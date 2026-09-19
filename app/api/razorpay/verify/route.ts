import { NextResponse } from "next/server";

import {
  fetchRazorpayOrder,
  fetchRazorpayPayment,
  getAuthedUser,
  getServiceRoleClient,
  verifyRazorpaySignature,
} from "@/app/lib/razorpay-server";

type VerifyBody = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;

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
    const { user } =
      await getAuthedUser(request);

    const body =
      (await request.json()) as VerifyBody;

    const razorpayOrderId =
      body.razorpay_order_id?.trim();

    const razorpayPaymentId =
      body.razorpay_payment_id?.trim();

    const razorpaySignature =
      body.razorpay_signature?.trim();

    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        {
          error:
            "Missing Razorpay payment details.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Verify Razorpay signature
    // --------------------------------------------------

    const signatureValid =
      verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

    if (!signatureValid) {
      return NextResponse.json(
        {
          error:
            "Payment signature verification failed.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Fetch payment directly from Razorpay
    // --------------------------------------------------

    const razorpayOrder =
      await fetchRazorpayOrder(
        razorpayOrderId
      );

    const razorpayPayment =
      await fetchRazorpayPayment(
        razorpayPaymentId
      );

    // --------------------------------------------------
    // Validate order/payment relationship
    // --------------------------------------------------

    if (
      razorpayOrder.currency !== "INR"
    ) {
      return NextResponse.json(
        {
          error:
            "Unexpected payment currency.",
        },
        { status: 400 }
      );
    }

    if (
      razorpayPayment.order_id !==
        razorpayOrderId ||
      razorpayPayment.currency !== "INR"
    ) {
      return NextResponse.json(
        {
          error:
            "Payment does not match the selected Razorpay order.",
        },
        { status: 400 }
      );
    }

    if (
      razorpayOrder.status !== "paid" ||
      razorpayPayment.status !== "captured"
    ) {
      return NextResponse.json(
        {
          error:
            "Payment has not been fully captured yet.",
        },
        { status: 400 }
      );
    }

    const db =
      getServiceRoleClient();

    // --------------------------------------------------
    // Find the pending order created before checkout
    // --------------------------------------------------

    const {
      data: existingOrder,
      error: existingError,
    } = await db
      .from("orders")
      .select(
        `
          order_id,
          user_id,
          total,
          status,
          payment_status,
          payment_method,
          razorpay_order_id,
          razorpay_payment_id
        `
      )
      .eq(
        "razorpay_order_id",
        razorpayOrderId
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (!existingOrder) {
      return NextResponse.json(
        {
          error:
            "Your payment was received, but the order record could not be found. Please contact support with your Razorpay Payment ID.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // Verify amount against our stored order total
    // --------------------------------------------------

    const expectedAmount =
      Math.round(
        Number(existingOrder.total || 0) *
          100
      );

    if (
      Number(razorpayOrder.amount) !==
        expectedAmount ||
      Number(razorpayPayment.amount) !==
        expectedAmount
    ) {
      return NextResponse.json(
        {
          error:
            "Payment amount does not match the order total.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Payment method
    // --------------------------------------------------

    const paymentMethod =
      razorpayPayment.method
        ? `${razorpayPayment.method.toUpperCase()} (Razorpay)`
        : "Razorpay";

    // --------------------------------------------------
    // Update existing order
    // --------------------------------------------------

    const {
      error: updateError,
    } = await db
      .from("orders")
      .update({
        payment_status: "Paid",
        payment_method: paymentMethod,

        razorpay_payment_id:
          razorpayPaymentId,

        razorpay_signature:
          razorpaySignature,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "order_id",
        existingOrder.order_id
      )
      .eq("user_id", user.id);

    if (updateError) {
      console.error(
        "Paid order update error:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Payment was verified, but the order could not be updated. Please contact support with your payment ID.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,

      orderId:
        existingOrder.order_id,

      total:
        Number(existingOrder.total || 0),

      status:
        existingOrder.status ||
        "New Order",

      paymentStatus: "Paid",

      paymentMethod,
    });
  } catch (error) {
    console.error(
      "Razorpay verify error:",
      error
    );

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