// app/(app)/profile.tsx - UPDATED WITH STATION OWNER ACCESS
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Mock check for station owner role
  // In real app, this would come from user profile in Firebase
  const isStationOwner = user?.email === 'daniel@voltuoso.com' || 
                        user?.email?.includes('owner') || 
                        user?.email?.includes('station');

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleStationOwnerAccess = () => {
    if (isStationOwner) {
      router.push('/(app)/station-owner-dashboard');
    } else {
      Alert.alert(
        'Station Owner Access',
        'This feature is only available to station owners. Contact support to become a station owner.',
        [
          { text: 'Contact Support', onPress: () => console.log('Contact support') },
          { text: 'OK', style: 'cancel' },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.memberSince}>
            Member since {new Date().getFullYear()}
          </Text>
          {isStationOwner && (
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerBadgeText}>🏢 Station Owner</Text>
            </View>
          )}
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(app)/transaction-history')}
          >
            <Text style={styles.menuIcon}>📋</Text>
            <Text style={styles.menuText}>Transaction History</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(app)/payment')}
          >
            <Text style={styles.menuIcon}>💳</Text>
            <Text style={styles.menuText}>Payment Methods</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(app)/sessions')}
          >
            <Text style={styles.menuIcon}>⚡</Text>
            <Text style={styles.menuText}>Charging Sessions</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          {/* Station Owner Dashboard - Conditional */}
          <TouchableOpacity 
            style={[styles.menuItem, isStationOwner && styles.ownerMenuItem]}
            onPress={handleStationOwnerAccess}
          >
            <Text style={styles.menuIcon}>🏢</Text>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Station Owner Dashboard</Text>
              {!isStationOwner && (
                <Text style={styles.menuSubtext}>Contact support to access</Text>
              )}
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert('Settings', 'Settings coming soon!')}
          >
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuText}>Settings</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert('Support', 'Contact: support@voltuoso.com')}
          >
            <Text style={styles.menuIcon}>❓</Text>
            <Text style={styles.menuText}>Help & Support</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Voltuoso App v1.0.0</Text>
          <Text style={styles.appInfoText}>
            Made with 💚 for EV drivers
          </Text>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#2ECC71',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2ECC71',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  email: { 
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  ownerBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ownerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2ECC71',
  },
  menuSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ownerMenuItem: {
    backgroundColor: '#f8fff8',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  menuSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  appInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appInfoText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  signOutButton: { 
    backgroundColor: '#E74C3C',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  signOutText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '600'
  },
});