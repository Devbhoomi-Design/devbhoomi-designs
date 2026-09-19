import crypto from "crypto";
import { NextResponse } from "next/server";

import {
  getServiceRoleClient,
} from "@/app/lib/razorpay-server";

export const runtime = "nodejs";

type RazorpayPaymentEntity = {
  id?: string;
  order_id?: string;
  status?: string;
  method?: string;
};

type RazorpayOrderEntity = {
  id?: string;
  status?: string;
};

type RazorpayWebhookPayload = {
  event?: string;

  payload?: {
    payment?: {
      entity?: RazorpayPaymentEntity;
    };

    order?: {
      entity?: RazorpayOrderEntity;
    };
  };
};

function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
) {
  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        secret
      )
      .update(rawBody)
      .digest("hex");

  const expectedBuffer =
    Buffer.from(
      expectedSignature,
      "utf8"
    );

  const actualBuffer =
    Buffer.from(
      signature,
      "utf8"
    );

  if (
    expectedBuffer.length !==
    actualBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    actualBuffer
  );
}

function formatPaymentMethod(
  method?: string
) {
  if (!method) {
    return "Razorpay";
  }

  return `${method.toUpperCase()} (Razorpay)`;
}

export async function POST(
  request: Request
) {
  try {
    const webhookSecret =
      process.env
        .RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "RAZORPAY_WEBHOOK_SECRET is missing."
      );

      return NextResponse.json(
        {
          error:
            "Webhook server configuration is missing.",
        },
        { status: 500 }
      );
    }

    const signature =
      request.headers.get(
        "x-razorpay-signature"
      );

    if (!signature) {
      return NextResponse.json(
        {
          error:
            "Missing webhook signature.",
        },
        { status: 401 }
      );
    }

    // IMPORTANT:
    // Webhook signatures must be verified
    // against the exact raw request body.
    const rawBody =
      await request.text();

    const valid =
      verifyWebhookSignature(
        rawBody,
        signature,
        webhookSecret
      );

    if (!valid) {
      console.error(
        "Invalid Razorpay webhook signature."
      );

      return NextResponse.json(
        {
          error:
            "Invalid webhook signature.",
        },
        { status: 401 }
      );
    }

    let payload:
      RazorpayWebhookPayload;

    try {
      payload =
        JSON.parse(rawBody) as RazorpayWebhookPayload;
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid webhook JSON.",
        },
        { status: 400 }
      );
    }

    const event =
      payload.event || "";

    const payment =
      payload.payload?.payment?.entity;

    const order =
      payload.payload?.order?.entity;

    const razorpayOrderId =
      payment?.order_id ||
      order?.id;

    const razorpayPaymentId =
      payment?.id;

    if (!razorpayOrderId) {
      // Valid webhook, but not an order event
      // that this application needs.
      return NextResponse.json({
        received: true,
        handled: false,
      });
    }

    const db =
      getServiceRoleClient();

    // ==================================================
    // PAYMENT CAPTURED
    // ==================================================

    if (
      event === "payment.captured"
    ) {
      const paymentMethod =
        formatPaymentMethod(
          payment?.method
        );

      const updateData: Record<
        string,
        unknown
      > = {
        payment_status: "Paid",
        payment_method:
          paymentMethod,

        updated_at:
          new Date().toISOString(),
      };

      if (razorpayPaymentId) {
        updateData.razorpay_payment_id =
          razorpayPaymentId;
      }

      const {
        error,
      } = await db
        .from("orders")
        .update(updateData)
        .eq(
          "razorpay_order_id",
          razorpayOrderId
        );

      if (error) {
        console.error(
          "Webhook payment.captured update error:",
          error
        );

        return NextResponse.json(
          {
            error:
              "Could not update the order.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        received: true,
        handled: true,
      });
    }

    // ==================================================
    // ORDER PAID
    // ==================================================

    if (
      event === "order.paid"
    ) {
      const paymentMethod =
        formatPaymentMethod(
          payment?.method
        );

      const updateData: Record<
        string,
        unknown
      > = {
        payment_status: "Paid",
        payment_method:
          paymentMethod,

        updated_at:
          new Date().toISOString(),
      };

      if (razorpayPaymentId) {
        updateData.razorpay_payment_id =
          razorpayPaymentId;
      }

      const {
        error,
      } = await db
        .from("orders")
        .update(updateData)
        .eq(
          "razorpay_order_id",
          razorpayOrderId
        );

      if (error) {
        console.error(
          "Webhook order.paid update error:",
          error
        );

        return NextResponse.json(
          {
            error:
              "Could not update the order.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        received: true,
        handled: true,
      });
    }

    // ==================================================
    // PAYMENT FAILED
    // ==================================================

    if (
      event === "payment.failed"
    ) {
      const updateData: Record<
        string,
        unknown
      > = {
        payment_status: "Failed",
        updated_at:
          new Date().toISOString(),
      };

      if (payment?.method) {
        updateData.payment_method =
          formatPaymentMethod(
            payment.method
          );
      }

      if (razorpayPaymentId) {
        updateData.razorpay_payment_id =
          razorpayPaymentId;
      }

      // Do not downgrade a payment that is
      // already marked Paid.
      const {
        error,
      } = await db
        .from("orders")
        .update(updateData)
        .eq(
          "razorpay_order_id",
          razorpayOrderId
        )
        .neq(
          "payment_status",
          "Paid"
        );

      if (error) {
        console.error(
          "Webhook payment.failed update error:",
          error
        );

        return NextResponse.json(
          {
            error:
              "Could not update the order.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        received: true,
        handled: true,
      });
    }

    // ==================================================
    // OTHER EVENTS
    // ==================================================

    return NextResponse.json({
      received: true,
      handled: false,
    });
  } catch (error) {
    console.error(
      "Razorpay webhook error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
}