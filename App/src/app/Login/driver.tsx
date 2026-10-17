import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavGOLogo } from '@/assets/assets';
import { apiRequest } from '@/utils/api';
import { saveToken, saveUser } from '@/utils/authStorage';

export default function DriverLoginScreen() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!userId || !password) {
      Alert.alert('Error', 'Please enter both ID and Password');
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest<{ success: boolean; token: string; data: { userId: string; name: string; role: 'DRIVER' | 'TRANSPORT_MANAGER' } }>(
        '/auth/login',
        { method: 'POST', body: { userId, password } }
      );

      // Persist token & user info on device
      await saveToken(data.token);
      await saveUser(data.data);

      router.replace('/Driver/driver-home');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not connect to the server';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <NavGOLogo width={180} height={80} />
        </View>

        <Text style={styles.heading}>Driver Login</Text>

        <View style={styles.formBox}>
          <Text style={styles.label}>Driver ID</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter driver ID"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            autoCorrect={false}
            value={userId}
            onChangeText={setUserId}
          />

          <Text style={styles.label}>Password</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.loginButtonPressed,
              loading && { opacity: 0.7 }
            ]}
            accessibilityRole="button"
            onPress={handleLogin}
            disabled={loading}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.loginButtonText,
                  pressed && styles.loginButtonTextPressed,
                ]}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Text>
            )}
          </Pressable>

          <Link href="/" style={styles.backLink}>
            Back to home
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  heading: {
    fontSize: 20,
    fontWeight: '400',
    color: '#1d68bd',
    marginBottom: 24,
    textAlign: 'center',
  },

  formBox: {
    backgroundColor: '#ffffff',
    padding: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    marginTop: 8,
  },

  input: {
    height: 50,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#000000',
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    color: '#0f172a',
    marginBottom: 14,
  },

  loginButton: {
    height: 52,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#1d68bd',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    
  },

  loginButtonPressed: {
    borderColor: '#000000',
  },

  loginButtonText: {
     color: '#1d68bd',
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
  },

  loginButtonTextPressed: {
    color: '#000000',
  },

  backLink: {
    marginTop: 18,
    color: '#1d68bd',
    textAlign: 'center',
    fontWeight: '400',
  },
});