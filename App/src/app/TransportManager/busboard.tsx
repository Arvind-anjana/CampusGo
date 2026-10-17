import React from 'react';
import {
  SafeAreaViewBase,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import TopBar from '@/components/TopBar';
import { SafeAreaView } from 'react-native-safe-area-context';

type BusBoardItem = {
  busNo: string;
  driver: string;
  route: string;
  status: 'A' | 'N';
};

const busData: BusBoardItem[] = [
  {
    busNo: '12',
    driver: 'Rahul Sharma',
    route: 'City Center - Airport',
    status: 'A',
  },
  {
    busNo: '07',
    driver: 'Aman Verma',
    route: 'Old Town - Market',
    status: 'A',
  },
  {
    busNo: '18',
    driver: 'Priya Nair',
    route: 'North Campus - Station',
    status: 'N',
  },
  {
    busNo: '22',
    driver: 'Karan Mehta',
    route: 'Downtown - Industrial Zone',
    status: 'A',
  },
];

export default function BusBoard() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <TopBar/>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Bus Board</Text>
            <View style={styles.underline} />
          </View>

          <Text
            style={styles.backButton}
            onPress={() => router.back()}
          >
            Back
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.row, styles.headerRow]}>
            <View style={[styles.cell, styles.busColumn]}>
              <Text style={styles.headerText}>Bus No</Text>
            </View>

            <View style={[styles.cell, styles.driverColumn]}>
              <Text style={styles.headerText}>Driver</Text>
            </View>

            <View style={[styles.cell, styles.routeColumn]}>
              <Text style={styles.headerText}>Route</Text>
            </View>

            <View style={[styles.cell, styles.statusColumn]}>
              <Text style={styles.headerText}>Status</Text>
            </View>
          </View>

          {/* Table Data */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {busData.map((bus, index) => (
              <View
                key={bus.busNo}
                style={[
                  styles.row,
                  index % 2 === 0 && styles.alternateRow,
                ]}
              >
                {/* Bus Number */}
                <View style={[styles.cell, styles.busColumn]}>
                  <Text style={styles.busText}>{bus.busNo}</Text>
                </View>

                {/* Driver */}
                <View style={[styles.cell, styles.driverColumn]}>
                  <Text style={styles.cellText}>
                    {bus.driver}
                  </Text>
                </View>

                {/* Route */}
                <View style={[styles.cell, styles.routeColumn]}>
                  <Text style={styles.cellText}>
                    {bus.route}
                  </Text>
                </View>

                {/* Status */}
                <View style={[styles.cell, styles.statusColumn]}>
                  <Text
                    style={[
                      styles.statusText,
                      bus.status === 'A'
                        ? styles.activeStatus
                        : styles.negativeStatus,
                    ]}
                  >
                    {bus.status}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal:20,
    backgroundColor: '#ffffff',
  },

  content: {
    flex: 1,
    paddingVertical:18,
  },

  /* Header */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
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

  /* Table */

  table: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },

  row: {
    flexDirection: 'row',
    minHeight: 58,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  headerRow: {
    minHeight: 50,
    backgroundColor: '#f8fafc',
  },

  alternateRow: {
    backgroundColor: '#fafafa',
  },

  /* Cells */

  cell: {
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },

  busColumn: {
    flex: 0.8,
  },

  driverColumn: {
    flex: 1.3,
  },

  routeColumn: {
    flex: 2,
  },

  statusColumn: {
    flex: 0.7,
    borderRightWidth: 0,
    alignItems: 'center',
  },

  /* Text */

  headerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },

  cellText: {
    fontSize: 13,
    color: '#000000',
  },

  busText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },

  statusText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },

  activeStatus: {
    color: '#16a34a',
  },

  negativeStatus: {
    color: '#dc2626',
  },
});