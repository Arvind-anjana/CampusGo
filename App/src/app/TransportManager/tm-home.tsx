import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TopBar from '@/components/TopBar';

const menuItems = [
  {
    title: 'Manage Driver',
    route: '/TransportManager/manage-driver',
  },
  {
    title: 'Manage Route',
    route: '/TransportManager/manage-route',
  },
  {
    title: 'Bus Board',
    route: '/TransportManager/busboard',
  },
  {
    title: 'View Map',
    route: '/TransportManager/view-map',
  },
] as const;

export default function TransportManagerHomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Reusable Top Bar */}
        <TopBar />

        {/* Dashboard Header */}
        <View style={styles.dashboardHeader}>
          <Text style={styles.dashboardTitle}>Dashboard</Text>
          <View style={styles.dashboardLine} />
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {menuItems.map((item) => (
            <Pressable
              key={item.title}
              style={({ pressed }) => [
                styles.menuButton,
                pressed && styles.menuButtonPressed,
              ]}
              accessibilityRole="button"
              onPress={() => router.push(item.route)}
            >
              {({ pressed }) => (
                <>
                  <Text
                    style={[
                      styles.menuButtonText,
                      pressed && styles.menuButtonTextPressed,
                    ]}
                  >
                    {item.title}
                  </Text>

                  <Text
                    style={[
                      styles.arrow,
                      pressed && styles.arrowPressed,
                    ]}
                  >
                    →
                  </Text>
                </>
              )}
            </Pressable>
          ))}
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
    paddingHorizontal: 22,
  },

  dashboardHeader: {
    marginTop: 32,
    marginBottom: 22,
  },

  dashboardTitle: {
    color: '#000000',
    fontSize: 24,
    fontWeight: '600',
  },

  dashboardLine: {
    width: 125,
    height: 3,
    backgroundColor: '#1d68bd',
    marginTop: 8,
  },

  menu: {
    gap: 14,
  },

  menuButton: {
    minHeight: 58,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 18,

    backgroundColor: '#ffffff',

    borderWidth: 1,
    borderColor: '#1d68bd',
    borderRadius: 0,
  },

  menuButtonPressed: {
    backgroundColor: '#1d68bd',
    borderColor: '#1d68bd',
  },

  menuButtonText: {
    color: '#1d68bd',
    fontSize: 16,
    fontWeight: '500',
  },

  menuButtonTextPressed: {
    color: '#ffffff',
  },

  arrow: {
    color: '#1d68bd',
    fontSize: 22,
  },

  arrowPressed: {
    color: '#ffffff',
  },

  backButton: {
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  backButtonText: {
    color: '#1d68bd',
    fontSize: 14,
    fontWeight: '500',
  },
});