// functions/src/index.ts
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import Stripe from 'stripe';

admin.initializeApp();

const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2023-10-16',
});

// Create Payment Intent for charging session
export const createPaymentIntent = functions.https.onCall(async (data, context) => {
  try {
    const { stationId, amount, currency = 'usd', captureMethod = 'automatic' } = data;

    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(context.auth.uid);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      capture_method: captureMethod,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        stationId,
        userId: context.auth.uid,
        type: 'charging_session',
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create payment intent');
  }
});

// Create Setup Intent for saving payment methods
export const createSetupIntent = functions.https.onCall(async (data, context) => {
  try {
    const { userId } = data;

    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(context.auth.uid);

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata: {
        userId: context.auth.uid,
      },
    });

    return {
      clientSecret: setupIntent.client_secret,
    };
  } catch (error) {
    console.error('Error creating setup intent:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create setup intent');
  }
});

// Get Payment Method details
export const getPaymentMethod = functions.https.onCall(async (data, context) => {
  try {
    const { paymentMethodId } = data;

    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    return {
      id: paymentMethod.id,
      type: paymentMethod.type,
      card: paymentMethod.card,
    };
  } catch (error) {
    console.error('Error getting payment method:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get payment method');
  }
});

// Capture Payment Intent (for EV charging)
export const capturePayment = functions.https.onCall(async (data, context) => {
  try {
    const { paymentIntentId, amountToCapture } = data;

    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId, {
      amount_to_capture: amountToCapture,
    });

    // Update transaction in Firestore
    await admin.firestore()
      .collection('transactions')
      .where('paymentIntentId', '==', paymentIntentId)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          doc.ref.update({
            status: 'succeeded',
            finalAmount: amountToCapture,
            capturedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
      });

    return { success: true, paymentIntentId: paymentIntent.id };
  } catch (error) {
    console.error('Error capturing payment:', error);
    throw new functions.https.HttpsError('internal', 'Failed to capture payment');
  }
});

// Cancel Payment Intent
export const cancelPaymentIntent = functions.https.onCall(async (data, context) => {
  try {
    const { paymentIntentId } = data;

    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    // Update transaction in Firestore
    await admin.firestore()
      .collection('transactions')
      .where('paymentIntentId', '==', paymentIntentId)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          doc.ref.update({
            status: 'cancelled',
            cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
      });

    return { success: true, paymentIntentId: paymentIntent.id };
  } catch (error) {
    console.error('Error canceling payment intent:', error);
    throw new functions.https.HttpsError('internal', 'Failed to cancel payment intent');
  }
});

// Process refund
export const refundPayment = functions.https.onCall(async (data, context) => {
  try {
    const { transactionId, amount, reason = 'requested_by_customer' } = data;

    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Get transaction from Firestore
    const transactionDoc = await admin.firestore()
      .collection('transactions')
      .doc(transactionId)
      .get();

    if (!transactionDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Transaction not found');
    }

    const transaction = transactionDoc.data();
    
    // Verify ownership (user or station owner or admin)
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();
    
    const user = userDoc.data();
    const isAuthorized = 
      user?.role === 'admin' || 
      transaction?.userId === context.auth.uid ||
      user?.stationIds?.includes(transaction?.stationId);
    
    if (!isAuthorized) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized to refund this transaction');
    }

    // Process refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: transaction?.paymentIntentId,
      amount: amount || transaction?.amount,
      reason,
      metadata: {
        transactionId,
        userId: context.auth.uid,
      },
    });

    // Update transaction in Firestore
    await transactionDoc.ref.update({
      status: 'refunded',
      refundId: refund.id,
      refundAmount: refund.amount,
      refundedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, refundId: refund.id };
  } catch (error) {
    console.error('Error processing refund:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process refund');
  }
});

// Send receipt email
export const sendReceiptEmail = functions.https.onCall(async (data, context) => {
  try {
    const { transactionId } = data;

    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Get transaction and user data
    const transactionDoc = await admin.firestore()
      .collection('transactions')
      .doc(transactionId)
      .get();

    if (!transactionDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Transaction not found');
    }

    const transaction = transactionDoc.data();
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(transaction?.userId)
      .get();

    const user = userDoc.data();

    if (!user?.email) {
      throw new functions.https.HttpsError('failed-precondition', 'User email not found');
    }

    // Get station details
    const stationDoc = await admin.firestore()
      .collection('stations')
      .doc(transaction?.stationId)
      .get();
    
    const station = stationDoc.data();

    // Email content
    const emailData = {
      to: user.email,
      subject: 'Voltuoso Charging Receipt',
      html: generateReceiptHTML(transaction, user, station),
    };

    // Add to email queue (using a service like SendGrid, Mailgun, etc.)
    await admin.firestore().collection('emailQueue').add({
      ...emailData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending',
      transactionId,
    });

    // Mark receipt as sent
    await transactionDoc.ref.update({
      receiptSent: true,
      receiptSentAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending receipt:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send receipt');
  }
});

// Delete Payment Method
export const deletePaymentMethod = functions.https.onCall(async (data, context) => {
  try {
    const { paymentMethodId } = data;

    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Get payment method from Firestore to get Stripe ID
    const paymentMethodDoc = await admin.firestore()
      .collection('paymentMethods')
      .doc(paymentMethodId)
      .get();

    if (!paymentMethodDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Payment method not found');
    }

    const paymentMethodData = paymentMethodDoc.data();
    
    // Verify ownership
    if (paymentMethodData?.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized to delete this payment method');
    }

    // Detach from Stripe
    await stripe.paymentMethods.detach(paymentMethodData?.stripePaymentMethodId);

    return { success: true };
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw new functions.https.HttpsError('internal', 'Failed to delete payment method');
  }
});

// Webhook handler for Stripe events
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = functions.config().stripe.webhook_secret;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).send(`Webhook Error: ${err}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;
    case 'setup_intent.succeeded':
      await handleSetupIntentSucceeded(event.data.object as Stripe.SetupIntent);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Helper function to get or create Stripe customer
async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const userData = userDoc.data();

  if (userData?.stripeCustomerId) {
    return userData.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    metadata: { firebaseUID: userId },
    email: userData?.email,
    name: userData?.displayName,
  });

  // Save customer ID to Firestore
  await userDoc.ref.update({
    stripeCustomerId: customer.id,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return customer.id;
}

// Webhook event handlers
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update transaction status in Firestore
    const transactionsRef = admin.firestore().collection('transactions');
    const query = transactionsRef.where('paymentIntentId', '==', paymentIntent.id);
    const snapshot = await query.get();

    snapshot.forEach(async (doc) => {
      await doc.ref.update({
        status: 'succeeded',
        stripePaymentIntentStatus: paymentIntent.status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send receipt email
      await admin.firestore().collection('emailQueue').add({
        type: 'receipt',
        transactionId: doc.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending',
      });
    });
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update transaction status in Firestore
    const transactionsRef = admin.firestore().collection('transactions');
    const query = transactionsRef.where('paymentIntentId', '==', paymentIntent.id);
    const snapshot = await query.get();

    snapshot.forEach(async (doc) => {
      await doc.ref.update({
        status: 'failed',
        stripePaymentIntentStatus: paymentIntent.status,
        failureReason: paymentIntent.last_payment_error?.message,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
  try {
    // The payment method was successfully saved
    // This is handled in the client-side confirmSetupIntent
    console.log('Setup intent succeeded:', setupIntent.id);
  } catch (error) {
    console.error('Error handling setup intent succeeded:', error);
  }
}

// Helper function to generate receipt HTML
function generateReceiptHTML(transaction: any, user: any, station: any): string {
  const date = new Date(transaction.createdAt.seconds * 1000);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header { 
          background: linear-gradient(135deg, #007AFF, #005BBB);
          color: white; 
          padding: 30px; 
          text-align: center; 
          border-radius: 8px 8px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .header p {
          margin: 8px 0 0 0;
          opacity: 0.9;
        }
        .content { 
          background: white;
          padding: 30px; 
          border: 1px solid #e0e0e0;
          border-top: none;
        }
        .receipt-details { 
          background-color: #f8f9fa; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        .detail-label {
          font-weight: 500;
          color: #666;
        }
        .detail-value {
          font-weight: 600;
          color: #333;
        }
        .total { 
          font-size: 20px; 
          font-weight: bold; 
          color: #007AFF; 
          background: #f0f8ff;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 14px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
        .environmental {
          background: #f0fff4;
          border: 1px solid #4CAF50;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          text-align: center;
        }
        .environmental h3 {
          color: #4CAF50;
          margin: 0 0 8px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>⚡ Voltuoso</h1>
        <p>Electric Vehicle Charging Receipt</p>
      </div>
      
      <div class="content">
        <h2>Thank you for charging with us!</h2>
        
        <div class="receipt-details">
          <div class="detail-row">
            <span class="detail-label">Transaction ID:</span>
            <span class="detail-value">${transaction.id.slice(-8).toUpperCase()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Station:</span>
            <span class="detail-value">${station?.name || transaction.stationName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${formattedDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Energy Delivered:</span>
            <span class="detail-value">${transaction.energyDelivered ? transaction.energyDelivered.toFixed(2) + ' kWh' : 'N/A'}</span>
          </div>
          ${transaction.sessionStartTime && transaction.sessionEndTime ? `
          <div class="detail-row">
            <span class="detail-label">Duration:</span>
            <span class="detail-value">${Math.round((transaction.sessionEndTime.seconds - transaction.sessionStartTime.seconds) / 60)} minutes</span>
          </div>
          ` : ''}
        </div>

        <div class="total">
          Total Amount: ${(transaction.amount / 100).toFixed(2)}
        </div>

        ${transaction.energyDelivered ? `
        <div class="environmental">
          <h3>🌱 Environmental Impact</h3>
          <p>You helped avoid approximately <strong>${(transaction.energyDelivered * 0.85).toFixed(1)} lbs</strong> of CO₂ emissions!</p>
        </div>
        ` : ''}

        <div class="footer">
          <p>Questions about your charge? Contact us at support@voltuoso.com</p>
          <p>Keep this receipt for your records.</p>
          <p style="margin-top: 16px; font-size: 12px; color: #999;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}