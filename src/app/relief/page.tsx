'use client';

import React, { useState, useEffect } from 'react';
import { HeartHandshake, UserPlus, CheckCircle, ShieldCheck, MapPin, Users, Award, AlertTriangle, Plus } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { SatarkStore } from '@/lib/db/store';
import { ReliefRequest, Volunteer, VolunteerSkill, PriorityLevel, ReliefCategory, UserProfile } from '@/types';
import getSatarkRank from '@/lib/satark-rank';
import { ToastNotification, useToast } from '@/components/toast-notification';

export default function ReliefPage() {
  const { t, language } = useLanguage();
  const { toasts, showToast, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState<'relief' | 'volunteer'>('relief');

  const [reliefRequests, setReliefRequests] = useState<ReliefRequest[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showNewReliefModal, setShowNewReliefModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [respondingToRelief, setRespondingToRelief] = useState<string | null>(null);
  const [claimingCompletion, setClaimingCompletion] = useState<string | null>(null);
  const [verifyingHelp, setVerifyingHelp] = useState<string | null>(null);
  const [rejectingHelp, setRejectingHelp] = useState<string | null>(null);

  // Volunteer Reg Form State
  const [volName, setVolName] = useState('');
  const [volPhone, setVolPhone] = useState('');
  const [volArea, setVolArea] = useState('');
  const [volSkills, setVolSkills] = useState<VolunteerSkill[]>(['First Aid']);

  // New Relief Request Form State
  const [relCategory, setRelCategory] = useState<ReliefCategory>('food');
  const [relDesc, setRelDesc] = useState('');
  const [relLocation, setRelLocation] = useState('');
  const [relAffected, setRelAffected] = useState(15);
  const [relUrgency, setRelUrgency] = useState<PriorityLevel>('urgent');

  const availableSkills: VolunteerSkill[] = [
    'First Aid',
    'Rescue',
    'Transportation',
    'Food Distribution',
    'Medical',
    'Logistics',
    'Communication',
  ];

  useEffect(() => {
    async function loadData() {
      setReliefRequests(await SatarkStore.getReliefRequests());
      setVolunteers(await SatarkStore.getVolunteers());
      // load current user profile
      const profile = SatarkStore.getUserProfile();
      setCurrentUser(profile);
    }
    loadData();
  }, []);

  const isVolunteerRegistered = !!(
    currentUser?.isVolunteer ||
    volunteers.find((v) => v.userId === currentUser?.id || v.phone === currentUser?.phone)
  );

  const handleCanHelp = async (requestId: string) => {
    if (!currentUser || !currentUser.id) {
      showToast('Please create a profile first', 'error');
      return;
    }

    if (!isVolunteerRegistered) {
      showToast('Please register as a volunteer before helping with a relief request.', 'error');
      return;
    }

    setRespondingToRelief(requestId);
    try {
      const result = await SatarkStore.acceptReliefRequest(requestId, currentUser.id);

      if (result.success) {
        const updatedRequests = await SatarkStore.getReliefRequests();
        setReliefRequests(updatedRequests);
        setCurrentUser(SatarkStore.getUserProfile());
        showToast('You have been registered as a responder for this relief task. No points are awarded yet.', 'success');
      } else {
        showToast(result.message || 'Unable to register as responder', 'error');
      }
    } catch (error) {
      showToast('An error occurred while registering. Please try again.', 'error');
      console.error('Relief responder registration error:', error);
    } finally {
      setRespondingToRelief(null);
    }
  };

  const handleMarkHelpCompleted = async (requestId: string) => {
    if (!currentUser || !currentUser.id) return;

    setClaimingCompletion(requestId);
    try {
      const result = await SatarkStore.markReliefHelpCompleted(requestId, currentUser.id);
      if (result.success) {
        setReliefRequests(await SatarkStore.getReliefRequests());
        showToast('Your help completion has been submitted for verification.', 'success');
      } else {
        showToast(result.message || 'Unable to submit help completion.', 'error');
      }
    } catch (error) {
      showToast('Unable to submit help completion.', 'error');
    } finally {
      setClaimingCompletion(null);
    }
  };

  const handleVerifyHelp = async (requestId: string, volunteerId: string) => {
    if (!currentUser) return;

    setVerifyingHelp(`${requestId}:${volunteerId}`);
    try {
      const result = await SatarkStore.verifyReliefHelp(requestId, volunteerId, currentUser.id);
      if (result.success) {
        setReliefRequests(await SatarkStore.getReliefRequests());
        setCurrentUser(SatarkStore.getUserProfile());
        showToast('Help verified successfully. +15 Satark Points awarded once.', 'success');
      } else {
        showToast(result.message || 'Unable to verify help.', 'error');
      }
    } catch (error) {
      showToast('Unable to verify help.', 'error');
    } finally {
      setVerifyingHelp(null);
    }
  };

  const handleRejectHelp = async (requestId: string, volunteerId: string) => {
    if (!currentUser) return;

    setRejectingHelp(`${requestId}:${volunteerId}`);
    try {
      const result = await SatarkStore.rejectReliefHelp(requestId, volunteerId, currentUser.id);
      if (result.success) {
        setReliefRequests(await SatarkStore.getReliefRequests());
        showToast('Help claim rejected. No points awarded.', 'info');
      } else {
        showToast(result.message || 'Unable to reject help claim.', 'error');
      }
    } catch (error) {
      showToast('Unable to reject help claim.', 'error');
    } finally {
      setRejectingHelp(null);
    }
  };

  const handleRegisterVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!volName || !volPhone || !volArea) return;
    // prevent duplicate registration
    const profile = SatarkStore.getUserProfile();
    const userId = profile?.id || 'USR-CURRENT';
    const existing = (await SatarkStore.getVolunteers()).find(v => v.userId === userId || v.phone === volPhone);
    if (existing) {
      setShowRegModal(false);
      setCurrentUser(SatarkStore.getUserProfile());
      setVolunteers(await SatarkStore.getVolunteers());
      showToast('You are already registered as a volunteer.', 'info');
      return;
    }

    setRegistering(true);
    try {
      await SatarkStore.registerVolunteer({
        userId: userId,
        userName: volName,
        phone: volPhone,
        area: volArea,
        skills: volSkills,
        availability: 'Immediate (24/7)',
        verified: true,
      });
      // refresh volunteers and profile from persistent store
      setVolunteers(await SatarkStore.getVolunteers());
      setCurrentUser(SatarkStore.getUserProfile());
      setShowRegModal(false);
      showToast('Successfully registered as a Satark Nepal Volunteer! (+15 Satark Points awarded)', 'success');
      // Reset form
      setVolName('');
      setVolPhone('');
      setVolArea('');
      setVolSkills(['First Aid']);
    } finally {
      setRegistering(false);
    }
  };

  const handleCreateRelief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!relDesc || !relLocation) return;
    await SatarkStore.addReliefRequest({
      createdBy: 'Citizen Request',
      type: relCategory,
      description: relDesc,
      location: relLocation,
      urgency: relUrgency,
      peopleAffected: relAffected,
    });
    setReliefRequests(await SatarkStore.getReliefRequests());
    setShowNewReliefModal(false);
  };

  return (
    <>
      <ToastNotification toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-emerald-400" />
            <span>{t.reliefTitle}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'np'
              ? 'आपत्कालीन राहत वितरण र स्वयंसेवक टोली समन्वय केन्द्र।'
              : 'Direct community relief distribution & responder volunteer dispatch.'}
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => setShowNewReliefModal(true)}
            className="bg-navy-800 hover:bg-navy-700 text-white border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Post Relief Request</span>
          </button>

          {(() => {
            const profileId = currentUser?.id;
            const isRegistered = !!(
              currentUser?.isVolunteer || volunteers.find((v) => v.userId === profileId || v.phone === currentUser?.phone)
            );

            if (isRegistered) {
              return (
                <div className="flex flex-col items-end">
                  <button
                    className="bg-navy-800 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-400"
                    disabled
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>✓ Registered Volunteer</span>
                  </button>
                </div>
              );
            }

            return (
              <button
                onClick={() => setShowRegModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t.registerVolunteer}</span>
              </button>
            );
          })()}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('relief')}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition ${activeTab === 'relief'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
            }`}
        >
          {t.needReliefTab} ({reliefRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('volunteer')}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition ${activeTab === 'volunteer'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
            }`}
        >
          {t.volunteerTab} ({volunteers.length})
        </button>
      </div>

      {/* Tab 1: Relief Requests */}
      {activeTab === 'relief' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reliefRequests.map((req) => (
            <div
              key={req.id}
              className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/40 uppercase">
                    {req.type} Relief
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${req.status === 'NEEDED'
                        ? 'bg-red-600/20 text-red-400 border border-red-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                  >
                    {req.status}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base leading-snug">
                  {req.description}
                </h3>

                <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    {req.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    {req.peopleAffected} {t.peopleAffected}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {req.currentResponders} {t.currentResponders} responding
                  </span>

                  {(() => {
                    const currentHelpRecord = currentUser ? req.helpRecords?.find((record) => record.volunteerId === currentUser.id) : undefined;
                    const isResponder = !!currentHelpRecord && currentHelpRecord.status !== 'REJECTED';
                    const isLoading = respondingToRelief === req.id;
                    const isDisabled = !isVolunteerRegistered || isLoading || !!(currentHelpRecord && (currentHelpRecord.status === 'PENDING_VERIFICATION' || currentHelpRecord.status === 'VERIFIED'));

                    return (
                      <button
                        onClick={() => handleCanHelp(req.id)}
                        disabled={isDisabled}
                        className={`font-extrabold text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition ${
                          currentHelpRecord?.status === 'VERIFIED'
                            ? 'bg-emerald-700 text-white cursor-not-allowed opacity-90'
                            : currentHelpRecord?.status === 'PENDING_VERIFICATION'
                              ? 'bg-amber-600 text-white cursor-wait opacity-75'
                              : currentHelpRecord?.status === 'REJECTED'
                                ? 'bg-rose-600 text-white cursor-pointer hover:bg-rose-700'
                                : isLoading
                                  ? 'bg-amber-600 text-white cursor-wait opacity-75'
                                  : !isVolunteerRegistered
                                    ? 'bg-navy-800 text-white cursor-not-allowed opacity-80'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                        }`}
                      >
                        {currentHelpRecord?.status === 'VERIFIED' ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>✓ HELP VERIFIED · +15 PTS</span>
                          </>
                        ) : currentHelpRecord?.status === 'PENDING_VERIFICATION' ? (
                          <>
                            <AlertTriangle className="w-4 h-4" />
                            <span>PENDING VERIFICATION</span>
                          </>
                        ) : currentHelpRecord?.status === 'REJECTED' ? (
                          <>
                            <AlertTriangle className="w-4 h-4" />
                            <span>HELP NOT VERIFIED</span>
                          </>
                        ) : isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>REGISTERING...</span>
                          </>
                        ) : isResponder ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>✓ I'M HELPING</span>
                          </>
                        ) : !isVolunteerRegistered ? (
                          <>
                            <HeartHandshake className="w-4 h-4" />
                            <span>Register as volunteer</span>
                          </>
                        ) : (
                          <>
                            <HeartHandshake className="w-4 h-4" />
                            <span>I CAN HELP</span>
                          </>
                        )}
                      </button>
                    );
                  })()}
                </div>

                {currentUser && req.helpRecords?.find((record) => record.volunteerId === currentUser.id)?.status === 'REGISTERED' && (
                  <button
                    onClick={() => handleMarkHelpCompleted(req.id)}
                    disabled={claimingCompletion === req.id}
                    className="w-full bg-amber-500/15 border border-amber-500/40 text-amber-300 px-3 py-2 rounded-xl text-[11px] font-bold hover:bg-amber-500/20 transition"
                  >
                    {claimingCompletion === req.id ? 'Submitting...' : 'MARK HELP AS COMPLETED'}
                  </button>
                )}

                {currentUser && req.helpRecords?.find((record) => record.volunteerId === currentUser.id)?.status === 'PENDING_VERIFICATION' && (
                  <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] rounded-xl px-3 py-2 font-semibold">
                    Help completion submitted for verification.
                  </div>
                )}

                {req.helpRecords?.filter((record) => record.status === 'PENDING_VERIFICATION').map((record) => {
                  const volunteer = volunteers.find((v) => v.userId === record.volunteerId || v.id === record.volunteerId);
                  const volunteerName = volunteer?.userName || 'Volunteer';
                  const isAuthorized = !!currentUser && (currentUser.role === 'admin' || currentUser.name === req.createdBy || currentUser.phone === req.contactPhone || currentUser.id === req.createdBy);

                  if (!isAuthorized) return null;

                  return (
                    <div key={`${req.id}-${record.volunteerId}`} className="bg-slate-900 border border-slate-700 rounded-xl p-3 space-y-2">
                      <p className="text-xs text-slate-200 font-semibold">{volunteerName} claims to have completed this relief task.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerifyHelp(req.id, record.volunteerId)}
                          disabled={verifyingHelp === `${req.id}:${record.volunteerId}`}
                          className="flex-1 bg-emerald-600 text-white text-[11px] font-bold px-3 py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-60"
                        >
                          {verifyingHelp === `${req.id}:${record.volunteerId}` ? 'Verifying...' : '✓ VERIFY HELP'}
                        </button>
                        <button
                          onClick={() => handleRejectHelp(req.id, record.volunteerId)}
                          disabled={rejectingHelp === `${req.id}:${record.volunteerId}`}
                          className="flex-1 bg-rose-600 text-white text-[11px] font-bold px-3 py-2 rounded-lg hover:bg-rose-700 transition disabled:opacity-60"
                        >
                          {rejectingHelp === `${req.id}:${record.volunteerId}` ? 'Rejecting...' : 'REJECT'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Volunteers Directory */}
      {activeTab === 'volunteer' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {volunteers.map((vol) => {
            const rankInfo = getSatarkRank(vol.points || 0);
            const displayRank = rankInfo.name;
            return (
              <div
                key={vol.id}
                className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 font-black text-sm">
                      {vol.userName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-1">
                        {vol.userName}
                        {vol.verified && <ShieldCheck className="w-3.5 h-3.5 text-safe-500" />}
                      </h4>
                      <p className="text-[11px] text-slate-400">{vol.area}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-amber-400 block">{vol.points} pts</span>
                    <span className="text-[10px] bg-navy-800 text-slate-300 px-1.5 py-0.5 rounded font-semibold border border-slate-700">
                      {displayRank}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {vol.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-navy-950 text-slate-300 text-[10px] px-2 py-0.5 rounded-full border border-slate-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex justify-between">
                  <span>Availability: {vol.availability}</span>
                  <span className="text-emerald-400 font-medium">✓ Verified Active</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Volunteer Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              <span>{t.registerVolunteer}</span>
            </h3>

            <form onSubmit={handleRegisterVolunteer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={volName}
                  onChange={(e) => setVolName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={volPhone}
                  onChange={(e) => setVolPhone(e.target.value)}
                  placeholder="+977 98XXXXXXXX"
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Area / District</label>
                <input
                  type="text"
                  required
                  value={volArea}
                  onChange={(e) => setVolArea(e.target.value)}
                  placeholder="e.g. Patan, Lalitpur"
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Select Skills</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableSkills.map((sk) => (
                    <label key={sk} className="flex items-center gap-2 text-slate-300 bg-navy-950 p-2 rounded-lg border border-slate-800">
                      <input
                        type="checkbox"
                        checked={volSkills.includes(sk)}
                        onChange={(e) => {
                          if (e.target.checked) setVolSkills([...volSkills, sk]);
                          else setVolSkills(volSkills.filter((s) => s !== sk));
                        }}
                        className="rounded accent-emerald-500"
                      />
                      <span>{sk}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="flex-1 bg-navy-800 text-slate-300 py-3 rounded-xl font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className={`flex-1 ${registering ? 'opacity-60 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'} text-white font-bold py-3 rounded-xl shadow-md`}
                >
                  {registering ? 'Registering...' : t.confirm}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Relief Request Modal */}
      {showNewReliefModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Post Relief Request</h3>

            <form onSubmit={handleCreateRelief} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Relief Type</label>
                <select
                  value={relCategory}
                  onChange={(e) => setRelCategory(e.target.value as ReliefCategory)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="food">Food</option>
                  <option value="water">Water</option>
                  <option value="medicine">Medicine</option>
                  <option value="shelter">Shelter</option>
                  <option value="rescue">Rescue</option>
                  <option value="transport">Transport</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Location Address</label>
                <input
                  type="text"
                  required
                  value={relLocation}
                  onChange={(e) => setRelLocation(e.target.value)}
                  placeholder="e.g. Suryabinayak, Bhaktapur"
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={relDesc}
                  onChange={(e) => setRelDesc(e.target.value)}
                  placeholder="Describe specific items required and shelter location..."
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewReliefModal(false)}
                  className="flex-1 bg-navy-800 text-slate-300 py-3 rounded-xl font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl shadow-md"
                >
                  Submit Relief Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}