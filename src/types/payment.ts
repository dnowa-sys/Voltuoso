// src/types/payment.ts

// Stripe Payment Method Types
export interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

// Transaction Status
export type TransactionStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

// Charging Session Status
export type ChargingSessionStatus = 'authorized' | 'active' | 'completed' | 'cancelled' | 'error';

// Station Availability
export type StationAvailability = 'available' | 'in_use' | 'offline' | 'maintenance';

// User Role Types
export type UserRole = 'customer' | 'station_owner' | 'admin';

// Transaction Record
export interface Transaction {
  id: string;
  userId: string;
  stationId: string;
  stationName: string;
  amount: number; // in cents
  currency: string;
  status: TransactionStatus;
  paymentMethodId: string;
  paymentIntentId?: string;
  sessionStartTime?: Date;
  sessionEndTime?: Date;
  energyDelivered?: number; // kWh
  createdAt: Date;
  receiptSent: boolean;
  refundId?: string;
  refundedAt?: Date;
}

// Charging Session
export interface ChargingSession {
  id: string;
  userId: string;
  stationId: string;
  transactionId: string;
  paymentIntentId: string;
  status: ChargingSessionStatus;
  authorizedAmount: number; // in cents
  finalAmount?: number; // in cents
  startTime?: Date;
  endTime?: Date;
  energyDelivered: number; // kWh
  currentPower?: number; // kW
  createdAt: Date;
  
  // Hardware status
  hardwareStatus?: 'connecting' | 'connected' | 'charging' | 'error';
  lastHeartbeat?: Date;
}

// Station Information
export interface Station {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  ownerId: string;
  ownerEmail: string;
  isActive: boolean;
  chargingSpeed: number; // kW
  connectorType: string; // "CCS", "CHAdeMO", "Tesla", etc.
  pricePerKwh: number; // in cents
  availability: StationAvailability;
  createdAt: Date;
  
  // Revenue sharing
  platformFeePercentage: number; // Platform's cut (default: 30%)
  
  // Hardware integration
  openEVSEId?: string;
  apiEndpoint?: string;
}

// Extended User Type
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  
  // Payment-related fields
  stripeCustomerId?: string;
  defaultPaymentMethodId?: string;
  
  // Station owner fields
  stationIds?: string[];
  
  // Usage statistics
  totalSpent?: number; // in cents
  totalEnergyConsumed?: number; // kWh
  membershipLevel?: 'basic' | 'premium';
  
  // Timestamps
  createdAt: Date;
  lastLoginAt?: Date;
}

// Payment Intent Creation
export interface CreatePaymentIntentRequest {
  stationId: string;
  amount: number; // in cents
  currency?: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

// Setup Intent for Saving Payment Methods
export interface CreateSetupIntentRequest {
  userId: string;
}

export interface CreateSetupIntentResponse {
  clientSecret: string;
}

// Payment Processing
export interface ProcessPaymentRequest {
  clientSecret: string;
  paymentMethodId?: string;
  savePaymentMethod?: boolean;
}

export interface ProcessPaymentResponse {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

// Refund Request
export interface RefundRequest {
  transactionId: string;
  amount?: number; // Optional partial refund amount in cents
  reason?: string;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  error?: string;
}

// Receipt Email
export interface SendReceiptRequest {
  transactionId: string;
}

export interface SendReceiptResponse {
  success: boolean;
  error?: string;
}

// Transaction Filters
export interface TransactionFilters {
  status?: TransactionStatus;
  stationId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

// Revenue Summary (for station owners)
export interface RevenueSummary {
  totalRevenue: number; // in cents
  totalTransactions: number;
  averageTransactionAmount: number; // in cents
  totalEnergyDelivered: number; // kWh
  period: {
    startDate: Date;
    endDate: Date;
  };
}

// Real-time Session Updates
export interface SessionUpdate {
  sessionId: string;
  energyDelivered: number; // kWh
  currentPower?: number; // kW
  estimatedTimeRemaining?: number; // minutes
  estimatedFinalCost?: number; // in cents
  timestamp: Date;
}

// Payment Method Validation
export interface PaymentMethodValidation {
  isValid: boolean;
  errors: string[];
}

// Webhook Event Types
export type WebhookEventType = 
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'setup_intent.succeeded'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted';

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: any;
  createdAt: Date;
}

// Error Types
export interface PaymentError {
  code: string;
  message: string;
  type: 'card_error' | 'invalid_request_error' | 'api_error' | 'authentication_error' | 'rate_limit_error';
  param?: string;
}

// Subscription Types (for future membership features)
export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // in cents per month
  features: string[];
  isActive: boolean;
}

// Analytics Types
export interface PaymentAnalytics {
  totalVolume: number; // in cents
  totalTransactions: number;
  averageTransactionSize: number; // in cents
  successRate: number; // percentage
  topStations: {
    stationId: string;
    stationName: string;
    revenue: number; // in cents
    transactionCount: number;
  }[];
  period: {
    startDate: Date;
    endDate: Date;
  };
}

// Export all types for easy importing
// (All interfaces and types are already exported above)
