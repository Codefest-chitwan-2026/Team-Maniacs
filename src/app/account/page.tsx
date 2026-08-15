"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";
import { SatarkStore } from "@/lib/db/store";
import { ToastNotification, useToast } from "@/components/toast-notification";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { InputModal } from "@/components/input-modal";

type Profile = {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  avatar?: string;
};

type Session = {
  id: string;
  device?: string;
  lastSeen: string;
};

export default function AccountPage() {
  const { language } = useLanguage();
  const { toasts, showToast, removeToast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [twoFA, setTwoFA] = useState<boolean>(false);
  const [locationPerm, setLocationPerm] = useState<boolean>(true);
  const [personalVisible, setPersonalVisible] = useState<boolean>(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    try {
      const p = SatarkStore.getUserProfile();

      if (p) {
        setProfile(p as Profile);
      }
      const storedSessions = localStorage.getItem("satark_sessions");

      if (storedSessions) {
        try {
          setSessions(JSON.parse(storedSessions));
        } catch {
          setSessions([]);
        }
      } else {
        const currentSession: Session = {
          id: "current",
          device: typeof navigator !== 'undefined' ? navigator.userAgent : 'browser',
          lastSeen: new Date().toISOString(),
        };

        setSessions([currentSession]);

        localStorage.setItem("satark_sessions", JSON.stringify([currentSession]));
      }
      const twoFAValue = localStorage.getItem("satark_2fa_enabled");

      setTwoFA(twoFAValue === "1");
      const locationValue = localStorage.getItem("satark_allow_location");

      setLocationPerm(locationValue !== "0");
      const privateProfile = localStorage.getItem("satark_private_profile");

      setPersonalVisible(privateProfile !== "1");
    } catch (error) {
      console.error("Failed to load account data:", error);
    }
  }, []);

  const toggle2FA = () => {
    const next = !twoFA;

    setTwoFA(next);

    localStorage.setItem("satark_2fa_enabled", next ? "1" : "0");

    showToast(
      next
        ? language === "np"
          ? "दुई-कारक प्रमाणीकरण सक्षम भयो"
          : "Two-factor authentication enabled"
        : language === "np"
        ? "दुई-कारक प्रमाणीकरण अक्षम भयो"
        : "Two-factor authentication disabled",
      "success"
    );
  };

  const logoutAll = () => {
    localStorage.removeItem("satark_sessions");

    setSessions([]);

    showToast(language === "np" ? "सबै सत्रहरू लगआउट गरियो" : "Logged out from all devices", "success");
  };

  const downloadData = () => {
    const data = {
      profile: localStorage.getItem("satark_user_profile"),
      reports: localStorage.getItem("satark_reports"),
      alerts: localStorage.getItem("satark_alerts"),
      volunteers: localStorage.getItem("satark_volunteers"),
      relief: localStorage.getItem("satark_relief"),
      transactions: localStorage.getItem("satark_transactions"),
      audit: localStorage.getItem("satark_audit_logs"),
      contacts: localStorage.getItem("satark_contacts"),
      safeLocations: localStorage.getItem("satark_safe_locations"),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "satark-data.json";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  const deleteAccount = async () => {
    setIsProcessing(true);
    try {
      const keysToRemove = [
        "satark_user_profile",
        "satark_transactions",
        "satark_reports",
        "satark_contacts",
        "satark_safe_locations",
        "satark_sessions",
        "satark_2fa_enabled",
        "satark_allow_location",
        "satark_private_profile",
        "satark_password",
        "satark_password_hash",
      ];

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });

      showToast(language === "np" ? "खाता हटाइयो" : "Account deleted", "success");

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } finally {
      setIsProcessing(false);
      setShowDeleteConfirm(false);
    }
  };

  const changePassword = async (newPass: string) => {
    if (newPass.trim().length < 8) {
      showToast(language === "np" ? "पासवर्ड कम्तीमा ८ वर्णको हुनुपर्छ" : "Password must be at least 8 characters", "error");
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(newPass);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hash = Array.from(new Uint8Array(hashBuffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");

    localStorage.setItem("satark_password_hash", hash);

    showToast(language === "np" ? "पासवर्ड परिवर्तन भयो" : "Password changed", "success");
    setShowPasswordModal(false);
  };

  const toggleLocationPermission = (enabled: boolean) => {
    setLocationPerm(enabled);

    if (enabled) {
      localStorage.setItem("satark_allow_location", "1");
    } else {
      localStorage.setItem("satark_allow_location", "0");
    }
  };

  const togglePersonalVisibility = (visible: boolean) => {
    setPersonalVisible(visible);

    if (visible) {
      localStorage.removeItem('satark_private_profile');
    } else {
      localStorage.setItem('satark_private_profile', '1');
    }
  };

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-8 text-center">
          <div className="text-slate-400 text-sm">{language === "np" ? "खाता जानकारी लोड हुँदैछ..." : "Loading account information..."}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastNotification toasts={toasts} onRemove={removeToast} />

      <InputModal
        isOpen={showPasswordModal}
        title={language === "np" ? "पासवर्ड परिवर्तन" : "Change Password"}
        label={language === "np" ? "नयाँ पासवर्ड" : "New Password"}
        placeholder={language === "np" ? "न्यूनतम ८ वर्ण" : "At least 8 characters"}
        type="password"
        confirmText={language === "np" ? "परिवर्तन गर्नुहोस्" : "Change Password"}
        cancelText={language === "np" ? "रद्द गर्नुहोस्" : "Cancel"}
        isLoading={isProcessing}
        onConfirm={async (value) => {
          setIsProcessing(true);
          try {
            await changePassword(value);
          } finally {
            setIsProcessing(false);
          }
        }}
        onCancel={() => setShowPasswordModal(false)}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title={language === "np" ? "खाता मेटाउनुहोस्?" : "Delete Account?"}
        message={language === "np" ? "के तपाइँ खातालाई स्थायी रुपमा हटाउन निश्चित हुनुहुन्छ? यो कार्य फर्काउन सकिँदैन।" : "Are you sure you want to permanently delete your account? This cannot be undone."}
        type="danger"
        confirmText={language === "np" ? "हटाउनुहोस्" : "Delete Account"}
        cancelText={language === "np" ? "रद्द गर्नुहोस्" : "Cancel"}
        isLoading={isProcessing}
        onConfirm={deleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <div className="max-w-4xl mx-auto space-y-6">

        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center gap-4">

          <div className="flex items-center gap-4">

            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-black text-2xl overflow-hidden">

              {profile.avatar ? (
                <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                profile.name?.charAt(0).toUpperCase()
              )}

            </div>

            <div>

              <h2 className="text-lg font-extrabold text-white">{profile.name}</h2>

              <div className="text-xs text-slate-400">{profile.email || profile.phone || '—'}</div>

              <div className="text-xs text-slate-400">{profile.location || '—'}</div>

              <div className="text-xs text-emerald-300 mt-1">{language === "np" ? "स्थिति: सक्रिय" : "Status: Active"}</div>

            </div>

          </div>

          <div className="ml-auto flex gap-2">

            <Link href="/profile/edit" className="px-3 py-2 bg-amber-400 text-slate-900 rounded-xl font-bold text-sm hover:bg-amber-300 transition">{language === "np" ? "खाता सम्पादन गर्नुहोस्" : "Edit Account Information"}</Link>

          </div>

        </div>

        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">

          <h3 className="font-bold text-white text-sm">{language === "np" ? "लगइन र सुरक्षा" : "Login & Security"}</h3>

          <div className="space-y-3">

            <div className="flex items-center justify-between p-3 bg-navy-950 rounded-xl border border-slate-800">

              <div>
                <div className="text-sm font-bold text-white">{language === "np" ? "पासवर्ड परिवर्तन" : "Change Password"}</div>

                <div className="text-xs text-slate-400">{language === "np" ? "पासवर्ड अपडेट गर्नुहोस्" : "Update your password regularly"}</div>
              </div>

              <button onClick={() => setShowPasswordModal(true)} className="px-3 py-2 rounded-lg border border-slate-800 text-xs text-white hover:bg-slate-800 transition">{language === "np" ? "परिवर्तन" : "Change"}</button>

            </div>

            <div className="flex items-center justify-between p-3 bg-navy-950 rounded-xl border border-slate-800">

              <div>
                <div className="text-sm font-bold text-white">{language === "np" ? "दुई-कारक प्रमाणीकरण" : "Two-Factor Authentication"}</div>

                <div className="text-xs text-slate-400">{language === "np" ? "वैकल्पिक अतिरिक्त सुरक्षा" : "Optional extra security"}</div>
              </div>

              <label className="inline-flex items-center cursor-pointer">

                <input type="checkbox" checked={twoFA} onChange={toggle2FA} className="sr-only" />

                <div className={`w-11 h-6 rounded-full ${twoFA ? "bg-amber-400" : "bg-slate-700"} transition`} />

              </label>

            </div>

            <div className="p-3 bg-navy-950 rounded-xl border border-slate-800">

              <div className="flex items-center justify-between">

                <div>
                  <div className="text-sm font-bold text-white">{language === "np" ? "सक्रिय सत्र / उपकरणहरू" : "Active Sessions / Devices"}</div>

                  <div className="text-xs text-slate-400">{language === "np" ? "हाल सक्रिय उपकरणहरू" : "Currently active devices"}</div>
                </div>

                <div className="text-xs text-slate-400">{sessions.length}</div>

              </div>

              <div className="mt-3 space-y-2">

                {sessions.length > 0 ? (
                  sessions.map((session, index) => (

                    <div key={`${session.id}-${index}`} className="text-xs p-2 bg-navy-900 rounded border border-slate-800 flex items-center justify-between gap-3">

                      <div className="truncate text-slate-300">{session.device || session.id}</div>

                      <div className="text-[11px] text-slate-400 whitespace-nowrap">{session.lastSeen ? new Date(session.lastSeen).toLocaleString() : '—'}</div>

                    </div>

                  ))
                ) : (
                  <div className="text-xs text-slate-500 py-2">{language === "np" ? "कुनै सक्रिय सत्र छैन" : "No active sessions"}</div>
                )}

                <div className="mt-2 flex gap-2">

                  <button onClick={logoutAll} className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-500 transition">{language === "np" ? "सबै सत्रबाट लगआउट" : "Log out from all devices"}</button>

                </div>

              </div>

            </div>

          </div>

        </div>

        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">

          <h3 className="font-bold text-white text-sm">{language === "np" ? "गोपनीयता" : "Privacy"}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div className="p-3 bg-navy-950 rounded-xl border border-slate-800 flex items-center justify-between">

              <div>
                <div className="text-sm font-bold text-white">{language === "np" ? "स्थान अनुमति" : "Location Permission"}</div>

                <div className="text-xs text-slate-400">{language === "np" ? "एपले स्थान प्रयोग गर्न सक्छ" : "Allow app to use location"}</div>
              </div>

              <label className="inline-flex items-center cursor-pointer">

                <input type="checkbox" checked={locationPerm} onChange={(e) => toggleLocationPermission(e.target.checked)} className="sr-only" />

                <div className={`w-11 h-6 rounded-full ${locationPerm ? "bg-amber-400" : "bg-slate-700"} transition`} />

              </label>

            </div>

            <div className="p-3 bg-navy-950 rounded-xl border border-slate-800 flex items-center justify-between">

              <div>
                <div className="text-sm font-bold text-white">{language === "np" ? "व्यक्तिगत जानकारी दृश्यता" : "Personal Info Visibility"}</div>

                <div className="text-xs text-slate-400">{language === "np" ? "कसले मेरो जानकारी हेर्न सक्छ" : "Who can see your profile info"}</div>
              </div>

              <label className="inline-flex items-center cursor-pointer">

                <input type="checkbox" checked={personalVisible} onChange={(e) => togglePersonalVisibility(e.target.checked)} className="sr-only" />

                <div className={`w-11 h-6 rounded-full ${personalVisible ? "bg-amber-400" : "bg-slate-700"} transition`} />

              </label>

            </div>

            <div className="p-3 bg-navy-950 rounded-xl border border-slate-800 flex items-center justify-between">

              <div>
                <div className="text-sm font-bold text-white">{language === "np" ? "डेटा र गोपनीयता" : "Data & Privacy"}</div>

                <div className="text-xs text-slate-400">{language === "np" ? "डेटा प्रयोग नीति" : "Manage data preferences"}</div>
              </div>

              <Link href="/help" className="text-amber-400 text-xs hover:text-amber-300">{language === "np" ? "हेर्नुहोस्" : "View"}</Link>

            </div>

          </div>

        </div>

        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">

          <h3 className="font-bold text-white text-sm">{language === "np" ? "खाता व्यवस्थापन" : "Account Management"}</h3>

          <div className="space-y-3">

            <div className="flex items-center justify-between p-3 bg-navy-950 rounded-xl border border-slate-800">

              <div>
                <div className="text-sm font-bold text-white">{language === "np" ? "मेरो डेटा डाउनलोड गर्नुहोस्" : "Download My Data"}</div>

                <div className="text-xs text-slate-400">{language === "np" ? "तपाईंको एप डाटा डाउनलोड गर्नुहोस्" : "Export your account data"}</div>
              </div>

              <button onClick={downloadData} className="px-3 py-2 bg-amber-400 text-slate-900 rounded-lg font-bold text-xs hover:bg-amber-300 transition">{language === "np" ? "डाउनलोड" : "Download"}</button>

            </div>

            <div className="flex items-center justify-between p-3 bg-navy-950 rounded-xl border border-slate-800">

              <div>
                <div className="text-sm font-bold text-red-500">{language === "np" ? "खाता मेटाउनुहोस्" : "Delete Account"}</div>

                <div className="text-xs text-slate-400">{language === "np" ? "यो कार्य स्थायी छ। कृपया सावधान हुनुहोस्।" : "This action is permanent. Please proceed with caution."}</div>
              </div>

              <button onClick={() => setShowDeleteConfirm(true)} className="px-3 py-2 bg-red-600 text-white rounded-lg font-bold text-xs hover:bg-red-500 transition">{language === "np" ? "मेटाउनुहोस्" : "Delete"}</button>

            </div>

          </div>

        </div>

      </div>
    </>
  );
}