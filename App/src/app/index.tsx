import * as Device from 'expo-device';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { router } from 'expo-router';
import { NavGOLogo } from '@/assets/assets';
export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <NavGOLogo width={180} height={80} />
        </View>

        

        {/* Login Buttons */}
        <View style={styles.buttonGroup}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            onPress={() => router.push('/Login/driver')}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.buttonText,
                  pressed && styles.buttonTextPressed,
                ]}
              >
                Login as Driver
              </Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            onPress={() => router.push('/Login/transport-manager')}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.buttonText,
                  pressed && styles.buttonTextPressed,
                ]}
              >
                Login as Transport Manager
              </Text>
            )}
          </Pressable>
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  logoContainer: {
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: '#1d68bd',
    fontSize: 20,
    fontWeight: '400',
    marginBottom: 32,
  },

  buttonGroup: {
    width: '100%',
    gap: 16,
  },

  button: {
     minHeight: 40,
    alignSelf: 'center',
    padding: 5,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#1d68bd',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },

  buttonPressed: {
    borderColor: '#000000',
    borderRadius: 0,
    backgroundColor: '#ffffff',
  },

  buttonText: {
    color: '#1d68bd',
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
  },

  buttonTextPressed: {
    color: '#000000',
  },
});