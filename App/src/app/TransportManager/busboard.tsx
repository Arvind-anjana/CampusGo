import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import TopBar from '@/components/TopBar';
import { apiRequest } from '@/utils/api';

interface BackendAssignment {
  _id: string;
  driverId: string;
  busId: string;
  routeId: string;
  createdBy?: string;
  createdAt?: string;
}

interface BackendDriver {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  isActive?: boolean;
}

interface BackendBus {
  _id: string;
  busId: string;
  busNo: string;
  registrationNo: string;
  isActive?: boolean;
}

interface BackendRoute {
  _id: string;
  routeId: string;
  name: string;
  description?: string;
  stops?: any[];
  isActive?: boolean;
}

export default function BusBoard() {
  const router = useRouter();

  const [assignments, setAssignments] = useState<BackendAssignment[]>([]);
  const [drivers, setDrivers] = useState<BackendDriver[]>([]);
  const [buses, setBuses] = useState<BackendBus[]>([]);
  const [routes, setRoutes] = useState<BackendRoute[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Assignment Modal State (Create / Edit)
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedBusId, setSelectedBusId] = useState<string>('');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Sub-selector picker states
  const [pickerType, setPickerType] = useState<'driver' | 'bus' | 'route' | null>(null);

  // Delete Assignment Modal State
  const [assignmentToDelete, setAssignmentToDelete] = useState<BackendAssignment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const [assignRes, driverRes, busRes, routeRes] = await Promise.all([
        apiRequest<{ success: boolean; data: BackendAssignment[] }>('/assignments'),
        apiRequest<{ success: boolean; data: BackendDriver[] }>('/transport-managers/drivers'),
        apiRequest<{ success: boolean; data: BackendBus[] }>('/bus'),
        apiRequest<{ success: boolean; data: BackendRoute[] }>('/routes'),
      ]);

      if (assignRes.success && assignRes.data) {
        setAssignments(assignRes.data);
      }
      if (driverRes.success && driverRes.data) {
        setDrivers(driverRes.data);
      }
      if (busRes.success && busRes.data) {
        setBuses(busRes.data);
      }
      if (routeRes.success && routeRes.data) {
        setRoutes(routeRes.data);
      }
    } catch (error: any) {
      console.warn('Error fetching bus board data:', error);
      Alert.alert('Notice', error.message || 'Failed to load bus board data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData(assignments.length === 0);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(false);
  };

  const openCreateModal = () => {
    setEditingAssignmentId(null);
    setSelectedDriverId(drivers[0]?.userId || '');
    setSelectedBusId(buses[0]?.busId || '');
    setSelectedRouteId(routes[0]?.routeId || '');
    setModalVisible(true);
  };

  const openEditModal = (assignment: BackendAssignment) => {
    setEditingAssignmentId(assignment._id);
    setSelectedDriverId(assignment.driverId);
    setSelectedBusId(assignment.busId);
    setSelectedRouteId(assignment.routeId);
    setModalVisible(true);
  };

  const closeAssignmentModal = () => {
    setModalVisible(false);
    setEditingAssignmentId(null);
    setPickerType(null);
  };

  const handleSaveAssignment = async () => {
    if (!selectedDriverId) {
      Alert.alert('Missing Field', 'Please select a driver.');
      return;
    }
    if (!selectedBusId) {
      Alert.alert('Missing Field', 'Please select a bus.');
      return;
    }
    if (!selectedRouteId) {
      Alert.alert('Missing Field', 'Please select a route.');
      return;
    }

    try {
      setSubmitting(true);

      if (editingAssignmentId) {
        // Update existing assignment
        const res = await apiRequest<{ success: boolean; message?: string }>(
          `/assignments/${editingAssignmentId}`,
          {
            method: 'PATCH',
            body: {
              driverId: selectedDriverId,
              busId: selectedBusId,
              routeId: selectedRouteId,
            },
          }
        );

        if (res.success) {
          Alert.alert('Success', 'Assignment updated successfully!');
          closeAssignmentModal();
          fetchData(false);
        }
      } else {
        // Create new assignment
        const res = await apiRequest<{ success: boolean; message?: string }>(
          '/assignments',
          {
            method: 'POST',
            body: {
              driverId: selectedDriverId,
              busId: selectedBusId,
              routeId: selectedRouteId,
            },
          }
        );

        if (res.success) {
          Alert.alert('Success', 'Bus and route assigned to driver successfully!');
          closeAssignmentModal();
          fetchData(false);
        }
      }
    } catch (error: any) {
      Alert.alert('Save Failed', error.message || 'Failed to save assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!assignmentToDelete) return;

    try {
      setDeleting(true);
      const res = await apiRequest<{ success: boolean; message?: string }>(
        `/assignments/${assignmentToDelete._id}`,
        { method: 'DELETE' }
      );

      if (res.success) {
        setAssignmentToDelete(null);
        Alert.alert('Success', 'Assignment removed successfully!');
        fetchData(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete assignment');
    } finally {
      setDeleting(false);
    }
  };

  // Helper getters
  const getDriverDisplay = (driverId: string) => {
    const d = drivers.find((x) => x.userId === driverId);
    return d ? `${d.name} (${d.userId})` : driverId;
  };

  const getBusDisplay = (busId: string) => {
    const b = buses.find((x) => x.busId === busId);
    return b ? `Bus ${b.busNo} (${b.registrationNo})` : busId;
  };

  const getRouteDisplay = (routeId: string) => {
    const r = routes.find((x) => x.routeId === routeId);
    return r ? `${r.name} (${r.routeId})` : routeId;
  };

  const selectedDriver = drivers.find((d) => d.userId === selectedDriverId);
  const selectedBus = buses.find((b) => b.busId === selectedBusId);
  const selectedRoute = routes.find((r) => r.routeId === selectedRouteId);

  return (
    <SafeAreaView style={styles.container}>
      <TopBar />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Bus Board</Text>
            <View style={styles.underline} />
          </View>

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={18} color="#1d68bd" />
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        </View>

        {/* Stats Strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{assignments.length}</Text>
            <Text style={styles.statLabel}>Assigned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{buses.length}</Text>
            <Text style={styles.statLabel}>Buses</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{drivers.length}</Text>
            <Text style={styles.statLabel}>Drivers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{routes.length}</Text>
            <Text style={styles.statLabel}>Routes</Text>
          </View>
        </View>

        {/* Table Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1d68bd" />
            <Text style={styles.loadingText}>Loading Bus Board...</Text>
          </View>
        ) : (
          <View style={styles.tableWrapper}>
            {/* Table Header */}
            <View style={[styles.row, styles.headerRow]}>
              <View style={[styles.cell, styles.busColumn]}>
                <Text style={styles.headerText}>Bus</Text>
              </View>
              <View style={[styles.cell, styles.driverColumn]}>
                <Text style={styles.headerText}>Driver</Text>
              </View>
              <View style={[styles.cell, styles.routeColumn]}>
                <Text style={styles.headerText}>Route</Text>
              </View>
              <View style={[styles.cell, styles.actionColumn]}>
                <Text style={styles.headerText}>Actions</Text>
              </View>
            </View>

            {/* Table Body */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1d68bd']} />}
            >
              {assignments.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>No Bus Assignments Yet</Text>
                </View>
              ) : (
                assignments.map((item, index) => {
                  const b = buses.find((x) => x.busId === item.busId);
                  const d = drivers.find((x) => x.userId === item.driverId);
                  const r = routes.find((x) => x.routeId === item.routeId);

                  return (
                    <View
                      key={item._id}
                      style={[styles.row, index % 2 === 1 && styles.alternateRow]}
                    >
                      {/* Bus Column */}
                      <View style={[styles.cell, styles.busColumn]}>
                        <Text style={styles.busNoText}>
                          {b ? `Bus ${b.busNo}` : item.busId}
                        </Text>
                        <Text style={styles.regNoText} numberOfLines={1}>
                          {b?.registrationNo || ''}
                        </Text>
                      </View>

                      {/* Driver Column */}
                      <View style={[styles.cell, styles.driverColumn]}>
                        <Text style={styles.driverNameText} numberOfLines={1}>
                          {d?.name || item.driverId}
                        </Text>
                        <Text style={styles.driverIdText}>{item.driverId}</Text>
                      </View>

                      {/* Route Column */}
                      <View style={[styles.cell, styles.routeColumn]}>
                        <Text style={styles.routeNameText} numberOfLines={2}>
                          {r?.name || item.routeId}
                        </Text>
                        <Text style={styles.routeIdText}>{item.routeId}</Text>
                      </View>

                      {/* Actions Column */}
                      <View style={[styles.cell, styles.actionColumn]}>
                        <Pressable
                          style={styles.iconButton}
                          onPress={() => openEditModal(item)}
                          accessibilityLabel="Edit assignment"
                        >
                          <Ionicons name="pencil" size={17} color="#1d68bd" />
                        </Pressable>

                        <Pressable
                          style={[styles.iconButton, { borderColor: '#fca5a5' }]}
                          onPress={() => setAssignmentToDelete(item)}
                          accessibilityLabel="Delete assignment"
                        >
                          <Ionicons name="trash-outline" size={17} color="#dc2626" />
                        </Pressable>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        )}

        {/* Bottom Floating Action: Assign Bus & Route */}
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          onPress={openCreateModal}
        >
          <Ionicons name="add" size={22} color="#ffffff" />
          <Text style={styles.addButtonText}>Assign Bus & Route to Driver</Text>
        </Pressable>
      </View>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* MODAL: Create / Edit Assignment */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeAssignmentModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAssignmentId ? 'Edit Bus Assignment' : 'Assign Bus & Route'}
              </Text>
              <Pressable onPress={closeAssignmentModal}>
                <Ionicons name="close" size={24} color="#000000" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Field 1: Driver Selection */}
              <Text style={styles.inputLabel}>1. Select Driver *</Text>
              <Pressable
                style={styles.selectorBox}
                onPress={() => setPickerType(pickerType === 'driver' ? null : 'driver')}
              >
                <View style={styles.selectorLeft}>
                  <Ionicons name="person-outline" size={18} color="#1d68bd" />
                  <Text style={selectedDriver ? styles.selectorValue : styles.selectorPlaceholder}>
                    {selectedDriver
                      ? `${selectedDriver.name} (${selectedDriver.userId})`
                      : 'Choose a driver...'}
                  </Text>
                </View>
                <Ionicons
                  name={pickerType === 'driver' ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#64748b"
                />
              </Pressable>

              {pickerType === 'driver' && (
                <View style={styles.pickerDropdown}>
                  {drivers.length === 0 ? (
                    <Text style={styles.pickerEmptyText}>No drivers registered yet.</Text>
                  ) : (
                    drivers.map((d) => (
                      <Pressable
                        key={d.userId}
                        style={[
                          styles.pickerItem,
                          selectedDriverId === d.userId && styles.pickerItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedDriverId(d.userId);
                          setPickerType(null);
                        }}
                      >
                        <Text style={styles.pickerItemTitle}>{d.name}</Text>
                        <Text style={styles.pickerItemSubtitle}>
                          ID: {d.userId} • Phone: {d.phone}
                        </Text>
                      </Pressable>
                    ))
                  )}
                </View>
              )}

              {/* Field 2: Bus Selection */}
              <Text style={styles.inputLabel}>2. Select Bus *</Text>
              <Pressable
                style={styles.selectorBox}
                onPress={() => setPickerType(pickerType === 'bus' ? null : 'bus')}
              >
                <View style={styles.selectorLeft}>
                  <Ionicons name="bus-outline" size={18} color="#1d68bd" />
                  <Text style={selectedBus ? styles.selectorValue : styles.selectorPlaceholder}>
                    {selectedBus
                      ? `Bus ${selectedBus.busNo} (${selectedBus.registrationNo})`
                      : 'Choose a bus...'}
                  </Text>
                </View>
                <Ionicons
                  name={pickerType === 'bus' ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#64748b"
                />
              </Pressable>

              {pickerType === 'bus' && (
                <View style={styles.pickerDropdown}>
                  {buses.length === 0 ? (
                    <Text style={styles.pickerEmptyText}>
                      No buses registered yet. Please add buses from Manage Bus.
                    </Text>
                  ) : (
                    buses.map((b) => (
                      <Pressable
                        key={b.busId}
                        style={[
                          styles.pickerItem,
                          selectedBusId === b.busId && styles.pickerItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedBusId(b.busId);
                          setPickerType(null);
                        }}
                      >
                        <Text style={styles.pickerItemTitle}>Bus {b.busNo}</Text>
                        <Text style={styles.pickerItemSubtitle}>
                          Plate: {b.registrationNo} • ID: {b.busId}
                        </Text>
                      </Pressable>
                    ))
                  )}
                </View>
              )}

              {/* Field 3: Route Selection */}
              <Text style={styles.inputLabel}>3. Select Route *</Text>
              <Pressable
                style={styles.selectorBox}
                onPress={() => setPickerType(pickerType === 'route' ? null : 'route')}
              >
                <View style={styles.selectorLeft}>
                  <Ionicons name="navigate-outline" size={18} color="#1d68bd" />
                  <Text style={selectedRoute ? styles.selectorValue : styles.selectorPlaceholder}>
                    {selectedRoute
                      ? `${selectedRoute.name} (${selectedRoute.routeId})`
                      : 'Choose a route...'}
                  </Text>
                </View>
                <Ionicons
                  name={pickerType === 'route' ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#64748b"
                />
              </Pressable>

              {pickerType === 'route' && (
                <View style={styles.pickerDropdown}>
                  {routes.length === 0 ? (
                    <Text style={styles.pickerEmptyText}>No routes found. Create a route first.</Text>
                  ) : (
                    routes.map((r) => (
                      <Pressable
                        key={r.routeId}
                        style={[
                          styles.pickerItem,
                          selectedRouteId === r.routeId && styles.pickerItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedRouteId(r.routeId);
                          setPickerType(null);
                        }}
                      >
                        <Text style={styles.pickerItemTitle}>{r.name}</Text>
                        <Text style={styles.pickerItemSubtitle}>
                          ID: {r.routeId} • {r.stops?.length || 0} stops
                        </Text>
                      </Pressable>
                    ))
                  )}
                </View>
              )}

              {/* Actions */}
              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.saveButton, submitting && { opacity: 0.7 }]}
                  onPress={handleSaveAssignment}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons
                        name={editingAssignmentId ? 'checkmark-circle-outline' : 'add-circle-outline'}
                        size={19}
                        color="#ffffff"
                      />
                      <Text style={styles.saveButtonText}>
                        {editingAssignmentId ? 'Update Assignment' : 'Confirm Assignment'}
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>

              <Pressable style={styles.cancelButton} onPress={closeAssignmentModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>


      {/* ────────────────────────────────────────────────────────────────── */}
      {/* MODAL: Delete Assignment Confirmation */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <Modal
        visible={assignmentToDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setAssignmentToDelete(null)}
      >
        <View style={styles.modalBackdropCenter}>
          <View style={styles.quickModalCard}>

            <Text style={styles.quickModalTitle}>Remove Assignment</Text>
            <Text style={styles.quickModalSubtitle}>
              Are you sure you want to unassign this driver from the bus and route?
            </Text>
            <View style={styles.quickModalActions}>
              <Pressable
                style={styles.quickCancelBtn}
                onPress={() => setAssignmentToDelete(null)}
                disabled={deleting}
              >
                <Text style={styles.quickCancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.deleteConfirmBtn, deleting && { opacity: 0.7 }]}
                onPress={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.deleteConfirmBtnText}>Delete</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingVertical: 14,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  underline: {
    height: 3,
    width: 45,
    backgroundColor: '#1d68bd',
    marginTop: 6,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButtonText: {
    color: '#1d68bd',
    fontSize: 14,
    fontWeight: '500',
  },

  /* Stats Strip */
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1d68bd',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
  },

  /* Loading & Empty */
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1d68bd',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 18,
  },
  emptyAddButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  /* Table */
  tableWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  headerRow: {
    minHeight: 44,
    backgroundColor: '#f8fafc',
    borderBottomColor: '#e2e8f0',
  },
  alternateRow: {
    backgroundColor: '#fafbfc',
  },
  cell: {
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
  },
  busColumn: {
    flex: 1.1,
  },
  driverColumn: {
    flex: 1.2,
  },
  routeColumn: {
    flex: 1.4,
  },
  actionColumn: {
    flex: 0.9,
    borderRightWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  headerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
  },
  busNoText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  regNoText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  driverNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  driverIdText: {
    fontSize: 10,
    color: '#1d68bd',
    fontWeight: '600',
    marginTop: 2,
  },
  routeNameText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1e293b',
  },
  routeIdText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },

  iconButton: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },

  /* Add Button */
  addButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1d68bd',
    marginTop: 14,
  },
  addButtonPressed: {
    backgroundColor: '#000000',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },

  /* Assignment Modal */
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
    borderTopWidth: 3,
    borderTopColor: '#1d68bd',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },

  selectorBox: {
    height: 48,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  selectorValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  selectorPlaceholder: {
    fontSize: 14,
    color: '#94a3b8',
  },

  pickerDropdown: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderTopWidth: 0,
    backgroundColor: '#ffffff',
    maxHeight: 180,
  },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  pickerItemSelected: {
    backgroundColor: '#eaf3fc',
  },
  pickerItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  pickerItemSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  pickerEmptyText: {
    padding: 12,
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },

  summaryBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    padding: 12,
    marginTop: 16,
    gap: 4,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  summaryLine: {
    fontSize: 13,
    color: '#14532d',
  },

  modalActions: {
    marginTop: 22,
  },
  saveButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#1d68bd',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },

  /* Center Modals (Quick Add Bus & Delete) */
  modalBackdropCenter: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  quickModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    padding: 22,
    borderTopWidth: 4,
    borderTopColor: '#dc2626',
  },
  quickModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  quickModalSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 14,
  },
  quickModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  quickCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  quickCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },

  dangerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteSummaryBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    marginBottom: 16,
    gap: 4,
  },
  deleteSummaryText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  deleteConfirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#dc2626',
  },
  deleteConfirmBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});