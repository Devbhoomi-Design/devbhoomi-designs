import { NextResponse } from "next/server";
import crypto from "crypto";

import {
  createRazorpayOrder,
  getAuthedUser,
  getServiceRoleClient,
  normalizeCart,
} from "@/app/lib/razorpay-server";

type CreateOrderBody = {
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

export async function POST(request: Request) {
  try {
    const { user } = await getAuthedUser(request);

    const body = (await request.json()) as CreateOrderBody;

    const customer = body.customer || {};

    // -----------------------------
    // Validate customer details
    // -----------------------------

    if (!customer.name?.trim()) {
      return NextResponse.json(
        { error: "Customer name is required." },
        { status: 400 }
      );
    }

    if (!/^[6-9]\d{9}$/.test(customer.phone || "")) {
      return NextResponse.json(
        { error: "Customer phone number is invalid." },
        { status: 400 }
      );
    }

    if (!customer.address?.trim()) {
      return NextResponse.json(
        { error: "Delivery address is required." },
        { status: 400 }
      );
    }

    if (!customer.city?.trim()) {
      return NextResponse.json(
        { error: "City is required." },
        { status: 400 }
      );
    }

    if (!customer.state?.trim()) {
      return NextResponse.json(
        { error: "State is required." },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(customer.pincode || "")) {
      return NextResponse.json(
        { error: "Pincode is invalid." },
        { status: 400 }
      );
    }

    const db = getServiceRoleClient();

    // --------------------------------------------------
    // Recalculate cart using trusted database prices
    // --------------------------------------------------

    const totals = await normalizeCart(
      body.items || [],
      db
    );

    // --------------------------------------------------
    // Create our internal Devbhoomi order ID FIRST
    // --------------------------------------------------

    const orderId =
      `DBD-${customer.pincode}-${crypto
        .randomUUID()
        .slice(0, 8)
        .toUpperCase()}`;

    // --------------------------------------------------
    // Create pending order in Supabase
    // --------------------------------------------------

    const { error: insertError } = await db
      .from("orders")
      .insert({
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

        // Payment has not completed yet.
        payment_status: "Pending",
        payment_method: "Razorpay",

        razorpay_order_id: null,
        razorpay_payment_id: null,
        razorpay_signature: null,
      })
      .select("order_id")
      .single();

    if (insertError) {
      console.error(
        "Pending order insert error:",
        insertError
      );

      throw new Error(
        "Could not create your order."
      );
    }

    try {
      // --------------------------------------------------
      // Create Razorpay order
      // --------------------------------------------------

      const razorpayOrder =
        await createRazorpayOrder(
          totals.total,
          orderId,
          {
            user_id: user.id,
            order_id: orderId,
          }
        );

      // --------------------------------------------------
      // Save Razorpay order ID
      // --------------------------------------------------

      const {
        error: updateError,
      } = await db
        .from("orders")
        .update({
          razorpay_order_id:
            razorpayOrder.id,
          updated_at:
            new Date().toISOString(),
        })
        .eq("order_id", orderId)
        .eq("user_id", user.id);

      if (updateError) {
        console.error(
          "Could not save Razorpay order ID:",
          updateError
        );

        throw new Error(
          "Could not connect the payment to your order."
        );
      }

      return NextResponse.json({
        success: true,

        orderId,

        razorpayOrderId:
          razorpayOrder.id,

        amount:
          razorpayOrder.amount,

        currency:
          razorpayOrder.currency,

        keyId:
          razorpayOrder.keyId,

        total:
          totals.total,
      });
    } catch (razorpayError) {
      // --------------------------------------------------
      // Razorpay creation failed.
      // Remove the pending order because no payment
      // checkout was successfully created.
      // --------------------------------------------------

      const { error: deleteError } =
        await db
          .from("orders")
          .delete()
          .eq("order_id", orderId)
          .eq("user_id", user.id);

      if (deleteError) {
        console.error(
          "Could not remove failed pending order:",
          deleteError
        );
      }

      throw razorpayError;
    }
  } catch (error) {
    console.error(
      "Razorpay create-order error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create Razorpay order.",
      },
      { status: 400 }
    );
  }
}