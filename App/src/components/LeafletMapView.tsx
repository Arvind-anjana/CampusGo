 import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

let WebView: any;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface LeafletStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  index: number;
}

export interface LeafletMapHandle {
  fitToRoute: (coords: LatLng[]) => void;
  fitToStops: (stops: LeafletStop[]) => void;
}

interface Props {
  initialCenter?: LatLng;
  initialZoom?: number;
  stops?: LeafletStop[];
  routeCoords?: LatLng[];
  onMapPress?: (coord: LatLng) => void;
  style?: any;
  readOnly?: boolean;
}

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function buildHtml(
  center: LatLng,
  zoom: number,
  stops: LeafletStop[],
  routeCoords: LatLng[],
  readOnly: boolean
): string {
  const stopsJson = JSON.stringify(stops);
  const routeJson = JSON.stringify(routeCoords.map((c) => [c.latitude, c.longitude]));

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #map { width: 100%; height: 100%; }

    .stop-marker {
      display: flex;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2.5px solid #ffffff;
      background: #1d68bd;
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 8px rgba(0,0,0,0.35);
      cursor: pointer;
    }
    .stop-marker.start { background: #16a34a; }
    .stop-marker.end   { background: #dc2626; }

    .leaflet-popup-content {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      line-height: 1.4;
      margin: 8px 12px;
    }
  </style>
</head>
<body>
<div id="map"></div>
<script>
(function() {
  var map = L.map('map', { 
    zoomControl: true, 
    attributionControl: true 
  });

  L.tileLayer('${OSM_TILE_URL}', {
    attribution: '${OSM_ATTRIBUTION}',
    maxZoom: 19,
    subdomains: ['a','b','c']
  }).addTo(map);

  map.setView([${center.latitude}, ${center.longitude}], ${zoom});

  var markers = [];
  var routeLine = null;

  function makeIcon(label, cls) {
    return L.divIcon({
      className: '',
      html: '<div class="stop-marker ' + cls + '">' + label + '</div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -16]
    });
  }

  function renderStops(stopsList) {
    markers.forEach(function(m) { map.removeLayer(m); });
    markers = [];
    if (!stopsList || !stopsList.length) return;

    var total = stopsList.length;
    stopsList.forEach(function(stop, idx) {
      var cls = idx === 0 ? 'start' : (idx === total - 1 && total > 1) ? 'end' : '';
      var icon = makeIcon(stop.index, cls);
      var m = L.marker([stop.latitude, stop.longitude], { icon: icon })
        .addTo(map)
        .bindPopup('<b>' + stop.name + '</b><br><span style="color:#64748b;font-weight:400;font-size:11px;">Stop #' + stop.index + '</span>');
      markers.push(m);
    });
  }

  function renderRoute(coordsList) {
    if (routeLine) { 
      map.removeLayer(routeLine); 
      routeLine = null; 
    }
    if (coordsList && coordsList.length > 1) {
      routeLine = L.polyline(coordsList, { 
        color: '#1d68bd', 
        weight: 5, 
        opacity: 0.85 
      }).addTo(map);
    }
  }

  // Initial draw
  renderStops(${stopsJson});
  renderRoute(${routeJson});

  ${
    !readOnly
      ? `
  map.on('click', function(e) {
    var payload = JSON.stringify({
      type: 'mapPress',
      latitude: Number(e.latlng.lat.toFixed(6)),
      longitude: Number(e.latlng.lng.toFixed(6))
    });

    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(payload);
    } else if (window.parent && window.parent !== window) {
      window.parent.postMessage(payload, '*');
    }
  });
  `
      : ''
  }

  function handleMessage(event) {
    try {
      var raw = event.data;
      var msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!msg) return;

      if (msg.cmd === 'updateStops') {
        renderStops(msg.stops);
      }
      if (msg.cmd === 'updateRoute') {
        renderRoute(msg.coords);
      }
      if (msg.cmd === 'fitToCoords' && msg.coords && msg.coords.length > 0) {
        map.fitBounds(L.latLngBounds(msg.coords), { padding: [40, 40], maxZoom: 15 });
      }
    } catch(e) {}
  }

  // Listen for messages from React Native / Parent Window
  document.addEventListener('message', handleMessage);
  window.addEventListener('message', handleMessage);
})();
</script>
</body>
</html>`;
}

const LeafletMapView = forwardRef<LeafletMapHandle, Props>(function LeafletMapView(
  {
    initialCenter = { latitude: 22.75115, longitude: 75.89555 },
    initialZoom = 12,
    stops = [],
    routeCoords = [],
    onMapPress,
    style,
    readOnly = false,
  },
  ref
) {
  const webviewRef = useRef<any>(null);
  const iframeRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    fitToRoute(coords: LatLng[]) {
      send({
        cmd: 'fitToCoords',
        coords: coords.map((c) => [c.latitude, c.longitude]),
      });
    },
    fitToStops(stopsList: LeafletStop[]) {
      send({
        cmd: 'fitToCoords',
        coords: stopsList.map((s) => [s.latitude, s.longitude]),
      });
    },
  }));

  function send(payload: object) {
    if (Platform.OS === 'web') {
      try {
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify(payload), '*');
      } catch (e) {}
    } else {
      webviewRef.current?.injectJavaScript(
        `(function() { window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(
          JSON.stringify(payload)
        )} })); })();`
      );
    }
  }

  useEffect(() => {
    send({ cmd: 'updateStops', stops });
  }, [stops]);

  useEffect(() => {
    send({
      cmd: 'updateRoute',
      coords: routeCoords.map((c) => [c.latitude, c.longitude]),
    });
  }, [routeCoords]);

  // Handle messages on Web platform
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleWebMsg = (e: MessageEvent) => {
        try {
          const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
          if (data && data.type === 'mapPress' && onMapPress) {
            onMapPress({ latitude: data.latitude, longitude: data.longitude });
          }
        } catch (err) {}
      };

      window.addEventListener('message', handleWebMsg);
      return () => window.removeEventListener('message', handleWebMsg);
    }
  }, [onMapPress]);

  function onNativeMessage(event: any) {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'mapPress' && onMapPress) {
        onMapPress({ latitude: msg.latitude, longitude: msg.longitude });
      }
    } catch {}
  }

  const html = buildHtml(initialCenter, initialZoom, stops, routeCoords, readOnly);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <iframe
          ref={iframeRef}
          srcDoc={html}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Leaflet OpenStreetMap"
          sandbox="allow-scripts allow-same-origin"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webviewRef}
        source={{ html }}
        style={styles.webview}
        onMessage={onNativeMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
        scrollEnabled={false}
      />
    </View>
  );
});

export default LeafletMapView;

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  webview: { flex: 1, backgroundColor: 'transparent' },
});
