'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  MapPin,
  Camera,
  Upload,
  Send,
  CheckCircle,
  Clock,
  Shield,
  Bot,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { SatarkStore } from '@/lib/db/store';
import { SatarkAIService } from '@/lib/satark-ai';
import { evaluateReportTrust } from '@/lib/trust-engine';
import { CommunicationService } from '@/lib/communication';
import { EmergencyCategory, PriorityLevel, EmergencyReport, AIVerification } from '@/types';
import TrustBadge from '@/components/trust-badge';
import AIAnalysisCard from '@/components/ai-analysis-card';

export default function ReportPage() {
  const { t, language } = useLanguage();
  const router = useRouter();

  const [category, setCategory] = useState<EmergencyCategory>('flood');
  const [priority, setPriority] = useState<PriorityLevel>('critical');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingGps, setGettingGps] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<EmergencyReport | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIVerification | undefined>(undefined);

  const categories: { id: EmergencyCategory; icon: string; labelEn: string; labelNp: string }[] = [
    { id: 'flood', icon: '🌊', labelEn: t.catFlood, labelNp: t.catFlood },
    { id: 'landslide', icon: '⛰️', labelEn: t.catLandslide, labelNp: t.catLandslide },
    { id: 'earthquake', icon: '🌎', labelEn: t.catEarthquake, labelNp: t.catEarthquake },
    { id: 'fire', icon: '🔥', labelEn: t.catFire, labelNp: t.catFire },
    { id: 'storm', icon: '🌪️', labelEn: t.catStorm, labelNp: t.catStorm },
    { id: 'medical', icon: '🚑', labelEn: t.catMedical, labelNp: t.catMedical },
    { id: 'building', icon: '🏚️', labelEn: t.catBuilding, labelNp: t.catBuilding },
    { id: 'road', icon: '🚧', labelEn: t.catRoad, labelNp: t.catRoad },
    { id: 'other', icon: '⚠️', labelEn: t.catOther, labelNp: t.catOther },
  ];

  const handleGetLocation = () => {
    setGettingGps(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          setAddress(`GPS Verified: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`);
          setGettingGps(false);
        },
        () => {
          setCoords({ lat: 27.7172, lng: 85.324 });
          setAddress('Kathmandu Valley (Default)');
          setGettingGps(false);
        }
      );
    } else {
      setGettingGps(false);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const hasGps = !!coords;
    const hasMedia = !!mediaFile;

    // Run Satark AI Media & Narrative Analysis
    const aiResult = await SatarkAIService.analyzeReportMedia(
      category,
      description,
      mediaFile,
      hasGps
    );
    setAiAnalysis(aiResult);

    // Compute Trust Score Matrix
    const { trustLevel, trustDetails } = evaluateReportTrust(hasGps, hasMedia, aiResult);

    // Dispatch via Communication pipeline
    const dispatch = await CommunicationService.dispatchEmergencyReport({
      type: category,
      description: description || 'Emergency reported via Satark Nepal mobile portal.',
      latitude: coords ? coords.lat : 27.7172,
      longitude: coords ? coords.lng : 85.324,
      address: address || 'Kathmandu, Nepal',
      priority,
      status: 'NEW',
      trustLevel,
      trustDetails,
    });

    const reportObj = await SatarkStore.addReport({
      userId: 'USR-CURRENT',
      userName: 'Citizen User',
      type: category,
      description: description || 'Emergency reported via Satark Nepal portal.',
      latitude: coords ? coords.lat : 27.7172,
      longitude: coords ? coords.lng : 85.324,
      address: address || 'Kathmandu Valley, Nepal',
      priority,
      status: 'NEW',
      trustLevel,
      trustDetails,
      aiVerification: aiResult,
      mediaUrl: mediaPreview || undefined,
      mediaType: mediaFile ? 'photo' : undefined,
    });

    setSubmittedReport(reportObj);
    setSubmitting(false);
  };

  if (submittedReport) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-navy-900 border border-safe-500/50 rounded-2xl p-6 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 bg-safe-500/20 border-2 border-safe-500 rounded-full flex items-center justify-center mx-auto text-safe-500">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white">
              {t.reportReceived}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {language === 'np'
                ? 'तपाईंको उजुरी आपत्कालीन नियन्त्रण कक्षमा दर्ता भइसकेको छ।'
                : 'Emergency report dispatched to ward response team.'}
            </p>
          </div>

          <div className="bg-navy-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center gap-1">
            <span className="text-xs text-slate-400">{t.reportIdLabel}</span>
            <span className="font-mono text-xl font-black text-amber-400 tracking-wider">
              {submittedReport.id}
            </span>
          </div>

          {/* Status Tracker */}
          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Report Status Workflow
            </h4>
            <div className="flex items-center justify-between text-[10px] md:text-xs">
              {['NEW', 'UNDER REVIEW', 'VERIFIED', 'RESPONDING', 'RESOLVED'].map((st, i) => (
                <div key={st} className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold mb-1 ${st === submittedReport.status
                        ? 'bg-amber-500 text-slate-950 animate-pulse'
                        : i === 0
                          ? 'bg-safe-500 text-white'
                          : 'bg-navy-800 text-slate-500'
                      }`}
                  >
                    {i + 1}
                  </div>
                  <span className={st === submittedReport.status ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                    {st}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust & AI Output */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
            <div className="bg-navy-950 p-3.5 rounded-xl border border-slate-800">
              <p className="text-xs font-bold text-white mb-2">{t.trustLayerTitle}</p>
              <TrustBadge trustLevel={submittedReport.trustLevel} details={submittedReport.trustDetails} />
            </div>
            <AIAnalysisCard ai={aiAnalysis} />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setSubmittedReport(null)}
              className="flex-1 bg-navy-800 hover:bg-navy-700 text-white font-bold py-3 rounded-xl border border-slate-700 text-xs"
            >
              Submit Another Report
            </button>
            <button
              onClick={() => router.push('/map')}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl text-xs"
            >
              {t.viewAllOnMap}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-extrabold text-white mb-1">
          {t.reportPageTitle}
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          {t.motto}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {t.selectCategory}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${category === cat.id
                      ? 'bg-red-600/20 border-red-500 text-white font-bold shadow-md'
                      : 'bg-navy-950 border-slate-800 text-slate-300 hover:bg-navy-800'
                    }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs leading-tight">
                    {language === 'np' ? cat.labelNp : cat.labelEn}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Location Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {t.locationHeading}
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gettingGps}
                className="w-full bg-navy-800 hover:bg-navy-700 text-white border border-slate-700 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                {gettingGps ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : <MapPin className="w-4 h-4 text-red-500 animate-pulse" />}
                <span>
                  {coords ? t.locationAcquired : t.useCurrentLocation}
                </span>
              </button>

              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t.manualLocation}
                className="w-full bg-navy-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {t.descriptionHeading}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.descriptionPlaceholder}
              className="w-full bg-navy-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {t.priorityHeading}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'critical', label: t.priorityCritical, color: 'bg-red-600 border-red-500' },
                { id: 'urgent', label: t.priorityUrgent, color: 'bg-amber-500 border-amber-400 text-slate-950' },
                { id: 'non-critical', label: t.priorityNonCritical, color: 'bg-slate-700 border-slate-600' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.id as PriorityLevel)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition text-center ${priority === p.id
                      ? `${p.color} text-white shadow-md`
                      : 'bg-navy-950 border-slate-800 text-slate-400 hover:bg-navy-800'
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Media File Attachment */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {t.mediaHeading}
            </label>
            <div className="border-2 border-dashed border-slate-700 hover:border-amber-400 bg-navy-950 rounded-xl p-4 text-center cursor-pointer transition relative">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {mediaPreview ? (
                <div className="relative inline-block max-h-40 overflow-hidden rounded-lg">
                  <img src={mediaPreview} alt="Preview" className="object-cover h-36 rounded-lg" />
                  <span className="absolute top-2 right-2 bg-navy-900/90 text-safe-500 text-[10px] font-bold px-2 py-0.5 rounded border border-safe-500/40 flex items-center gap-1">
                    <Bot className="w-3 h-3 text-amber-400" /> Satark AI Scanned
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1 text-slate-400 py-2">
                  <Camera className="w-6 h-6 text-amber-400 mb-1" />
                  <span className="text-xs font-semibold">{t.uploadMedia}</span>
                  <span className="text-[10px] text-slate-500">JPG, PNG, MP4 up to 25MB</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold py-4 rounded-xl shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 text-sm uppercase tracking-wider animate-pulse-emergency"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing & Scanning...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>{t.submitReport}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}