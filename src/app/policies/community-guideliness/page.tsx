'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Filter, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { SatarkStore } from '@/lib/db/store';
import { EmergencyReport, Alert } from '@/types';
import TrustBadge from '@/components/trust-badge';

const DynamicMap = dynamic(
  () => import('@/components/disaster-map'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[550px] bg-navy-900 border border-slate-800 rounded-2xl flex items-center justify-center text-xs text-slate-400">
        Initializing Leaflet OpenStreetMap Engine...
      </div>
    ),
  }
);
/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function MapPage() {
  const { t } = useLanguage();

  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("all");

  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------------------- */
  /* Load reports                                                            */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [reportsData, alertsData] = await Promise.all([
          SatarkStore.getReports(),
          SatarkStore.getAlerts(),
        ]);

        if (!mounted) {
          return;
        }

        setReports(reportsData);
        setAlerts(alertsData);
      } catch (error) {
        console.error(
          "Failed to load disaster map data:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    /*
     * Refresh reports every 30 seconds.
     *
     * This gives the map basic live-update behavior without
     * requiring WebSockets yet.
     */
    const interval = window.setInterval(
      loadData,
      30000
    );

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Categories                                                             */
  /* ---------------------------------------------------------------------- */

  const categories = [
    {
      id: "all",
      label: t.filterAll || "All Categories",
    },
    {
      id: "flood",
      label: t.catFlood || "Flood",
    },
    {
      id: "landslide",
      label: t.catLandslide || "Landslide",
    },
    {
      id: "earthquake",
      label: t.catEarthquake || "Earthquake",
    },
    {
      id: "fire",
      label: t.catFire || "Fire",
    },
    {
      id: "road",
      label: t.catRoad || "Road Blockage",
    },
  ];

  /* ---------------------------------------------------------------------- */
  /* Filtered reports                                                        */
  /* ---------------------------------------------------------------------- */

  const filteredReports = reports.filter((report) => {
    if (selectedCategory === "all") {
      return true;
    }

    return report.type === selectedCategory;
  });

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* ================================================================== */}
      {/* Header                                                             */}
      {/* ================================================================== */}

      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xl">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-white">
              <MapPin className="h-5 w-5 text-red-500" />

              <span>
                {t.mapTitle || "Live Disaster Map & Responders"}
              </span>
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {t.mapLegend ||
                "Pins represent reported emergencies, shelters, and relief requests across Nepal."}
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </div>
        </div>

        {/* ================================================================ */}
        {/* Category filters                                                  */}
        {/* ================================================================ */}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => {
            const active =
              selectedCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setSelectedCategory(category.id)
                }
                className={`
                  whitespace-nowrap
                  rounded-xl
                  border
                  px-4
                  py-2
                  text-xs
                  font-bold
                  transition
                  ${active
                    ? "border-amber-400 bg-amber-500 text-slate-950 shadow-md"
                    : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
                  }
                `}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================================== */}
      {/* Map                                                                 */}
      {/* ================================================================== */}

      {loading ? (
        <div className="flex h-[550px] w-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-950">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-amber-500" />

            <p className="text-sm text-slate-400">
              Loading disaster reports...
            </p>
          </div>
        </div>
      ) : (
        <DynamicMap
          reports={reports}
          alerts={alerts}
          selectedCategory={selectedCategory}
        />
      )}

      {/* ================================================================== */}
      {/* Incident feed                                                       */}
      {/* ================================================================== */}

      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white">
              Active Emergency Incidents
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {filteredReports.length} incident
              {filteredReports.length === 1 ? "" : "s"} found
            </p>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-8 text-center">
            <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-slate-600" />

            <p className="text-sm font-semibold text-slate-400">
              No incidents found
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Try another category or check again later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-slate-700"
              >
                {/* ======================================================== */}
                {/* Top row                                                   */}
                {/* ======================================================== */}

                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 text-xs font-black uppercase text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" />

                    {report.type}
                  </span>

                  <span className="rounded border border-slate-800 bg-slate-950 px-2 py-0.5 font-mono text-[10px] text-slate-500">
                    {report.id}
                  </span>
                </div>

                {/* ======================================================== */}
                {/* Address                                                    */}
                {/* ======================================================== */}

                <div>
                  <p className="text-sm font-bold text-white">
                    {report.address ||
                      "Location not specified"}
                  </p>

                  {report.description && (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                      {report.description}
                    </p>
                  )}
                </div>

                {/* ======================================================== */}
                {/* Bottom                                                     */}
                {/* ======================================================== */}

                <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                  <TrustBadge
                    trustLevel={report.trustLevel}
                    details={report.trustDetails}
                  />

                  <span
                    className={`
                      rounded
                      border
                      px-2
                      py-0.5
                      text-[10px]
                      font-bold
                      ${report.status === "VERIFIED"
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-slate-700 bg-slate-800 text-slate-400"
                      }
                    `}
                  >
                    {report.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}