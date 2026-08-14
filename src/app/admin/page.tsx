'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  Bot,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Plus,
  FileText,
  Clock,
  Eye,
  Send,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { SatarkStore } from '@/lib/db/store';
import { EmergencyReport, Alert, AuditLog } from '@/types';
import TrustBadge from '@/components/trust-badge';
import AIAnalysisCard from '@/components/ai-analysis-card';

export default function AdminPage() {
  const { t, language } = useLanguage();
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [selectedReport, setSelectedReport] = useState<EmergencyReport | null>(null);

  // New Alert State
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertTitleNp, setAlertTitleNp] = useState('');
  const [alertDesc, setAlertDesc] = useState('');
  const [alertLocation, setAlertLocation] = useState('');

  useEffect(() => {
    async function loadData() {
      setReports(await SatarkStore.getReports());
      setAlerts(await SatarkStore.getAlerts());
      setAuditLogs(await SatarkStore.getAuditLogs());
    }
    loadData();
  }, []);

  const handleVerify = async (reportId: string) => {
    await SatarkStore.updateReportStatus(reportId, 'VERIFIED', 'HIGH');
    await SatarkStore.logAdminAction('Chief Moderator', 'VERIFY_REPORT', 'emergency_report', reportId, { status: 'VERIFIED' });
    setReports(await SatarkStore.getReports());
    setAuditLogs(await SatarkStore.getAuditLogs());
    if (selectedReport?.id === reportId) {
      setSelectedReport((prev) => (prev ? { ...prev, status: 'VERIFIED', trustLevel: 'HIGH' } : null));
    }
  };

  const handleReject = async (reportId: string) => {
    await SatarkStore.updateReportStatus(reportId, 'RESOLVED', 'LOW');
    await SatarkStore.logAdminAction('Chief Moderator', 'REJECT_REPORT', 'emergency_report', reportId, { status: 'REJECTED' });
    setReports(await SatarkStore.getReports());
    setAuditLogs(await SatarkStore.getAuditLogs());
  };

  const handleResolve = async (reportId: string) => {
    await SatarkStore.updateReportStatus(reportId, 'RESOLVED');
    await SatarkStore.logAdminAction('Chief Moderator', 'RESOLVE_REPORT', 'emergency_report', reportId, { status: 'RESOLVED' });
    setReports(await SatarkStore.getReports());
    setAuditLogs(await SatarkStore.getAuditLogs());
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle || !alertDesc || !alertLocation) return;
    await SatarkStore.createAlert({
      title: alertTitle,
      titleNp: alertTitleNp || alertTitle,
      description: alertDesc,
      type: 'flood',
      severity: 'high',
      location: alertLocation,
      source: 'Official Emergency Agency',
      verified: true,
    });
    await SatarkStore.logAdminAction('Chief Moderator', 'PUBLISH_ALERT', 'alert', 'ALT-NEW', { title: alertTitle });
    setAlerts(await SatarkStore.getAlerts());
    setAuditLogs(await SatarkStore.getAuditLogs());
    setShowNewAlertModal(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <span>{t.adminTitle}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Official emergency verification, alert publishing, and community report audit ledger.
          </p>
        </div>

        <button
          onClick={() => setShowNewAlertModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Official Emergency Alert</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-center">
          <p className="text-xs text-slate-400 font-semibold">Total Reports</p>
          <p className="text-2xl font-black text-white mt-1">{reports.length}</p>
        </div>
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-center">
          <p className="text-xs text-slate-400 font-semibold">Verified Active</p>
          <p className="text-2xl font-black text-safe-500 mt-1">
            {reports.filter((r) => r.status === 'VERIFIED').length}
          </p>
        </div>
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-center">
          <p className="text-xs text-slate-400 font-semibold">Under AI Review</p>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {reports.filter((r) => r.status === 'UNDER REVIEW' || r.status === 'NEW').length}
          </p>
        </div>
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-center">
          <p className="text-xs text-slate-400 font-semibold">Audit Records</p>
          <p className="text-2xl font-black text-blue-400 mt-1">{auditLogs.length}</p>
        </div>
      </div>

      {/* Main Reports Moderation Table */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="font-extrabold text-white text-base flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          <span>Emergency Reports Moderation Queue</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">Report ID</th>
                <th className="p-3">Category</th>
                <th className="p-3">Location</th>
                <th className="p-3">Trust Score</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-navy-950/60 transition">
                  <td className="p-3 font-mono font-bold text-amber-400">{r.id}</td>
                  <td className="p-3 uppercase font-bold text-white">{r.type}</td>
                  <td className="p-3 max-w-[180px] truncate">{r.address}</td>
                  <td className="p-3">
                    <TrustBadge trustLevel={r.trustLevel} />
                  </td>
                  <td className="p-3">
                    <span className="bg-navy-950 border border-slate-800 px-2 py-0.5 rounded font-bold text-[10px]">
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5">
                    <button
                      onClick={() => setSelectedReport(r)}
                      className="bg-navy-800 hover:bg-navy-700 text-white px-2.5 py-1 rounded text-[11px] font-bold border border-slate-700"
                    >
                      Inspect AI
                    </button>
                    {r.status !== 'VERIFIED' && (
                      <button
                        onClick={() => handleVerify(r.id)}
                        className="bg-safe-600 hover:bg-safe-700 text-white px-2.5 py-1 rounded text-[11px] font-bold"
                      >
                        Verify
                      </button>
                    )}
                    {r.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleResolve(r.id)}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded text-[11px] font-bold"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Report AI Inspection Drawer */}
      {selectedReport && (
        <div className="bg-navy-900 border-2 border-amber-400/50 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-400" />
              <span>Satark AI Inspection for Report {selectedReport.id}</span>
            </h4>
            <button
              onClick={() => setSelectedReport(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-xs">
              <p className="text-slate-300">
                <span className="font-bold text-white">Location:</span> {selectedReport.address}
              </p>
              <p className="text-slate-300">
                <span className="font-bold text-white">Description:</span> {selectedReport.description}
              </p>
              {selectedReport.mediaUrl && (
                <img
                  src={selectedReport.mediaUrl}
                  alt="Report proof"
                  className="w-full h-40 object-cover rounded-xl border border-slate-800 mt-2"
                />
              )}
            </div>

            <AIAnalysisCard ai={selectedReport.aiVerification} />
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="font-extrabold text-white text-base flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <span>System Moderation Audit Log</span>
        </h3>

        <div className="space-y-2 text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="bg-navy-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-white">{log.adminName}</span>
                <span className="text-slate-400"> executed </span>
                <span className="font-mono text-amber-400 font-bold">{log.action}</span>
                <span className="text-slate-400"> on {log.entityType} ({log.entityId})</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {new Date(log.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))}

          {auditLogs.length === 0 && (
            <p className="text-slate-400 text-center py-3">No admin audit log actions recorded yet.</p>
          )}
        </div>
      </div>

      {/* Create Alert Modal */}
      {showNewAlertModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Publish Official Emergency Warning</h3>

            <form onSubmit={handleCreateAlert} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Title (English)</label>
                <input
                  type="text"
                  required
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  placeholder="e.g. RED ALERT: Flash Flood Warning for Hanumante River"
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Title (Nepali)</label>
                <input
                  type="text"
                  value={alertTitleNp}
                  onChange={(e) => setAlertTitleNp(e.target.value)}
                  placeholder="उदा. हनुमन्ते नदी तटीय क्षेत्रमा बाढीको उच्च जोखिम"
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Affected Location</label>
                <input
                  type="text"
                  required
                  value={alertLocation}
                  onChange={(e) => setAlertLocation(e.target.value)}
                  placeholder="e.g. Bhaktapur & South Lalitpur"
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Advisory Description</label>
                <textarea
                  rows={3}
                  required
                  value={alertDesc}
                  onChange={(e) => setAlertDesc(e.target.value)}
                  placeholder="Enter details, safety evacuation instructions, and emergency shelter locations..."
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewAlertModal(false)}
                  className="flex-1 bg-navy-800 text-slate-300 py-3 rounded-xl font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}