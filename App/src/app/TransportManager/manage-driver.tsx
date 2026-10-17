import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TopBar from '@/components/TopBar';
import { apiRequest } from '@/utils/api'; // Adjust path if needed
import { getToken } from '@/utils/authStorage';
type Driver = {
  id: string;
  name: string;
  mobile: string;
  d_id: string;
  assignedRoute: string;
  assignedBus: string;
};

type BackendDriver = {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  assignedRoute?: string;
  assignedBus?: string;
};

type FormState = {
  name: string;
  mobile: string;
  assignedRoute: string;
  assignedBus: string;
  password: string;
};

const emptyForm: FormState = {
  name: '',
  mobile: '',
  assignedRoute: '',
  assignedBus: '',
  password: '',
};

export default function ManageDriverScreen() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  // Fetch Drivers from Backend API
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      // const token = await AsyncStorage.getItem('token');
      const token = await getToken();
      // console.log('🔑 TOKEN VALUE IN MANAGE DRIVER:', token);
      const response = await apiRequest<{ success: boolean; data: BackendDriver[] }>(
        '/transport-managers/drivers',
        {
          method: 'GET',
          token,
        }
      );

      if (response.success && response.data) {
        const mappedDrivers: Driver[] = response.data.map((item) => ({
          id: item._id || item.userId,
          name: item.name,
          mobile: item.phone,
          d_id: item.userId,
          assignedRoute: item.assignedRoute || 'Unassigned',
          assignedBus: item.assignedBus || 'Unassigned',
        }));
        setDrivers(mappedDrivers);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const openCreateModal = () => {
    setEditingDriverId(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const openEditModal = (driver: Driver) => {
    setEditingDriverId(driver.id);

    setForm({
      name: driver.name,
      mobile: driver.mobile,
      assignedRoute: driver.assignedRoute,
      assignedBus: driver.assignedBus,
      password: '',
    });

    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingDriverId(null);
    setForm(emptyForm);
  };

  const handleSaveDriver = async () => {
    if (!form.name.trim() || !form.mobile.trim()) {
      Alert.alert('Missing fields', 'Please enter driver name and phone number.');
      return;
    }

    const token = await AsyncStorage.getItem('token');

    if (editingDriverId !== null) {
      // Edit flow (when backend PUT endpoint is ready)
      Alert.alert('Notice', 'Driver update API endpoint pending.');
    } else {
      // Create Driver Flow
      if (!form.password.trim()) {
        Alert.alert('Missing password', 'Please enter a password for the driver.');
        return;
      }

      if (form.password.length < 6) {
        Alert.alert('Weak Password', 'Password must be at least 6 characters.');
        return;
      }

      try {
        setSubmitting(true);

        const response = await apiRequest<{ success: boolean; message: string }>(
          '/transport-managers/drivers',
          {
            method: 'POST',
            body: {
              name: form.name.trim(),
              phone: form.mobile.trim(),
              password: form.password.trim(),
            },
            token,
          }
        );

        if (response.success) {
          Alert.alert('Success', 'Driver created successfully!');
          closeModal();
          fetchDrivers(); // Refresh list from server
        }
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to create driver');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleDeleteDriver = () => {
    if (editingDriverId === null) return;

    Alert.alert(
      'Delete Driver',
      'Are you sure you want to delete this driver?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Delete API trigger can be attached here
            closeModal();
          },
        },
      ]
    );
  };

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TopBar />

        {/* Page Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Manage Driver</Text>
            <View style={styles.titleLine} />
          </View>

          <Link href="/TransportManager/tm-home" asChild>
            <Pressable style={styles.backButton}>
              <Ionicons name="arrow-back" size={18} color="#1d68bd" />
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
          </Link>
        </View>

        {/* Driver List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1d68bd" />
            <Text style={styles.loadingText}>Fetching drivers...</Text>
          </View>
        ) : (
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {drivers.map((driver) => (
              <View key={driver.id} style={styles.driverCard}>
                <View style={styles.driverInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.driverName}>{driver.name}</Text>
                    <Text style={styles.driverId}>{driver.d_id}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={15} color="#64748b" />
                    <Text style={styles.infoText}>{driver.mobile}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="navigate-outline" size={15} color="#64748b" />
                    <Text style={styles.infoText} numberOfLines={1}>
                      {driver.assignedRoute}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="bus-outline" size={15} color="#64748b" />
                    <Text style={styles.infoText}>{driver.assignedBus}</Text>
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.editButton,
                    pressed && styles.editButtonPressed,
                  ]}
                  onPress={() => openEditModal(driver)}
                >
                  <Ionicons name="create-outline" size={20} color="#1d68bd" />
                </Pressable>
              </View>
            ))}

            <View style={styles.bottomSpace} />
          </ScrollView>
        )}

        {/* Add Driver */}
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          onPress={openCreateModal}
        >
          <Ionicons name="add" size={22} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Driver</Text>
        </Pressable>
      </View>

      {/* Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingDriverId !== null ? 'Edit Driver' : 'Create Driver'}
                </Text>
                <Pressable onPress={closeModal}>
                  <Ionicons name="close" size={24} color="#000000" />
                </Pressable>
              </View>

              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(text) => updateField('name', text)}
                placeholder="Enter driver name"
                placeholderTextColor="#94a3b8"
              />

              <Text style={styles.label}>Mobile</Text>
              <TextInput
                style={styles.input}
                value={form.mobile}
                onChangeText={(text) => updateField('mobile', text)}
                placeholder="Enter mobile number"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                maxLength={10}
              />

              {editingDriverId === null && (
                <>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    value={form.password}
                    onChangeText={(text) => updateField('password', text)}
                    placeholder="Enter password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                  />
                </>
              )}

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.saveButton, submitting && { opacity: 0.7 }]}
                  onPress={handleSaveDriver}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons
                        name={editingDriverId !== null ? 'checkmark' : 'add'}
                        size={19}
                        color="#ffffff"
                      />
                      <Text style={styles.saveButtonText}>
                        {editingDriverId !== null ? 'Update' : 'Create'}
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>

              <Pressable style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, paddingHorizontal: 18 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 18,
  },
  title: { fontSize: 24, fontWeight: '600', color: '#000000' },
  titleLine: { width: 38, height: 3, backgroundColor: '#1d68bd', marginTop: 7 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  backButtonText: { color: '#1d68bd', fontSize: 14, fontWeight: '500' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748b', fontSize: 14 },
  list: { flex: 1 },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 3,
    borderLeftColor: '#1d68bd',
    paddingVertical: 15,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  driverInfo: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  driverName: { flex: 1, color: '#000000', fontSize: 16, fontWeight: '600' },
  driverId: { color: '#1d68bd', fontSize: 12, fontWeight: '600', marginLeft: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 5 },
  infoText: { flex: 1, color: '#64748b', fontSize: 13 },
  editButton: {
    width: 40,
    height: 40,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1d68bd',
    backgroundColor: '#ffffff',
  },
  editButtonPressed: { backgroundColor: '#eaf3fc' },
  addButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#1d68bd',
    marginTop: 12,
    marginBottom: 18,
  },
  addButtonPressed: { backgroundColor: '#000000' },
  addButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '500' },
  bottomSpace: { height: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#ffffff',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 30,
    borderTopWidth: 2,
    borderTopColor: '#1d68bd',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: { fontSize: 22, fontWeight: '600', color: '#000000' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginTop: 13,
    marginBottom: 7,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#000000',
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: 14,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 22 },
  saveButton: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1d68bd',
  },
  saveButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '500' },
  cancelButton: { alignItems: 'center', paddingVertical: 14, marginTop: 5 },
  cancelButtonText: { color: '#64748b', fontSize: 14, fontWeight: '500' },
});


// import { Ionicons } from '@expo/vector-icons';
// import { Link, router } from 'expo-router';
// import { useState } from 'react';
// import {
//   Alert,
//   Modal,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// import TopBar from '@/components/TopBar';

// type Driver = {
//   id: number;
//   name: string;
//   mobile: string;
//   d_id: string;
//   assignedRoute: string;
//   assignedBus: string;
// };

// const initialDrivers: Driver[] = [
//   {
//     id: 1,
//     name: 'Rahul Sharma',
//     mobile: '9876543210',
//     d_id: 'DV001',
//     assignedRoute: 'City Center - Airport',
//     assignedBus: 'Bus 12',
//   },
//   {
//     id: 2,
//     name: 'Aman Verma',
//     mobile: '9876543211',
//     d_id: 'DV002',
//     assignedRoute: 'Old Town - Market',
//     assignedBus: 'Bus 07',
//   },
//   {
//     id: 3,
//     name: 'Priya Nair',
//     mobile: '9876543212',
//     d_id: 'DV003',
//     assignedRoute: 'North Campus - Station',
//     assignedBus: 'Bus 18',
//   },
// ];

// type FormState = {
//   name: string;
//   mobile: string;
//   d_id: string;
//   assignedRoute: string;
//   assignedBus: string;
//   password: string;
// };

// const emptyForm: FormState = {
//   name: '',
//   mobile: '',
//   d_id: '',
//   assignedRoute: '',
//   assignedBus: '',
//   password: '',
// };

// export default function ManageDriverScreen() {
//   const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [editingDriverId, setEditingDriverId] = useState<number | null>(null);
//   const [form, setForm] = useState<FormState>(emptyForm);

//   const openCreateModal = () => {
//     setEditingDriverId(null);
//     setForm(emptyForm);
//     setModalVisible(true);
//   };

//   const openEditModal = (driver: Driver) => {
//     setEditingDriverId(driver.id);

//     setForm({
//       name: driver.name,
//       mobile: driver.mobile,
//       d_id: driver.d_id,
//       assignedRoute: driver.assignedRoute,
//       assignedBus: driver.assignedBus,
//       password: '',
//     });

//     setModalVisible(true);
//   };

//   const closeModal = () => {
//     setModalVisible(false);
//     setEditingDriverId(null);
//     setForm(emptyForm);
//   };

//   const handleSaveDriver = () => {
//     if (
//       !form.name.trim() ||
//       !form.mobile.trim() ||
//       !form.d_id.trim() ||
//       !form.assignedRoute.trim() ||
//       !form.assignedBus.trim()
//     ) {
//       Alert.alert(
//         'Missing fields',
//         'Please fill in all driver details.'
//       );
//       return;
//     }

//     if (editingDriverId !== null) {
//       setDrivers((current) =>
//         current.map((driver) =>
//           driver.id === editingDriverId
//             ? {
//                 ...driver,
//                 name: form.name.trim(),
//                 mobile: form.mobile.trim(),
//                 d_id: form.d_id.trim(),
//                 assignedRoute: form.assignedRoute.trim(),
//                 assignedBus: form.assignedBus.trim(),
//               }
//             : driver
//         )
//       );

//       Alert.alert('Driver Updated', 'Driver details have been updated.');
//     } else {
//       if (!form.password.trim()) {
//         Alert.alert(
//           'Missing password',
//           'Please enter a password for the driver.'
//         );
//         return;
//       }

//       const newDriver: Driver = {
//         id: Date.now(),
//         name: form.name.trim(),
//         mobile: form.mobile.trim(),
//         d_id: form.d_id.trim(),
//         assignedRoute: form.assignedRoute.trim(),
//         assignedBus: form.assignedBus.trim(),
//       };

//       setDrivers((current) => [newDriver, ...current]);

//       Alert.alert('Driver Added', 'New driver has been created.');
//     }

//     closeModal();
//   };

//   const handleDeleteDriver = () => {
//     if (editingDriverId === null) return;

//     Alert.alert(
//       'Delete Driver',
//       'Are you sure you want to delete this driver?',
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: () => {
//             setDrivers((current) =>
//               current.filter(
//                 (driver) => driver.id !== editingDriverId
//               )
//             );

//             closeModal();

//             Alert.alert(
//               'Driver Deleted',
//               'The driver has been removed.'
//             );
//           },
//         },
//       ]
//     );
//   };

//   const updateField = (field: keyof FormState, value: string) => {
//     setForm((current) => ({
//       ...current,
//       [field]: value,
//     }));
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>

//         {/* Top Bar */}
//         <TopBar />

//         {/* Page Header */}
//         <View style={styles.headerRow}>
//           <View>
//             <Text style={styles.title}>Manage Driver</Text>
//             <View style={styles.titleLine} />
//           </View>

//           <Link href="/TransportManager/tm-home" asChild>
//             <Pressable style={styles.backButton}>
//               <Ionicons
//                 name="arrow-back"
//                 size={18}
//                 color="#1d68bd"
//               />
//               <Text style={styles.backButtonText}>Back</Text>
//             </Pressable>
//           </Link>
//         </View>

//         {/* Driver List */}
//         <ScrollView
//           style={styles.list}
//           showsVerticalScrollIndicator={false}
//         >
//           {drivers.map((driver) => (
//             <View key={driver.id} style={styles.driverCard}>

//               {/* Driver Information */}
//               <View style={styles.driverInfo}>

//                 <View style={styles.nameRow}>
//                   <Text style={styles.driverName}>
//                     {driver.name}
//                   </Text>

//                   <Text style={styles.driverId}>
//                     {driver.d_id}
//                   </Text>
//                 </View>

//                 <View style={styles.infoRow}>
//                   <Ionicons
//                     name="call-outline"
//                     size={15}
//                     color="#64748b"
//                   />

//                   <Text style={styles.infoText}>
//                     {driver.mobile}
//                   </Text>
//                 </View>

//                 <View style={styles.infoRow}>
//                   <Ionicons
//                     name="navigate-outline"
//                     size={15}
//                     color="#64748b"
//                   />

//                   <Text
//                     style={styles.infoText}
//                     numberOfLines={1}
//                   >
//                     {driver.assignedRoute}
//                   </Text>
//                 </View>

//                 <View style={styles.infoRow}>
//                   <Ionicons
//                     name="bus-outline"
//                     size={15}
//                     color="#64748b"
//                   />

//                   <Text style={styles.infoText}>
//                     {driver.assignedBus}
//                   </Text>
//                 </View>
//               </View>

//               {/* Edit Icon */}
//               <Pressable
//                 style={({ pressed }) => [
//                   styles.editButton,
//                   pressed && styles.editButtonPressed,
//                 ]}
//                 onPress={() => openEditModal(driver)}
//                 accessibilityRole="button"
//                 accessibilityLabel={`Edit ${driver.name}`}
//               >
//                 <Ionicons
//                   name="create-outline"
//                   size={20}
//                   color="#1d68bd"
//                 />
//               </Pressable>
//             </View>
//           ))}

//           <View style={styles.bottomSpace} />
//         </ScrollView>

//         {/* Add Driver */}
//         <Pressable
//           style={({ pressed }) => [
//             styles.addButton,
//             pressed && styles.addButtonPressed,
//           ]}
//           onPress={openCreateModal}
//           accessibilityRole="button"
//         >
//           <Ionicons
//             name="add"
//             size={22}
//             color="#ffffff"
//           />

//           <Text style={styles.addButtonText}>
//             Add Driver
//           </Text>
//         </Pressable>
//       </View>

//       {/* Create / Edit Modal */}
//       <Modal
//         transparent
//         visible={modalVisible}
//         animationType="slide"
//         onRequestClose={closeModal}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalCard}>

//             <ScrollView
//               showsVerticalScrollIndicator={false}
//               keyboardShouldPersistTaps="handled"
//             >
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalTitle}>
//                   {editingDriverId !== null
//                     ? 'Edit Driver'
//                     : 'Create Driver'}
//                 </Text>

//                 <Pressable onPress={closeModal}>
//                   <Ionicons
//                     name="close"
//                     size={24}
//                     color="#000000"
//                   />
//                 </Pressable>
//               </View>

//               {/* Name */}
//               <Text style={styles.label}>Name</Text>

//               <TextInput
//                 style={styles.input}
//                 value={form.name}
//                 onChangeText={(text) =>
//                   updateField('name', text)
//                 }
//                 placeholder="Enter driver name"
//                 placeholderTextColor="#94a3b8"
//               />

//               {/* Mobile */}
//               <Text style={styles.label}>Mobile</Text>

//               <TextInput
//                 style={styles.input}
//                 value={form.mobile}
//                 onChangeText={(text) =>
//                   updateField('mobile', text)
//                 }
//                 placeholder="Enter mobile number"
//                 placeholderTextColor="#94a3b8"
//                 keyboardType="phone-pad"
//                 maxLength={10}
//               />

//               {/* Driver ID */}
//               <Text style={styles.label}>Driver ID</Text>

//               <TextInput
//                 style={styles.input}
//                 value={form.d_id}
//                 onChangeText={(text) =>
//                   updateField('d_id', text)
//                 }
//                 placeholder="Enter driver ID"
//                 placeholderTextColor="#94a3b8"
//                 autoCapitalize="characters"
//               />

//               {/* Assigned Route */}
//               <Text style={styles.label}>
//                 Assigned Route
//               </Text>

//               <TextInput
//                 style={styles.input}
//                 value={form.assignedRoute}
//                 onChangeText={(text) =>
//                   updateField('assignedRoute', text)
//                 }
//                 placeholder="Enter assigned route"
//                 placeholderTextColor="#94a3b8"
//               />

//               {/* Assigned Bus */}
//               <Text style={styles.label}>
//                 Assigned Bus
//               </Text>

//               <TextInput
//                 style={styles.input}
//                 value={form.assignedBus}
//                 onChangeText={(text) =>
//                   updateField('assignedBus', text)
//                 }
//                 placeholder="Enter assigned bus"
//                 placeholderTextColor="#94a3b8"
//               />

//               {/* Password - Create only */}
//               {editingDriverId === null && (
//                 <>
//                   <Text style={styles.label}>Password</Text>

//                   <TextInput
//                     style={styles.input}
//                     value={form.password}
//                     onChangeText={(text) =>
//                       updateField('password', text)
//                     }
//                     placeholder="Enter password"
//                     placeholderTextColor="#94a3b8"
//                     secureTextEntry
//                   />
//                 </>
//               )}

//               {/* Actions */}
//               <View style={styles.modalActions}>

//                 {editingDriverId !== null && (
//                   <Pressable
//                     style={styles.deleteButton}
//                     onPress={handleDeleteDriver}
//                   >
//                     <Ionicons
//                       name="trash-outline"
//                       size={18}
//                       color="#dc2626"
//                     />

//                     <Text style={styles.deleteButtonText}>
//                       Delete
//                     </Text>
//                   </Pressable>
//                 )}

//                 <Pressable
//                   style={styles.saveButton}
//                   onPress={handleSaveDriver}
//                 >
//                   <Ionicons
//                     name={
//                       editingDriverId !== null
//                         ? 'checkmark'
//                         : 'add'
//                     }
//                     size={19}
//                     color="#ffffff"
//                   />

//                   <Text style={styles.saveButtonText}>
//                     {editingDriverId !== null
//                       ? 'Update'
//                       : 'Create'}
//                   </Text>
//                 </Pressable>
//               </View>

//               <Pressable
//                 style={styles.cancelButton}
//                 onPress={closeModal}
//               >
//                 <Text style={styles.cancelButtonText}>
//                   Cancel
//                 </Text>
//               </Pressable>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//   },

//   container: {
//     flex: 1,
//     paddingHorizontal: 18,
//   },

//   /* Header */

//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginTop: 24,
//     marginBottom: 18,
//   },

//   title: {
//     fontSize: 24,
//     fontWeight: '600',
//     color: '#000000',
//   },

//   titleLine: {
//     width: 38,
//     height: 3,
//     backgroundColor: '#1d68bd',
//     marginTop: 7,
//   },

//   backButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 5,
//   },

//   backButtonText: {
//     color: '#1d68bd',
//     fontSize: 14,
//     fontWeight: '500',
//   },

//   /* Driver List */

//   list: {
//     flex: 1,
//   },

//   driverCard: {
//     flexDirection: 'row',
//     alignItems: 'center',

//     backgroundColor: '#ffffff',

//     borderWidth: 1,
//     borderColor: '#e2e8f0',

//     borderLeftWidth: 3,
//     borderLeftColor: '#1d68bd',

//     paddingVertical: 15,
//     paddingHorizontal: 14,

//     marginBottom: 10,
//   },

//   driverInfo: {
//     flex: 1,
//   },

//   nameRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },

//   driverName: {
//     flex: 1,
//     color: '#000000',
//     fontSize: 16,
//     fontWeight: '600',
//   },

//   driverId: {
//     color: '#1d68bd',
//     fontSize: 12,
//     fontWeight: '600',
//     marginLeft: 10,
//   },

//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 7,
//     marginTop: 5,
//   },

//   infoText: {
//     flex: 1,
//     color: '#64748b',
//     fontSize: 13,
//   },

//   editButton: {
//     width: 40,
//     height: 40,

//     marginLeft: 12,

//     alignItems: 'center',
//     justifyContent: 'center',

//     borderWidth: 1,
//     borderColor: '#1d68bd',
//     backgroundColor: '#ffffff',
//   },

//   editButtonPressed: {
//     backgroundColor: '#eaf3fc',
//   },

//   /* Add Button */

//   addButton: {
//     height: 52,

//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',

//     gap: 7,

//     backgroundColor: '#1d68bd',

//     marginTop: 12,
//     marginBottom: 18,
//   },

//   addButtonPressed: {
//     backgroundColor: '#000000',
//   },

//   addButtonText: {
//     color: '#ffffff',
//     fontSize: 15,
//     fontWeight: '500',
//   },

//   bottomSpace: {
//     height: 20,
//   },

//   /* Modal */

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.45)',
//     justifyContent: 'flex-end',
//   },

//   modalCard: {
//     width: '100%',
//     maxHeight: '90%',
//     backgroundColor: '#ffffff',

//     paddingHorizontal: 22,
//     paddingTop: 20,
//     paddingBottom: 30,

//     borderTopWidth: 2,
//     borderTopColor: '#1d68bd',
//   },

//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },

//   modalTitle: {
//     fontSize: 22,
//     fontWeight: '600',
//     color: '#000000',
//   },

//   label: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#000000',
//     marginTop: 13,
//     marginBottom: 7,
//   },

//   input: {
//     height: 48,

//     borderWidth: 1,
//     borderColor: '#000000',

//     borderRadius: 0,

//     paddingHorizontal: 12,

//     backgroundColor: '#ffffff',

//     color: '#000000',
//     fontSize: 14,
//   },

//   /* Modal Actions */

//   modalActions: {
//     flexDirection: 'row',
//     gap: 10,
//     marginTop: 22,
//   },

//   saveButton: {
//     flex: 1,
//     height: 48,

//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',

//     gap: 6,

//     backgroundColor: '#1d68bd',
//   },

//   saveButtonText: {
//     color: '#ffffff',
//     fontSize: 14,
//     fontWeight: '500',
//   },

//   deleteButton: {
//     flex: 1,
//     height: 48,

//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',

//     gap: 6,

//     borderWidth: 1,
//     borderColor: '#dc2626',
//     backgroundColor: '#ffffff',
//   },

//   deleteButtonText: {
//     color: '#dc2626',
//     fontSize: 14,
//     fontWeight: '500',
//   },

//   cancelButton: {
//     alignItems: 'center',
//     paddingVertical: 14,
//     marginTop: 5,
//   },

//   cancelButtonText: {
//     color: '#64748b',
//     fontSize: 14,
//     fontWeight: '500',
//   },
// });