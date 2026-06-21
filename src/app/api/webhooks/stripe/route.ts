import type Stripe from "stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured.");

    return NextResponse.json(
      {
        success: false,
        error: "Stripe webhooks are not configured.",
      },
      {
        status: 503,
      },
    );
  }

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing Stripe signature.",
      },
      {
        status: 400,
      },
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error("Stripe webhook verification failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Invalid Stripe webhook signature.",
      },
      {
        status: 400,
      },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      const customerEmail =
        session.customer_details?.email ??
        session.customer_email ??
        "unknown customer";

      console.log(`Payment confirmed for: ${customerEmail}`);
      break;
    }

    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  return NextResponse.json({
    received: true,
  });
}