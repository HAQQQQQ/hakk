// stripe.service.ts
import { Injectable } from "@nestjs/common";
import Stripe from "stripe";

@Injectable()
export class StripeService {
	private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

	async createSubscriptionSession(email: string) {
		const customer = await this.stripe.customers.create({ email });

		const session = await this.stripe.checkout.sessions.create({
			customer: customer.id,
			payment_method_types: ["card"],
			mode: "subscription",
			line_items: [
				{
					price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID!,
					quantity: 1,
				},
			],
			success_url: `http://localhost:3000/payment-success`,
			cancel_url: `http://localhost:3000/payment-cancel`,
		});

		return { url: session.url };
	}

	getStripeInstance() {
		return this.stripe;
	}
}
