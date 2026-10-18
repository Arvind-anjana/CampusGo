import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Link, useFocusEffect } from 'expo-router';

import TopBar from '@/components/TopBar';
import { apiRequest } from '@/utils/api';

interface BackendBus {
  _id: string;
  busId: string;
  busNo: string;
  registrationNo: string;
  isActive: boolean;
  createdAt?: string;
}

export default function ManageBusScreen() {
  const [buses, setBuses] = useState<BackendBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Create / Edit modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBusId, setEditingBusId] = useState<string | null>(null);
  const [busNo, setBusNo] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [busToDelete, setBusToDelete] = useState<BackendBus | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBuses = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const res = await apiRequest<{ success: boolean; data: BackendBus[] }>('/bus');
      if (res.success && res.data) {
        setBuses(res.data);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch buses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBuses(buses.length === 0);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBuses(false);
  };

  const openCreateModal = () => {
    setEditingBusId(null);
    setBusNo('');
    setRegistrationNo('');
    setModalVisible(true);
  };

  const openEditModal = (bus: BackendBus) => {
    setEditingBusId(bus.busId);
    setBusNo(bus.busNo);
    setRegistrationNo(bus.registrationNo);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingBusId(null);
    setBusNo('');
    setRegistrationNo('');
  };

  const handleSaveBus = async () => {
    if (!busNo.trim() || !registrationNo.trim()) {
      Alert.alert('Missing Fields', 'Please enter both Bus Number and Registration Number.');
      return;
    }

    try {
      setSubmitting(true);

      if (editingBusId) {
        // Update existing bus
        const res = await apiRequest<{ success: boolean; message?: string }>(
          `/bus/${editingBusId}`,
          {
            method: 'PATCH',
            body: {
              busNo: busNo.trim(),
              registrationNo: registrationNo.trim().toUpperCase(),
            },
          }
        );

        if (res.success) {
          Alert.alert('Success', 'Bus details updated successfully!');
          closeModal();
          fetchBuses(false);
        }
      } else {
        // Create new bus
        const res = await apiRequest<{ success: boolean; message?: string }>(
          '/bus',
          {
            method: 'POST',
            body: {
              busNo: busNo.trim(),
              registrationNo: registrationNo.trim().toUpperCase(),
            },
          }
        );

        if (res.success) {
          Alert.alert('Success', 'New bus registered successfully!');
          closeModal();
          fetchBuses(false);
        }
      }
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Failed to save bus');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!busToDelete) return;

    try {
      setDeleting(true);
      const res = await apiRequest<{ success: boolean; message?: string }>(
        `/bus/${busToDelete.busId}`,
        { method: 'DELETE' }
      );

      if (res.success) {
        setBusToDelete(null);
        Alert.alert('Success', 'Bus deactivated successfully!');
        fetchBuses(false);
      }
    } catch (err: any) {
      Alert.alert('Delete Failed', err.message || 'Failed to delete bus');
    } finally {
      setDeleting(false);
    }
  };

  const activeBuses = buses.filter((b) => b.isActive !== false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TopBar />

        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Manage Bus</Text>
            <View style={styles.titleLine} />
          </View>

          <Link href="/TransportManager/tm-home" asChild>
            <Pressable style={styles.backButton}>
              <Ionicons name="arrow-back" size={18} color="#1d68bd" />
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
          </Link>
        </View>

        {/* Bus List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1d68bd" />
            <Text style={styles.loadingText}>Fetching buses...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1d68bd']} />}
          >
            {activeBuses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No Buses</Text>
              </View>
            ) : (
              activeBuses.map((bus) => (
                <View key={bus.busId} style={styles.busCard}>
                  <View style={styles.busInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.busNumber}>Bus {bus.busNo}</Text>
                      <Text style={styles.busIdBadge}>{bus.busId}</Text>
                    </View>

                    <View style={styles.plateRow}>
                      <View style={styles.plateBadge}>
                        <Text style={styles.plateText}>{bus.registrationNo}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.actionButtonsCol}>
                    <Pressable
                      style={styles.editButton}
                      onPress={() => openEditModal(bus)}
                      accessibilityLabel="Edit bus"
                    >
                      <Ionicons name="pencil" size={18} color="#1d68bd" />
                    </Pressable>

                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => setBusToDelete(bus)}
                      accessibilityLabel="Delete bus"
                    >
                      <Ionicons name="trash-outline" size={18} color="#dc2626" />
                    </Pressable>
                  </View>
                </View>
              ))
            )}

            <View style={styles.bottomSpace} />
          </ScrollView>
        )}

        {/* Add Bus Button */}
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          onPress={openCreateModal}
        >
          <Ionicons name="add" size={22} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Bus</Text>
        </Pressable>

        {/* ────────────────────────────────────────────────────────── */}
        {/* MODAL: Create / Edit Bus */}
        {/* ────────────────────────────────────────────────────────── */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingBusId ? 'Edit Bus Details' : 'Register New Bus'}
                </Text>
                <Pressable onPress={closeModal}>
                  <Ionicons name="close" size={24} color="#000000" />
                </Pressable>
              </View>

              <Text style={styles.label}>Bus Number *</Text>
              <TextInput
                style={styles.input}
                value={busNo}
                onChangeText={setBusNo}
                placeholder=""
                placeholderTextColor="#94a3b8"
                keyboardType="default"
              />

              <Text style={styles.label}>Registration Number *</Text>
              <TextInput
                style={styles.input}
                value={registrationNo}
                onChangeText={setRegistrationNo}
                placeholder=""
                placeholderTextColor="#94a3b8"
                autoCapitalize="characters"
              />

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.saveButton, submitting && { opacity: 0.7 }]}
                  onPress={handleSaveBus}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Text style={styles.saveButtonText}>
                        {editingBusId ? 'Update Bus' : 'Save Bus'}
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>

              <Pressable style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* ────────────────────────────────────────────────────────── */}
        {/* MODAL: Delete Bus Confirmation */}
        {/* ────────────────────────────────────────────────────────── */}
        <Modal
          visible={busToDelete !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setBusToDelete(null)}
        >
          <View style={styles.modalBackdropCenter}>
            <View style={styles.quickModalCard}>
              <Text style={styles.quickModalTitle}>Delete</Text>
              <Text style={styles.quickModalSubtitle}>
                Are you sure you want to delete{' '}
                <Text style={{ fontWeight: '700', color: '#0f172a' }}>
                  Bus {busToDelete?.busNo} ({busToDelete?.registrationNo})
                </Text>
                ? 
              </Text>

              <View style={styles.quickModalActions}>
                <Pressable
                  style={styles.quickCancelBtn}
                  onPress={() => setBusToDelete(null)}
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
      </View>
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

  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#334155', marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 4, textAlign: 'center' },

  busCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 3,
    borderLeftColor: '#1d68bd',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  busInfo: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  busNumber: { fontSize: 17, fontWeight: '700', color: '#0f172a', marginRight: 8 },
  busIdBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d68bd',
    backgroundColor: '#eaf3fc',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  plateBadge: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
  },
  plateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  statusText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
  },

  actionButtonsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  editButton: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderColor: '#1d68bd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderColor: '#fca5a5',
    justifyContent: 'center',
    alignItems: 'center',
  },

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

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    width: '100%',
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
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#000000' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginTop: 12,
    marginBottom: 6,
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
  modalActions: { marginTop: 22 },
  saveButton: {
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

  /* Delete Modal */
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
  dangerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  quickModalSubtitle: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 20,
  },
  quickModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  quickCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  quickCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
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
