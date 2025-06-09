"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = exports.sendReceipt = exports.cancelPaymentIntent = exports.capturePayment = exports.savePaymentMethod = exports.getCustomerPaymentMethods = exports.createPaymentIntent = void 0;
// functions/src/index.ts - Fixed Firebase Cloud Functions for Stripe
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const stripe_1 = __importDefault(require("stripe"));
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
// Initialize Stripe with your secret key - with proper error handling
const stripeSecretKey = (_b = (_a = functions.config()) === null || _a === void 0 ? void 0 : _a.stripe) === null || _b === void 0 ? void 0 : _b.secret_key;
if (!stripeSecretKey) {
    console.warn("Stripe secret key not configured. Set it with: firebase functions:config:set stripe.secret_key=\"sk_test_...\"");
}
const stripe = new stripe_1.default(stripeSecretKey || "sk_test_placeholder", {
    apiVersion: "2023-10-16",
});
// Create a PaymentIntent
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
    try {
        // Verify authentication
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
        }
        const { amount, currency, customerId, stationId, metadata } = data;
        // Validate inputs
        if (!amount || amount < 50) { // Minimum $0.50
            throw new functions.https.HttpsError("invalid-argument", "Invalid amount");
        }
        // Ensure customer exists in Stripe
        let stripeCustomerId = customerId;
        try {
            await stripe.customers.retrieve(customerId);
        }
        catch (error) {
            // Customer doesn't exist, create one
            const userDoc = await db.collection("users").doc(context.auth.uid).get();
            const userData = userDoc.data();
            const customer = await stripe.customers.create({
                id: customerId,
                email: (userData === null || userData === void 0 ? void 0 : userData.email) || `user-${context.auth.uid}@placeholder.com`,
                metadata: {
                    firebaseUID: context.auth.uid,
                },
            });
            stripeCustomerId = customer.id;
        }
        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: currency || "usd",
            customer: stripeCustomerId,
            capture_method: "manual",
            metadata: Object.assign({ stationId, userId: context.auth.uid }, metadata),
        });
        return {
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        };
    }
    catch (error) {
        console.error("Error creating payment intent:", error);
        throw new functions.https.HttpsError("internal", "Failed to create payment intent");
    }
});
// Get customer's payment methods
exports.getCustomerPaymentMethods = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
        }
        const { customerId } = data;
        // Get payment methods from Stripe
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: "card",
        });
        return {
            success: true,
            paymentMethods: paymentMethods.data,
        };
    }
    catch (error) {
        console.error("Error getting payment methods:", error);
        return {
            success: false,
            error: "Failed to get payment methods",
            paymentMethods: [],
        };
    }
});
// Save a payment method to customer
exports.savePaymentMethod = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
        }
        const { customerId, paymentMethodId, setAsDefault } = data;
        // Attach payment method to customer
        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
        });
        // Set as default if requested
        if (setAsDefault) {
            await stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
            // Update metadata to mark as default
            await stripe.paymentMethods.update(paymentMethodId, {
                metadata: {
                    is_default: "true",
                },
            });
        }
        return {
            success: true,
        };
    }
    catch (error) {
        console.error("Error saving payment method:", error);
        throw new functions.https.HttpsError("internal", "Failed to save payment method");
    }
});
// Capture payment when charging is complete
exports.capturePayment = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
        }
        const { paymentIntentId, amount } = data;
        // Capture the payment
        const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId, {
            amount_to_capture: amount,
        });
        return {
            success: true,
            paymentIntent,
        };
    }
    catch (error) {
        console.error("Error capturing payment:", error);
        return {
            success: false,
            error: "Failed to capture payment",
        };
    }
});
// Cancel payment intent
exports.cancelPaymentIntent = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
        }
        const { paymentIntentId } = data;
        // Cancel the payment intent
        const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
        return {
            success: true,
            paymentIntent,
        };
    }
    catch (error) {
        console.error("Error canceling payment intent:", error);
        return {
            success: false,
            error: "Failed to cancel payment intent",
        };
    }
});
// Send receipt email
exports.sendReceipt = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
        }
        const { transactionId } = data;
        // Get transaction details
        const transactionDoc = await db.collection("transactions").doc(transactionId).get();
        if (!transactionDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Transaction not found");
        }
        const transaction = transactionDoc.data();
        // Get user details
        const userDoc = await db.collection("users").doc(transaction.userId).get();
        const user = userDoc.data();
        // Here you would integrate with your email service (SendGrid, Mailgun, etc.)
        // For now, we'll just log and return success
        console.log("Sending receipt email for transaction:", transactionId);
        console.log("Recipient:", user === null || user === void 0 ? void 0 : user.email);
        console.log("Amount:", transaction.amount);
        // Example with SendGrid:
        /*
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(functions.config().sendgrid.api_key);
    
        const msg = {
          to: user?.email,
          from: 'receipts@voltuoso.com',
          subject: 'Your Voltuoso Charging Receipt',
          html: generateReceiptHTML(transaction, user),
        };
    
        await sgMail.send(msg);
        */
        return {
            success: true,
        };
    }
    catch (error) {
        console.error("Error sending receipt:", error);
        return {
            success: false,
            error: "Failed to send receipt",
        };
    }
});
// Stripe webhook handler
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    var _a, _b;
    const sig = req.headers["stripe-signature"];
    const endpointSecret = (_b = (_a = functions.config()) === null || _a === void 0 ? void 0 : _a.stripe) === null || _b === void 0 ? void 0 : _b.webhook_secret;
    if (!endpointSecret) {
        console.error("Webhook endpoint secret not configured");
        res.status(500).send("Webhook not configured");
        return;
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    }
    catch (err) {
        console.error("Webhook signature verification failed:", err);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    // Handle the event
    try {
        switch (event.type) {
            case "payment_intent.succeeded":
                const paymentIntent = event.data.object;
                console.log("PaymentIntent succeeded:", paymentIntent.id);
                // Update transaction status in Firestore
                if (paymentIntent.metadata.transactionId) {
                    await db.collection("transactions").doc(paymentIntent.metadata.transactionId).update({
                        status: "succeeded",
                        paymentIntentStatus: paymentIntent.status,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                }
                break;
            case "payment_intent.payment_failed":
                const failedPayment = event.data.object;
                console.log("PaymentIntent failed:", failedPayment.id);
                // Update transaction status
                if (failedPayment.metadata.transactionId) {
                    await db.collection("transactions").doc(failedPayment.metadata.transactionId).update({
                        status: "failed",
                        paymentIntentStatus: failedPayment.status,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                }
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        res.status(200).send("Webhook handled");
    }
    catch (error) {
        console.error("Error handling webhook:", error);
        res.status(500).send("Webhook handler failed");
    }
});
// Helper function to generate receipt HTML (placeholder)
function generateReceiptHTML(transaction, user) {
    var _a, _b;
    return `
    <html>
      <body>
        <h1>Voltuoso Charging Receipt</h1>
        <p>Thank you for charging with us, ${(user === null || user === void 0 ? void 0 : user.firstName) || "Customer"}!</p>
        <p><strong>Station:</strong> ${transaction.stationName}</p>
        <p><strong>Amount:</strong> $${(transaction.amount / 100).toFixed(2)}</p>
        <p><strong>Energy:</strong> ${transaction.energyDelivered} kWh</p>
        <p><strong>Date:</strong> ${((_b = (_a = transaction.createdAt) === null || _a === void 0 ? void 0 : _a.toDate()) === null || _b === void 0 ? void 0 : _b.toLocaleDateString()) || "N/A"}</p>
      </body>
    </html>
  `;
}
//# sourceMappingURL=index.js.map