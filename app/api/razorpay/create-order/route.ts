import { NextResponse } from "next/server";
import crypto from "crypto";

import {
  createRazorpayOrder,
  getAuthedUser,
  getServiceRoleClient,
  normalizeCart,
} from "@/app/lib/razorpay-server";

export async function POST(request: Request) {
  try {
    const { user } = await getAuthedUser(request);

    const body = (await request.json()) as {
      items?: unknown[];
    };

    const db = getServiceRoleClient();

    // Calculate the amount from the database.
    // We do not trust the total sent by the browser.
    const totals = await normalizeCart(body.items || [], db);

    const receipt = `DBD-${crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 20)}`;

    const razorpayOrder = await createRazorpayOrder(
      totals.total,
      receipt,
      {
        user_id: user.id,
      }
    );

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: razorpayOrder.keyId,
      total: totals.total,
    });
  } catch (error) {
    console.error("Razorpay create-order error:", error);

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