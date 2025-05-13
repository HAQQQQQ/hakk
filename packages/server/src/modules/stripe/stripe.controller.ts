// stripe.controller.ts
import { Controller, Post, Req, Res, Headers, HttpCode } from "@nestjs/common";

import type { Request, Response } from "express"; // ✅ Fix: Use express types
import Stripe from "stripe"; // ✅ Fix: Import Stripe directly

import { StripeService } from "./stripe.service";
import * as bodyParser from "body-parser"; // For raw body handling

@Controller("stripe")
export class StripeController {
	constructor(private readonly stripeService: StripeService) {}

	// You should configure this route to use raw body parsing in main.ts
	@Post("webhook")
	@HttpCode(200) // Ensures Stripe sees a 200 OK when we handle it
	async handleStripeWebhook(
		@Req() req: Request,
		@Res() res: Response,
		@Headers("stripe-signature") signature: string,
	) {
		let event: Stripe.Event;

		try {
			// ✅ Verify and construct the event using the Stripe library
			event = this.stripeService.getStripeInstance().webhooks.constructEvent(
				(req as any).rawBody, // rawBody must be available from body parser middleware
				signature,
				process.env.STRIPE_WEBHOOK_SECRET!,
			);
		} catch (err) {
			console.error("Webhook signature verification failed.", err.message);
			return res.status(400).send(`Webhook Error: ${err.message}`);
		}

		// ✅ Handle only the events you care about
		switch (event.type) {
			case "checkout.session.completed":
				const session = event.data.object as Stripe.Checkout.Session;
				console.log("✅ Checkout complete:", session.id);
				// TODO: Mark user as paid/subscribed in your DB
				break;

			case "invoice.paid":
				const invoice = event.data.object as Stripe.Invoice;
				console.log("✅ Invoice paid:", invoice.id);
				// TODO: Extend subscription access or similar
				break;

			default:
				console.log(`Unhandled event type: ${event.type}`);
		}

		// ✅ Always send a 200 to Stripe to confirm receipt
		res.send({ received: true });
	}
}
