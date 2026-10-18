export interface RoutePoint {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface RoutingResult {
  coordinates: [number, number][]; // GeoJSON [longitude, latitude]
  mapCoordinates: { latitude: number; longitude: number }[]; // For react-native-maps
  distanceKm: number;
  durationMinutes: number;
  isRoadSnapped: boolean;
}

/**
 * Fetch road-following route geometry between ordered stops using OSRM.
 * Falls back to straight-line interpolation if OSRM is unreachable.
 */
export async function getRoadRoute(stops: RoutePoint[]): Promise<RoutingResult> {
  if (stops.length < 2) {
    throw new Error('At least two stops are required to generate a route');
  }

  // OSRM expects coordinates in {longitude},{latitude} separated by semicolons
  const coordinatesString = stops
    .map((stop) => `${stop.longitude},${stop.latitude}`)
    .join(';');

  const url = `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const bestRoute = data.routes[0];
      const geoCoordinates: [number, number][] = bestRoute.geometry.coordinates;

      return {
        coordinates: geoCoordinates,
        mapCoordinates: geoCoordinates.map(([lon, lat]) => ({
          latitude: lat,
          longitude: lon,
        })),
        distanceKm: Number((bestRoute.distance / 1000).toFixed(2)),
        durationMinutes: Math.round(bestRoute.duration / 60),
        isRoadSnapped: true,
      };
    }
  } catch (error) {
    console.warn('OSRM routing request failed, falling back to direct paths:', error);
  }

  // Fallback: connect stops directly
  const fallbackGeo: [number, number][] = stops.map((s) => [s.longitude, s.latitude]);
  return {
    coordinates: fallbackGeo,
    mapCoordinates: stops.map((s) => ({
      latitude: s.latitude,
      longitude: s.longitude,
    })),
    distanceKm: 0,
    durationMinutes: 0,
    isRoadSnapped: false,
  };
}

