import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { NavGOLogo } from '@/assets/assets';

export default function TopBar() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    setShowMenu(false);
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <NavGOLogo width={115} height={50} />

      <View style={styles.profileContainer}>
        {/* Profile Circle */}
        <Pressable
          onPress={() => setShowMenu(!showMenu)}
          style={({ pressed }) => [
            styles.profileIcon,
            pressed && styles.profileIconPressed,
          ]}
        >
          <Text style={styles.profileIconText}>TM</Text>
        </Pressable>

        {/* Logout Menu */}
        {showMenu && (
          <View style={styles.menu}>
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutButtonPressed,
              ]}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },

  profileContainer: {
    position: 'relative',
  },

  profileIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1d68bd',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileIconPressed: {
    opacity: 0.8,
  },

  profileIconText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  menu: {
    position: 'absolute',
    top: 48,
    right: 0,
    width: 110,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    zIndex: 1000,
    elevation: 5,
  },

  logoutButton: {
    height: 42,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },

  logoutButtonPressed: {
    backgroundColor: '#f1f5f9',
  },

  logoutText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
});