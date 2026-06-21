import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  // 1. Get raw body text (Required for Stripe signature verification)
  const body = await req.text();
  
  // 2. Get headers (Must be awaited in Next.js 15+)
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature");

  if (!signature) {
    return new NextResponse("Missing Stripe Signature", { status: 400 });
  }

  let event;

  try {
    // 3. Construct the Stripe event
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook Error:", error);
    return new NextResponse("Invalid Signature", { status: 400 });
  }

  // 4. Handle events
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      // Add your database logic here
      console.log(`Payment confirmed for: ${session.customer_email}`);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}