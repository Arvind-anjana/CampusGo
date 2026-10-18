import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '@/components/TopBar';
import LeafletMapView from '@/components/LeafletMapView';

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
    name: 'Rahul Sharma (Bus 101)',
    latitude: 22.75115,
    longitude: 75.89555,
    route: 'Vijay Nagar Square',
  },
  {
    id: 2,
    name: 'Aman Verma (Bus 102)',
    latitude: 22.7244,
    longitude: 75.8839,
    route: 'Palasia Square',
  },
  {
    id: 3,
    name: 'Priya Nair (Bus 103)',
    latitude: 22.82,
    longitude: 75.84,
    route: 'SVVV Campus',
  },
];

export default function ViewMapScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
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
            onPress={() => router.push('/TransportManager/tm-home')}
          >
            Back
          </Text>
        </View>

        {/* OpenStreetMap Leaflet Map */}
        <View style={styles.mapContainer}>
          <LeafletMapView
            initialCenter={{ latitude: 22.75115, longitude: 75.89555 }}
            initialZoom={12}
            stops={driverLocations.map((d) => ({
              id: String(d.id),
              name: `${d.name} (${d.route})`,
              latitude: d.latitude,
              longitude: d.longitude,
              index: d.id,
            }))}
            readOnly={true}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    paddingVertical: 18,
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
    cursor: 'pointer' as any,
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
});