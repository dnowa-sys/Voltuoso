// src/types/payment.ts
// Type definitions for payment-related data structures

export interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    funding?: 'credit' | 'debit' | 'prepaid' | 'unknown';
    country?: string;
  };
  isDefault: boolean;
  customerId?: string;
  created?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  stationId: string;
  stationName: string;
  amount: number; // in cents
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'canceled';
  paymentIntentId: string;
  paymentMethodId: string;
  sessionStartTime?: Date;
  sessionEndTime?: Date;
  energyDelivered?: number; // kWh
  createdAt: Date;
  receiptSent: boolean;
  receiptSentAt?: Date;
  refunded?: boolean;
  refundedAt?: Date;
  refundAmount?: number;
}

export interface ChargingSession {
  id: string;
  userId: string;
  stationId: string;
  stationName?: string;
  paymentIntentId: string;
  status: 'authorized' | 'active' | 'completed' | 'cancelled' | 'error';
  authorizedAmount: number; // in cents
  finalAmount?: number; // in cents
  startTime?: Date;
  endTime?: Date;
  energyDelivered: number; // kWh
  powerDelivered?: number; // kW current rate
  createdAt: Date;
  lastHeartbeat?: Date;
  hardwareStatus?: string;
  transactionId?: string;
  errorMessage?: string;
}

export interface Station {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  status: 'available' | 'in_use' | 'offline' | 'maintenance';
  connectorType: 'ccs' | 'chademo' | 'tesla' | 'j1772';
  maxPower: number; // kW
  pricePerKwh: number; // USD per kWh
  networkId?: string;
  lastUpdated: Date;
  amenities?: string[];
}

export interface Customer {
  id: string;
  email: string;
  userId: string;
  defaultPaymentMethodId?: string;
  created: Date;
  metadata?: Record<string, string>;
}

export interface PaymentIntent {
  id: string;
  amount: number; // in cents
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  clientSecret: string;
  customerId?: string;
  paymentMethodId?: string;
  created: Date;
  metadata?: Record<string, string>;
}

export interface SetupIntent {
  id: string;
  clientSecret: string;
  customerId: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'canceled' | 'succeeded';
  paymentMethodId?: string;
  created: Date;
}

// Stripe webhook event types
export type WebhookEventType = 
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'payment_intent.canceled'
  | 'setup_intent.succeeded'
  | 'payment_method.attached'
  | 'customer.created'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed';

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: {
    object: any;
  };
  created: number;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  customerId?: string;
  paymentMethodId?: string;
  stationId: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface CreateCustomerRequest {
  email: string;
  userId: string;
  metadata?: Record<string, string>;
}

export interface CreateCustomerResponse {
  customer: Customer;
}

export interface CreateSetupIntentRequest {
  customerId: string;
  paymentMethodTypes?: string[];
}

export interface CreateSetupIntentResponse {
  clientSecret: string;
  setupIntentId: string;
}

// Charging session related types
export interface StartChargingSessionRequest {
  stationId: string;
  paymentMethodId?: string;
  estimatedAmount: number;
}

export interface StartChargingSessionResponse {
  sessionId: string;
  paymentIntentId: string;
  clientSecret: string;
}

export interface ChargingSessionUpdate {
  energyDelivered?: number;
  powerDelivered?: number;
  status?: ChargingSession['status'];
  hardwareStatus?: string;
  errorMessage?: string;
}

// Hardware integration types
export interface ChargerHardwareStatus {
  connected: boolean;
  charging: boolean;
  errorCode?: string;
  currentPower?: number; // kW
  voltage?: number;
  current?: number;
  temperature?: number;
  lastHeartbeat: Date;
}

// Receipt and email types
export interface ReceiptData {
  transactionId: string;
  sessionId: string;
  customerEmail: string;
  stationName: string;
  sessionDuration: number; // minutes
  energyDelivered: number; // kWh
  amount: number; // in cents
  currency: string;
  sessionDate: Date;
  receiptUrl?: string;
}

// Analytics and reporting types
export interface SessionAnalytics {
  totalSessions: number;
  totalRevenue: number; // in cents
  totalEnergyDelivered: number; // kWh
  averageSessionDuration: number; // minutes
  averageAmount: number; // in cents
  period: {
    start: Date;
    end: Date;
  };
}

export interface StationAnalytics extends SessionAnalytics {
  stationId: string;
  utilizationRate: number; // percentage
  revenue: number; // in cents
  maintenanceEvents: number;
}