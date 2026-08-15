'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Volume2, VolumeX, MapPin, X, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { SatarkStore } from '@/lib/db/store';
import { useToast } from '@/components/toast-notification';

export default function SOSModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [dispatching, setDispatching] = useState(false);
  const [sosRecord, setSosRecord] = useState<any | null>(null);
  const [locationText, setLocationText] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    const profile = SatarkStore.getUserProfile();
    if (!profile) {
      setSosRecord(null);
      return;
    }

    SatarkStore.getActiveSOSForUser(profile.id).then((record) => {
      setSosRecord(record);
      if (record?.latitude && record?.longitude) {
        setLocationText(`${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}`);
      } else if (record?.locationSource === 'unavailable') {
        setLocationText('Location unavailable');
      }
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const stopSiren = () => {
    if (oscillator) {
      oscillator.stop();
      setOscillator(null);
    }
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }
    setIsPlayingSiren(false);
  };

  const toggleSiren = () => {
    if (isPlayingSiren) {
      stopSiren();
      return;
    }

    try {
      const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtor) {
        showToast('This browser does not support the local audio siren.', 'error');
        return;
      }

      const ctx = new AudioCtor();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      osc.start();

      setAudioContext(ctx);
      setOscillator(osc);
      setIsPlayingSiren(true);
    } catch (e) {
      console.error('Web Audio siren not supported:', e);
      showToast('Audio siren could not be started in this browser.', 'error');
    }
  };

  const obtainLocation = (): Promise<{ latitude?: number; longitude?: number; source: 'gps' | 'unavailable'; notes?: string }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ source: 'unavailable', notes: 'Location not available in this browser.' });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            source: 'gps',
          });
        },
        () => {
          resolve({
            source: 'unavailable',
            notes: 'Location permission was denied or location could not be obtained.',
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const handleBroadcastSOS = async () => {
    const profile = SatarkStore.getUserProfile();
    if (!profile) {
      showToast('Please log in before broadcasting an emergency SOS.', 'error');
      return;
    }

    setDispatching(true);
    try {
      const location = await obtainLocation();
      const result = await SatarkStore.createSOS(profile.id, {
        latitude: location.latitude,
        longitude: location.longitude,
        source: location.source,
        notes: location.notes,
      });

      if (result.record) {
        setSosRecord(result.record);
        if (result.record.latitude && result.record.longitude) {
          setLocationText(`${result.record.latitude.toFixed(4)}, ${result.record.longitude.toFixed(4)}`);
        } else {
          setLocationText('Location unavailable');
        }
      }

      if (result.duplicate) {
        showToast('An active SOS already exists for this user.', 'info');
      } else if (result.success) {
        showToast(location.source === 'unavailable'
          ? 'SOS created. Location was unavailable, but the emergency alert was still sent.'
          : 'SOS created successfully. Emergency responders have been notified.', 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch (err) {
      console.error('SOS creation error:', err);
      showToast('Unable to create SOS. Please try again.', 'error');
    } finally {
      setDispatching(false);
    }
  };

  const handleResolveSOS = async () => {
    const profile = SatarkStore.getUserProfile();
    if (!profile || !sosRecord) {
      showToast('No active SOS found for this user.', 'error');
      return;
    }

    const result = await SatarkStore.resolveSOS(profile.id, sosRecord.id, 'RESOLVED');
    if (result.success && result.record) {
      setSosRecord(result.record);
      showToast('SOS resolved successfully.', 'success');
    } else {
      showToast(result.message || 'Unable to resolve SOS.', 'error');
    }
  };

  const isActive = sosRecord?.status === 'ACTIVE';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-navy-900 border-2 border-red-600 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
        <button
          onClick={() => {
            stopSiren();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center animate-pulse-emergency">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">
              {language === 'np' ? 'आपत्कालीन SOS रWhistle साइरन' : 'Emergency SOS & Siren Broadcast'}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {language === 'np'
                ? 'तत्काल उद्धार टोली र नजिकैका मानिसहरूलाई सतर्क गराउनुहोस्।'
                : 'Instantly notify emergency responders and emit local acoustic beacon.'}
            </p>
          </div>

          {isActive ? (
            <div className="bg-safe-500/10 border border-safe-500 text-safe-500 rounded-xl p-4 w-full flex flex-col items-center gap-2">
              <CheckCircle className="w-8 h-8" />
              <p className="font-bold text-sm">🚨 SOS ACTIVE</p>
              <p className="text-xs text-slate-200">Emergency responders have been notified.</p>
              <p className="text-xs text-slate-300">📍 Location shared with responders</p>
              {locationText && <p className="text-[11px] text-slate-300">{locationText}</p>}
              <button
                onClick={handleResolveSOS}
                className="mt-2 w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 rounded-xl"
              >
                RESOLVE SOS
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-3 mt-2">
              <button
                onClick={handleBroadcastSOS}
                disabled={dispatching}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg uppercase tracking-wider animate-pulse-emergency"
              >
                <AlertTriangle className="w-6 h-6" />
                {dispatching ? (language === 'np' ? 'प्रसारण हुँदैछ...' : 'SENDING SOS...') : (language === 'np' ? 'SOS आपत्कालीन प्रसारण' : 'BROADCAST SOS EMERGENCY')}
              </button>

              <button
                onClick={toggleSiren}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition ${isPlayingSiren
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-navy-800 hover:bg-navy-700 text-white border-slate-700'
                  }`}
              >
                {isPlayingSiren ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                {isPlayingSiren
                  ? (language === 'np' ? 'साइरन बन्द गर्नुहोस्' : '🔇 STOP SIREN')
                  : (language === 'np' ? 'अडियो साइरन बजाउनुहोस् (Acoustic Beacon)' : '🔊 PLAY AUDIO SIREN BEACON')}
              </button>
            </div>
          )}

          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mt-2">
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span>
              {language === 'np'
                ? 'नजिकैको प्रहरी, रेडक्रस र स्वयंसेवकहरूलाई लोकेशन सेयर गरिनेछ।'
                : 'Location is shared with responders when available.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}