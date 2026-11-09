"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  Clock,
  Calendar,
  Phone,
  Globe,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sliders,
  History,
  Check,
  X,
  ExternalLink,
} from "lucide-react";

interface ProfileEditorViewProps {
  locationId?: string;
  tenantName?: string;
  onAuditUpdated?: () => void;
}

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export default function ProfileEditorView({
  locationId,
  tenantName,
  onAuditUpdated,
}: ProfileEditorViewProps) {
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Form State
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [regularHours, setRegularHours] = useState<Record<string, { open: string; close: string; isClosed?: boolean }>>({});
  const [specialHours, setSpecialHours] = useState<Array<{ date: string; open: string; close: string; isClosed: boolean }>>([]);
  const [services, setServices] = useState<string[]>([]);
  const [newServiceInput, setNewServiceInput] = useState("");
  const [syncMicrosite, setSyncMicrosite] = useState(true);

  // Original Baseline for Diff
  const [originalData, setOriginalData] = useState<any>(null);

  // Modal & Save States
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [pendingDiffs, setPendingDiffs] = useState<Array<{ field: string; label: string; before: any; after: any }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const url = locationId
        ? `/api/dashboard/google/profile?locationId=${encodeURIComponent(locationId)}`
        : "/api/dashboard/google/profile";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load profile details");

      if (data.location) {
        setLocation(data.location);

        const initialDesc = data.location.description || "";
        const initialPhone = data.location.primaryPhone || "";
        const initialWeb = data.location.websiteUri || "";

        // Normalize regular hours
        const rawHours = data.location.regularHours || {};
        const normalizedHours: Record<string, any> = {};
        DAYS_OF_WEEK.forEach((d) => {
          normalizedHours[d.key] = rawHours[d.key] || { open: "06:00", close: "23:00", isClosed: false };
        });

        // Normalize special hours
        const initialSpecial = Array.isArray(data.location.specialHours) ? data.location.specialHours : [];

        // Normalize services
        const initialServices = Array.isArray(data.location.serviceItems)
          ? data.location.serviceItems.map((s: any) => (typeof s === "string" ? s : s.displayName || s.name || ""))
          : [];

        setDescription(initialDesc);
        setPhone(initialPhone);
        setWebsite(initialWeb);
        setRegularHours(normalizedHours);
        setSpecialHours(initialSpecial);
        setServices(initialServices.filter(Boolean));

        setOriginalData({
          description: initialDesc,
          phone: initialPhone,
          website: initialWeb,
          regularHours: normalizedHours,
          specialHours: initialSpecial,
          services: initialServices.filter(Boolean),
        });
      }

      setAuditLogs(data.auditLogs || []);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [locationId]);

  // Compute Diffs when user clicks "Review & Save Changes"
  const handleReviewChanges = () => {
    if (!originalData) return;

    const diffs: Array<{ field: string; label: string; before: any; after: any }> = [];

    if (description.trim() !== originalData.description.trim()) {
      diffs.push({
        field: "description",
        label: "Business Description",
        before: originalData.description || "(Empty)",
        after: description || "(Empty)",
      });
    }

    if (phone.trim() !== originalData.phone.trim()) {
      diffs.push({
        field: "primaryPhone",
        label: "Primary Phone Number",
        before: originalData.phone || "(Empty)",
        after: phone || "(Empty)",
      });
    }

    if (website.trim() !== originalData.website.trim()) {
      diffs.push({
        field: "websiteUri",
        label: "Website / Booking URL",
        before: originalData.website || "(Empty)",
        after: website || "(Empty)",
      });
    }

    if (JSON.stringify(regularHours) !== JSON.stringify(originalData.regularHours)) {
      diffs.push({
        field: "regularHours",
        label: "Weekly Operating Hours",
        before: originalData.regularHours,
        after: regularHours,
      });
    }

    if (JSON.stringify(specialHours) !== JSON.stringify(originalData.specialHours)) {
      diffs.push({
        field: "specialHours",
        label: "Special Festival & Holiday Hours",
        before: originalData.specialHours,
        after: specialHours,
      });
    }

    if (JSON.stringify(services) !== JSON.stringify(originalData.services)) {
      diffs.push({
        field: "serviceItems",
        label: "Services Catalog",
        before: originalData.services,
        after: services,
      });
    }

    if (diffs.length === 0) {
      alert("No changes have been made to your profile.");
      return;
    }

    setPendingDiffs(diffs);
    setShowDiffModal(true);
  };

  // Dispatch PATCH to API
  const handleConfirmPublish = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccessMessage(null);

    const changesToSubmit: any = {};
    pendingDiffs.forEach((d) => {
      if (d.field === "description") changesToSubmit.description = description;
      if (d.field === "primaryPhone") changesToSubmit.primaryPhone = phone;
      if (d.field === "websiteUri") changesToSubmit.websiteUri = website;
      if (d.field === "regularHours") changesToSubmit.regularHours = regularHours;
      if (d.field === "specialHours") changesToSubmit.specialHours = specialHours;
      if (d.field === "serviceItems") {
        changesToSubmit.serviceItems = services.map((s) => ({
          serviceTypeId: s.toLowerCase().replace(/[^a-z0-9]/g, "_"),
          displayName: s,
        }));
      }
    });

    try {
      const res = await fetch("/api/dashboard/google/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: location?.id,
          changes: changesToSubmit,
          syncMicrosite,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile changes");
      }

      setShowDiffModal(false);
      setSaveSuccessMessage(data.message || "Profile updated successfully on Google!");
      setTimeout(() => setSaveSuccessMessage(null), 5000);

      // Refresh baseline
      fetchProfile();
      if (onAuditUpdated) onAuditUpdated();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newServiceInput.trim();
    if (!trimmed) return;
    if (services.includes(trimmed)) return;
    setServices([...services, trimmed]);
    setNewServiceInput("");
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setServices(services.filter((s) => s !== serviceToRemove));
  };

  const handleAddSpecialHour = () => {
    const today = new Date().toISOString().split("T")[0];
    setSpecialHours([
      ...specialHours,
      { date: today, open: "08:00", close: "22:00", isClosed: false },
    ]);
  };

  const handleRemoveSpecialHour = (index: number) => {
    setSpecialHours(specialHours.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-12 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-700">Loading Profile Details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  Google Business Profile Editor
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  LIVE PATCH
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Edit storefront details, holiday hours, and services. Changes are previewed and audited with precise updateMask.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReviewChanges}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all active:scale-98 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Review & Save Changes</span>
          </button>
        </div>

        {saveSuccessMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 1: Business Description */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Business Description (SEO Profile)
            </label>
            <span className={`text-[11px] font-mono ${description.length >= 150 ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
              {description.length} / 750 characters {description.length < 150 && "(Recommend ≥ 150 chars)"}
            </span>
          </div>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Introduce your business to Google searchers. Describe your services, facilities, specialties, and why customers should choose you..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
          />
        </div>

        {/* Section 2: Contact Info (Phone & Website) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Primary Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98400 12345"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Website / Online Booking URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourbusiness.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Regular Weekly Operating Hours */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Weekly Operating Hours</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Displayed in Google Search knowledge panel and Google Maps.
              </p>
            </div>

            {/* Sync microsite toggle */}
            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={syncMicrosite}
                onChange={(e) => setSyncMicrosite(e.target.checked)}
                className="w-3.5 h-3.5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <span className="text-[11px] font-semibold text-slate-700">
                Sync with TapGenie microsite hours
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DAYS_OF_WEEK.map((d) => {
              const dayConf = regularHours[d.key] || { open: "06:00", close: "23:00", isClosed: false };
              const isClosed = Boolean(dayConf.isClosed);
              return (
                <div
                  key={d.key}
                  className={`p-3 rounded-2xl border transition-all ${
                    isClosed
                      ? "bg-slate-100/60 border-slate-200 text-slate-400"
                      : "bg-slate-50/70 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">{d.label}</span>
                    <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isClosed}
                        onChange={(e) => {
                          setRegularHours({
                            ...regularHours,
                            [d.key]: { ...dayConf, isClosed: e.target.checked },
                          });
                        }}
                        className="w-3 h-3 text-teal-600 rounded border-slate-300"
                      />
                      <span>Closed</span>
                    </label>
                  </div>

                  {!isClosed ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="time"
                        value={dayConf.open || "06:00"}
                        onChange={(e) =>
                          setRegularHours({
                            ...regularHours,
                            [d.key]: { ...dayConf, open: e.target.value },
                          })
                        }
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 font-mono"
                      />
                      <span className="text-slate-400 text-xs">to</span>
                      <input
                        type="time"
                        value={dayConf.close || "23:00"}
                        onChange={(e) =>
                          setRegularHours({
                            ...regularHours,
                            [d.key]: { ...dayConf, close: e.target.value },
                          })
                        }
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 font-mono"
                      />
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 font-medium py-1">Closed all day</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Special / Holiday Hours */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>Special Holiday & Festival Hours ({specialHours.length})</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Override regular schedules for public holidays, festivals (Diwali, Pongal, Christmas), or renovations.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddSpecialHour}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Holiday Date</span>
            </button>
          </div>

          {specialHours.length === 0 ? (
            <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-2xl text-center text-xs text-slate-400">
              No special holiday schedules configured. Click "Add Holiday Date" above to add upcoming festival timings.
            </div>
          ) : (
            <div className="space-y-2">
              {specialHours.map((sp, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="date"
                      value={sp.date}
                      onChange={(e) => {
                        const updated = [...specialHours];
                        updated[idx].date = e.target.value;
                        setSpecialHours(updated);
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                    />

                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(sp.isClosed)}
                        onChange={(e) => {
                          const updated = [...specialHours];
                          updated[idx].isClosed = e.target.checked;
                          setSpecialHours(updated);
                        }}
                        className="w-3.5 h-3.5 text-teal-600 rounded border-slate-300"
                      />
                      <span>Closed all day</span>
                    </label>
                  </div>

                  {!sp.isClosed && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={sp.open || "09:00"}
                        onChange={(e) => {
                          const updated = [...specialHours];
                          updated[idx].open = e.target.value;
                          setSpecialHours(updated);
                        }}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
                      />
                      <span className="text-slate-400 text-xs">to</span>
                      <input
                        type="time"
                        value={sp.close || "18:00"}
                        onChange={(e) => {
                          const updated = [...specialHours];
                          updated[idx].close = e.target.value;
                          setSpecialHours(updated);
                        }}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveSpecialHour(idx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-all self-end sm:self-auto"
                    title="Remove holiday schedule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Services Catalog */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Services Catalog ({services.length})</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Specific services shown directly on your Google Business Profile listing.
            </p>
          </div>

          <form onSubmit={handleAddService} className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              value={newServiceInput}
              onChange={(e) => setNewServiceInput(e.target.value)}
              placeholder="e.g. Turf Booking, Night Cricket, Coaching"
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0"
            >
              Add Service
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-1">
            {services.map((svc) => (
              <span
                key={svc}
                className="px-3 py-1 bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 inline-flex items-center gap-1.5"
              >
                <span>{svc}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveService(svc)}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Table of Changes */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Profile Change Audit History
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Recorded with user & timestamp
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            No profile modifications recorded yet. Any saved changes will be logged here.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => {
              const meta = (log.metadata as any) || {};
              const diffs = meta.diffs || [];
              return (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.actorEmail}</span>
                      <span className="px-2 py-0.2 bg-teal-50 text-teal-700 rounded-md font-mono text-[10px] font-bold">
                        mask: {meta.updateMask || "profile"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Modified {diffs.length} field(s): {diffs.map((d: any) => d.field).join(", ")}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {new Date(log.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Before vs After Diff Confirmation Modal */}
      {showDiffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Confirm Profile Changes (Before & After)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review exact modifications before publishing live to Google Business Profile.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDiffModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Diffs List */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {pendingDiffs.map((d) => (
                <div key={d.field} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {d.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">
                      updateMask: {d.field === "description" ? "profile" : d.field === "phone" ? "phoneNumbers" : d.field}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-rose-50/70 border border-rose-100 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                        Before (Live on Google)
                      </span>
                      <div className="text-slate-700 font-mono text-[11px] break-words">
                        {typeof d.before === "object" ? JSON.stringify(d.before, null, 1) : String(d.before)}
                      </div>
                    </div>

                    <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                        After (Proposed Update)
                      </span>
                      <div className="text-slate-800 font-mono text-[11px] font-bold break-words">
                        {typeof d.after === "object" ? JSON.stringify(d.after, null, 1) : String(d.after)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {syncMicrosite && (
              <p className="text-[11px] text-teal-700 bg-teal-50 border border-teal-200 p-2.5 rounded-xl font-medium">
                ✓ Operating hours will also be automatically updated on your TapGenie customer microsite.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setShowDiffModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleConfirmPublish}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Publishing to Google...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm & Publish to Google</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

