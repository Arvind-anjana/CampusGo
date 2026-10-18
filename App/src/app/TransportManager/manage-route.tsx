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
import { Link, useFocusEffect, useRouter } from 'expo-router';

import TopBar from '@/components/TopBar';
import { apiRequest } from '@/utils/api';

interface StopData {
  stopId: string;
  name: string;
  sequence: number;
  location: {
    type: string;
    coordinates: [number, number]; // [lon, lat]
  };
}

interface BackendRoute {
  _id: string;
  routeId: string;
  name: string;
  description?: string;
  stops: StopData[];
  geometry?: {
    type: string;
    coordinates: [number, number][];
  };
  isActive: boolean;
  createdAt?: string;
}

export default function ManageRouteScreen() {
  const router = useRouter();
  const [routes, setRoutes] = useState<BackendRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  // Delete state & modal
  const [routeToDelete, setRouteToDelete] = useState<BackendRoute | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRoutes = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const res = await apiRequest<{ success: boolean; data: BackendRoute[] }>('/routes');
      if (res.success && res.data) {
        setRoutes(res.data);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch routes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRoutes(true);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRoutes(false);
  };

  const openDeleteModal = (route: BackendRoute) => {
    setRouteToDelete(route);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setRouteToDelete(null);
  };

  const confirmDeleteRoute = async () => {
    if (!routeToDelete) return;

    try {
      setIsDeleting(true);
      const res = await apiRequest<{ success: boolean; message?: string }>(
        `/routes/${routeToDelete.routeId}`,
        { method: 'DELETE' }
      );

      if (res.success) {
        setRouteToDelete(null);
        Alert.alert('Success', 'Route deleted successfully!');
        fetchRoutes(false);
      }
    } catch (error: any) {
      Alert.alert('Delete Failed', error.message || 'Failed to delete route from server');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleExpand = (routeId: string) => {
    setExpandedRouteId((prev) => (prev === routeId ? null : routeId));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TopBar />

        {/* Page Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Manage Route</Text>
            <View style={styles.titleLine} />
          </View>

          <Link href="/TransportManager/tm-home" asChild>
            <Pressable style={styles.backButton}>
              <Ionicons name="arrow-back" size={18} color="#1d68bd" />
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
          </Link>
        </View>

        {/* Route List */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#1d68bd" />
            <Text style={styles.loadingText}>Fetching routes...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1d68bd']} />}
          >
            {routes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="git-network-outline" size={48} color="#94a3b8" />
                <Text style={styles.emptyTitle}>No Routes Found</Text>
                <Text style={styles.emptySubtitle}>
                  Create your first bus route using the button below.
                </Text>
              </View>
            ) : (
              routes.map((routeItem) => {
                const isExpanded = expandedRouteId === routeItem.routeId;
                const firstStop = routeItem.stops?.[0]?.name || 'Origin';
                const lastStop = routeItem.stops?.[routeItem.stops.length - 1]?.name || 'Destination';

                return (
                  <View key={routeItem.routeId} style={styles.routeCard}>
                    <View style={styles.cardHeaderRow}>
                      <Pressable
                        style={styles.cardHeaderContent}
                        onPress={() => toggleExpand(routeItem.routeId)}
                      >
                        <View style={styles.routeMain}>
                          <View style={styles.routeTitleRow}>
                            <Text style={styles.routeName}>{routeItem.name}</Text>
                            <Text style={styles.routeIdBadge}>{routeItem.routeId}</Text>
                          </View>

                          {routeItem.description ? (
                            <Text style={styles.routeDesc} numberOfLines={1}>
                              {routeItem.description}
                            </Text>
                          ) : null}

                          {/* Origin -> Destination Preview */}
                          <View style={styles.originDestRow}>
                            <Ionicons name="navigate-outline" size={14} color="#1d68bd" />
                            <Text style={styles.originDestText} numberOfLines={1}>
                              {firstStop} → {lastStop}
                            </Text>
                          </View>

                          <View style={styles.metaRow}>
                            <View style={styles.badge}>
                              <Ionicons name="location-outline" size={13} color="#64748b" />
                              <Text style={styles.badgeText}>{routeItem.stops?.length || 0} stops</Text>
                            </View>
                            {routeItem.geometry?.coordinates ? (
                              <View style={styles.badge}>
                                <Ionicons name="checkmark-circle-outline" size={13} color="#16a34a" />
                                <Text style={[styles.badgeText, { color: '#16a34a' }]}>Road-snapped</Text>
                              </View>
                            ) : null}
                          </View>
                        </View>
                      </Pressable>

                      {/* Action Buttons: Delete & Expand */}
                      <View style={styles.actionCol}>
                        <Pressable
                          style={styles.expandIconButton}
                          onPress={() => toggleExpand(routeItem.routeId)}
                        >
                          <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color="#64748b"
                          />
                        </Pressable>
                      </View>
                    </View>

                    {/* Expanded Stops Accordion */}
                    {isExpanded && (
                      <View style={styles.expandedSection}>
                        <Text style={styles.stopsHeader}>Ordered Stops ({routeItem.stops.length}):</Text>
                        {routeItem.stops.map((stop, sIdx) => (
                          <View key={stop.stopId || sIdx} style={styles.stopDetailRow}>
                            <View style={styles.stopNumberBadge}>
                              <Text style={styles.stopNumberText}>{sIdx + 1}</Text>
                            </View>
                            <Text style={styles.stopDetailName}>{stop.name}</Text>
                            <Text style={styles.stopDetailCoords}>
                              {stop.location.coordinates[1].toFixed(4)}, {stop.location.coordinates[0].toFixed(4)}
                            </Text>
                          </View>
                        ))}

                        <View style={styles.cardActions}>
                          <Pressable
                            style={styles.expandedDeleteBtn}
                            onPress={() => openDeleteModal(routeItem)}
                          >
                            <Text style={styles.expandedDeleteBtnText}>Delete</Text>
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
            )}

            <View style={styles.bottomSpace} />
          </ScrollView>
        )}

        {/* Add Route Button */}
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          onPress={() => router.push('/TransportManager/create-route')}
        >
          <Ionicons name="add" size={22} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Route</Text>
        </Pressable>

        {/* Delete Confirmation Modal (Cross-platform) */}
        <Modal
          visible={routeToDelete !== null}
          transparent
          animationType="fade"
          onRequestClose={closeDeleteModal}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              
              <Text style={styles.modalTitle}>Delete Route</Text>

              <Text style={styles.modalMessage}>
                Are you sure you want to delete{' '}
                <Text style={{ fontWeight: '700', color: '#0f172a' }}>
                  {routeToDelete?.name} ({routeToDelete?.routeId})
                </Text>
                ?
              </Text>

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalCancelBtn, isDeleting && { opacity: 0.5 }]}
                  onPress={closeDeleteModal}
                  disabled={isDeleting}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[styles.modalDeleteBtn, isDeleting && { opacity: 0.7 }]}
                  onPress={confirmDeleteRoute}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="trash-outline" size={16} color="#ffffff" />
                      <Text style={styles.modalDeleteText}>Delete</Text>
                    </>
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

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748b', fontSize: 14 },

  list: { flex: 1 },

  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#334155', marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 4, textAlign: 'center' },

  routeCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 3,
    borderLeftColor: '#1d68bd',
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  cardHeaderContent: { flex: 1 },
  routeMain: { flex: 1 },
  routeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  routeName: { fontSize: 16, fontWeight: '600', color: '#0f172a', flex: 1 },
  routeIdBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d68bd',
    backgroundColor: '#eaf3fc',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  routeDesc: { fontSize: 12, color: '#64748b', marginBottom: 6 },
  originDestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 6,
  },
  originDestText: { fontSize: 13, fontWeight: '500', color: '#1d68bd', flex: 1 },
  metaRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeText: { fontSize: 12, color: '#64748b' },

  actionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 10,
  },
  deleteIconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fff1f2',
  },
  deleteIconButtonPressed: { backgroundColor: '#fee2e2' },
  expandIconButton: {
    width: 32,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  expandedSection: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
    padding: 14,
  },
  stopsHeader: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  stopDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  stopNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1d68bd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  stopNumberText: { color: '#ffffff', fontSize: 10, fontWeight: '700' },
  stopDetailName: { fontSize: 13, color: '#0f172a', fontWeight: '500', flex: 1 },
  stopDetailCoords: { fontSize: 11, color: '#94a3b8' },

  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  expandedDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#dc2626',
    backgroundColor: '#ffffff',
  },
  expandedDeleteBtnText: { fontSize: 13, color: '#dc2626', fontWeight: '600' },

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

  // Delete Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    padding: 22,
    borderTopWidth: 4,
    borderTopColor: '#dc2626',
  },
  modalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 19, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  modalMessage: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  modalCancelText: { fontSize: 14, fontWeight: '600', color: '#475569' },
  modalDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#dc2626',
  },
  modalDeleteText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
});