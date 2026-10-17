import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '@/components/TopBar';
// import MapView, {
//   Marker,
//   PROVIDER_GOOGLE,
// } from 'react-native-maps';
let MapView: any, Marker: any, PROVIDER_GOOGLE: any;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}
type DriverLocation = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  route: string;
};

const driverLocations: DriverLocation[] = [
  {
    id: 1,
    name: 'Rahul Sharma',
    latitude: 28.6139,
    longitude: 77.2090,
    route: 'City Center - Airport',
  },
  {
    id: 2,
    name: 'Aman Verma',
    latitude: 28.6220,
    longitude: 77.2150,
    route: 'Old Town - Market',
  },
  {
    id: 3,
    name: 'Priya Nair',
    latitude: 28.6080,
    longitude: 77.2010,
    route: 'North Campus - Station',
  },
];

export default function ViewMapScreen() {
  const router = useRouter();

  // Web fallback
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <TopBar />

        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Live Driver Map</Text>
              <View style={styles.underline} />
            </View>

            <Text
              style={styles.backButton}
              onPress={() =>
                router.push('/TransportManager/tm-home')
              }
            >
              Back
            </Text>
          </View>

          <View style={styles.fallbackBox}>
            <Text style={styles.fallbackTitle}>
              Map preview unavailable on web
            </Text>

            <Text style={styles.fallbackText}>
              Open the app on Android or iOS to view the driver map.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['left', 'right', 'bottom']}
    >
      <TopBar />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Live Driver Map</Text>
            <View style={styles.underline} />
          </View>

          <Text
            style={styles.backButton}
            onPress={() =>
              router.push('/TransportManager/tm-home')
            }
          >
            Back
          </Text>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: 28.6139,
              longitude: 77.2090,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={true}
            zoomEnabled={true}
            scrollEnabled={true}
            rotateEnabled={true}
            pitchEnabled={true}
          >
            {driverLocations.map((driver) => (
              <Marker
                key={driver.id}
                coordinate={{
                  latitude: driver.latitude,
                  longitude: driver.longitude,
                }}
                title={driver.name}
                description={driver.route}
              />
            ))}
          </MapView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding : 20,
    backgroundColor: '#ffffff',
  },

  container: {
    flex: 1,
    paddingVertical:18,
    backgroundColor: '#ffffff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },

  underline: {
    height: 2,
    width: 45,
    backgroundColor: '#1d68bd',
    marginTop: 6,
  },

  backButton: {
    color: '#1d68bd',
    fontSize: 15,
    paddingTop: 4,
  },

  mapContainer: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },

  map: {
    flex: 1,
  },

  fallbackBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  fallbackTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },

  fallbackText: {
    color: '#475569',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
});