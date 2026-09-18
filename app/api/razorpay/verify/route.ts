import { NextResponse } from "next/server";
import crypto from "crypto";

import {
  fetchRazorpayOrder,
  fetchRazorpayPayment,
  getAuthedUser,
  getServiceRoleClient,
  normalizeCart,
  verifyRazorpaySignature,
} from "@/app/lib/razorpay-server";

export async function POST(request: Request) {
  try {
    const { user } = await getAuthedUser(request);

    const body = (await request.json()) as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      items?: unknown[];
      customer?: {
        name?: string;
        phone?: string;
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
      };
    };

    const razorpayOrderId = body.razorpay_order_id?.trim();
    const razorpayPaymentId = body.razorpay_payment_id?.trim();
    const razorpaySignature = body.razorpay_signature?.trim();
    const customer = body.customer || {};

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Missing Razorpay payment details." },
        { status: 400 }
      );
    }

    if (
      !customer.name?.trim() ||
      !/^[6-9]\d{9}$/.test(customer.phone || "")
    ) {
      return NextResponse.json(
        { error: "Customer contact details are invalid." },
        { status: 400 }
      );
    }

    if (
      !customer.address?.trim() ||
      !customer.city?.trim() ||
      !customer.state?.trim() ||
      !/^\d{6}$/.test(customer.pincode || "")
    ) {
      return NextResponse.json(
        { error: "Delivery address is invalid." },
        { status: 400 }
      );
    }

    const signatureValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!signatureValid) {
      return NextResponse.json(
        { error: "Payment signature verification failed." },
        { status: 400 }
      );
    }

    const razorpayOrder = await fetchRazorpayOrder(razorpayOrderId);

    if (razorpayOrder.currency !== "INR") {
      return NextResponse.json(
        { error: "Unexpected payment currency." },
        { status: 400 }
      );
    }

    const razorpayPayment =
      await fetchRazorpayPayment(razorpayPaymentId);

    if (
      razorpayPayment.order_id !== razorpayOrderId ||
      razorpayPayment.currency !== "INR"
    ) {
      return NextResponse.json(
        { error: "Payment does not match the selected Razorpay order." },
        { status: 400 }
      );
    }

    if (
      razorpayOrder.status !== "paid" ||
      razorpayPayment.status !== "captured"
    ) {
      return NextResponse.json(
        { error: "Payment has not been fully captured yet." },
        { status: 400 }
      );
    }

    const adminDb = getServiceRoleClient();

    // Prevent duplicate orders for the same Razorpay payment.
    const { data: existingOrder, error: existingError } = await adminDb
      .from("orders")
      .select("order_id, total, status, payment_status")
      .eq("razorpay_payment_id", razorpayPaymentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingOrder) {
      return NextResponse.json({
        orderId: existingOrder.order_id,
        total: Number(existingOrder.total || 0),
        status: existingOrder.status || "New Order",
        paymentStatus: existingOrder.payment_status || "Paid",
      });
    }

    // Recalculate the cart total from Supabase.
    const totals = await normalizeCart(body.items || [], adminDb);

    const expectedAmount = Math.round(totals.total * 100);

    if (
      Number(razorpayOrder.amount) !== expectedAmount ||
      Number(razorpayPayment.amount) !== expectedAmount
    ) {
      return NextResponse.json(
        { error: "Payment amount does not match the current order total." },
        { status: 400 }
      );
    }

    const orderId = `DBD-${customer.pincode}-${crypto
      .randomUUID()
      .slice(0, 8)
      .toUpperCase()}`;

    const { error: insertError } = await adminDb.from("orders").insert({
      order_id: orderId,
      user_id: user.id,
      customer_name: customer.name.trim(),
      customer_phone: customer.phone,
      customer_address: customer.address.trim(),
      customer_city: customer.city.trim(),
      customer_pincode: customer.pincode,

      items: totals.items,
      subtotal: totals.subtotal,
      delivery: totals.delivery,
      total: totals.total,

      status: "New Order",

      payment_status: "Paid",
      payment_method: "UPI (Razorpay)",

      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    });

    if (insertError) {
      console.error(
        "Supabase paid order insert error:",
        insertError
      );

      return NextResponse.json(
        {
          error:
            "Payment was verified, but the order could not be saved. Please contact support with your payment ID.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId,
      total: totals.total,
      status: "New Order",
      paymentStatus: "Paid",
    });
  } catch (error) {
    console.error("Razorpay verify error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not verify the payment.",
      },
      { status: 400 }
    );
  }
}