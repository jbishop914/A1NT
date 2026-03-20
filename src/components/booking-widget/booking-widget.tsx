"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { getTheme, themeToCSSVars, type BookingTheme } from "./themes";

/* ─── Types ─────────────────────────────────────────────────────── */

interface BookingType {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  type: string;
}

interface TimeSlot {
  start: string; // ISO datetime
  end: string;
  display: string; // "9:00 AM"
}

interface BookingWidgetProps {
  /** Organization ID for API calls */
  orgId?: string;
  /** Theme ID from pre-made themes */
  themeId?: string;
  /** Custom theme override */
  theme?: BookingTheme;
  /** API base URL (for embedded widget) */
  apiBase?: string;
  /** Called on successful booking */
  onComplete?: (booking: any) => void;
  /** Called on close/cancel */
  onClose?: () => void;
  /** Show close button */
  showClose?: boolean;
}

type Step = "type" | "info" | "address" | "time" | "confirm" | "success";

const STEPS: { id: Step; label: string }[] = [
  { id: "type", label: "Service" },
  { id: "info", label: "Contact" },
  { id: "address", label: "Address" },
  { id: "time", label: "Schedule" },
  { id: "confirm", label: "Confirm" },
];

/* ─── Component ─────────────────────────────────────────────────── */

export function BookingWidget({
  orgId,
  themeId = "clean-light",
  theme: customTheme,
  apiBase = "",
  onComplete,
  onClose,
  showClose = false,
}: BookingWidgetProps) {
  const theme = customTheme || getTheme(themeId);
  const cssVars = useMemo(() => themeToCSSVars(theme), [theme]);

  /* ── State ── */
  const [step, setStep] = useState<Step>("type");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [bookingTypes, setBookingTypes] = useState<BookingType[]>([]);
  const [selectedType, setSelectedType] = useState<BookingType | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [description, setDescription] = useState("");
  const [addressValid, setAddressValid] = useState<boolean | null>(null);
  const [addressChecking, setAddressChecking] = useState(false);

  /* ── Load booking types on mount ── */
  useEffect(() => {
    (async () => {
      try {
        const url = orgId
          ? `${apiBase}/api/booking/config?orgId=${orgId}`
          : `${apiBase}/api/booking/config`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load booking config");
        const data = await res.json();
        setBookingTypes(data.bookingTypes || []);
      } catch {
        setError("Unable to load booking options. Please try again later.");
      }
    })();
  }, [orgId, apiBase]);

  /* ── Generate available dates (next 30 days) ── */
  const availableDates = useMemo(() => {
    const dates: { value: string; label: string; dayName: string }[] = [];
    const now = new Date();
    for (let i = 1; i <= 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      dates.push({
        value: d.toISOString().split("T")[0],
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }
    return dates;
  }, []);

  /* ── Fetch available time slots when date changes ── */
  useEffect(() => {
    if (!selectedDate || !selectedType) return;

    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          date: selectedDate,
          type: selectedType.type,
        });
        if (orgId) params.set("orgId", orgId);
        const res = await fetch(`${apiBase}/api/booking?${params}`);
        if (!res.ok) throw new Error("Failed to load availability");
        const data = await res.json();
        setTimeSlots(data.slots || []);
      } catch {
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedDate, selectedType, orgId, apiBase]);

  /* ── Validate address against service area ── */
  const validateAddress = useCallback(async () => {
    if (!street || !city || !state || !zip) return;

    setAddressChecking(true);
    setAddressValid(null);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/api/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate-address",
          address: { street, city, state, zip },
          orgId,
        }),
      });
      const data = await res.json();
      setAddressValid(data.inServiceArea ?? false);

      if (!data.inServiceArea) {
        setError(
          "The address you entered is outside of our normal service area. Please call the office if you need further assistance. Thank you."
        );
      }
    } catch {
      // If validation fails, allow to proceed
      setAddressValid(true);
    } finally {
      setAddressChecking(false);
    }
  }, [street, city, state, zip, apiBase, orgId]);

  /* ── Submit booking ── */
  const submitBooking = useCallback(async () => {
    if (!selectedType || !selectedSlot) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/api/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingTypeId: selectedType.id,
          date: selectedDate,
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          firstName,
          lastName,
          email,
          phone,
          address: { street, city, state, zip },
          description,
          orgId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create booking");
      }

      const booking = await res.json();
      setStep("success");
      onComplete?.(booking);
    } catch (err: any) {
      setError(err.message || "Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    selectedType,
    selectedSlot,
    selectedDate,
    firstName,
    lastName,
    email,
    phone,
    street,
    city,
    state,
    zip,
    description,
    orgId,
    apiBase,
    onComplete,
  ]);

  /* ── Navigation ── */
  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  const canProceed = useMemo(() => {
    switch (step) {
      case "type":
        return !!selectedType;
      case "info":
        return firstName.trim() && lastName.trim() && email.trim() && phone.trim();
      case "address":
        return (
          street.trim() &&
          city.trim() &&
          state.trim() &&
          zip.trim() &&
          addressValid === true
        );
      case "time":
        return !!selectedSlot;
      case "confirm":
        return true;
      default:
        return false;
    }
  }, [step, selectedType, firstName, lastName, email, phone, street, city, state, zip, addressValid, selectedSlot]);

  const goNext = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx < STEPS.length - 1) {
      setError(null);
      setStep(STEPS[idx + 1].id);
    }
  }, [step]);

  const goBack = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx > 0) {
      setError(null);
      setStep(STEPS[idx - 1].id);
    }
  }, [step]);

  /* ── Render ── */
  return (
    <div
      className="bw-root"
      style={{
        ...cssVars as any,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "var(--bw-text)",
        background: "var(--bw-bg)",
        borderRadius: "12px",
        overflow: "hidden",
        maxWidth: "480px",
        width: "100%",
        border: `1px solid var(--bw-border)`,
      }}
      data-testid="booking-widget"
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: `1px solid var(--bw-border)`,
          background: "var(--bw-bg-card)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Calendar style={{ width: "18px", height: "18px", color: "var(--bw-accent)" }} />
          <span style={{ fontSize: "15px", fontWeight: 600 }}>Book Appointment</span>
        </div>
        {showClose && onClose && (
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "6px",
              color: "var(--bw-text-muted)",
              display: "flex",
            }}
            data-testid="booking-close"
          >
            <X style={{ width: "18px", height: "18px" }} />
          </button>
        )}
      </div>

      {/* ── Progress Steps ── */}
      {step !== "success" && (
        <div
          style={{
            display: "flex",
            padding: "12px 20px",
            gap: "4px",
            borderBottom: `1px solid var(--bw-border)`,
            background: "var(--bw-bg-card)",
          }}
        >
          {STEPS.map((s, i) => {
            const isActive = s.id === step;
            const isComplete = i < currentStepIndex;
            return (
              <div key={s.id} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <div
                  style={{
                    height: "3px",
                    borderRadius: "2px",
                    background: isComplete
                      ? "var(--bw-accent)"
                      : isActive
                      ? "var(--bw-accent)"
                      : "var(--bw-bg-muted)",
                    opacity: isActive ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}
                />
                <span
                  style={{
                    fontSize: "10px",
                    color: isActive || isComplete ? "var(--bw-accent)" : "var(--bw-text-muted)",
                    fontWeight: isActive ? 600 : 400,
                    textAlign: "center",
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            padding: "12px 20px",
            background: `${theme.colors.error}10`,
            borderBottom: `1px solid ${theme.colors.error}20`,
            fontSize: "13px",
            color: theme.colors.error,
          }}
          data-testid="booking-error"
        >
          <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0, marginTop: "1px" }} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Step Content ── */}
      <div style={{ padding: "20px", minHeight: "280px" }}>
        {/* STEP 1: Appointment Type */}
        {step === "type" && (
          <div data-testid="booking-step-type">
            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
              Select Appointment Type
            </h3>
            <p style={{ fontSize: "12px", color: "var(--bw-text-muted)", marginBottom: "16px" }}>
              Choose the type of appointment you need
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {bookingTypes.length === 0 && !error && (
                <div style={{ display: "flex", justifyContent: "center", padding: "24px" }}>
                  <Loader2
                    style={{ width: "20px", height: "20px", color: "var(--bw-text-muted)", animation: "spin 1s linear infinite" }}
                  />
                </div>
              )}
              {bookingTypes.map((bt) => (
                <button
                  key={bt.id}
                  onClick={() => setSelectedType(bt)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: `1px solid ${selectedType?.id === bt.id ? "var(--bw-accent)" : "var(--bw-border)"}`,
                    background: selectedType?.id === bt.id ? "var(--bw-accent-muted)" : "var(--bw-bg-card)",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    transition: "all 0.15s",
                    color: "var(--bw-text)",
                  }}
                  data-testid={`booking-type-${bt.type}`}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: selectedType?.id === bt.id ? "var(--bw-accent)" : "var(--bw-bg-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FileText
                      style={{
                        width: "16px",
                        height: "16px",
                        color: selectedType?.id === bt.id ? "var(--bw-text-inverse)" : "var(--bw-text-muted)",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 500 }}>{bt.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--bw-text-muted)", marginTop: "2px" }}>
                      {bt.durationMinutes} min
                      {bt.description ? ` · ${bt.description}` : ""}
                    </div>
                  </div>
                  {selectedType?.id === bt.id && (
                    <Check style={{ width: "16px", height: "16px", color: "var(--bw-accent)", flexShrink: 0 }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Contact Info */}
        {step === "info" && (
          <div data-testid="booking-step-info">
            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
              Contact Information
            </h3>
            <p style={{ fontSize: "12px", color: "var(--bw-text-muted)", marginBottom: "16px" }}>
              How can we reach you?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <InputField
                  icon={<User style={{ width: "14px", height: "14px" }} />}
                  placeholder="First name"
                  value={firstName}
                  onChange={setFirstName}
                  testId="booking-first-name"
                />
                <InputField
                  placeholder="Last name"
                  value={lastName}
                  onChange={setLastName}
                  testId="booking-last-name"
                />
              </div>
              <InputField
                icon={<Mail style={{ width: "14px", height: "14px" }} />}
                placeholder="Email address"
                type="email"
                value={email}
                onChange={setEmail}
                testId="booking-email"
              />
              <InputField
                icon={<Phone style={{ width: "14px", height: "14px" }} />}
                placeholder="Phone number"
                type="tel"
                value={phone}
                onChange={setPhone}
                testId="booking-phone"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Address / Service Area Validation */}
        {step === "address" && (
          <div data-testid="booking-step-address">
            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
              Service Address
            </h3>
            <p style={{ fontSize: "12px", color: "var(--bw-text-muted)", marginBottom: "16px" }}>
              Where do you need service?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <InputField
                icon={<MapPin style={{ width: "14px", height: "14px" }} />}
                placeholder="Street address"
                value={street}
                onChange={(v) => {
                  setStreet(v);
                  setAddressValid(null);
                }}
                testId="booking-street"
              />
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px" }}>
                <InputField
                  placeholder="City"
                  value={city}
                  onChange={(v) => {
                    setCity(v);
                    setAddressValid(null);
                  }}
                  testId="booking-city"
                />
                <InputField
                  placeholder="State"
                  value={state}
                  onChange={(v) => {
                    setState(v);
                    setAddressValid(null);
                  }}
                  testId="booking-state"
                />
                <InputField
                  placeholder="ZIP"
                  value={zip}
                  onChange={(v) => {
                    setZip(v);
                    setAddressValid(null);
                  }}
                  testId="booking-zip"
                />
              </div>

              {/* Validate button */}
              {addressValid === null && street && city && state && zip && (
                <button
                  onClick={validateAddress}
                  disabled={addressChecking}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "10px",
                    borderRadius: "8px",
                    border: `1px solid var(--bw-accent)`,
                    background: "var(--bw-accent-muted)",
                    color: "var(--bw-accent)",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    width: "100%",
                  }}
                  data-testid="booking-validate-address"
                >
                  {addressChecking ? (
                    <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />
                  ) : (
                    <MapPin style={{ width: "14px", height: "14px" }} />
                  )}
                  {addressChecking ? "Checking..." : "Verify Service Area"}
                </button>
              )}

              {/* Validation result */}
              {addressValid === true && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: `${theme.colors.success}10`,
                    border: `1px solid ${theme.colors.success}30`,
                    fontSize: "12px",
                    color: theme.colors.success,
                  }}
                  data-testid="booking-address-valid"
                >
                  <Check style={{ width: "14px", height: "14px" }} />
                  Address is within our service area
                </div>
              )}

              {/* Description */}
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "var(--bw-text-muted)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Describe the work needed (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of what you need..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: `1px solid var(--bw-border)`,
                    background: "var(--bw-bg-card)",
                    color: "var(--bw-text)",
                    fontSize: "13px",
                    resize: "vertical",
                    outline: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                  data-testid="booking-description"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Time Slot Selection */}
        {step === "time" && (
          <div data-testid="booking-step-time">
            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
              Select Date & Time
            </h3>
            <p style={{ fontSize: "12px", color: "var(--bw-text-muted)", marginBottom: "16px" }}>
              Choose your preferred appointment slot
            </p>

            {/* Date selector — horizontal scroll */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{ fontSize: "11px", color: "var(--bw-text-muted)", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                Date
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  overflowX: "auto",
                  paddingBottom: "4px",
                  scrollbarWidth: "none",
                }}
              >
                {availableDates.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => {
                      setSelectedDate(d.value);
                      setSelectedSlot(null);
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: `1px solid ${selectedDate === d.value ? "var(--bw-accent)" : "var(--bw-border)"}`,
                      background: selectedDate === d.value ? "var(--bw-accent-muted)" : "var(--bw-bg-card)",
                      cursor: "pointer",
                      flexShrink: 0,
                      minWidth: "56px",
                      transition: "all 0.15s",
                      color: "var(--bw-text)",
                    }}
                    data-testid={`booking-date-${d.value}`}
                  >
                    <span style={{ fontSize: "10px", color: "var(--bw-text-muted)" }}>{d.dayName}</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, marginTop: "2px" }}>{d.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div>
                <label
                  style={{ fontSize: "11px", color: "var(--bw-text-muted)", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}
                >
                  Available Times
                </label>
                {loading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "24px" }}>
                    <Loader2 style={{ width: "20px", height: "20px", color: "var(--bw-text-muted)", animation: "spin 1s linear infinite" }} />
                  </div>
                ) : timeSlots.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "var(--bw-text-muted)", textAlign: "center", padding: "24px" }}>
                    No available times for this date. Please try another day.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "6px",
                    }}
                  >
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.start}
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          padding: "8px",
                          borderRadius: "8px",
                          border: `1px solid ${selectedSlot?.start === slot.start ? "var(--bw-accent)" : "var(--bw-border)"}`,
                          background: selectedSlot?.start === slot.start ? "var(--bw-accent-muted)" : "var(--bw-bg-card)",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 500,
                          textAlign: "center",
                          transition: "all 0.15s",
                          color: "var(--bw-text)",
                        }}
                        data-testid={`booking-slot-${slot.display}`}
                      >
                        {slot.display}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Confirmation */}
        {step === "confirm" && (
          <div data-testid="booking-step-confirm">
            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
              Confirm Your Appointment
            </h3>
            <p style={{ fontSize: "12px", color: "var(--bw-text-muted)", marginBottom: "16px" }}>
              Please review your booking details
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "16px",
                borderRadius: "8px",
                background: "var(--bw-bg-card)",
                border: `1px solid var(--bw-border)`,
              }}
            >
              <SummaryRow
                icon={<FileText style={{ width: "14px", height: "14px" }} />}
                label="Service"
                value={selectedType?.name || ""}
              />
              <SummaryRow
                icon={<User style={{ width: "14px", height: "14px" }} />}
                label="Name"
                value={`${firstName} ${lastName}`}
              />
              <SummaryRow
                icon={<Mail style={{ width: "14px", height: "14px" }} />}
                label="Email"
                value={email}
              />
              <SummaryRow
                icon={<Phone style={{ width: "14px", height: "14px" }} />}
                label="Phone"
                value={phone}
              />
              <SummaryRow
                icon={<MapPin style={{ width: "14px", height: "14px" }} />}
                label="Address"
                value={`${street}, ${city}, ${state} ${zip}`}
              />
              <SummaryRow
                icon={<Calendar style={{ width: "14px", height: "14px" }} />}
                label="Date"
                value={selectedDate ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : ""}
              />
              <SummaryRow
                icon={<Clock style={{ width: "14px", height: "14px" }} />}
                label="Time"
                value={selectedSlot?.display || ""}
              />
              {description && (
                <SummaryRow
                  icon={<FileText style={{ width: "14px", height: "14px" }} />}
                  label="Notes"
                  value={description}
                />
              )}
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {step === "success" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px 20px",
              textAlign: "center",
            }}
            data-testid="booking-success"
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: `${theme.colors.success}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <Check style={{ width: "28px", height: "28px", color: theme.colors.success }} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>
              Appointment Confirmed
            </h3>
            <p style={{ fontSize: "13px", color: "var(--bw-text-muted)", maxWidth: "300px" }}>
              You'll receive a confirmation email at <strong>{email}</strong>. We look forward to
              seeing you!
            </p>
          </div>
        )}
      </div>

      {/* ── Footer / Navigation ── */}
      {step !== "success" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            borderTop: `1px solid var(--bw-border)`,
            background: "var(--bw-bg-card)",
          }}
        >
          <button
            onClick={goBack}
            disabled={currentStepIndex === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "8px 14px",
              borderRadius: "8px",
              border: `1px solid var(--bw-border)`,
              background: "transparent",
              color: currentStepIndex === 0 ? "var(--bw-text-muted)" : "var(--bw-text)",
              fontSize: "13px",
              cursor: currentStepIndex === 0 ? "default" : "pointer",
              opacity: currentStepIndex === 0 ? 0.4 : 1,
              fontFamily: "inherit",
            }}
            data-testid="booking-back"
          >
            <ChevronLeft style={{ width: "14px", height: "14px" }} />
            Back
          </button>

          {step === "confirm" ? (
            <button
              onClick={submitBooking}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                background: "var(--bw-accent)",
                color: "var(--bw-text-inverse)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              data-testid="booking-submit"
            >
              {loading ? (
                <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />
              ) : (
                <Check style={{ width: "14px", height: "14px" }} />
              )}
              Confirm Booking
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!canProceed}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                background: canProceed ? "var(--bw-accent)" : "var(--bw-bg-muted)",
                color: canProceed ? "var(--bw-text-inverse)" : "var(--bw-text-muted)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: canProceed ? "pointer" : "default",
                fontFamily: "inherit",
              }}
              data-testid="booking-next"
            >
              Continue
              <ChevronRight style={{ width: "14px", height: "14px" }} />
            </button>
          )}
        </div>
      )}

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .bw-root *::-webkit-scrollbar { display: none; }
        .bw-root * { scrollbar-width: none; }
      `}</style>
    </div>
  );
}

/* ─── Sub-components ───────────────────────────────────────────── */

function InputField({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  testId,
}: {
  icon?: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  testId?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 12px",
        borderRadius: "8px",
        border: `1px solid var(--bw-border)`,
        background: "var(--bw-bg-card)",
      }}
    >
      {icon && (
        <span style={{ color: "var(--bw-text-muted)", display: "flex", flexShrink: 0 }}>
          {icon}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          border: "none",
          background: "transparent",
          color: "var(--bw-text)",
          fontSize: "13px",
          outline: "none",
          fontFamily: "inherit",
          width: "100%",
          minWidth: 0,
        }}
        data-testid={testId}
      />
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
      <span style={{ color: "var(--bw-text-muted)", marginTop: "1px", display: "flex", flexShrink: 0 }}>
        {icon}
      </span>
      <div>
        <div style={{ fontSize: "10px", color: "var(--bw-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </div>
        <div style={{ fontSize: "13px", fontWeight: 500, marginTop: "1px" }}>{value}</div>
      </div>
    </div>
  );
}
