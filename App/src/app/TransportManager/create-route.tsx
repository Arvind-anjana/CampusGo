import React, { useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import TopBar from '@/components/TopBar';
import { apiRequest } from '@/utils/api';
import { getRoadRoute, RoutingResult } from '@/utils/routing';
import LeafletMapView, { LeafletMapHandle, LatLng } from '@/components/LeafletMapView';

interface StopItem {
  tempId: string;
  name: string;
  latitude: number;
  longitude: number;
}

const INDORE_INITIAL_CENTER: LatLng = {
  latitude: 22.75115,
  longitude: 75.89555,
};

export default function CreateRouteScreen() {
  const router = useRouter();
  const mapRef = useRef<LeafletMapHandle>(null);

  const [routeName, setRouteName] = useState('');
  const [description, setDescription] = useState('');
  const [stops, setStops] = useState<StopItem[]>([]);
  const [routingResult, setRoutingResult] = useState<RoutingResult | null>(null);

  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Stop naming modal
  const [stopModalVisible, setStopModalVisible] = useState(false);
  const [pendingCoord, setPendingCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [pendingStopName, setPendingStopName] = useState('');
  const [editingStopId, setEditingStopId] = useState<string | null>(null);

  const handleMapPress = (coord: LatLng) => {
    setPendingCoord(coord);
    setPendingStopName(`Stop ${stops.length + 1}`);
    setEditingStopId(null);
    setStopModalVisible(true);
  };

  const handleSaveStop = () => {
    if (!pendingStopName.trim()) {
      Alert.alert('Validation Error', 'Please enter a name for this stop.');
      return;
    }

    if (editingStopId) {
      setStops((prev) =>
        prev.map((s) => (s.tempId === editingStopId ? { ...s, name: pendingStopName.trim() } : s))
      );
    } else if (pendingCoord) {
      const newStop: StopItem = {
        tempId: `stop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: pendingStopName.trim(),
        latitude: Number(pendingCoord.latitude.toFixed(6)),
        longitude: Number(pendingCoord.longitude.toFixed(6)),
      };
      setStops((prev) => [...prev, newStop]);
      // Invalidate current route geometry since stops changed
      setRoutingResult(null);
    }

    setStopModalVisible(false);
    setPendingCoord(null);
    setPendingStopName('');
    setEditingStopId(null);
  };

  const handleEditStop = (stop: StopItem) => {
    setEditingStopId(stop.tempId);
    setPendingStopName(stop.name);
    setPendingCoord({ latitude: stop.latitude, longitude: stop.longitude });
    setStopModalVisible(true);
  };

  const handleDeleteStop = (tempId: string) => {
    setStops((prev) => prev.filter((s) => s.tempId !== tempId));
    setRoutingResult(null);
  };

  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stops.length) return;

    const updated = [...stops];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setStops(updated);
    setRoutingResult(null);
  };

  // Add popular presets (useful on web & quick testing)
  const addPresetStop = (name: string, lat: number, lon: number) => {
    const newStop: StopItem = {
      tempId: `stop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      latitude: lat,
      longitude: lon,
    };
    setStops((prev) => [...prev, newStop]);
    setRoutingResult(null);
  };

  const generateRoutePath = async (currentStops = stops): Promise<RoutingResult | null> => {
    if (currentStops.length < 2) {
      Alert.alert('Need More Stops', 'Please select at least 2 stops to generate a road route.');
      return null;
    }

    try {
      setGenerating(true);
      const result = await getRoadRoute(
        currentStops.map((s) => ({
          latitude: s.latitude,
          longitude: s.longitude,
          name: s.name,
        }))
      );
      setRoutingResult(result);

      if (mapRef.current && result.mapCoordinates.length > 0) {
        mapRef.current.fitToRoute(result.mapCoordinates);
      }

      return result;
    } catch (err: any) {
      Alert.alert('Route Error', err.message || 'Failed to generate road route.');
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveRoute = async () => {
    if (!routeName.trim()) {
      Alert.alert('Validation Error', 'Please enter a Route Name.');
      return;
    }

    if (stops.length < 2) {
      Alert.alert('Validation Error', 'A route requires at least 2 stops.');
      return;
    }

    let routeGeom = routingResult;
    if (!routeGeom) {
      routeGeom = await generateRoutePath(stops);
      if (!routeGeom) return;
    }

    try {
      setSaving(true);
      const payload = {
        name: routeName.trim(),
        description: description.trim(),
        stops: stops.map((s) => ({
          name: s.name,
          location: {
            type: 'Point',
            coordinates: [s.longitude, s.latitude], // GeoJSON [longitude, latitude]
          },
        })),
        geometry: {
          type: 'LineString',
          coordinates: routeGeom.coordinates,
        },
      };

      const response = await apiRequest<{ success: boolean; message?: string }>(
        '/routes',
        {
          method: 'POST',
          body: payload,
        }
      );

      if (response.success) {
        Alert.alert('Success', 'Route created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setSaving(false);
              router.replace('/TransportManager/manage-route');
            },
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Save Failed', error.message || 'Failed to save route to server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TopBar />

        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Create Route</Text>
            <View style={styles.titleLine} />
          </View>

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={18} color="#1d68bd" />
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Inputs Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Route Name *</Text>
            <TextInput
              style={styles.textInput}
              value={routeName}
              onChangeText={setRouteName}
              placeholder="e.g. SVVV to Bhawarkua (Route 10)"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Map Preview Section */}
          <View style={styles.sectionCard}>
            <View style={styles.mapHeaderRow}>
              <Text style={styles.sectionHeading}>Tap on Map to Add Stops</Text>
              <Text style={styles.stopsCountBadge}>{stops.length} Stops</Text>
            </View>
            {/* OpenStreetMap Leaflet Map */}
            <View style={styles.mapBox}>
              <LeafletMapView
                ref={mapRef}
                initialCenter={INDORE_INITIAL_CENTER}
                initialZoom={12}
                stops={stops.map((s, idx) => ({
                  id: s.tempId,
                  name: s.name,
                  latitude: s.latitude,
                  longitude: s.longitude,
                  index: idx + 1,
                }))}
                routeCoords={routingResult?.mapCoordinates || []}
                onMapPress={handleMapPress}
              />
            </View>

            {/* Quick Stop Presets */}
            <View style={styles.presetsRow}>
              <Pressable
                style={styles.presetChip}
                onPress={() => addPresetStop('SVVV Campus', 22.82, 75.84)}
              >
                <Text style={styles.presetChipText}>+ SVVV Campus</Text>
              </Pressable>
               
              
            </View>

            {/* Route Stats Chip */}
            {routingResult && (
              <View style={styles.routeStatsBox}>
                <View style={styles.statItem}>
                  <Ionicons name="car-outline" size={16} color="#1d68bd" />
                  <Text style={styles.statText}>
                    {routingResult.distanceKm > 0 ? `${routingResult.distanceKm} km` : 'Calculated'}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={16} color="#1d68bd" />
                  <Text style={styles.statText}>
                    {routingResult.durationMinutes > 0 ? `~${routingResult.durationMinutes} mins` : 'Estimated'}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                  <Text style={[styles.statText, { color: '#16a34a' }]}>Road-Snapped</Text>
                </View>
              </View>
            )}

            {/* Action to Generate Route */}
            <Pressable
              style={[styles.generateButton, (generating || stops.length < 2) && styles.disabledButton]}
              onPress={() => generateRoutePath(stops)}
              disabled={generating || stops.length < 2}
            >
              {generating ? (
                <ActivityIndicator color="#1d68bd" />
              ) : (
                <>
                  <Text style={styles.generateButtonText}>
                    {routingResult ? 'Regenerate Route' : 'Generate Route'}
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Stops List & Reordering */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Selected Stops ({stops.length})</Text>

            {stops.length === 0 ? (
              <View style={styles.emptyStopsBox}>
                <Ionicons name="location-outline" size={28} color="#94a3b8" />
                <Text style={styles.emptyStopsText}>No stops added yet.</Text>
                <Text style={styles.emptyStopsSubtext}>Tap on the map above to select bus stops.</Text>
              </View>
            ) : (
              stops.map((stop, index) => (
                <View key={stop.tempId} style={styles.stopCard}>
                  <View style={styles.stopSequenceBadge}>
                    <Text style={styles.stopSequenceText}>{index + 1}</Text>
                  </View>

                  <View style={styles.stopDetails}>
                    <Text style={styles.stopName}>{stop.name}</Text>
                    <Text style={styles.stopCoords}>
                      {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                    </Text>
                  </View>

                  <View style={styles.stopActions}>
                    <Pressable
                      style={[styles.iconButton, index === 0 && styles.iconButtonDisabled]}
                      onPress={() => handleMoveStop(index, 'up')}
                      disabled={index === 0}
                    >
                      <Ionicons name="arrow-up" size={16} color={index === 0 ? '#cbd5e1' : '#1d68bd'} />
                    </Pressable>

                    <Pressable
                      style={[styles.iconButton, index === stops.length - 1 && styles.iconButtonDisabled]}
                      onPress={() => handleMoveStop(index, 'down')}
                      disabled={index === stops.length - 1}
                    >
                      <Ionicons
                        name="arrow-down"
                        size={16}
                        color={index === stops.length - 1 ? '#cbd5e1' : '#1d68bd'}
                      />
                    </Pressable>

                    <Pressable style={styles.iconButton} onPress={() => handleEditStop(stop)}>
                      <Ionicons name="pencil" size={16} color="#64748b" />
                    </Pressable>

                    <Pressable style={styles.iconButton} onPress={() => handleDeleteStop(stop.tempId)}>
                      <Ionicons name="trash-outline" size={16} color="#dc2626" />
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Save Route Button */}
          <Pressable
            style={[styles.saveRouteButton, (saving || stops.length < 2) && styles.disabledButton]}
            onPress={handleSaveRoute}
            disabled={saving || stops.length < 2}
          >
            {saving ? (
              <>
                <ActivityIndicator color="#ffffff" />
                <Text style={styles.saveRouteButtonText}>Saving...</Text>
              </>
            ) : (
              <Text style={styles.saveRouteButtonText}>Save Route</Text>
            )}
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Modal: Add / Rename Stop */}
        <Modal
          visible={stopModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setStopModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{editingStopId ? 'Rename Stop' : 'Add Stop'}</Text>

              {pendingCoord && (
                <Text style={styles.modalSub}>
                  Coordinates: {pendingCoord.latitude.toFixed(5)}, {pendingCoord.longitude.toFixed(5)}
                </Text>
              )}

              <Text style={styles.modalLabel}>Stop Name *</Text>
              <TextInput
                style={styles.modalInput}
                value={pendingStopName}
                onChangeText={setPendingStopName}
                placeholder="e.g. Rajendra Nagar"
                placeholderTextColor="#94a3b8"
                autoFocus
              />

              <View style={styles.modalActions}>
                <Pressable
                  style={styles.modalCancelButton}
                  onPress={() => setStopModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>

                <Pressable style={styles.modalConfirmButton} onPress={handleSaveStop}>
                  <Text style={styles.modalConfirmText}>{editingStopId ? 'Save' : 'Add Stop'}</Text>
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
    marginTop: 20,
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '600', color: '#000000' },
  titleLine: { width: 38, height: 3, backgroundColor: '#1d68bd', marginTop: 7 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  backButtonText: { color: '#1d68bd', fontSize: 14, fontWeight: '500' },

  scrollArea: { flex: 1 },

  sectionCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 16,
  },
  sectionHeading: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 6 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  textInput: {
    height: 46,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },

  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stopsCountBadge: {
    color: '#1d68bd',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  mapInstructions: { fontSize: 12, color: '#64748b', marginBottom: 12 },

  mapBox: {
    height: 320,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    overflow: 'hidden',
    marginBottom: 12,
  },
  map: { width: '100%', height: '100%' },

  customMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1d68bd',
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  markerStart: { backgroundColor: '#16a34a' },
  markerEnd: { backgroundColor: '#dc2626' },
  markerText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },

  routeStatsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 10,
    marginBottom: 12,
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontSize: 13, fontWeight: '600', color: '#1e293b' },

  generateButton: {
    marginTop:8,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#1d68bd',
    backgroundColor: '#f0f7ff',
  },
  generateButtonText: { color: '#1d68bd', fontSize: 14, fontWeight: '600' },

  webFallbackContainer: {
    padding: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    marginBottom: 12,
  },
  webFallbackTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginTop: 8 },
  webFallbackSubtitle: { fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 4, marginBottom: 12 },
  presetsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  presetChip: {
    borderWidth: 1,
    borderColor: '#1d68bd',
    padding:4
  },
  presetChipText: { color: '#1d68bd', fontSize: 12, fontWeight: '600' },

  emptyStopsBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStopsText: { fontSize: 14, fontWeight: '600', color: '#64748b', marginTop: 6 },
  emptyStopsSubtext: { fontSize: 12, color: '#94a3b8', marginTop: 2 },

  stopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  stopSequenceBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1d68bd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stopSequenceText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  stopDetails: { flex: 1 },
  stopName: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  stopCoords: { fontSize: 11, color: '#64748b', marginTop: 2 },
  stopActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconButton: {
    padding: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  iconButtonDisabled: { opacity: 0.35 },

  saveRouteButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1d68bd',
    marginTop: 8,
  },
  saveRouteButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  disabledButton: { opacity: 0.5 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 3,
    borderTopColor: '#1d68bd',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  modalSub: { fontSize: 12, color: '#64748b', marginBottom: 14 },
  modalLabel: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  modalInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalCancelButton: { paddingVertical: 10, paddingHorizontal: 16 },
  modalCancelText: { color: '#64748b', fontSize: 14, fontWeight: '600' },
  modalConfirmButton: {
    backgroundColor: '#1d68bd',
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  modalConfirmText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
});

