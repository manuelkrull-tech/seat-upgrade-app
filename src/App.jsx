import { useState, useEffect } from "react";
import pictureKoelnHero from "./assets/picture_koeln_hero.jpg";
import pictureDrakeHero from "./assets/picture_drake_hero.jpg";
import pictureEisbaerenHero from "./assets/picture_eisbaeren_hero.jpg";
import pictureBayernHero from "./assets/picture_bayern_hero.jpg";
import pictureAlbaHero from "./assets/picture_alba_hero.jpg";
import pictureRedBullHero from "./assets/picture_redbull_hero.jpg";
import pictureReco1 from "./assets/picture_reco_1.jpg";
import pictureReco2 from "./assets/picture_reco_2.jpg";
import AppLogo from "./assets/app_logo.png";

const EVENTS = [
  {
    id: "koeln-hertha",
    name: "1. FC Köln vs Hertha BSC",
    venue: "RheinEnergieSTADION",
    city: "Köln",
    primaryColor: "#C8102E",
    seatLabel: "Block (z. B. S3, N2, O3, W1)",
    type: "football",
    dateUtc: "2025-12-01T18:30:00Z",
    demandLevel: "medium",
    isUpgradable: false,
  },
  {
    id: "drake-uber",
    name: "Drake – Boy Meets World Tour",
    venue: "Uber Arena Berlin",
    city: "Berlin",
    primaryColor: "#8E24AA",
    seatLabel: "Bereich (z. B. 211, 103, Innenraum)",
    type: "concert",
    dateUtc: "2025-11-18T13:55:00Z",
    demandLevel: "high",
    isUpgradable: true,
  },
  {
    id: "eisbaeren-adler",
    name: "Eisbären Berlin vs Adler Mannheim",
    venue: "Uber Arena Berlin",
    city: "Berlin",
    primaryColor: "#1565C0",
    seatLabel: "Sektion (z. B. 106, 204, 119)",
    type: "hockey",
    dateUtc: "2025-12-05T19:30:00Z",
    demandLevel: "medium",
    isUpgradable: false,
  },

  // 🔴 NEW: Bayern vs Dortmund
  {
    id: "bayern-dortmund",
    name: "FC Bayern München vs Borussia Dortmund",
    venue: "Allianz Arena",
    city: "München",
    primaryColor: "#DC052D",
    seatLabel: "Block (z. B. 116, 132, 240)",
    type: "football",
    dateUtc: "2025-12-10T17:30:00Z",
    demandLevel: "high",
    isUpgradable: false,
  },

  // 🟡 NEW: ALBA vs Bonn in Bonn
  {
    id: "alba-bonn",
    name: "Bonner Baskets vs ALBA Berlin",
    venue: "Telekom Dome Bonn",
    city: "Bonn",
    primaryColor: "#FBC02D",
    seatLabel: "Block (z. B. 104, 210)",
    type: "football", // läuft unter „Fußball“-Filter, du kannst später eine Basketball-Kategorie ergänzen
    dateUtc: "2025-12-03T19:00:00Z",
    demandLevel: "medium",
    isUpgradable: false,
  },

  // 🔵 NEW: Red Bull München vs Straubing in SAP Arena
  {
    id: "redbull-straubing",
    name: "Red Bull München vs Straubing",
    venue: "SAP Arena",
    city: "München",
    primaryColor: "#1976D2",
    seatLabel: "Sektion (z. B. 104, 203, 119)",
    type: "hockey",
    dateUtc: "2025-12-08T19:15:00Z",
    demandLevel: "medium",
    isUpgradable: false,
  },
];

function App() {
  const [activeTab, setActiveTab] = useState("events");
  const [selectedEventId, setSelectedEventId] = useState("koeln-hertha");

  const [block, setBlock] = useState("");
  const [row, setRow] = useState("");
  const [seat, setSeat] = useState("");

  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [savedOffers, setSavedOffers] = useState([]);
  const [history, setHistory] = useState([]);

  const [checkoutOffer, setCheckoutOffer] = useState(null);
  const [checkoutGuest, setCheckoutGuest] = useState(null);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentEvent = EVENTS.find((e) => e.id === selectedEventId);
  const themeColor = currentEvent?.primaryColor ?? "#C8102E";

  const pageStyles = {
  minHeight: "100vh",
  width: "100vw",                 // 🔒 exactly viewport width
  backgroundColor: "rgb(15, 23, 22)", // dark greenish-black to match your nav
  color: "white",
  fontFamily:
    "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  paddingBottom: 60,              // space for bottom nav
  overflowX: "hidden",            // 🚫 no sideways scrolling
};                                   

  const mainContainer = {
    width: "100%",
    maxWidth: 420,
    padding: "16px 16px 72px",
    boxSizing: "border-box",
  };

  const inputStyle = {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #333",
    backgroundColor: "#1a1a1a",
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
    boxSizing: "border-box",
  };

  const buttonStyle = {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    backgroundColor: isLoading ? "#555" : themeColor,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    border: "none",
    cursor: isLoading ? "default" : "pointer",
    boxSizing: "border-box",
    opacity: isLoading ? 0.8 : 1,
  };

  function resetSeatState() {
    setBlock("");
    setRow("");
    setSeat("");
    setOffers([]);
    setSelectedOffer(null);
    setCheckoutOffer(null);
    setCheckoutGuest(null);
    setError("");
  }

  function handleSelectEvent(eventId) {
    setSelectedEventId(eventId);
    resetSeatState();
    setActiveTab("upgrades");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSelectedOffer(null);
    setCheckoutOffer(null);
    setOffers([]);
    setIsLoading(true);

    if (!block || !row || !seat) {
      setIsLoading(false);
      setError("Bitte alle Felder ausfüllen.");
      return;
    }

    try {
      let result = [];
      if (currentEvent.id === "koeln-hertha") {
        result = await fetchKoelnOffers({ block, row, seat });
      } else if (currentEvent.id === "drake-uber") {
        result = await fetchDrakeOffers({ block, row, seat });
      } else if (currentEvent.id === "eisbaeren-adler") {
        result = await fetchHockeyOffers({ block, row, seat });
      }

      setOffers(result);
      if (result.length === 0) {
        setError("Keine Upgrades für diesen Sitz gefunden.");
      }
    } catch (err) {
      setError("Es ist ein Fehler beim Laden der Upgrades aufgetreten.");
    } finally {
      setIsLoading(false);
    }
  }

  // Start guest checkout for selected offer
  function handleStartCheckout(offer) {
    setCheckoutOffer(offer);
    setSelectedOffer(null);
    setCheckoutGuest(null);
  }

  // Confirm checkout as guest
  function handleConfirmCheckout(offer, guest) {
    setCheckoutGuest(guest);
    setSelectedOffer(offer);
    setCheckoutOffer(null);

    const entry = {
      time: new Date().toLocaleTimeString(),
      event: currentEvent?.name,
      block,
      row,
      seat,
      offerTitle: offer.title,
      priceEuro: offer.priceEuro,
      guestName: guest.name,
      guestEmail: guest.email,
      guestPaymentMethod: guest.paymentMethod,
    };

    setHistory((prev) => [entry, ...prev]);
  }

  function handleToggleSave(offer) {
    const exists = savedOffers.find((o) => o.id === offer.id);
    if (exists) {
      setSavedOffers(savedOffers.filter((o) => o.id !== offer.id));
    } else {
      setSavedOffers([...savedOffers, offer]);
    }
  }

  const savedIds = new Set(savedOffers.map((o) => o.id));

  return (
    <div style={pageStyles}>
      {/* PREMIUM HEADER */}
      <PremiumHeader activeTab={activeTab} currentEvent={currentEvent} />

      <div style={mainContainer}>
        {/* TAB CONTENT */}
        {activeTab === "events" && (
          <EventsTab
            events={EVENTS}
            selectedEventId={selectedEventId}
            onSelectEvent={handleSelectEvent}
          />
        )}

        {activeTab === "upgrades" && (
          <UpgradesTab
            currentEvent={currentEvent}
            block={block}
            row={row}
            seat={seat}
            setBlock={setBlock}
            setRow={setRow}
            setSeat={setSeat}
            inputStyle={inputStyle}
            buttonStyle={buttonStyle}
            error={error}
            isLoading={isLoading}
            offers={offers}
            checkoutOffer={checkoutOffer}
            selectedOffer={selectedOffer}
            checkoutGuest={checkoutGuest}
            savedIds={savedIds}
            onSubmit={handleSubmit}
            onStartCheckout={handleStartCheckout}
            onConfirmCheckout={handleConfirmCheckout}
            onToggleSave={handleToggleSave}
            history={history}
          />
        )}

        {activeTab === "saved" && (
          <SavedTab
            savedOffers={savedOffers}
            onSelectOffer={(offer) => {
              setActiveTab("upgrades");
              setCheckoutOffer(offer);
              setSelectedOffer(null);
            }}
          />
        )}

        {activeTab === "account" && <AccountTab />}
      </div>

      {/* BOTTOM NAV */}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}

/* ---------- HEADER ---------- */

function PremiumHeader({ activeTab, currentEvent }) {
  const subtitle =
    activeTab === "events"
      ? "Wähle dein Event – Echtzeit-Seat-Upgrades"
      : activeTab === "upgrades" && currentEvent
      ? currentEvent.name
      : activeTab === "saved"
      ? "Gemerkte Upgrades"
      : "Dein Profil & Einstellungen";

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        width: "100%",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        background: "rgba(53, 76, 70, 1.0)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: "100%",
          margin: "0 auto",
          padding: "16px 0 10px",
          textAlign: "center",
        }}
      >
        {/* LOGO + GLOW */}
        <div style={{ position: "relative", display: "inline-block" }}>
          {/* Glow */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 100,
              height: 110,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)",
              filter: "blur(8px)",
            }}
          />

          {/* Logo image */}
          <img
            src={AppLogo}
            alt="SeatUpgrade Logo"
            style={{
              height: 60,
              width: "auto",
              position: "relative",
              zIndex: 2,
              userSelect: "none",
            }}
          />
        </div>

        {/* Slogan */}
        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            color: "#ccc",
            letterSpacing: 0.3,
            textShadow: "0 0 4px rgba(0,0,0,0.4)",
            minHeight: 16,
          }}
        >
          {subtitle}
        </div>

        {/* Divider line */}
        <div
          style={{
            marginTop: 10,
            height: 2,
            width: "65%",
            marginLeft: "auto",
            marginRight: "auto",
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)",
            opacity: 0.5,
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
}

/* ---------- EVENTS TAB ---------- */

function EventsTab({ events, selectedEventId, onSelectEvent }) {
  const [categoryFilter, setCategoryFilter] = useState("all"); // all | football | concert | hockey
  const [dateFilter, setDateFilter] = useState("all"); // all | today | week | month

  const now = new Date();

  function formatDate(ev) {
    if (!ev.dateUtc) return "";
    const d = new Date(ev.dateUtc);
    return d.toLocaleString("de-DE", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getDateParts(ev) {
    if (!ev.dateUtc) return { weekday: "", day: "", month: "", time: "" };
    const d = new Date(ev.dateUtc);

    const weekday = d.toLocaleString("de-DE", { weekday: "short" });
    const day = d.toLocaleString("de-DE", { day: "2-digit" });
    const month = d.toLocaleString("de-DE", { month: "short" });
    const time = d.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return { weekday, day, month, time };
  }

  function isLive(ev) {
    if (!ev.dateUtc) return false;
    const d = new Date(ev.dateUtc);
    const diffMinutes = (d.getTime() - now.getTime()) / 60000;
    // "Live" = from 30 min before start until 90 min after start
    return diffMinutes > -90 && diffMinutes < 30;
  }

  function matchesCategory(ev) {
    if (categoryFilter === "all") return true;
    return ev.type === categoryFilter;
  }

  function matchesDate(ev) {
    if (!ev.dateUtc || dateFilter === "all") return true;
    const d = new Date(ev.dateUtc);

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfTomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    if (dateFilter === "today") {
      return d >= startOfToday && d < startOfTomorrow;
    }

    if (dateFilter === "week") {
      const endOfWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 7
      );
      return d >= startOfToday && d < endOfWeek;
    }

    if (dateFilter === "month") {
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate()
      );
      return d >= startOfToday && d < endOfMonth;
    }

    return true;
  }

  // Enrich events with "live"
  const enrichedEvents = events.map((ev) => ({
    ...ev,
    isLive: isLive(ev),
  }));

  const liveEvents = enrichedEvents.filter((ev) => ev.isLive);

  // Top event
  const topEvent =
    enrichedEvents.find((ev) => ev.isUpgradable === "true") ||
    enrichedEvents.find((ev) => ev.demandLevel === "high") ||
    enrichedEvents[0];

  // Filtered list
  const filteredEvents = enrichedEvents.filter(
    (ev) => matchesCategory(ev) && matchesDate(ev)
  );

  // Coming soon
  const comingSoonEvents = enrichedEvents
    .filter((ev) => {
      if (!ev.dateUtc) return false;
      const d = new Date(ev.dateUtc);
      return d > now && !ev.isLive;
    })
    .sort((a, b) => new Date(a.dateUtc) - new Date(b.dateUtc))
    .slice(0, 4);

  const categoryOptions = [
    { id: "all", label: "Alle" },
    { id: "football", label: "⚽ Fußball" },
    { id: "concert", label: "🎤 Konzerte" },
    { id: "hockey", label: "🏒 Eishockey" },
  ];

  const dateOptions = [
    { id: "all", label: "Alle Daten" },
    { id: "today", label: "Heute" },
    { id: "week", label: "Diese Woche" },
    { id: "month", label: "Dieser Monat" },
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",   // 🔒 never wider than container
        boxSizing: "border-box",
        paddingBottom: 24,
        overflowX: "hidden", // extra safety
      }}
    >
      {/* LIVE NOW PILL */}
      {liveEvents.length > 0 && (
        <div
          style={{
            marginBottom: 12,
            padding: 10,
            borderRadius: 999,
            background:
              "linear-gradient(90deg, rgba(76,175,80,0.3), rgba(0,0,0,0))",
            border: "1px solid rgba(76,175,80,0.6)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            maxWidth: "100%",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#4CAF50",
              boxShadow: "0 0 8px rgba(76,175,80,0.8)",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <strong>Live jetzt:</strong>{" "}
            {liveEvents.map((ev) => ev.name).join(" · ")}
          </span>
        </div>
      )}

      {/* HERO TOP EVENT */}
      {topEvent && (
        <div
          onClick={() => onSelectEvent(topEvent.id)}
          style={{
            marginBottom: 20,
            padding: 14,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${
              topEvent.primaryColor
            }, rgba(0,0,0,0.85))`,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              borderRadius: 12,
              overflow: "hidden",
              height: 180,
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            <img
              src={getEventHeroImage(topEvent)}
              alt={topEvent.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>

          <div>
            <div
              style={{
                fontWeight: "bold",
                fontSize: 16,
                marginBottom: 2,
              }}
            >
              {topEvent.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#f5f5f5",
                marginBottom: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {(topEvent.city || "").trim()
                ? `${topEvent.city} · ${topEvent.venue}`
                : topEvent.venue}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#f5f5f5",
                opacity: 0.9,
              }}
            >
              {formatDate(topEvent)}
            </div>
          </div>

          <div
            style={{
              marginTop: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 10,
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                color: "#f1f8e9",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Hohe Nachfrage · ideale Upgrade-Chancen
            </span>
            <span
              style={{
                padding: "4px 8px",
                borderRadius: 999,
                backgroundColor: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.4)",
                whiteSpace: "nowrap",
              }}
            >
              Jetzt Sitz prüfen
            </span>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div
        style={{
          marginBottom: 14,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* Category filter */}
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 2,
          }}
        >
          {categoryOptions.map((opt) => {
            const isActive = opt.id === categoryFilter;
            return (
              <button
                key={opt.id}
                onClick={() => setCategoryFilter(opt.id)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: isActive ? "1px solid #ffffff" : "1px solid #444",
                  backgroundColor: isActive ? "#ffffff" : "#1a1a1a",
                  color: isActive ? "#111" : "#eee",
                  fontSize: 11,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Date filter */}
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 2,
          }}
        >
          {dateOptions.map((opt) => {
            const isActive = opt.id === dateFilter;
            return (
              <button
                key={opt.id}
                onClick={() => setDateFilter(opt.id)}
                style={{
                  padding: "5px 9px",
                  borderRadius: 999,
                  border: isActive ? "1px solid #90caf9" : "1px solid #333",
                  backgroundColor: isActive ? "#0d47a1" : "#141414",
                  color: isActive ? "#e3f2fd" : "#ddd",
                  fontSize: 11,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TITLE */}
      <h2
        style={{
          fontSize: 18,
          marginBottom: 4,
        }}
      >
        Events entdecken
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "#b3b3b3",
          marginBottom: 10,
        }}
      >
        Wähle Spiel oder Konzert, gib deine Ticket-ID ein und sichere dir das
        beste verfügbare Upgrade.
      </p>

      {/* MAIN EVENT LIST */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {filteredEvents.map((ev) => {
          const isActive = ev.id === selectedEventId;
          const { weekday, day, month, time } = getDateParts(ev);

          return (
            <button
              key={ev.id}
              onClick={() => onSelectEvent(ev.id)}
              style={{
                padding: 10,
                borderRadius: 10,
                border: `1px solid ${
                  isActive ? ev.primaryColor : "#333"
                }`,
                backgroundColor: isActive ? "#1f1f1f" : "#141414",
                color: "white",
                textAlign: "left",
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "stretch",
                gap: 10,
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {/* LEFT: date column */}
              <div
                style={{
                  width: 56,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px 0",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    color: "#bbb",
                    marginBottom: 2,
                  }}
                >
                  {weekday}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    lineHeight: 1,
                  }}
                >
                  {day}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#aaa",
                    marginTop: 2,
                  }}
                >
                  {month}
                </div>
              </div>

              {/* MIDDLE: vertical separator */}
              <div
                style={{
                  width: 1,
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0))",
                  alignSelf: "stretch",
                  opacity: 0.8,
                  flexShrink: 0,
                }}
              />

              {/* RIGHT: event info */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    marginBottom: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ev.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#bbb",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {(ev.city || "").trim()
                    ? `${ev.city} | ${ev.venue}`
                    : ev.venue}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#888",
                    marginTop: 2,
                  }}
                >
                  {time} Uhr
                </div>
              </div>

              {/* BADGE AREA */}
              <div
                style={{
                  marginLeft: 6,
                  alignSelf: "center",
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {!ev.isUpgradable ? (
                  <span
                    style={{
                      padding: "3px 7px",
                      borderRadius: 999,
                      backgroundColor: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      color: "#fff",
                      fontSize: 9,
                      whiteSpace: "nowrap",
                    }}
                  >
                    🕒 Bald verfügbar
                  </span>
                ) : ev.isLive ? (
                  <span
                    style={{
                      padding: "3px 7px",
                      borderRadius: 999,
                      backgroundColor: "#2e7d32",
                      color: "#fff",
                      fontSize: 9,
                      whiteSpace: "nowrap",
                    }}
                  >
                    🟢 Live
                  </span>
                ) : ev.demandLevel === "high" ? (
                  <span
                    style={{
                      padding: "3px 7px",
                      borderRadius: 999,
                      backgroundColor: "#8B1A1A",
                      color: "#fff",
                      fontSize: 9,
                      whiteSpace: "nowrap",
                    }}
                  >
                    🔥 Hohe Nachfrage
                  </span>
                ) : (
                  <span
                    style={{
                      padding: "3px 7px",
                      borderRadius: 999,
                      backgroundColor: "#333",
                      color: "#ccc",
                      fontSize: 9,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Upgrade verfügbar
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* COMING SOON SECTION */}
      {comingSoonEvents.length > 0 && (
        <div
          style={{
            marginTop: 32,
            padding: 14,
            borderRadius: 14,
            backgroundColor: "#101010",
            border: "1px solid #333",
            boxSizing: "border-box",
          }}
        >
          <h3
            style={{
              fontSize: 14,
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>⏳</span>
            <span>Bald verfügbare Events</span>
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {comingSoonEvents.map((ev) => (
              <div
                key={ev.id}
                style={{
                  padding: 8,
                  borderRadius: 10,
                  backgroundColor: "#151515",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {ev.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#aaa",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {(ev.city || "").trim()
                      ? `${ev.city} · ${ev.venue}`
                      : ev.venue}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#ccc",
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {formatDate(ev)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 10,
          borderTop: "1px solid rgba(255,255,255,0.04)",
          fontSize: 11,
          color: "#777",
          textAlign: "center",
        }}
      >
        SeatUpgrade · Demo · Keine echten Ticketkäufe
      </div>
    </div>
  );
}

function getEventHeroImage(ev) {
  if (!ev) return null;

  switch (ev.id) {
    case "koeln-hertha":
      return pictureKoelnHero;
    case "drake-uber":
      return pictureDrakeHero;
    case "eisbaeren-adler":
      return pictureEisbaerenHero;
    case "bayern-dortmund":
      return pictureBayernHero;
    case "alba-bonn":
      return pictureAlbaHero;
    case "redbull-straubing":
      return pictureRedBullHero;


    default:
      // Fallback hero if no specific image exists yet
      return pictureKoelnHero;
  }
}


function UpgradesTab({
  currentEvent,
  block,
  row,
  seat,
  setBlock,
  setRow,
  setSeat,
  inputStyle,
  buttonStyle,
  error,
  isLoading,
  offers,
  checkoutOffer,
  selectedOffer,
  checkoutGuest,
  savedIds,
  onSubmit,
  onStartCheckout,
  onConfirmCheckout,
  onToggleSave,
  history,
}) {
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  const [ticketCode, setTicketCode] = useState("");
  const [ticketStatus, setTicketStatus] = useState("idle"); // "idle" | "checking" | "ok" | "error"

  // Simple availability + dynamic price demo (you can adjust)
  const [availability] = useState({
    // offerId: remaining seats (demo)
    1: 5,
    2: 3,
    3: 10,
    4: 2,
    5: 8,
    6: 12,
    10: 4,
    11: 9,
    12: 6,
    13: 2,
    20: 5,
    21: 3,
    22: 7,
    23: 10,
  });

  if (!currentEvent) {
    return <p style={{ color: "#ccc" }}>Kein Event ausgewählt.</p>;
  }

  const hasSeatEntered = !!(block && row && seat);
  const canCheckoutWithTicket = ticketStatus === "ok" && hasSeatEntered;

  // --- PRICE + FEES FOR CHECKOUT ---

  const serviceFee = checkoutOffer
    ? Math.round(checkoutOffer.priceEuro * 0.08 * 100) / 100
    : 0;
  const totalPrice = checkoutOffer
    ? Math.round((checkoutOffer.priceEuro + serviceFee) * 100) / 100
    : 0;

  // --- HELPERS ---

  function handleChangeTicketCode(value) {
    setTicketCode(value);
    if (ticketStatus !== "idle") {
      setTicketStatus("idle");
    }
  }

  function handleVerifyTicket() {
    const trimmed = (ticketCode || "").trim();

    if (!trimmed) {
      setTicketStatus("error");
      return;
    }

    setTicketStatus("checking");

    setTimeout(() => {
      const normalized = trimmed.toUpperCase();
      const seatInfo = lookupSeatFromTicket(currentEvent.id, normalized);

      if (!seatInfo) {
        setTicketStatus("error");
        return;
      }

      // ✅ Seat comes ONLY from ticket now
      setBlock(seatInfo.block);
      setRow(String(seatInfo.row));
      setSeat(String(seatInfo.seat));

      setTicketStatus("ok");
    }, 700);
  }

  function handleSubmitCheckout(e) {
    e.preventDefault();
    if (!guestEmail || !checkoutOffer) return;

    onConfirmCheckout(checkoutOffer, {
      name: guestName || "Gast",
      email: guestEmail,
      paymentMethod,
    });
  }

  function getDynamicPrice(offer) {
    const remaining =
      availability[String(offer.id)] != null
        ? availability[String(offer.id)]
        : null;

    if (remaining === null || remaining <= 0) {
      return offer.priceEuro;
    }

    let factor = 1;
    if (remaining <= 3) factor = 1.25;
    else if (remaining <= 5) factor = 1.15;
    else if (remaining <= 10) factor = 1.08;

    return Math.round(offer.priceEuro * factor * 100) / 100;
  }

  const hasVerifiedSeat = ticketStatus === "ok" && hasSeatEntered;

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "0 auto",
      }}
    >
      {/* Event hero bubble – same style as Top Event card */}
      {currentEvent && (
        <div
          style={{
            marginBottom: 20,
            padding: 14,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${
              currentEvent.primaryColor || "#444"
            }, rgba(0,0,0,0.9))`,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
          }}
        >
          {/* Hero image */}
          <div
            style={{
              borderRadius: 12,
              overflow: "hidden",
              height: 170,
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            <img
              src={getEventHeroImage(currentEvent)}
              alt={currentEvent.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>

          {/* Text */}
          <div>
            <div
              style={{
                fontWeight: "bold",
                fontSize: 16,
                marginBottom: 2,
              }}
            >
              {currentEvent.name}
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 14 }}>📍</span>
              <span>
                {currentEvent.city
                  ? `${currentEvent.city} · ${currentEvent.venue}`
                  : currentEvent.venue}
              </span>
            </div>

            <div
              style={{
                fontSize: 11,
                color: "#ddd",
                marginTop: 6,
                opacity: 0.9,
              }}
            >
              Demo: Ticket-ID eingeben – wir erkennen deinen Sitzplatz
              automatisch.
            </div>
          </div>
        </div>
      )}

      {/* Ticket / Seat section */}
      <div
        style={{
          textAlign: "center",
          marginTop: 4,
          marginBottom: 10,
        }}
      >
        {/* Small label chip */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 10px",
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            fontSize: 11,
            color: "#ddd",
            marginBottom: 6,
          }}
        >
          <span>🎫</span>
          <span>Ticket-ID prüfen</span>
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: 0.3,
          }}
        >
          Ticket scannen / eingeben
        </h3>

        <p
          style={{
            marginTop: 6,
            marginBottom: 8,
            fontSize: 12,
            color: "#b3b3b3",
            lineHeight: 1.4,
          }}
        >
          Gib deine Ticket-ID oder einen Demo-Code ein, wir lesen Block, Reihe
          und Sitz aus dem System.
        </p>

        {/* Ticket-ID field – centered bubble */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <input
            value={ticketCode}
            onChange={(e) => handleChangeTicketCode(e.target.value)}
            placeholder="Ticket-ID / Barcode (Demo)"
            style={{
              width: "75%",
              padding: "12px",
              borderRadius: 12,
              border: "1px solid #333",
              backgroundColor: "#1a1a1a",
              color: "#fff",
              fontSize: 14,
              textAlign: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            }}
          />
        </div>

        {/* Ticket verify */}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          <button
            type="button"
            onClick={handleVerifyTicket}
            style={{
              flexShrink: 0,
              padding: "8px 12px",
              borderRadius: 999,
              border: "none",
              backgroundColor:
                ticketStatus === "checking" ? "#555" : "#444",
              color: "#fff",
              fontSize: 12,
              cursor:
                ticketStatus === "checking" ? "default" : "pointer",
              fontWeight: "bold",
            }}
          >
            {ticketStatus === "checking"
              ? "Ticket wird geprüft..."
              : "Ticket prüfen (Demo)"}
          </button>

          <div style={{ fontSize: 11, color: "#bbb" }}>
            {ticketStatus === "idle" && "Ticket wird nur lokal simuliert."}
            {ticketStatus === "checking" &&
              "Abgleich mit Ticket-System (Demo)..."}
            {ticketStatus === "ok" && (
              <span style={{ color: "#81C784" }}>
                ✅ Ticket verifiziert (Demo)
              </span>
            )}
            {ticketStatus === "error" && (
              <span style={{ color: "#ef9a9a" }}>
                ❌ Ticket ungültig (Demo) – Code prüfen.
              </span>
            )}
          </div>
        </div>

        {/* Recognized seat after successful verification */}
        {hasVerifiedSeat && (
          <div
            style={{
              marginBottom: 12,
              padding: 10,
              borderRadius: 10,
              backgroundColor: "#111",
              border: "1px solid #333",
              fontSize: 12,
              color: "#ddd",
            }}
          >
            Erkannter Sitzplatz:
            <br />
            <span style={{ fontWeight: "bold" }}>
              Block {block} · Reihe {row} · Sitz {seat}
            </span>
          </div>
        )}
      </div>

      {/* Request offers */}
      <form onSubmit={onSubmit}>
        <button
          type="submit"
          style={buttonStyle}
          disabled={isLoading || ticketStatus !== "ok" || !hasSeatEntered}
        >
          {ticketStatus !== "ok"
            ? "Ticket zuerst verifizieren"
            : isLoading
            ? "Lade Upgrade-Angebote..."
            : "Upgrade-Angebote anzeigen"}
        </button>
      </form>

      {/* Error from offer loading */}
      {error && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 10,
            backgroundColor: "#8B1A1A",
            color: "#ffdddd",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* Map */}
      <div style={{ marginTop: 24 }}>
        {currentEvent.id === "koeln-hertha" && (
          <KoelnStadiumMap currentBlock={block} offers={offers} />
        )}
        {currentEvent.id === "drake-uber" && (
          <ConcertArenaMap currentBlock={block} offers={offers} />
        )}
        {currentEvent.id === "eisbaeren-adler" && (
          <HockeyArenaMap currentBlock={block} offers={offers} />
        )}
      </div>

      {/* Checkout for a selected offer */}
      {checkoutOffer && hasSeatEntered && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            borderRadius: 12,
            backgroundColor: "#151515",
            border: "1px solid #333",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>
            Checkout als Gast
          </h3>
          <p style={{ fontSize: 13, color: "#ccc", marginBottom: 10 }}>
            Bestätige dein Upgrade ohne Konto. Deine Tickets würden in
            einer echten Version per E-Mail verschickt.
          </p>

          {/* Seat comparison */}
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              backgroundColor: "#111",
              border: "1px solid #333",
              fontSize: 13,
              color: "#ccc",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                marginBottom: 6,
                color: "#999",
                fontWeight: "bold",
              }}
            >
              Vorher:
            </div>
            <div>
              Block {block}, Reihe {row}, Sitz {seat}
            </div>

            <div
              style={{
                marginTop: 10,
                marginBottom: 6,
                color: "#999",
                fontWeight: "bold",
              }}
            >
              Nachher (Upgrade):
            </div>
            <div style={{ color: "#fff" }}>
              Block{" "}
              {checkoutOffer.comparison?.toBlock ||
                checkoutOffer.targetBlock}
            </div>
            <div
              style={{ marginTop: 10, fontSize: 12, color: "#bbb" }}
            >
              Höhere Kategorie · bessere Sicht · beliebter Bereich
            </div>
          </div>

          {/* Price breakdown */}
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              backgroundColor: "#101010",
              border: "1px solid #333",
              fontSize: 13,
              color: "#ddd",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span>Upgrade-Preis (dynamisch)</span>
              <span>{checkoutOffer.priceEuro.toFixed(2)} €</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
                fontSize: 12,
                color: "#bbb",
              }}
            >
              <span>Servicegebühr (8%)</span>
              <span>{serviceFee.toFixed(2)} €</span>
            </div>
            <div
              style={{
                borderTop: "1px solid #333",
                marginTop: 6,
                paddingTop: 6,
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
              }}
            >
              <span>Gesamt</span>
              <span>{totalPrice.toFixed(2)} €</span>
            </div>
          </div>

          {/* Guest details */}
          <form onSubmit={handleSubmitCheckout}>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Name (optional)"
              style={{
                ...inputStyle,
                textAlign: "left",
                fontSize: 14,
              }}
            />
            <input
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="E-Mail für Ticketbestätigung"
              style={{
                ...inputStyle,
                textAlign: "left",
                fontSize: 14,
              }}
            />

            {/* Payment method (fake) */}
            <div
              style={{
                marginBottom: 12,
                marginTop: 4,
                padding: 10,
                borderRadius: 10,
                backgroundColor: "#111",
                border: "1px solid #333",
                fontSize: 13,
                color: "#ddd",
              }}
            >
              <div style={{ marginBottom: 8, fontWeight: "bold" }}>
                Zahlungsmethode (Demo)
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "space-between",
                }}
              >
                {[
                  { id: "card", label: "Kreditkarte", emoji: "💳" },
                  { id: "paypal", label: "PayPal", emoji: "🅿️" },
                  { id: "apple", label: "Apple Pay", emoji: "" },
                ].map((m) => {
                  const isActive = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      style={{
                        flex: 1,
                        padding: "6px 4px",
                        borderRadius: 8,
                        border: isActive
                          ? "1px solid #fff"
                          : "1px solid #444",
                        backgroundColor: isActive
                          ? "#2E7D32"
                          : "#1a1a1a",
                        color: "#fff",
                        fontSize: 12,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={!guestEmail}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "none",
                backgroundColor: !guestEmail ? "#444" : "#2E7D32",
                color: "#fff",
                fontWeight: "bold",
                cursor: !guestEmail ? "not-allowed" : "pointer",
                fontSize: 15,
              }}
            >
              Upgrade jetzt bestätigen
            </button>
          </form>
        </div>
      )}

      {/* Offers (only when not in checkout mode) */}
      {!checkoutOffer && offers.length > 0 && (
        <div style={{ marginTop: 24 }}>
          {offers.map((offer) => {
            const isSaved = savedIds.has(offer.id);
            const remaining =
              availability[String(offer.id)] != null
                ? availability[String(offer.id)]
                : null;

            const dynamicPrice = getDynamicPrice(offer);
            const basePrice = offer.priceEuro;
            const priceChanged = dynamicPrice !== basePrice;

            const availabilityText =
              remaining === null
                ? null
                : remaining <= 0
                ? "Ausverkauft (Demo)"
                : remaining <= 3
                ? `Nur noch ${remaining} Plätze verfügbar`
                : `${remaining} Plätze verfügbar`;

            const availabilityColor =
              remaining === null
                ? "#bbb"
                : remaining <= 0
                ? "#ef9a9a"
                : remaining <= 3
                ? "#ffcc80"
                : "#a5d6a7";

            const isSoldOut = remaining !== null && remaining <= 0;

            return (
              <div
                key={offer.id}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  backgroundColor: "#1a1a1a",
                  borderLeft: `6px solid ${offer.color}`,
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 14,
                  opacity: isSoldOut ? 0.6 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <div>
                    <h3 style={{ marginTop: 0, marginBottom: 4 }}>
                      {offer.title}
                    </h3>
                    <p
                      style={{
                        color: "#ccc",
                        marginTop: 0,
                        fontSize: 13,
                      }}
                    >
                      {offer.description}
                    </p>
                  </div>
                  <button
                    onClick={() => onToggleSave(offer)}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: 18,
                    }}
                    aria-label="Merken"
                  >
                    {isSaved ? "⭐" : "☆"}
                  </button>
                </div>

                {/* Dynamic price */}
                <p style={{ fontWeight: "bold", marginTop: 8 }}>
                  Preis (dynamisch): {dynamicPrice.toFixed(2)} €
                </p>
                {priceChanged && (
                  <p
                    style={{
                      marginTop: 2,
                      fontSize: 11,
                      color: "#aaa",
                    }}
                  >
                    Basispreis: {basePrice.toFixed(2)} €
                  </p>
                )}

                {/* Availability line */}
                {availabilityText && (
                  <p
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color: availabilityColor,
                    }}
                  >
                    {availabilityText}
                  </p>
                )}

                {/* Urgency */}
                {offer.urgency && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: "6px 10px",
                      borderRadius: 8,
                      backgroundColor:
                        offer.urgency.level === "high"
                          ? "#8B1A1A"
                          : offer.urgency.level === "medium"
                          ? "#7A4F00"
                          : "#1b3a1b",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: "bold",
                    }}
                  >
                    {offer.urgency.text}
                  </div>
                )}

                {/* Comparison */}
                {offer.comparison && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: 12,
                      borderRadius: 10,
                      backgroundColor: "#111",
                      border: "1px solid #333",
                      fontSize: 13,
                      color: "#ccc",
                    }}
                  >
                    <div
                      style={{
                        marginBottom: 6,
                        color: "#999",
                        fontWeight: "bold",
                      }}
                    >
                      Vorher:
                    </div>
                    <div>
                      Block {offer.comparison.fromBlock}, Reihe{" "}
                      {offer.comparison.fromRow}, Sitz{" "}
                      {offer.comparison.fromSeat}
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        marginBottom: 6,
                        color: "#999",
                        fontWeight: "bold",
                      }}
                    >
                      Nachher (Upgrade):
                    </div>
                    <div style={{ color: "#fff" }}>
                      Block {offer.comparison.toBlock}
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 12,
                        color: "#bbb",
                      }}
                    >
                      Höhere Kategorie · bessere Sicht · beliebter Bereich
                    </div>
                  </div>
                )}

                <button
                  onClick={() =>
                    canCheckoutWithTicket &&
                    !isSoldOut &&
                    onStartCheckout({
                      ...offer,
                      priceEuro: dynamicPrice,
                    })
                  }
                  style={{
                    marginTop: 12,
                    padding: "10px 16px",
                    borderRadius: 8,
                    backgroundColor:
                      canCheckoutWithTicket && !isSoldOut
                        ? offer.color
                        : "#444",
                    border: "none",
                    color: "#111",
                    fontWeight: "bold",
                    cursor:
                      canCheckoutWithTicket && !isSoldOut
                        ? "pointer"
                        : "not-allowed",
                    width: "100%",
                  }}
                >
                  {ticketStatus !== "ok"
                    ? "Ticket zuerst verifizieren"
                    : isSoldOut
                    ? "Kontingent erschöpft"
                    : "Weiter zum Checkout"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation after checkout */}
      {selectedOffer && checkoutGuest && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: "#2E7D32",
            borderRadius: 12,
          }}
        >
          <h3 style={{ marginTop: 0 }}>Upgrade ausgewählt 🎉</h3>
          <p>{currentEvent.name}</p>
          <p>
            Platz: {block}, Reihe {row}, Sitz {seat}
          </p>
          <p>{selectedOffer.title}</p>
          <p>{selectedOffer.priceEuro.toFixed(2)} €</p>
          <p style={{ marginTop: 8, fontSize: 12 }}>
            Bestätigung (Demo) für: {checkoutGuest.name} –{" "}
            {checkoutGuest.email}
          </p>
          <p style={{ marginTop: 4, fontSize: 12 }}>
            Zahlungsmethode (Demo):{" "}
            {checkoutGuest.paymentMethod === "card"
              ? "Kreditkarte"
              : checkoutGuest.paymentMethod === "paypal"
              ? "PayPal"
              : "Apple Pay"}
          </p>
        </div>
      )}

      {/* History (compact) */}
      {history.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: 15 }}>Session-Log</h3>
          <ul style={{ color: "#bbb", paddingLeft: 16, fontSize: 12 }}>
            {history.slice(0, 6).map((item, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                [{item.time}] {item.event} – {item.block}/{item.row}/
                {item.seat} → {item.offerTitle} (+{item.priceEuro.toFixed(2)} €
                ){" "}
                {item.guestName ? `für ${item.guestName}` : ""}{" "}
                {item.guestPaymentMethod
                  ? `· Zahlung: ${
                      item.guestPaymentMethod === "card"
                        ? "Kreditkarte"
                        : item.guestPaymentMethod === "paypal"
                        ? "PayPal"
                        : "Apple Pay"
                    }`
                  : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function lookupSeatFromTicket(eventId, ticketCode) {
  // Demo mapping: in a real app this would call the ticketing system.
  const demoMap = {
    "koeln-hertha": {
      "KOELN-S3-12-27": { block: "S3", row: 12, seat: 27 },
      "KOELN-N2-18-14": { block: "N2", row: 18, seat: 14 },
    },
    "drake-uber": {
      "DRAKE-401-5-18": { block: "401", row: 5, seat: 18 },
      "DRAKE-INNEN-1-99": { block: "INNENRAUM", row: 1, seat: 99 },
    },
    "eisbaeren-adler": {
      "HOCKEY-204-8-11": { block: "204", row: 8, seat: 11 },
      "HOCKEY-106-16-4": { block: "106", row: 16, seat: 4 },
    },
  };

  const byEvent = demoMap[eventId] || {};
  return byEvent[ticketCode] || null;
}

/* ---------- SAVED TAB ---------- */

function SavedTab({ savedOffers, onSelectOffer }) {
  if (savedOffers.length === 0) {
    return (
      <div>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Gemerkte Upgrades</h2>
        <p style={{ fontSize: 13, color: "#bbb" }}>
          Du hast noch keine Upgrades gemerkt. Tippe auf ☆ bei einem Angebot,
          um es hier zu speichern.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>Gemerkte Upgrades</h2>
      <p style={{ fontSize: 13, color: "#bbb", marginBottom: 12 }}>
        Diese Upgrades hast du dir gemerkt. Du kannst sie später auswählen.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {savedOffers.map((offer) => (
          <button
            key={offer.id}
            onClick={() => onSelectOffer(offer)}
            style={{
              textAlign: "left",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #333",
              backgroundColor: "#171717",
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>
              {offer.title}
            </div>
            <div style={{ color: "#ccc", marginBottom: 4 }}>
              {offer.description}
            </div>
            <div style={{ fontWeight: "bold" }}>
              {offer.priceEuro.toFixed(2)} €
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- ACCOUNT TAB ---------- */

function AccountTab() {
  return (
    <div>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>Konto</h2>
      <p style={{ fontSize: 13, color: "#bbb", marginBottom: 12 }}>
        In einer echten Version könntest du hier dein Fanprofil, bevorzugte
        Teams, Zahlungsarten und Benachrichtigungen verwalten.
      </p>
      <div
        style={{
          padding: 14,
          borderRadius: 12,
          backgroundColor: "#151515",
          border: "1px solid #333",
          fontSize: 13,
        }}
      >
        <div style={{ marginBottom: 6 }}>👤 Gast-Fan</div>
        <div style={{ color: "#ccc" }}>
          • Keine Anmeldung erforderlich in dieser Demo.
        </div>
        <div style={{ color: "#ccc" }}>
          • Upgrades werden nur lokal simuliert.
        </div>
      </div>
    </div>
  );
}

/* ---------- BOTTOM NAV ---------- */

function BottomNav({ activeTab, onChange }) {
  const items = [
    { id: "events", label: "Events"},
    { id: "upgrades", label: "Upgrades"},
    { id: "saved", label: "Gemerkt"},
    { id: "account", label: "Konto"},
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 52,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        background: "rgba(53, 76, 70, 1.0)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        justifyContent: "center",
        zIndex: 200,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "stretch",
        }}
      >
        {items.map((item) => {
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                color: isActive ? "#fff" : "#aaa",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                cursor: "pointer",
                padding: 0,
              }}
            >
              <span style={{ fontSize: 17, lineHeight: 1 }}>
                {item.icon}
              </span>
              <span style={{ marginTop: 2 }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ---------- UTILS: URGENCY & OFFERS ---------- */

function getUrgencyLabel() {
  const options = [
    { text: "🔥 Nur 2 Plätze verfügbar", level: "high" },
    { text: "🔥 Nur 3 Plätze verfügbar", level: "high" },
    { text: "⏳ Begrenztes Kontingent", level: "medium" },
    { text: "⭐ Sehr gefragt", level: "medium" },
    { text: "🟢 Gute Verfügbarkeit", level: "low" },
  ];

  const weighted = [
    ...options.filter((o) => o.level === "high"),
    ...options.filter((o) => o.level === "medium"),
    ...options.filter((o) => o.level === "medium"),
    ...options.filter((o) => o.level === "low"),
  ];

  return weighted[Math.floor(Math.random() * weighted.length)];
}

function addUrgencyAndComparison(offers, { block, row, seat }) {
  return offers.map((o) => ({
    ...o,
    urgency: getUrgencyLabel(),
    comparison: {
      fromBlock: block,
      fromRow: row,
      fromSeat: seat,
      toBlock: o.targetBlock,
    },
  }));
}

/* ---------- FAKE APIS ---------- */

function fetchKoelnOffers({ block, row, seat }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const trimmed = (block || "").trim().toUpperCase();
      if (!trimmed) {
        resolve([]);
        return;
      }

      const stand = trimmed[0]; // N / O / S / W
      const rowNumber = parseInt(row, 10);
      const seatNumber = parseInt(seat, 10);

      if (trimmed === "X1") {
        reject(new Error("Fake API error for block X1"));
        return;
      }

      let offers = [];

      if (stand === "S") {
        offers.push({
          id: 1,
          title: "Besserer Platz in der Südkurve",
          description: "Mehr mittig in der Heimkurve mit Top-Atmosphäre.",
          priceEuro: 22,
          color: "#D81B60",
          targetBlock: "S3",
        });
      }

      if (stand === "N") {
        offers.push({
          id: 2,
          title: "Zentrale Nordtribüne",
          description: "Bessere Sicht von hinter dem Tor.",
          priceEuro: 19,
          color: "#E53935",
          targetBlock: "N3",
        });
      }

      if (stand === "O") {
        offers.push({
          id: 3,
          title: "Ost – Mittellinien-Upgrade",
          description: "Premiumsicht wie im TV.",
          priceEuro: 35,
          color: "#43A047",
          targetBlock: "O3",
        });
      }

      if (stand === "W") {
        offers.push({
          id: 4,
          title: "West – Businessnah",
          description: "Nähe Business-Seats mit komfortabler Sicht.",
          priceEuro: 39,
          color: "#FB8C00",
          targetBlock: "W3",
        });
      }

      if (!isNaN(rowNumber) && rowNumber > 15) {
        offers.push({
          id: 5,
          title: "Näher ans Spielfeld",
          description: "Wechsel in eine Reihe näher am Rasen.",
          priceEuro: 18,
          color: "#E53935",
          targetBlock:
            stand === "S"
              ? "S2"
              : stand === "N"
              ? "N2"
              : stand === "O"
              ? "O2"
              : "W2",
        });
      }

      if (offers.length === 0) {
        offers.push({
          id: 6,
          title: "Standard-Upgrade",
          description: "Eine Kategorie höher mit etwas besserer Sicht.",
          priceEuro: 12,
          color: "#9E9E9E",
          targetBlock: "O4",
        });
      }

      const withDynamicText = offers.map((offer) => ({
        ...offer,
        description:
          offer.description +
          (isNaN(seatNumber)
            ? ""
            : ` (Sitz ${seatNumber} – begrenztes Kontingent)`),
      }));

      resolve(addUrgencyAndComparison(withDynamicText, { block, row, seat }));
    }, 700);
  });
}

function fetchDrakeOffers({ block, row, seat }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const trimmed = (block || "").trim().toUpperCase();
      const seatNumber = parseInt(seat, 10);
      const rowStr = (row || "").toUpperCase();

      let offers = [];

      const isFloor = trimmed.includes("INNEN") || trimmed === "FLOOR";

      if (isFloor) {
        offers.push({
          id: 10,
          title: "Front of Stage Upgrade",
          description: "Direkt vor der Bühne – maximale Nähe.",
          priceEuro: 120,
          color: "#AB47BC",
          targetBlock: "INNER CIRCLE",
        });
      } else {
        offers.push({
          id: 11,
          title: "Innenraum-Upgrade",
          description:
            "Vom Sitzplatz in den Innenraum – dichter an der Bühne.",
          priceEuro: 89,
          color: "#8E24AA",
          targetBlock: "INNENRAUM",
        });
      }

      if (rowStr === "OBER" || trimmed.startsWith("2")) {
        offers.push({
          id: 12,
          title: "Unterrang Frontview",
          description: "Besserer Blickwinkel und geringere Distanz.",
          priceEuro: 49,
          color: "#EC407A",
          targetBlock: "101",
        });
      }

      offers.push({
        id: 13,
        title: "VIP Lounge Paket",
        description:
          "Separater Eingang, Lounge-Zugang, eigene Bar, entspanntes Ankommen.",
        priceEuro: 159,
        color: "#FFA726",
        targetBlock: "VIP LOUNGE",
      });

      const withDynamicText = offers.map((offer) => ({
        ...offer,
        description:
          offer.description +
          (isNaN(seatNumber)
            ? ""
            : ` (Sitz ${seatNumber} – limitiertes Kontingent)`),
      }));

      resolve(addUrgencyAndComparison(withDynamicText, { block, row, seat }));
    }, 700);
  });
}

function fetchHockeyOffers({ block, row, seat }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const trimmed = (block || "").trim().toUpperCase();
      const seatNumber = parseInt(seat, 10);
      const rowNumber = parseInt(row, 10);

      let offers = [];

      const isCenter = ["204", "203", "104", "103"].includes(trimmed);
      const isGoalEnd = ["106", "119"].includes(trimmed);

      if (isGoalEnd) {
        offers.push({
          id: 20,
          title: "Angriffsdrittel-Sicht",
          description: "Upgrade in einen Block mit besserer Sicht aufs Tor.",
          priceEuro: 16,
          color: "#42A5F5",
          targetBlock: "104",
        });
      }

      if (!isCenter) {
        offers.push({
          id: 21,
          title: "Zentrum – Blaue Linie",
          description: "Mehr Übersicht über das komplette Eis.",
          priceEuro: 24,
          color: "#1E88E5",
          targetBlock: "204",
        });
      }

      if (!isNaN(rowNumber) && rowNumber > 15) {
        offers.push({
          id: 22,
          title: "Näher ans Eis",
          description:
            "Wechsel in eine der unteren Reihen – näher an Checks & Action.",
          priceEuro: 18,
          color: "#29B6F6",
          targetBlock: trimmed,
        });
      }

      if (offers.length === 0) {
        offers.push({
          id: 23,
          title: "Standard-Hockey-Upgrade",
          description: "Eine Sitzkategorie besser mit klarerer Sicht.",
          priceEuro: 14,
          color: "#90CAF9",
          targetBlock: "203",
        });
      }

      const withDynamicText = offers.map((offer) => ({
        ...offer,
        description:
          offer.description +
          (isNaN(seatNumber)
            ? ""
            : ` (Sitz ${seatNumber} – limitiertes Kontingent)`),
      }));

      resolve(addUrgencyAndComparison(withDynamicText, { block, row, seat }));
    }, 700);
  });
}

/* ---------- MAPS ---------- */

function KoelnStadiumMap({ currentBlock, offers }) {
  const trimmed = (currentBlock || "").trim().toUpperCase();
  const currentId = trimmed;

  const upgradeBlocks = Array.from(
    new Set(
      offers
        .map((o) =>
          o.targetBlock ? o.targetBlock.trim().toUpperCase() : null
        )
        .filter(Boolean)
    )
  );

  function getFill(id) {
    const isCurrent = id === currentId;
    const isUpgrade = upgradeBlocks.includes(id);

    if (isCurrent && isUpgrade) return "#C8102E"; // current + upgrade
    if (isCurrent) return "#C8102E";              // current seat
    if (isUpgrade) return "#FBC02D";              // upgrade target
    return "#222";                                // default
  }

  return (
    <div
      style={{
        backgroundColor: "#151515",
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#ccc",
          marginBottom: 8,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>RheinEnergieSTADION – schematische Ansicht</span>
        <span style={{ fontSize: 11, opacity: 0.8 }}>
          Rot = dein Block · Gelb = Upgrade-Ziel
        </span>
      </div>

      <svg
        viewBox="0 0 260 180"
        style={{ width: "100%", display: "block" }}
      >
        {/* PITCH: 2D rectangle */}
        <rect
          x="60"
          y="40"
          width="140"
          height="80"
          fill="#0f3d1a"
          stroke="#2e7d32"
          strokeWidth="2"
          rx="4"
          ry="4"
        />

        {/* Halfway line (dotted) */}
        <line
          x1="130"
          y1="40"
          x2="130"
          y2="120"
          stroke="#2e7d32"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Center dot */}
        <circle cx="130" cy="80" r="2" fill="#ffffff" />

        {/* Goals on short sides */}
        {/* Left goal */}
        <rect
          x="55"
          y="70"
          width="5"
          height="20"
          fill="#101010"
          stroke="#cccccc"
          strokeWidth="1"
        />
        {/* Right goal */}
        <rect
          x="200"
          y="70"
          width="5"
          height="20"
          fill="#101010"
          stroke="#cccccc"
          strokeWidth="1"
        />

        {/* ============================== */}
        {/* LONG SIDES (TOP/BOTTOM) – 5   */}
        {/* ============================== */}

        {/* Top (above pitch) – N1..N5 */}
        {[
          { id: "N1", type: "rect" },
          { id: "N2", type: "rect" },
          { id: "N3", type: "rectCenter" },
          { id: "N4", type: "rect" },
          { id: "N5", type: "rect" },
        ].map((b, index) => {
          const y = 18; // top row y
          const h = 16;

          // manually chosen x positions to nicely span above the pitch (60–200)
          // center block (N3) is perpendicular rectangle in the middle
          const positions = {
            N1: { x1: 60, x2: 84 },
            N2: { x1: 84, x2: 110 },
            N3: { x1: 110, x2: 150 },
            N4: { x1: 150, x2: 176 },
            N5: { x1: 176, x2: 200 },
          };
          const { x1, x2 } = positions[b.id];
          const midX = (x1 + x2) / 2;

          if (b.type === "rect" || b.type === "rectCenter") {
            return (
              <g key={b.id}>
                <rect
                  x={x1 + 2}
                  y={y}
                  width={x2 - x1 - 4}
                  height={h}
                  fill={getFill(b.id)}
                  stroke="#333"
                  strokeWidth="1"
                  rx="2"
                  ry="2"
                />
                <text
                  x={midX}
                  y={y - 2}
                  fill="#ffffff"
                  fontSize="7"
                  textAnchor="middle"
                >
                  {b.id}
                </text>
              </g>
            );
          }

          // trapezoid left
          if (b.type === "trapLeft") {
            return (
              <g key={b.id}>
                <polygon
                  points={`
                    ${x1},${y}
                    ${x2},${y}
                    ${x2 - 2},${y + h}
                    ${x1 + 6},${y + h}
                  `}
                  fill={getFill(b.id)}
                  stroke="#333"
                  strokeWidth="1"
                />
                <text
                  x={midX}
                  y={y - 2}
                  fill="#ffffff"
                  fontSize="7"
                  textAnchor="middle"
                >
                  {b.id}
                </text>
              </g>
            );
          }

          // trapezoid right
          return (
            <g key={b.id}>
              <polygon
                points={`
                  ${x1 + 2},${y}
                  ${x2},${y}
                  ${x2 - 6},${y + h}
                  ${x1},${y + h}
                `}
                fill={getFill(b.id)}
                stroke="#333"
                strokeWidth="1"
              />
              <text
                x={midX}
                y={y - 2}
                fill="#ffffff"
                fontSize="7"
                textAnchor="middle"
              >
                {b.id}
              </text>
            </g>
          );
        })}

        {/* Bottom (below pitch) – S1..S5 */}
        {[
          { id: "S1", type: "rect" },
          { id: "S2", type: "rect" },
          { id: "S3", type: "rectCenter" },
          { id: "S4", type: "rect" },
          { id: "S5", type: "rect" },
        ].map((b) => {
          const y = 126; // bottom row y
          const h = 16;

          const positions = {
            S1: { x1: 60, x2: 84 },
            S2: { x1: 84, x2: 110 },
            S3: { x1: 110, x2: 150 },
            S4: { x1: 150, x2: 176 },
            S5: { x1: 176, x2: 200 },
          };
          const { x1, x2 } = positions[b.id];
          const midX = (x1 + x2) / 2;

          if (b.type === "rect" || b.type === "rectCenter") {
            return (
              <g key={b.id}>
                <rect
                  x={x1 + 2}
                  y={y}
                  width={x2 - x1 - 4}
                  height={h}
                  fill={getFill(b.id)}
                  stroke="#333"
                  strokeWidth="1"
                  rx="2"
                  ry="2"
                />
                <text
                  x={midX}
                  y={y + h + 10}
                  fill="#ffffff"
                  fontSize="7"
                  textAnchor="middle"
                >
                  {b.id}
                </text>
              </g>
            );
          }

          if (b.type === "trapLeft") {
            return (
              <g key={b.id}>
                <polygon
                  points={`
                    ${x1},${y}
                    ${x2},${y}
                    ${x2 - 2},${y + h}
                    ${x1 + 6},${y + h}
                  `}
                  fill={getFill(b.id)}
                  stroke="#333"
                  strokeWidth="1"
                />
                <text
                  x={midX}
                  y={y + h + 10}
                  fill="#ffffff"
                  fontSize="7"
                  textAnchor="middle"
                >
                  {b.id}
                </text>
              </g>
            );
          }

          return (
            <g key={b.id}>
              <polygon
                points={`
                  ${x1 + 2},${y}
                  ${x2},${y}
                  ${x2 - 6},${y + h}
                  ${x1},${y + h}
                `}
                fill={getFill(b.id)}
                stroke="#333"
                strokeWidth="1"
              />
              <text
                x={midX}
                y={y + h + 10}
                fill="#ffffff"
                fontSize="7"
                textAnchor="middle"
              >
                {b.id}
              </text>
            </g>
          );
        })}

        {/* ===================================== */}
        {/* SHORT SIDES (LEFT/RIGHT) – 4 blocks  */}
        {/* ===================================== */}

        {/* Left side – W1..W4 (all rectangles) */}
        {[
          { id: "W1", index: 0 },
          { id: "W2", index: 1 },
          { id: "W3", index: 2 },
          { id: "W4", index: 3 },
        ].map((b) => {
          const blockHeight = 18;
          const gap = 2;
          const y = 40 + b.index * (blockHeight + gap);
          const x = 26;
          const width = 20;
          const midY = y + blockHeight / 2;

          return (
            <g key={b.id}>
              <rect
                x={x}
                y={y}
                width={width}
                height={blockHeight}
                fill={getFill(b.id)}
                stroke="#333"
                strokeWidth="1"
                rx="2"
                ry="2"
              />
              <text
                x={x - 4}
                y={midY + 2}
                fill="#ffffff"
                fontSize="7"
                textAnchor="end"
              >
                {b.id}
              </text>
            </g>
          );
        })}

        {/* Right side – O1..O4 (all rectangles) */}
        {[
          { id: "O1", index: 0 },
          { id: "O2", index: 1 },
          { id: "O3", index: 2 },
          { id: "O4", index: 3 },
        ].map((b) => {
          const blockHeight = 18;
          const gap = 2;
          const y = 40 + b.index * (blockHeight + gap);
          const x = 214;
          const width = 20;
          const midY = y + blockHeight / 2;

          return (
            <g key={b.id}>
              <rect
                x={x}
                y={y}
                width={width}
                height={blockHeight}
                fill={getFill(b.id)}
                stroke="#333"
                strokeWidth="1"
                rx="2"
                ry="2"
              />
              <text
                x={x + width + 4}
                y={midY + 2}
                fill="#ffffff"
                fontSize="7"
                textAnchor="start"
              >
                {b.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ConcertArenaMap({ currentBlock, offers }) {
  const trimmed = (currentBlock || "").trim().toUpperCase();
  const currentId = trimmed;

  const upgradeTargets = Array.from(
    new Set(
      offers
        .map((o) => o.targetBlock?.toUpperCase())
        .filter(Boolean)
    )
  );

  function getFill(id) {
    const isCurrent =
      currentId === id ||
      (id === "INNENRAUM" && currentId.includes("INNEN")) ||
      (id === "INNER CIRCLE" && currentId.includes("INNER"));
    const isUpgrade = upgradeTargets.includes(id);

    if (isCurrent && isUpgrade) return "#8E24AA"; // both
    if (isCurrent) return "#C8102E";              // selected seat/area
    if (isUpgrade) return "#FBC02D";              // upgrade target
    return "#222";                                // default
  }

  return (
    <div
      style={{
        backgroundColor: "#151515",
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#ccc",
          marginBottom: 8,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Uber Arena – Konzertlayout (Drake)</span>
        <span style={{ fontSize: 11, opacity: 0.8 }}>
        </span>
      </div>

      <svg
        viewBox="0 0 260 180"
        style={{ width: "100%", display: "block" }}
      >
        {/* STANDING AREA (Stehplätze / Innenraum) */}
        <rect
          x="75"
          y="55"
          width="90"
          height="60"
          fill={getFill("INNENRAUM")}
          stroke="#444"
          strokeWidth="1.5"
          rx="12"
          ry="12"
        />
        <text
          x="120"
          y="88"
          fill="#ffffff"
          fontSize="9"
          textAnchor="middle"
        >
          Stehplätze
        </text>

        {/* STAGE on the right */}
        <rect
          x="170"
          y="60"
          width="35"
          height="50"
          fill="#eeeeee"
          stroke="#666666"
          strokeWidth="1"
          rx="3"
          ry="3"
        />
        <text
          x="188"
          y="88"
          fill="#000000"
          fontSize="8"
          textAnchor="middle"
        >
          Stage
        </text>

        {/* ========================== */}
        {/* INNER RING (UNTER-RANG)   */}
        {/* ========================== */}

        {/* Top inner – 101–104 */}
        {[
          { id: "101", x: 85},
          { id: "102", x: 103 },
          { id: "103", x: 121 },
          { id: "104", x: 139 },
        ].map((b) => (
          <g key={b.id}>
            <rect
              x={b.x}
              y={40}
              width={16}
              height={12}
              fill={getFill(b.id)}
              stroke="#444"
              strokeWidth="1"
              rx="3"
              ry="3"
            />
            <text
              x={b.x + 8}
              y={38}
              fill="#ffffff"
              fontSize="7"
              textAnchor="middle"
            >
              {b.id}
            </text>
          </g>
        ))}

        {/* Bottom inner – 203–209 (simple row) */}
        {[
          { id: "205", x: 85 },
          { id: "206", x: 103 },
          { id: "207", x: 121 },
          { id: "208", x: 139 },
        ].map((b) => (
          <g key={b.id}>
            <rect
              x={b.x}
              y={118}
              width={16}
              height={12}
              fill={getFill(b.id)}
              stroke="#444"
              strokeWidth="1"
              rx="3"
              ry="3"
            />
            <text
              x={b.x + 8}
              y={137}
              fill="#ffffff"
              fontSize="7"
              textAnchor="middle"
            >
              {b.id}
            </text>
          </g>
        ))}

        {/* Left inner – 201, 202 */}
        {[
          { id: "A", y: 60 },
          { id: "B", y: 86 },
        ].map((b) => (
          <g key={b.id}>
            <rect
              x={58}
              y={b.y}
              width={14}
              height={24}
              fill={getFill(b.id)}
              stroke="#444"
              strokeWidth="1"
              rx="3"
              ry="3"
            />
            <text
              x={68}
              y={b.y + 15}
              fill="#ffffff"
              fontSize="7"
              textAnchor="end"
            >
              {b.id}
            </text>
          </g>
        ))}

        {/* Right inner corners – 215, 216 */}
        {[
          { id: "C", y: 40 },
          { id: "D", y: 118 },
        ].map((b) => (
          <g key={b.id}>
            <rect
              x={170}
              y={b.y}
              width={16}
              height={14}
              fill={getFill(b.id)}
              stroke="#444"
              strokeWidth="1"
              rx="3"
              ry="3"
            />
            <text
              x={178}
              y={b.y + 9}
              fill="#ffffff"
              fontSize="7"
              textAnchor="middle"
            >
              {b.id}
            </text>
          </g>
        ))}

        {/* ========================== */}
        {/* OUTER RING (OBER-RANG)    */}
        {/* ========================== */}

        {/* Top outer – 401–406 */}
        {[
          { id: "406", x: 65 },
          { id: "405", x: 85 },
          { id: "404", x: 105 },
          { id: "403", x: 125 },
          { id: "402", x: 145 },
          { id: "401", x: 165 },
        ].map((b) => (
          <g key={b.id}>
            <rect
              x={b.x}
              y={20}
              width={16}
              height={10}
              fill={getFill(b.id)}
              stroke="#333"
              strokeWidth="1"
              rx="2"
              ry="2"
            />
            <text
              x={b.x + 8}
              y={18}
              fill="#ffffff"
              fontSize="6"
              textAnchor="middle"
            >
              {b.id}
            </text>
          </g>
        ))}

        {/* Left outer curve – 407–415 */}
        {[
          { id: "407", y: 35 },
          { id: "408", y: 50 },
          { id: "409", y: 65 },
          { id: "410", y: 80 },
          { id: "411", y: 95 },
          { id: "412", y: 110 },
          { id: "413", y: 125 },
        ].map((b) => (
          <g key={b.id}>
            <rect
              x={36}
              y={b.y}
              width={14}
              height={10}
              fill={getFill(b.id)}
              stroke="#333"
              strokeWidth="1"
              rx="2"
              ry="2"
            />
            <text
              x={32}
              y={b.y + 8}
              fill="#ffffff"
              fontSize="6"
              textAnchor="end"
            >
              {b.id}
            </text>
          </g>
        ))}

        {/* Bottom outer blocks – 416–421 */}
        {[
          { id: "416", x: 65 },
          { id: "417", x: 85 },
          { id: "418", x: 105 },
          { id: "419", x: 125 },
          { id: "420", x: 145 },
          { id: "421", x: 165 },
        ].map((b) => (
          <g key={b.id}>
            <rect
              x={b.x}
              y={140}
              width={16}
              height={10}
              fill={getFill(b.id)}
              stroke="#333"
              strokeWidth="1"
              rx="2"
              ry="2"
            />
            <text
              x={b.x + 8}
              y={157}
              fill="#ffffff"
              fontSize="6"
              textAnchor="middle"
            >
              {b.id}
            </text>
          </g>
        ))}

        {/* Right outer curve – 210–214 (simplified) */}
        {[
          { id: "301", y: 118 },
          { id: "302", y: 100 },
          { id: "303", y: 82 },
          { id: "304", y: 64 },
          { id: "305", y: 46 },
        ].map((b) => (
          <g key={b.id}>
            <rect
              x={214}
              y={b.y}
              width={14}
              height={10}
              fill={getFill(b.id)}
              stroke="#333"
              strokeWidth="1"
              rx="2"
              ry="2"
            />
            <text
              x={231}
              y={b.y + 7}
              fill="#ffffff"
              fontSize="6"
              textAnchor="start"
            >
              {b.id}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function HockeyArenaMap({ currentBlock, offers }) {
  const trimmed = (currentBlock || "").trim().toUpperCase();
  const currentId = trimmed;
  const upgradeTargets = Array.from(
    new Set(
      offers
        .map((o) => o.targetBlock?.toUpperCase())
        .filter(Boolean)
    )
  );

  function getFill(id) {
    const isCurrent = currentId === id;
    const isUpgrade = upgradeTargets.includes(id);

    if (isCurrent && isUpgrade) return "#1565C0"; // both
    if (isCurrent) return "#1565C0";              // selected
    if (isUpgrade) return "#FBC02D";              // target
    return "#222";                                // default
  }

  return (
    <div
      style={{
        backgroundColor: "#151515",
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#ccc",
          marginBottom: 8,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Uber Arena – Eishockey Layout (2 Ebenen)</span>
        <span style={{ fontSize: 11, opacity: 0.8 }}>
          100/103 = Unterrang · 201/203 = Oberrang
        </span>
      </div>

      <svg
        viewBox="0 0 260 180"
        style={{ width: "100%", display: "block" }}
      >
        {/* ICE RINK: rounded rectangle */}
        <rect
          x="70"
          y="45"
          width="120"
          height="70"
          rx="25"
          ry="25"
          fill="#e0f2ff"
          stroke="#90caf9"
          strokeWidth="2"
        />

        {/* Center line */}
        <line
          x1="130"
          y1="45"
          x2="130"
          y2="115"
          stroke="#f44336"
          strokeWidth="1"
        />

        {/* Blue lines */}
        <line
          x1="95"
          y1="45"
          x2="95"
          y2="115"
          stroke="#1e88e5"
          strokeWidth="1"
        />
        <line
          x1="165"
          y1="45"
          x2="165"
          y2="115"
          stroke="#1e88e5"
          strokeWidth="1"
        />

        {/* Center faceoff circle */}
        <circle
          cx="130"
          cy="80"
          r="10"
          fill="none"
          stroke="#1e88e5"
          strokeWidth="1"
        />
        <circle cx="130" cy="80" r="2" fill="#1e88e5" />

        {/* ============================== */}
        {/* INNER RING – UNTER-RANG       */}
        {/* 100 & 101 evenly around ice   */}
        {/* ============================== */}

        {/* Top inner block – 100 */}
        <g>
          <rect
            x="80"
            y="30"
            width="100"
            height="10"
            fill={getFill("100")}
            stroke="#333"
            strokeWidth="1"
            rx="2"
            ry="2"
          />
          <text
            x="130"
            y="38"
            fill="#ffffff"
            fontSize="7"
            textAnchor="middle"
          >
            100
          </text>
        </g>

        {/* Bottom inner block – 103 */}
        <g>
          <rect
            x="80"
            y="120"
            width="100"
            height="10"
            fill={getFill("103")}
            stroke="#333"
            strokeWidth="1"
            rx="2"
            ry="2"
          />
          <text
            x="130"
            y="127.5"
            fill="#ffffff"
            fontSize="7"
            textAnchor="middle"
          >
            103
          </text>
        </g>

        {/* Left inner block – A1 */}
        <g>
          <rect
            x="50"
            y="50"
            width="12"
            height="60"
            fill={getFill("A1")}
            stroke="#333"
            strokeWidth="1"
            rx="2"
            ry="2"
          />
          <text
            x="61"
            y="82"
            fill="#ffffff"
            fontSize="7"
            textAnchor="end"
          >
            A1
          </text>
        </g>

        {/* Right inner block – B1 */}
        <g>
          <rect
            x="198"
            y="50"
            width="12"
            height="60"
            fill={getFill("B1")}
            stroke="#333"
            strokeWidth="1"
            rx="2"
            ry="2"
          />
          <text
            x="199"
            y="82"
            fill="#ffffff"
            fontSize="7"
            textAnchor="start"
          >
            B1
          </text>
        </g>

        {/* ============================== */}
        {/* OUTER RING – OBER-RANG        */}
        {/* 201 & 202 = second level      */}
        {/* ============================== */}

        {/* Top outer block – 201 */}
        <g>
          <rect
            x="70"
            y="8"
            width="120"
            height="20"
            fill={getFill("201")}
            stroke="#444"
            strokeWidth="1"
            rx="2"
            ry="2"
          />
          <text
            x="130"
            y="21"
            fill="#ffffff"
            fontSize="8"
            textAnchor="middle"
          >
            201
          </text>
        </g>

        {/* Bottom outer block – 203 */}
        <g>
          <rect
            x="70"
            y="132"
            width="120"
            height="20"
            fill={getFill("203")}
            stroke="#444"
            strokeWidth="1"
            rx="2"
            ry="2"
          />
          <text
            x="130"
            y="145"
            fill="#ffffff"
            fontSize="8"
            textAnchor="middle"
          >
            203
          </text>
        </g>

        {/* Left outer block – A2 */}
        <g>
          <rect
            x="28"
            y="45"
            width="20"
            height="70"
            fill={getFill("A2")}
            stroke="#444"
            strokeWidth="1"
            rx="2"
            ry="2"
          />
          <text
            x="45"
            y="82"
            fill="#ffffff"
            fontSize="8"
            textAnchor="end"
          >
            A2
          </text>
        </g>

        {/* Right outer block – B2 */}
        <g>
          <rect
            x="212"
            y="45"
            width="20"
            height="70"
            fill={getFill("B2")}
            stroke="#444"
            strokeWidth="1"
            rx="2"
            ry="2"
          />
          <text
            x="217"
            y="82"
            fill="#ffffff"
            fontSize="8"
            textAnchor="start"
          >
            B2
          </text>
        </g>
      </svg>
    </div>
  );
}

export default App;