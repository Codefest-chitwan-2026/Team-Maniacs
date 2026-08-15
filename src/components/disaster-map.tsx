'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  CircleMarker,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { EmergencyReport, Alert } from '@/types';
import { useLanguage } from '@/context/language-context';
import { MapPin, LocateFixed } from 'lucide-react';


/* -------------------------------------------------------
   CONSTANTS
------------------------------------------------------- */

const NEPAL_CENTER: [number, number] = [28.3949, 84.124];

const NEPAL_BOUNDS: [[number, number], [number, number]] = [
  [26.347, 80.058],
  [30.422, 88.201],
];

/* -------------------------------------------------------
   CUSTOM MARKERS
------------------------------------------------------- */

function createMarkerIcon(color: string) {
  return L.divIcon({
    className: 'satark-marker-wrapper',
    html: `
      <div
        style="
          width:22px;
          height:22px;
          background:${color};
          border:3px solid white;
          border-radius:50%;
          box-shadow:0 2px 8px rgba(0,0,0,0.45);
        "
      ></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
}

const reportIcons = {
  critical: createMarkerIcon('#ef4444'),
  urgent: createMarkerIcon('#f59e0b'),
  verified: createMarkerIcon('#10b981'),
  normal: createMarkerIcon('#3b82f6'),
};

/* -------------------------------------------------------
   MAP CONTROLLER
------------------------------------------------------- */

function MapController({
  reports,
  selectedCategory,
  onLocationChange,
}: {
  reports: EmergencyReport[];
  selectedCategory: string;
  onLocationChange: (location: [number, number] | null) => void;
}) {
  const map = useMap();

  /* Fit map whenever reports/filter changes */
  useEffect(() => {
    if (!map) return;

    const validReports = reports.filter(
      (report) =>
        Number.isFinite(report.latitude) &&
        Number.isFinite(report.longitude)
    );

    const filtered = validReports.filter(
      (report) =>
        selectedCategory === 'all' ||
        report.type === selectedCategory
    );

    if (filtered.length > 0) {
      const bounds = L.latLngBounds(
        filtered.map(
          (report) =>
            [report.latitude, report.longitude] as [number, number]
        )
      );

      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 13,
          animate: true,
        });

        return;
      }
    }

    map.fitBounds(NEPAL_BOUNDS, {
      padding: [30, 30],
      animate: false,
    });
  }, [map, reports, selectedCategory]);

  /* Track map movement */
  useMapEvents({
    moveend() {
      const center = map.getCenter();

      onLocationChange([center.lat, center.lng]);
    },
  });

  return null;
}

/* -------------------------------------------------------
   MAP LOCATION BUTTON
------------------------------------------------------- */

function LocationControl({
  onLocationFound,
}: {
  onLocationFound: (location: [number, number]) => void;
}) {
  const map = useMap();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const locateUser = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const location: [number, number] = [lat, lng];

        onLocationFound(location);

        map.flyTo(location, 15, {
          animate: true,
          duration: 1.2,
        });

        setLoading(false);
      },
      () => {
        setError(
          'Unable to access your location. Please allow location permission.'
        );

        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <>
      <div className="absolute top-3 right-3 z-[1000]">
        <button
          type="button"
          onClick={locateUser}
          disabled={loading}
          className="
            flex items-center gap-2
            rounded-lg
            border border-slate-700
            bg-slate-950/95
            px-3 py-2
            text-xs font-semibold
            text-white
            shadow-lg
            transition
            hover:bg-slate-800
            disabled:opacity-60
          "
        >
          <LocateFixed className="h-4 w-4 text-amber-400" />

          {loading ? 'Locating...' : 'My Location'}
        </button>

        {error && (
          <div className="mt-2 max-w-[240px] rounded-lg border border-red-500/30 bg-slate-950/95 p-2 text-[11px] text-red-300 shadow-lg">
            {error}
          </div>
        )}
      </div>
    </>
  );
}

/* -------------------------------------------------------
   MAIN MAP
------------------------------------------------------- */

export default function DisasterMap({
  reports,
  alerts,
  selectedCategory,
}: {
  reports: EmergencyReport[];
  alerts: Alert[];
  selectedCategory: string;
}) {
  const { t } = useLanguage();

  const [userLocation, setUserLocation] = useState<
    [number, number] | null
  >(null);

  const [tileError, setTileError] = useState(false);

  /* -----------------------------------------------------
     FILTER REPORTS
  ----------------------------------------------------- */

  const filteredReports = useMemo(() => {
    return reports.filter(
      (report) =>
        selectedCategory === 'all' ||
        report.type === selectedCategory
    );
  }, [reports, selectedCategory]);

  /* -----------------------------------------------------
     VALID GEO REPORTS
  ----------------------------------------------------- */

  const geoReports = useMemo(() => {
    return filteredReports.filter(
      (report) =>
        Number.isFinite(report.latitude) &&
        Number.isFinite(report.longitude)
    );
  }, [filteredReports]);

  /* -----------------------------------------------------
     GET ICON
  ----------------------------------------------------- */

  const getReportIcon = (report: EmergencyReport) => {
    if (report.priority === 'critical') {
      return reportIcons.critical;
    }

    if (report.status === 'VERIFIED') {
      return reportIcons.verified;
    }

    if (report.priority === 'urgent') {
      return reportIcons.urgent;
    }

    return reportIcons.normal;
  };

  /* -----------------------------------------------------
     REPORT POPUP
  ----------------------------------------------------- */

  const getReportColor = (report: EmergencyReport) => {
    if (report.priority === 'critical') return '#ef4444';

    if (report.status === 'VERIFIED') return '#10b981';

    if (report.priority === 'urgent') return '#f59e0b';

    return '#3b82f6';
  };

  return (
    <div className="relative h-[550px] w-full overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
      <MapContainer
        center={NEPAL_CENTER}
        zoom={7}
        minZoom={6}
        maxZoom={18}
        scrollWheelZoom={true}
        zoomControl={true}
        className="h-full w-full"
      >
        {/* -------------------------------------------------
            OPENSTREETMAP
        ------------------------------------------------- */}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            tileerror: () => setTileError(true),
            load: () => setTileError(false),
          }}
        />

        {/* -------------------------------------------------
            MAP CONTROLLER
        ------------------------------------------------- */}

        <MapController
          reports={reports}
          selectedCategory={selectedCategory}
          onLocationChange={() => {}}
        />

        {/* -------------------------------------------------
            MY LOCATION BUTTON
        ------------------------------------------------- */}

        <LocationControl
          onLocationFound={(location) => {
            setUserLocation(location);
          }}
        />

        {/* -------------------------------------------------
            USER LOCATION
        ------------------------------------------------- */}

        {userLocation && (
          <>
            <CircleMarker
              center={userLocation}
              radius={9}
              pathOptions={{
                color: '#ffffff',
                weight: 3,
                fillColor: '#2563eb',
                fillOpacity: 1,
              }}
            >
              <Popup>
                <div className="text-sm font-semibold">
                  📍 Your Location
                </div>
              </Popup>
            </CircleMarker>

            <Circle
              center={userLocation}
              radius={100}
              pathOptions={{
                color: '#2563eb',
                fillColor: '#2563eb',
                fillOpacity: 0.08,
              }}
            />
          </>
        )}

        {/* -------------------------------------------------
            HIGH RISK ZONE
        ------------------------------------------------- */}

        <Circle
          center={[27.7335, 85.3122]}
          radius={2000}
          pathOptions={{
            color: '#ef4444',
            weight: 2,
            fillColor: '#ef4444',
            fillOpacity: 0.12,
          }}
        />

        {/* -------------------------------------------------
            REPORT MARKERS
        ------------------------------------------------- */}

        {geoReports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={getReportIcon(report)}
          >
            <Popup maxWidth={320}>
              <div
                style={{
                  minWidth: '220px',
                  fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
                }}
              >
                {/* Type */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <strong
                    style={{
                      color: getReportColor(report),
                      textTransform: 'uppercase',
                      fontSize: '12px',
                    }}
                  >
                    {report.type}
                  </strong>

                  <span
                    style={{
                      fontSize: '10px',
                      background: '#e5e7eb',
                      color: '#111827',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                    }}
                  >
                    {report.id}
                  </span>
                </div>

                {/* Address */}
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '13px',
                    marginBottom: '6px',
                  }}
                >
                  {report.address || 'Unknown location'}
                </div>

                {/* Description */}
                {report.description && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#4b5563',
                      marginBottom: '8px',
                    }}
                  >
                    {report.description}
                  </div>
                )}

                {/* Status */}
                <div
                  style={{
                    fontSize: '12px',
                    color: '#374151',
                    marginBottom: '4px',
                  }}
                >
                  <strong>Severity:</strong> {report.priority}
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: '#374151',
                    marginBottom: '4px',
                  }}
                >
                  <strong>Status:</strong> {report.status}
                </div>

                {/* Trust */}
                {report.trustLevel && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      marginTop: '6px',
                    }}
                  >
                    Trust: {report.trustLevel}
                  </div>
                )}

                {/* Date */}
                {report.createdAt && (
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      marginTop: '6px',
                    }}
                  >
                    {new Date(report.createdAt).toLocaleString()}
                  </div>
                )}

                {/* View Details */}
                <a
                  href={`/report/${encodeURIComponent(report.id)}`}
                  style={{
                    display: 'block',
                    marginTop: '10px',
                    background: '#f59e0b',
                    color: '#111827',
                    padding: '8px',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '12px',
                  }}
                >
                  View Details
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* -----------------------------------------------------
          TILE ERROR
      ----------------------------------------------------- */}

      {tileError && (
        <div className="pointer-events-none absolute inset-0 z-[2000] flex items-center justify-center bg-black/40">
          <div className="rounded-xl border border-red-500/30 bg-slate-950/95 px-5 py-4 text-center shadow-xl">
            <div className="text-sm font-bold text-red-400">
              Map failed to load
            </div>

            <div className="mt-1 text-xs text-slate-400">
              Please check your internet connection.
            </div>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------
          NO REPORTS
      ----------------------------------------------------- */}

      {geoReports.length === 0 && !tileError && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[1000] flex justify-center">
          <div className="rounded-lg border border-slate-700 bg-slate-950/90 px-4 py-2 text-xs text-slate-300 shadow-lg">
            No geo-tagged reports for this category.
          </div>
        </div>
      )}
    </div>
  );
}