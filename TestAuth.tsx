// TestAuth.tsx
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';
import { auth } from './src/config/firebase';

export default function TestAuth() {
  const [user, setUser] = useState(null);
  
  const testSignUp = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, 'test@test.com', 'password123');
      setUser(result.user);
      console.log('✅ Sign up successful');
    } catch (error) {
      console.error('❌ Sign up failed:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>User: {user ? user.email : 'None'}</Text>
      <Button title="Test Sign Up" onPress={testSignUp} />
    </View>
  );
}