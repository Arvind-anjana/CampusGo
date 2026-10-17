import { Link } from 'expo-router';
import * as Location from 'expo-location';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavGOLogo } from '@/assets/assets';

export default function DriverHomeScreen() {
  const [locationText, setLocationText] =
    useState('Location not started');

  const handleStartLocation = async () => {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission denied',
          'Location permission is required to share your live location.'
        );
        return;
      }

      const current =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      setLocationText(
        `Lat: ${current.coords.latitude.toFixed(5)}\nLng: ${current.coords.longitude.toFixed(5)}`
      );

      Alert.alert(
        'Location Captured',
        `Latitude: ${current.coords.latitude.toFixed(
          5
        )}\nLongitude: ${current.coords.longitude.toFixed(5)}`
      );
    } catch (error) {
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <NavGOLogo width={150} height={65} />
        </View>

        {/* Page Title */}
        <Text style={styles.pageTitle}>Driver Dashboard</Text>

        {/* Driver Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Driver Information
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>Rahul Sharma</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Driver ID</Text>
            <Text style={styles.value}>DV001</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Assigned Bus</Text>
            <Text style={styles.value}>Bus 12</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Assigned Route</Text>
            <Text style={styles.value}>
              City Center - Airport
            </Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationCard}>
          <Text style={styles.sectionTitle}>
            Live Location
          </Text>

          <View style={styles.locationBox}>
            <Text style={styles.locationText}>
              {locationText}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.locationButton,
              pressed && styles.locationButtonPressed,
            ]}
            onPress={handleStartLocation}
          >
            <Text>
              Start Location
            </Text>
          </Pressable>
        </View>

        {/* Back */}
        <Link href="/" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>
              Back to Home
            </Text>
          </Pressable>
        </Link>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },

  /* Logo */

  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },

  /* Page */

  pageTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#1d68bd',
    textAlign: 'center',
    marginBottom: 20,
  },

  /* Cards */

  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 18,
    marginBottom: 16,
  },

  locationCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1d68bd',
    marginBottom: 14,
  },

  /* Driver information */

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 45,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  label: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },

  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    flex: 1.5,
    textAlign: 'right',
  },

  /* Location */

  locationBox: {
    minHeight: 65,
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  locationText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#000000',
  },

  /* Location button */

  locationButton: {
    height: 50,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#1d68bd',
    justifyContent: 'center',
    alignItems: 'center',
  },

  locationButtonPressed: {
    backgroundColor: '#1d68bd',
  },

  locationButtonText: {
    color: '#1d68bd',
    fontSize: 16,
    fontWeight: '500',
  },

  locationButtonTextPressed: {
    color: '#ffffff',
  },

  /* Back */

  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },

  backButtonText: {
    color: '#1d68bd',
    fontSize: 15,
  },
});