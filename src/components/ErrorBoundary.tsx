// src/components/ErrorBoundary.tsx - ERROR HANDLING FOR PAYMENT FAILURES
import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Payment Error Boundary caught an error:', error, errorInfo);
    
    // In production, send error to monitoring service
    // sendErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <PaymentErrorScreen 
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

interface PaymentErrorScreenProps {
  error?: Error;
  onRetry: () => void;
}

export function PaymentErrorScreen({ error, onRetry }: PaymentErrorScreenProps) {
  const getErrorMessage = (error?: Error) => {
    if (!error) return 'Something went wrong with your payment.';
    
    const message = error.message.toLowerCase();
    
    if (message.includes('network')) {
      return 'Network connection error. Please check your internet connection and try again.';
    }
    if (message.includes('card') || message.includes('payment')) {
      return 'There was an issue with your payment method. Please try a different card or contact your bank.';
    }
    if (message.includes('declined')) {
      return 'Your payment was declined. Please check your payment method or try a different card.';
    }
    if (message.includes('insufficient')) {
      return 'Insufficient funds. Please check your account balance or try a different payment method.';
    }
    
    return 'We encountered an error processing your payment. Please try again.';
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Our support team is available 24/7 to help with payment issues.',
      [
        { 
          text: 'Call Support', 
          onPress: () => console.log('Call support: 1-800-VOLTUOSO') 
        },
        { 
          text: 'Email Support', 
          onPress: () => console.log('Email: support@voltuoso.com') 
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.errorCard}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Payment Error</Text>
        <Text style={styles.errorMessage}>
          {getErrorMessage(error)}
        </Text>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleContactSupport}
          >
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.helpText}>
          💡 Tip: Make sure your card has international transactions enabled if you're traveling.
        </Text>
      </View>
    </View>
  );
}

// Network Error Handler
export function NetworkErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.errorCard}>
        <Text style={styles.errorIcon}>🌐</Text>
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorMessage}>
          Unable to connect to our servers. Please check your internet connection and try again.
        </Text>
        
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
        >
          <Text style={styles.retryButtonText}>Retry Connection</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Station Offline Error
export function StationOfflineScreen({ stationName, onFindAlternative }: { 
  stationName: string; 
  onFindAlternative: () => void; 
}) {
  return (
    <View style={styles.container}>
      <View style={styles.errorCard}>
        <Text style={styles.errorIcon}>🔌</Text>
        <Text style={styles.errorTitle}>Station Unavailable</Text>
        <Text style={styles.errorMessage}>
          {stationName} is currently offline or under maintenance. We apologize for the inconvenience.
        </Text>
        
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onFindAlternative}
        >
          <Text style={styles.retryButtonText}>Find Alternative Stations</Text>
        </TouchableOpacity>
        
        <Text style={styles.helpText}>
          📍 We'll help you find the nearest available charging station.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 320,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2ECC71',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  supportButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#2ECC71',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  supportButtonText: {
    color: '#2ECC71',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
});