// functions/src/index.ts - Fixed for Firebase Functions v2
import * as admin from "firebase-admin";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import Stripe from "stripe";

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

// Simple ping function to test deployment
export const ping = onCall(async (request) => {
  return {
    success: true,
    message: "Functions are working!",
    timestamp: new Date().toISOString(),
  };
});

// Create Payment Intent
export const createPaymentIntent = onCall(async (request) => {
  try {
    // Verify user is authenticated
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const {amount, currency = "usd", customerId, stationId, metadata = {}} = request.data;

    // Validate required parameters
    if (!amount || !stationId) {
      throw new HttpsError("invalid-argument", "Missing required parameters");
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure amount is integer
      currency,
      customer: customerId,
      metadata: {
        stationId,
        userId: request.auth.uid,
        ...metadata,
      },
      capture_method: "manual", // Authorize only, capture later
    });

    return {
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw new HttpsError("internal", `Failed to create payment intent: ${error}`);
  }
});

// Capture Payment
export const capturePayment = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const {paymentIntentId, amount} = request.data;

    if (!paymentIntentId) {
      throw new HttpsError("invalid-argument", "Payment Intent ID is required");
    }

    // Capture the payment
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId, {
      amount_to_capture: amount ? Math.round(amount) : undefined,
    });

    return {
      success: true,
      data: {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount_received,
      },
    };
  } catch (error) {
    console.error("Error capturing payment:", error);
    throw new HttpsError("internal", `Failed to capture payment: ${error}`);
  }
});

// Cancel Payment Intent
export const cancelPaymentIntent = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const {paymentIntentId} = request.data;

    if (!paymentIntentId) {
      throw new HttpsError("invalid-argument", "Payment Intent ID is required");
    }

    // Cancel the payment intent
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    return {
      success: true,
      data: {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      },
    };
  } catch (error) {
    console.error("Error canceling payment intent:", error);
    throw new HttpsError("internal", `Failed to cancel payment intent: ${error}`);
  }
});

// Create Stripe Customer
export const createStripeCustomer = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const {email, name, metadata = {}} = request.data;

    if (!email) {
      throw new HttpsError("invalid-argument", "Email is required");
    }

    // Create customer in Stripe
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        firebaseUID: request.auth.uid,
        ...metadata,
      },
    });

    // Save customer ID to user document
    await admin.firestore().collection("users").doc(request.auth.uid).update({
      stripeCustomerId: customer.id,
    });

    return {
      success: true,
      data: {
        customerId: customer.id,
      },
    };
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    throw new HttpsError("internal", `Failed to create customer: ${error}`);
  }
});

// Get Customer Payment Methods
export const getCustomerPaymentMethods = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const {customerId} = request.data;

    if (!customerId) {
      throw new HttpsError("invalid-argument", "Customer ID is required");
    }

    // Get payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    return {
      success: true,
      data: {
        paymentMethods: paymentMethods.data.map((pm) => ({
          id: pm.id,
          type: pm.type,
          card: {
            brand: pm.card?.brand,
            last4: pm.card?.last4,
            expMonth: pm.card?.exp_month,
            expYear: pm.card?.exp_year,
          },
          isDefault: pm.metadata?.is_default === "true",
        })),
      },
    };
  } catch (error) {
    console.error("Error getting payment methods:", error);
    throw new HttpsError("internal", `Failed to get payment methods: ${error}`);
  }
});

// Send Receipt Email (placeholder)
export const sendReceipt = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const {transactionId} = request.data;

    if (!transactionId) {
      throw new HttpsError("invalid-argument", "Transaction ID is required");
    }

    // TODO: Implement email sending logic
    // For now, just return success
    console.log(`Receipt requested for transaction: ${transactionId}`);

    return {
      success: true,
      message: "Receipt functionality not yet implemented",
    };
  } catch (error) {
    console.error("Error sending receipt:", error);
    throw new HttpsError("internal", `Failed to send receipt: ${error}`);
  }
});

// Simple HTTP endpoint for testing
export const hello = onRequest(async (req, res) => {
  res.json({
    message: "Hello from Firebase Functions!",
    timestamp: new Date().toISOString(),
  });
});