import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
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

type RouteItem = {
  id: number;
  routeName: string;
  driverName: string;
  busNo: string;
};

const initialRoutes: RouteItem[] = [
  {
    id: 1,
    routeName: 'City Center - Airport',
    driverName: 'Rahul Sharma',
    busNo: 'Bus 12',
  },
  {
    id: 2,
    routeName: 'Old Town - Market',
    driverName: 'Aman Verma',
    busNo: 'Bus 07',
  },
  {
    id: 3,
    routeName: 'North Campus - Station',
    driverName: 'Priya Nair',
    busNo: 'Bus 18',
  },
];

type FormState = {
  routeName: string;
  driverName: string;
  busNo: string;
};

const emptyForm: FormState = {
  routeName: '',
  driverName: '',
  busNo: '',
};

export default function ManageRouteScreen() {
  const [routes, setRoutes] = useState<RouteItem[]>(initialRoutes);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const openCreateModal = () => {
    setEditingRouteId(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const openEditModal = (routeItem: RouteItem) => {
    setEditingRouteId(routeItem.id);

    setForm({
      routeName: routeItem.routeName,
      driverName: routeItem.driverName,
      busNo: routeItem.busNo,
    });

    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingRouteId(null);
    setForm(emptyForm);
  };

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSaveRoute = () => {
    if (
      !form.routeName.trim() ||
      !form.driverName.trim() ||
      !form.busNo.trim()
    ) {
      Alert.alert(
        'Missing fields',
        'Please fill in route name, assigned driver, and bus number.'
      );
      return;
    }

    if (editingRouteId !== null) {
      setRoutes((current) =>
        current.map((routeItem) =>
          routeItem.id === editingRouteId
            ? {
                ...routeItem,
                routeName: form.routeName.trim(),
                driverName: form.driverName.trim(),
                busNo: form.busNo.trim(),
              }
            : routeItem
        )
      );

      Alert.alert(
        'Route Updated',
        'Route details have been updated.'
      );
    } else {
      const newRoute: RouteItem = {
        id: Date.now(),
        routeName: form.routeName.trim(),
        driverName: form.driverName.trim(),
        busNo: form.busNo.trim(),
      };

      setRoutes((current) => [newRoute, ...current]);

      Alert.alert(
        'Route Added',
        'New route has been created.'
      );
    }

    closeModal();
  };

  const handleDeleteRoute = () => {
    if (editingRouteId === null) return;

    Alert.alert(
      'Delete Route',
      'Are you sure you want to delete this route?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setRoutes((current) =>
              current.filter(
                (routeItem) => routeItem.id !== editingRouteId
              )
            );

            closeModal();

            Alert.alert(
              'Route Deleted',
              'The route has been removed.'
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Top Bar */}
        <TopBar />

        {/* Page Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Manage Route</Text>

            <View style={styles.titleLine} />
          </View>

          <Link href="/TransportManager/tm-home" asChild>
            <Pressable style={styles.backButton}>
              <Ionicons
                name="arrow-back"
                size={18}
                color="#1d68bd"
              />

              <Text style={styles.backButtonText}>
                Back
              </Text>
            </Pressable>
          </Link>
        </View>

        {/* Route List */}
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {routes.map((routeItem) => (
            <View
              key={routeItem.id}
              style={styles.routeCard}
            >
              <View style={styles.routeInfo}>

                {/* Route Name */}
                <Text
                  style={styles.routeName}
                  numberOfLines={2}
                >
                  {routeItem.routeName}
                </Text>

                {/* Driver */}
                <View style={styles.infoRow}>
                  <Ionicons
                    name="person-outline"
                    size={15}
                    color="#64748b"
                  />

                  <Text
                    style={styles.infoText}
                    numberOfLines={1}
                  >
                    {routeItem.driverName}
                  </Text>
                </View>

                {/* Bus */}
                <View style={styles.infoRow}>
                  <Ionicons
                    name="bus-outline"
                    size={15}
                    color="#64748b"
                  />

                  <Text style={styles.infoText}>
                    {routeItem.busNo}
                  </Text>
                </View>
              </View>

              {/* Edit */}
              <Pressable
                style={({ pressed }) => [
                  styles.editButton,
                  pressed && styles.editButtonPressed,
                ]}
                onPress={() => openEditModal(routeItem)}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${routeItem.routeName}`}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color="#1d68bd"
                />
              </Pressable>
            </View>
          ))}

          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* Add Route */}
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          onPress={openCreateModal}
          accessibilityRole="button"
        >
          <Ionicons
            name="add"
            size={22}
            color="#ffffff"
          />

          <Text style={styles.addButtonText}>
            Add Route
          </Text>
        </Pressable>
      </View>

      {/* Create / Edit Modal */}
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
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingRouteId !== null
                    ? 'Edit Route'
                    : 'Create Route'}
                </Text>

                <Pressable onPress={closeModal}>
                  <Ionicons
                    name="close"
                    size={24}
                    color="#000000"
                  />
                </Pressable>
              </View>

              {/* Route Name */}
              <Text style={styles.label}>
                Route Name
              </Text>

              <TextInput
                style={styles.input}
                value={form.routeName}
                onChangeText={(text) =>
                  updateField('routeName', text)
                }
                placeholder="Enter route name"
                placeholderTextColor="#94a3b8"
              />

              {/* Assigned Driver */}
              <Text style={styles.label}>
                Assigned Driver
              </Text>

              <TextInput
                style={styles.input}
                value={form.driverName}
                onChangeText={(text) =>
                  updateField('driverName', text)
                }
                placeholder="Enter assigned driver"
                placeholderTextColor="#94a3b8"
              />

              {/* Bus */}
              <Text style={styles.label}>
                Assigned Bus
              </Text>

              <TextInput
                style={styles.input}
                value={form.busNo}
                onChangeText={(text) =>
                  updateField('busNo', text)
                }
                placeholder="Enter assigned bus"
                placeholderTextColor="#94a3b8"
              />

              {/* Actions */}
              <View style={styles.modalActions}>

                {editingRouteId !== null && (
                  <Pressable
                    style={styles.deleteButton}
                    onPress={handleDeleteRoute}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color="#dc2626"
                    />

                    <Text style={styles.deleteButtonText}>
                      Delete
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  style={styles.saveButton}
                  onPress={handleSaveRoute}
                >
                  <Ionicons
                    name={
                      editingRouteId !== null
                        ? 'checkmark'
                        : 'add'
                    }
                    size={19}
                    color="#ffffff"
                  />

                  <Text style={styles.saveButtonText}>
                    {editingRouteId !== null
                      ? 'Update'
                      : 'Create'}
                  </Text>
                </Pressable>
              </View>

              {/* Cancel */}
              <Pressable
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 18,
  },

  /* Header */

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginTop: 24,
    marginBottom: 18,
  },

  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },

  titleLine: {
    width: 38,
    height: 3,
    backgroundColor: '#1d68bd',
    marginTop: 7,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  backButtonText: {
    color: '#1d68bd',
    fontSize: 14,
    fontWeight: '500',
  },

  /* Route List */

  list: {
    flex: 1,
  },

  routeCard: {
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

  routeInfo: {
    flex: 1,
  },

  routeName: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',

    marginBottom: 8,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 7,

    marginTop: 5,
  },

  infoText: {
    flex: 1,

    color: '#64748b',
    fontSize: 13,
  },

  /* Edit */

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

  editButtonPressed: {
    backgroundColor: '#eaf3fc',
  },

  /* Add */

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

  addButtonPressed: {
    backgroundColor: '#000000',
  },

  addButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },

  bottomSpace: {
    height: 20,
  },

  /* Modal */

  modalOverlay: {
    flex: 1,

    backgroundColor: 'rgba(0, 0, 0, 0.45)',

    justifyContent: 'flex-end',
  },

  modalCard: {
    width: '100%',
    maxHeight: '80%',

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

  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
  },

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

    borderRadius: 0,

    paddingHorizontal: 12,

    backgroundColor: '#ffffff',

    color: '#000000',

    fontSize: 14,
  },

  /* Actions */

  modalActions: {
    flexDirection: 'row',

    gap: 10,

    marginTop: 22,
  },

  saveButton: {
    flex: 1,

    height: 48,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,

    backgroundColor: '#1d68bd',
  },

  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },

  deleteButton: {
    flex: 1,

    height: 48,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,

    borderWidth: 1,
    borderColor: '#dc2626',

    backgroundColor: '#ffffff',
  },

  deleteButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },

  cancelButton: {
    alignItems: 'center',

    paddingVertical: 14,

    marginTop: 5,
  },

  cancelButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
});