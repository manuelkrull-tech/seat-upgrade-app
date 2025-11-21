import { useState, useEffect } from "react";
import './App.css';
import pictureKoelnHero from "./assets/picture_koeln_hero.jpg";
import pictureDrakeHero from "./assets/picture_drake_hero.jpg";
import pictureEisbaerenHero from "./assets/picture_eisbaeren_hero.jpg";
import pictureBayernHero from "./assets/picture_bayern_hero.jpg";
import pictureAlbaHero from "./assets/picture_alba_hero.jpg";
import pictureRedBullHero from "./assets/picture_redbull_hero.jpg";
import picture_ad_event from "./assets/picture_ad_event.png";
import auctionAd from "./assets/auction_ad.jpg";
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
    dateUtc: "2025-11-21T21:15:00Z",
    demandLevel: "medium",
    isUpgradable: true,
    preview: "true",
  },
  {
    id: "drake-uber",
    name: "Drake – Boy Meets World Tour",
    venue: "Uber Arena Berlin",
    city: "Berlin",
    primaryColor: "#555D61)",
    seatLabel: "Bereich (z. B. 211, 103, Innenraum)",
    type: "concert",
    dateUtc: "2025-11-21T21:15:00Z",
    demandLevel: "high",
    isUpgradable: true,
    preview: "true",
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
    preview: "false",
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
    preview: "true",
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
    demandLevel: "low",
    isUpgradable: true,
    preview: "true",
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
    preview: "true",
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
  backgroundColor: "rgb(255, 255, 255)", // dark greenish-black to match your nav
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
    maxWidth: "100%",
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
    {/* PREMIUM HEADER ONLY ON EVENTS TAB */}
    {activeTab === "events" && (
      <PremiumHeader activeTab={activeTab} currentEvent={currentEvent} />
    )}

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

      {activeTab === "bidding" && (
        <BiddingTab
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
      ? "Echtzeit-Seat-Upgrades & Ticket Auktion"
      : activeTab === "upgrades" && currentEvent
      ? currentEvent.name
      : activeTab === "bidding"
      ? "Gemerkte Upgrades"
      : "Dein Profil & Einstellungen";

  const tabLabel =
    activeTab === "events"
      ? "Events"
      : activeTab === "upgrades"
      ? "Upgrades"
      : activeTab === "bidding"
      ? "Auction"
      : "Account";

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        width: "100%",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        background: "rgba(244, 244, 244, 0.94)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "10px 16px 8px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {/* Top row: brand + current tab */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          {/* Small text logo instead of image */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 0.4,
                color: "#111827",
              }}
            >
              SEATR
            </span>
            <span
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "#9ca3af",
              }}
            >
              beta
            </span>
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 12,
            color: "#6b7280",
            minHeight: 16,
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {subtitle}
        </div>

        {/* Subtle divider */}
        <div
          style={{
            marginTop: 4,
            height: 1,
            width: "100%",
            background:
              "linear-gradient(90deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.18) 50%, rgba(15,23,42,0) 100%)",
            borderRadius: 999,
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
  const [searchResults, setSearchResults] = useState(null);


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
  (ev) =>
    (ev.preview === "true" || ev.preview === "sale") &&
    matchesCategory(ev) &&
    matchesDate(ev)
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
    { id: "football", label: "Fußball" },
    { id: "concert", label: "Konzerte" },
    { id: "hockey", label: "Eishockey" },
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

{/* HERO TOP EVENT */}
{topEvent && (
  <div
    onClick={() => onSelectEvent(topEvent.id)}
    style={{
      marginBottom: 18,
      borderRadius: 16,
      overflow: "hidden",
      position: "relative",
      cursor: "pointer",
      height: 210,

      // full card as image
      backgroundImage: `url(${getEventHeroImage(topEvent)})`,
      backgroundSize: "cover",
      backgroundPosition: "center center",
      backgroundRepeat: "no-repeat",
    }}
  >
    {/* dark gradient overlay for readability */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.8))",
      }}
    />

    {/* content over image */}
    <div
      style={{
        position: "relative",
        zIndex: 1,
        height: "100%",
        padding: 12,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      {/* top row: Top Event + type + live */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11,
        }}
      >
        {/* Top Event chip */}
        <span
          style={{
            padding: "3px 9px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.45)",
            backgroundColor: "rgba(0,0,0,0.45)",
            color: "#f9fafb",
            textTransform: "uppercase",
            letterSpacing: 0.8,
            fontWeight: 600,
          }}
        >
          🔥 Top Event
        </span>

        {/* type + optional live pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {topEvent.isLive && (
            <span
              style={{
                padding: "2px 7px",
                borderRadius: 999,
                backgroundColor: "rgba(22,163,74,0.95)",
                color: "#ecfdf5",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#bbf7d0",
                }}
              />
              Live
            </span>
          )}

          <span
            style={{
              fontSize: 11,
              color: "rgba(249,250,251,0.85)",
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            {topEvent.type === "football"
              ? "Fußball"
              : topEvent.type === "concert"
              ? "Konzert"
              : "Eishockey"}
          </span>
        </div>
      </div>

      {/* bottom text block */}
      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 17,
            marginBottom: 2,
            color: "#ffffff",
            textShadow: "0 6px 18px rgba(0,0,0,0.9)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {topEvent.name}
        </div>

        <div
          style={{
            fontSize: 12,
            color: "rgba(229,231,235,0.9)",
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
            color: "rgba(209,213,219,0.9)",
          }}
        >
          {formatDate(topEvent)}
        </div>

        <div
          style={{
            marginTop: 4,
            fontSize: 10,
            color: "rgba(243,244,246,0.9)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>⬆</span>
          <span>Hohe Nachfrage · Last-Minute</span>
        </div>
      </div>
    </div>
  </div>
)}

<div
  style={{
    height: 1,
    width: "100%",
    margin: "8px 0",
    background:
      "linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,0.25), rgba(0,0,0,0))",
  }}
/>

{/* SECTION HEADER */}
<div
  style={{
    marginBottom: 0,
    paddingTop: 18,
    paddingBottom: 10,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    textAlign: "center",
  }}
>
  <div
    style={{
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 1.2,
      color: "rgba(53, 76, 70, 1.0)",
      marginBottom: 4,
    }}
  >
    EVENTS ENDTECKEN
  </div>
  
  <p
    style={{
      fontSize: 13,
      color: "rgba(53, 76, 70, 1.0)",
      marginTop: 6,
      lineHeight: 1.45,
    }}
  >
    Finde Spiele & Konzerte, gib deine Ticket-ID ein und sichere dir die besten 
    verfügbaren Upgrades – in Echtzeit.
  </p>
</div>

{/* FILTERS */}
<div
  style={{
    marginBottom: 14,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "center",   // ← centers the rows
  }}
>
  {/* Category filter */}
  <div
    style={{
      display: "flex",
      justifyContent: "center", // ← center pills
      width: "100%",
    }}
  >
    <div
      style={{
        display: "flex",
        gap: 6,
        overflowX: "auto",
        paddingBottom: 2,
        justifyContent: "center",
      }}
    >
      {categoryOptions.map((opt) => {
        const isActive = opt.id === categoryFilter;
        return (
          <button
            key={opt.id}
            onClick={() => setCategoryFilter(opt.id)}
            style={{
              padding: "4px 8px",
              borderRadius: 999,
              border: isActive ? "1px solid #000000ff" : "1px solid #444",
              backgroundColor: isActive ? "#ffffff" : "#E0E0DA",
              color: isActive ? "#111" : "#4a4a4aff",
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
  
        {/* SEARCH BAR */}
      <div
        style={{
          width: "100%",
          margin: "0 auto 16px auto",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <input
          type="text"
          placeholder="Suche nach Events..."
          onChange={(e) => {
            const q = e.target.value.toLowerCase();
            // You can adjust this logic or extract to a dedicated state
            const filtered = events.filter((ev) =>
              ev.name.toLowerCase().includes(q)
            );
            // Store it in state (create a state: const [searchResults, setSearchResults] = useState([]))
            setSearchResults(filtered);
          }}
          style={{
            width: "100%",
            padding: "6px 16px",
            borderRadius: 10,
            border: "1px solid #333",
            color: "#000000ff",
            fontSize: 14,
          }}
        />
      </div>
</div>

      {/* MAIN EVENT LIST */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {(searchResults || filteredEvents).map((ev) => {
          const isActive = ev.id === selectedEventId;
          const { weekday, day, month, time } = getDateParts(ev);

          return (
            <button
              key={ev.id}
              onClick={() => onSelectEvent(ev.id)}
              style={{
                padding: 8,
                borderRadius: 10,
                border: `1px solid ${
                  isActive ? ev.primaryColor : "#333"
                }`,
                backgroundColor:"#E0E0DA",
                color: "#111",
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
                    color: "#4a4a4aff",
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
                    color: "#4a4a4aff",
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
                  background: "rgba(0, 0, 0, 0.73",
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
                    color: "#000000ff",
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
                    color: "#525252ff",
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
        <button
          style={{
            width: "50%",
            margin: "20px auto 0",
            padding: "8px 0",
            color: "rgba(53, 76, 70, 1.0)",
            border: "1px solid #333",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
          onClick={() => {
            // your navigation function here
            console.log("Go to: Alle Events Entdecken");
          }}
        >
          Alle Events Entdecken
        </button>
      </div>

      {/* BRAND PARTNER AD – COCA-COLA */}
      <div
        style={{
          marginTop: 32,
          padding: 20,
          borderRadius: 18,
          background:
            "radial-gradient(circle at top left, rgba(148,27,27,0.6), transparent 55%) #080808",
          border: "1px solid rgba(148,27,27,0.6)",
          boxSizing: "border-box",
        }}
      >
        {/* small “presented by” row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 8,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: 1.2,
                color: "rgba(255,255,255,0.45)",
              }}
            >
              Presented by
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#ffffff",
              }}
            >
              Coca-Cola
            </div>
          </div>

          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.6)",
              textAlign: "right",
              maxWidth: 120,
            }}
          >
            Offizieller Erfrischungspartner
          </span>
        </div>

        {/* visual */}
        <div
          style={{
            marginTop: 8,
            marginBottom: 12,
            borderRadius: 14,
            overflow: "hidden",
            position: "relative",
            boxShadow: "0 10px 26px rgba(0,0,0,0.55)", // softer, no visible border
          }}
        >
          <img
            src={picture_ad_event}
            alt="Coca-Cola Arena Experience"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transform: "scale(1.03)",
            }}
          />
          {/* subtle gradient overlay for text readability if needed later */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0.05))",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* copy */}
        <div
          style={{
            fontSize: 13,
            color: "#f5f5f5",
            marginBottom: 4,
            fontWeight: 500,
          }}
        >
          Exklusives Coca-Cola Arena Special
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#d4d4d4",
            lineHeight: 1.4,
            marginBottom: 10,
          }}
        >
          Sichere dir mit jedem erfolgreichen Upgrade{" "}
          <strong>10&nbsp;% Rabatt</strong> auf alle Coca-Cola Produkte
          in deiner Arena – vom ersten Drink bis zur letzten Pause.
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#9e9e9e",
          }}
        >
          Gültig nur an teilnehmenden Standorten. Das Modul kann später für echte
          Partnerkampagnen oder Club-Deals genutzt werden.
        </div>

        {/* CTA – simple, not pill-like */}
        <button
          type="button"
          style={{
            marginTop: 14,
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(248,113,113,0.7)",
            background:
              "linear-gradient(90deg, #b91c1c, #ef4444)",
            fontSize: 13,
            fontWeight: 600,
            color: "#ffffff",
            cursor: "pointer",
            outline: "none",
          }}
        >
          Mehr zu Coca-Cola Vorteilen
        </button>
      </div>

<div
  style={{
    height: 1,
    width: "100%",
    margin: "15px 0",
    background:
      "linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,0.25), rgba(0,0,0,0))",
  }}
/>      

{/* ARENA-BASED UPGRADES — standalone cards */}
<div
  style={{
    marginTop: 28,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  }}
>
  {/* Section title */}
  <div>
    <div
      style={{
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: 1.2,
        color: "rgba(0, 0, 0, 0.5)",
        marginBottom: 4,
        textAlign: "center"
      }}
    >
      Arena Specials
    </div>

    <h3
      style={{
        fontSize: 16,
        fontWeight: 600,
        margin: 0,
        color: "#000000ff",
        textAlign: "center"
      }}
    >
      Kuratierte Erlebnisse
    </h3>

    <p
      style={{
        fontSize: 12,
        color: "rgba(0, 0, 0, 0.55)",
        marginTop: 6,
        marginBottom: 12,
        lineHeight: 1.45,
        textAlign: "center"
      }}
    >
      Exklusive Erlebnisse für besondere Momente vor, während oder nach dem Event.
    </p>
  </div>

  {/* UPGRADE CARDS */}
  {[
    {
      id: "hf",
      code: "EHC-301125",
      headerColor: "#A9C7A6",
      title: "Eisbären – High Five Lane",
      subtitle: "Spielertunnel · UBER Arena",
      price: "ab 15 €",
      statusLabel: "Verfügbar",
      statusBg: "rgba(191,219,254,0.6)",
      statusColor: "#1F2937",
      cta: "Upgrade ansehen",
    },
    {
      id: "drake",
      code: "DRAKE-MG299",
      headerColor: "#606E8C",
      title: "Drake – Meet & Greet",
      subtitle: "Backstage Access · UBER Arena",
      price: "ab 299 €",
      statusLabel: "Premium",
      statusBg: "rgba(244,114,182,0.28)",
      statusColor: "#9D174D",
      cta: "Upgrade ansehen",
    },
    {
      id: "gasag",
      code: "GASAG-EHC25",
      headerColor: "#5D6970",
      title: "GASAG Energy Shot - Pausenspiel",
      subtitle: "On-Ice Experience · UBER Arena",
      price: "Kostenlos",
      statusLabel: "Fans",
      statusBg: "rgba(96,165,250,0.25)",
      statusColor: "#1D4ED8",
      cta: "Anmelden",
    },
  ].map((u) => (
    <div
      key={u.id}
      style={{
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: "#F9FAFB",
        marginLeft: 2,
        marginRight: 2,
        border: `1px solid ${u.headerColor}`,
      }}
    >
      {/* TOP COLORED BAR */}
      <div
        style={{
          backgroundColor: u.headerColor,
          padding: "8px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#F9FAFB",
          fontSize: 11,
          fontWeight: 500,
        }}
      >
        <span>{u.code}</span>
        <span style={{ opacity: 0.9 }}>Arena Upgrade</span>
      </div>

      {/* BODY */}
      <div
        style={{
          padding: "12px 14px 14px",
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* Title + status */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 6,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#111827",
                marginBottom: 2,
              }}
            >
              {u.title}
            </div>

            <div
              style={{
                fontSize: 11,
                color: "#6B7280",
              }}
            >
              {u.subtitle}
            </div>
          </div>

          <span
            style={{
              padding: "3px 10px",
              borderRadius: 999,
              backgroundColor: u.statusBg,
              color: u.statusColor,
              fontSize: 10,
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            {u.statusLabel}
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            borderTop: "1px dashed rgba(156,163,175,0.7)",
            margin: "8px 0 12px",
          }}
        />

        {/* Price + CTA */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#111827",
            }}
          >
            {u.price}
          </div>

          <button
            type="button"
            style={{
              border: "none",
              outline: "none",
              padding: "6px 16px",
              borderRadius: 999,
              backgroundColor: "#020617",
              color: "#F9FAFB",
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {u.cta}
          </button>
        </div>
      </div>
    </div>
  ))}
</div>


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
  buttonStyle, // still passed, but not really used here now
  error,
  isLoading,
  offers,
  checkoutOffer,
  selectedOffer,
  checkoutGuest,
  savedIds,
  onSubmit,           // parent "load offers" handler
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

  // Simple availability + dynamic price demo
  const [availability] = useState({
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
  const hasVerifiedSeat = ticketStatus === "ok" && hasSeatEntered;
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
    if (ticketStatus !== "idle") setTicketStatus("idle");
  }

  // ✅ One big button: verify ticket AND load offers
  function handleVerifyAndLoadOffers() {
    const trimmed = (ticketCode || "").trim();

    if (!trimmed) {
      setTicketStatus("error");
      return;
    }

    setTicketStatus("checking");

    // simulate async ticket check
    setTimeout(() => {
      const normalized = trimmed.toUpperCase();
      const seatInfo = lookupSeatFromTicket(currentEvent.id, normalized);

      if (!seatInfo) {
        setTicketStatus("error");
        return;
      }

      const newBlock = seatInfo.block;
      const newRow = String(seatInfo.row);
      const newSeat = String(seatInfo.seat);

      // ✅ update parent seat state
      setBlock(newBlock);
      setRow(newRow);
      setSeat(newSeat);
      setTicketStatus("ok");

      // ✅ trigger parent onSubmit to actually load offers
      if (typeof onSubmit === "function") {
        // parent expects an event; fake one with preventDefault
        onSubmit(
          { preventDefault: () => {} },
          {
            block: newBlock,
            row: newRow,
            seat: newSeat,
            fromTicket: true,
          }
        );
      }
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

    if (remaining === null || remaining <= 0) return offer.priceEuro;

    let factor = 1;
    if (remaining <= 3) factor = 1.25;
    else if (remaining <= 5) factor = 1.15;
    else if (remaining <= 10) factor = 1.08;

    return Math.round(offer.priceEuro * factor * 100) / 100;
  }

  return (
    <div
      style={{
        width: "100%",
        background: "transparent",
      }}
    >
      {/* FULL-BLEED HERO AT TOP */}
      <div
        style={{
          position: "relative",
          width: "100vw",
          marginLeft: "calc(50% - 50vw)", // edge-to-edge
          height: 260,
          overflow: "hidden",
          backgroundColor: "#000",
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

        {/* gradient so text is readable */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.75))",
            zIndex: 1,
          }}
        />

        {/* text over the image */}
        <div
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 40,
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* TITLE */}
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: 1,
            }}
          >
            {currentEvent.name}
          </div>

          {/* CITY + VENUE */}
          <div
            style={{
              fontSize: 12,
              color: "rgba(249,250,251,0.85)",
            }}
          >
            {currentEvent.city
              ? `${currentEvent.city} · ${currentEvent.venue}`
              : currentEvent.venue}
          </div>

          {/* DATE + TIME */}
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.85)",
              marginTop: 1,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>
              {new Date(currentEvent.dateUtc).toLocaleString("de-DE", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              })}
              {" · "}
              {new Date(currentEvent.dateUtc).toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" Uhr"}
            </span>
          </div>
        </div>
      </div>

      {/* CONTENT BELOW – WHITE SHEET */}
      <div
        style={{
          position: "relative",
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          backgroundColor: "#ffffff",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          marginTop: -30, // overlap hero
          paddingTop: 20,
          paddingBottom: 24,
          boxSizing: "border-box",
          zIndex: 5,
          boxShadow: "0 -4px 16px rgba(0,0,0,0.12)",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto",
            padding: "0 16px",
            boxSizing: "border-box",
          }}
        >
          {/* little handle bar at the top */}
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 999,
              backgroundColor: "rgba(15,23,42,0.12)",
              margin: "0 auto 14px auto",
            }}
          />

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
                backgroundColor: "rgba(15,23,42,0.06)",
                border: "1px solid rgba(15,23,42,0.1)",
                fontSize: 11,
                color: "#374151",
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
                color: "#040404ff",
              }}
            >
              Ticket-ID eingeben
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
              Gib deine Ticket-ID ein und entdecke alle verfügbaren Upgrades.
            </p>

            {/* Ticket-ID field – centered bubble */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <input
                value={ticketCode}
                onChange={(e) => handleChangeTicketCode(e.target.value)}
                placeholder="Ticket-ID / Barcode (Demo)"
                style={{
                  width: "75%",
                  padding: "8px",
                  borderRadius: 12,
                  border: "1px solid #d1d5db",
                  backgroundColor: "#f9fafb",
                  color: "#000000ff",
                  fontSize: 14,
                  textAlign: "center",
                }}
              />
            </div>

            {/* SINGLE BIG BUTTON: Ticket prüfen + Upgrades laden */}
            <button
              type="button"
              onClick={handleVerifyAndLoadOffers}
              style={{
                width: "60%",
                padding: 10,
                borderRadius: 999,
                border: "none",
                background:
                  ticketStatus === "checking" || isLoading
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #111827, #1f2937)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                cursor:
                  ticketStatus === "checking" || isLoading
                    ? "default"
                    : "pointer",
                marginBottom: 6,
              }}
              disabled={
                ticketStatus === "checking" || isLoading || !ticketCode.trim()
              }
            >
              {ticketStatus === "checking"
                ? "Ticket wird geprüft..."
                : isLoading
                ? "Lade Upgrade-Angebote..."
                : "Ticket prüfen & Upgrades anzeigen"}
            </button>

            {/* Status text */}
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>
              {ticketStatus === "idle" && "Ticket wird nur lokal simuliert (Demo)."}
              {ticketStatus === "checking" &&
                "Abgleich mit Ticket-System (Demo)..."}
              {ticketStatus === "ok" && (
                <span style={{ color: "#16a34a" }}>
                  Ticket verifiziert – Angebote geladen.
                </span>
              )}
              {ticketStatus === "error" && (
                <span style={{ color: "#b91c1c" }}>
                  ❌ Ticket ungültig (Demo) – Code prüfen.
                </span>
              )}
            </div>

            {/* Recognized seat after successful verification */}
            {hasVerifiedSeat && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "12px 14px",
                  borderRadius: 12,
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)",
                  fontSize: 10,
                  color: "#111",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    color: "#6b7280",
                    marginBottom: 4,
                    letterSpacing: 0.5,
                  }}
                >
                  Erkannter Sitzplatz
                </div>

                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  Block {block} &nbsp;·&nbsp; Reihe {row} &nbsp;·&nbsp; Sitz{" "}
                  {seat}
                </div>
              </div>
            )}
          </div>

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
                borderRadius: 14,
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                boxShadow: "0 10px 30px rgba(15,23,42,0.09)",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: 6,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                Checkout als Gast
              </h3>
              <p
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginBottom: 12,
                }}
              >
                Bestätige dein Upgrade ohne Konto. In einer echten Version würden deine
                Tickets per E-Mail verschickt.
              </p>

              {/* Seat comparison */}
              <div
                style={{
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                  color: "#374151",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    marginBottom: 4,
                    color: "#6b7280",
                    fontWeight: 600,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  Sitzplatz-Vergleich
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ fontSize: 12 }}>
                    <div style={{ color: "#9ca3af", fontSize: 11 }}>Vorher</div>
                    <div>
                      Block {block}, Reihe {row}, Sitz {seat}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: 16,
                      color: "#9ca3af",
                    }}
                  >
                    ➜
                  </span>

                  <div style={{ fontSize: 12 }}>
                    <div style={{ color: "#9ca3af", fontSize: 11 }}>Upgrade</div>
                    <div style={{ fontWeight: 600, color: "#111827" }}>
                      Block{" "}
                      {checkoutOffer.comparison?.toBlock ||
                        checkoutOffer.targetBlock}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: "#6b7280",
                  }}
                >
                  Höhere Kategorie · bessere Sicht · beliebter Bereich
                </div>
              </div>

              {/* Price breakdown */}
              <div
                style={{
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                  color: "#374151",
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
                    fontSize: 11,
                    color: "#6b7280",
                  }}
                >
                  <span>Servicegebühr (8%)</span>
                  <span>{serviceFee.toFixed(2)} €</span>
                </div>
                <div
                  style={{
                    borderTop: "1px solid #e5e7eb",
                    marginTop: 6,
                    paddingTop: 6,
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 600,
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
                    backgroundColor: "#f9fafb",
                    borderColor: "#e5e7eb",
                    color: "#111827",
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
                    backgroundColor: "#f9fafb",
                    borderColor: "#e5e7eb",
                    color: "#111827",
                  }}
                />

                {/* Payment method (fake) */}
                <div
                  style={{
                    marginBottom: 12,
                    marginTop: 4,
                    padding: 10,
                    borderRadius: 10,
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    fontSize: 13,
                    color: "#374151",
                  }}
                >
                  <div
                    style={{
                      marginBottom: 8,
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
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
                              ? "1px solid #111827"
                              : "1px solid #e5e7eb",
                            backgroundColor: isActive ? "#111827" : "#ffffff",
                            color: isActive ? "#f9fafb" : "#374151",
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
                    backgroundColor: !guestEmail ? "#e5e7eb" : "#16a34a",
                    color: !guestEmail ? "#9ca3af" : "#f9fafb",
                    fontWeight: 600,
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
                    ? `Nur ${remaining} Plätze`
                    : `${remaining} Plätze frei`;

                const availabilityColor =
                  remaining === null
                    ? "#6b7280"
                    : remaining <= 0
                    ? "#b91c1c"
                    : remaining <= 3
                    ? "#b45309"
                    : "#15803d";

                const isSoldOut = remaining !== null && remaining <= 0;

                // small urgency label
                let urgencyLabel = null;

                if (offer.urgence && offer.urgency.text) {
                  urgencyLabel = offer.urgency.text;
                } else if (offer.urgency) {
                  urgencyLabel =
                    offer.urgency.level === "high"
                      ? "Hohe Nachfrage"
                      : offer.urgency.level === "medium"
                      ? "Beliebt"
                      : "Entspannt verfügbar";
                }

                return (
                  <div
                    key={offer.id}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      backgroundColor: "#ffffff",
                      borderRadius: 14,
                      border: "1px solid #e5e7eb",
                      borderLeft: `4px solid ${offer.color}`,
                      padding: 12,
                      marginBottom: 12,
                      opacity: isSoldOut ? 0.55 : 1,
                      boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
                    }}
                  >
                    {/* top row: title + save icon */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
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
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 2,
                          }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#111",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {offer.title}
                          </h3>
                          {urgencyLabel && (
                            <span
                              style={{
                                fontSize: 9,
                                padding: "2px 6px",
                                borderRadius: 999,
                                backgroundColor: "rgba(248, 250, 252, 1)",
                                border: "1px solid rgba(148,163,184,0.6)",
                                color: "#374151",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {urgencyLabel}
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            color: "#4b5563",
                            margin: 0,
                            fontSize: 12,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
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
                          lineHeight: 1,
                        }}
                        aria-label="Merken"
                      >
                        {isSaved ? "⭐" : "☆"}
                      </button>
                    </div>

                    {/* middle row: price + availability */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 8,
                        gap: 8,
                      }}
                    >
                      {/* price pill */}
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "baseline",
                          gap: 6,
                          padding: "4px 10px",
                          borderRadius: 999,
                          backgroundColor: "#0f172a",
                          color: "#f9fafb",
                          fontSize: 12,
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>
                          {dynamicPrice.toFixed(2)} €
                        </span>
                        {priceChanged && (
                          <span
                            style={{
                              fontSize: 10,
                              textDecoration: "line-through",
                              opacity: 0.65,
                            }}
                          >
                            {basePrice.toFixed(2)} €
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 10,
                            opacity: 0.8,
                          }}
                        >
                          / Ticket
                        </span>
                      </div>

                      {/* availability */}
                      {availabilityText && (
                        <span
                          style={{
                            fontSize: 11,
                            color: availabilityColor,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {availabilityText}
                        </span>
                      )}
                    </div>

                    {/* compact seat comparison line */}
                    {offer.comparison && (
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 11,
                          color: "#6b7280",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span style={{ fontSize: 12 }}>⬆️</span>
                        <span>
                          Von Block {offer.comparison.fromBlock} nach{" "}
                          <strong>Block {offer.comparison.toBlock}</strong> – bessere
                          Sicht & Kategorie.
                        </span>
                      </div>
                    )}

                    {/* CTA button */}
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
                        marginTop: 10,
                        padding: "9px 12px",
                        borderRadius: 10,
                        backgroundColor:
                          canCheckoutWithTicket && !isSoldOut
                            ? offer.color
                            : "#e5e7eb",
                        border: "none",
                        color:
                          canCheckoutWithTicket && !isSoldOut
                            ? "#111827"
                            : "#9ca3af",
                        fontWeight: 600,
                        cursor:
                          canCheckoutWithTicket && !isSoldOut
                            ? "pointer"
                            : "not-allowed",
                        width: "100%",
                        fontSize: 13,
                      }}
                    >
                      {ticketStatus !== "ok"
                        ? "Ticket zuerst verifizieren"
                        : isSoldOut
                        ? "Kontingent erschöpft"
                        : "Upgrade auswählen"}
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
                padding: 18,
                borderRadius: 16,
                backgroundColor: "#ecfdf5",
                border: "1px solid #bbf7d0",
                boxShadow: "0 8px 24px rgba(16,185,129,0.12)",
                color: "#064e3b",
              }}
            >
              {/* Header with success icon */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: "#22c55e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 0 4px rgba(34,197,94,0.25)",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 20, color: "#ecfdf5" }}>✓</span>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                  >
                    Upgrade erfolgreich ausgewählt 🎉
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#047857",
                      marginTop: 2,
                    }}
                  >
                    In der echten Version würdest du jetzt eine E-Mail erhalten.
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  fontSize: 13,
                  marginBottom: 10,
                }}
              >
                {/* Event */}
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "#059669",
                      marginBottom: 2,
                    }}
                  >
                    Event
                  </div>
                  <div style={{ fontWeight: 600 }}>{currentEvent.name}</div>
                </div>

                {/* Upgrade */}
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "#059669",
                      marginBottom: 2,
                    }}
                  >
                    Upgrade
                  </div>
                  <div style={{ fontWeight: 600 }}>{selectedOffer.title}</div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#047857",
                      marginTop: 2,
                    }}
                  >
                    {selectedOffer.priceEuro.toFixed(2)} € · pro Ticket
                  </div>
                </div>

                {/* Seat */}
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "#059669",
                      marginBottom: 2,
                    }}
                  >
                    Sitzplatz
                  </div>
                  Block {block}, Reihe {row}, Sitz {seat}
                </div>

                {/* Guest */}
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "#059669",
                      marginBottom: 2,
                    }}
                  >
                    Gast (Demo)
                  </div>
                  {checkoutGuest.name}
                  <div style={{ fontSize: 11, color: "#047857", marginTop: 2 }}>
                    {checkoutGuest.email}
                  </div>
                </div>
              </div>

              {/* Payment line */}
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: "1px solid rgba(16,185,129,0.25)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#065f46",
                }}
              >
                <span>
                  Zahlungsmethode:{" "}
                  {checkoutGuest.paymentMethod === "card"
                    ? "Kreditkarte"
                    : checkoutGuest.paymentMethod === "paypal"
                    ? "PayPal"
                    : "Apple Pay"}
                </span>

                <span>{selectedOffer.priceEuro.toFixed(2)} €</span>
              </div>
            </div>
          )}


          {/* History (compact) */}
          {history.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontSize: 15 }}>Session-Log</h3>
              <ul style={{ color: "#6b7280", paddingLeft: 16, fontSize: 12 }}>
                {history.slice(0, 6).map((item, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>
                    [{item.time}] {item.event} – {item.block}/{item.row}/
                    {item.seat} → {item.offerTitle} (+{item.priceEuro.toFixed(
                      2
                    )} €){" "}
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
      </div>
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

/* ---------- BIDDING TAB ---------- */

function BiddingTab() {
  // 1) Initial auctions (static template)
  const INITIAL_AUCTIONS = [
    {
      id: "auction-koeln-1",
      eventName: "1. FC Köln vs Hertha BSC",
      venue: "RheinEnergieSTADION · Köln",
      block: "S3",
      row: "12",
      seat: "27",
      currentBid: 30,
      minIncrement: 10,
      timeLeft: "23 Min",
      color: "#C8102E",
      tag: "Highlight",
      image: "picture_koeln_hero.jpg",
    },
    {
      id: "auction-drake-1",
      eventName: "Drake – World Tour",
      venue: "UBER Arena · Berlin",
      block: "401",
      row: "5",
      seat: "18",
      currentBid: 40,
      minIncrement: 5,
      timeLeft: "1 Std 12 Min",
      color: "#7c3aed",
      tag: "Last-Minute",
    },
    {
      id: "auction-eisbaeren-1",
      eventName: "Eisbären Berlin vs Adler Mannheim",
      venue: "UBER Arena · Berlin",
      block: "204",
      row: "8",
      seat: "11",
      currentBid: 35,
      minIncrement: 5,
      timeLeft: "Heute · Live",
      color: "#0ea5e9",
      tag: "Penny DEL",
    },
    {
      id: "auction-koeln-2",
      eventName: "1. FC Köln vs Borussia Mönchengladbach",
      venue: "RheinEnergieSTADION · Köln",
      block: "N2",
      row: "18",
      seat: "14",
      currentBid: 72,
      minIncrement: 5,
      timeLeft: "Morgen",
      color: "#C8102E",
    },
    {
      id: "auction-drake-2",
      eventName: "Drake – Zusatzshow",
      venue: "UBER Arena · Berlin",
      block: "305",
      row: "9",
      seat: "32",
      currentBid: 120,
      minIncrement: 10,
      timeLeft: "2 Tage",
      color: "#7c3aed",
    },
    {
      id: "auction-eisbaeren-2",
      eventName: "Eisbären Berlin vs Red Bull München",
      venue: "UBER Arena · Berlin",
      block: "106",
      row: "16",
      seat: "4",
      currentBid: 49,
      minIncrement: 5,
      timeLeft: "Sonntag",
      color: "#0ea5e9",
    },
  ];

  // 2) State: live bids
  const [auctions, setAuctions] = useState(INITIAL_AUCTIONS);

  // 3) State: bid input values per auction (hero + featured)
  const [bidInputs, setBidInputs] = useState({}); // { [auctionId]: "12" }

  if (!auctions || auctions.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          margin: "0 auto",
          padding: "0px 0px 24px",
          boxSizing: "border-box",
        }}
      >
        <h2
          style={{
            margin: "0 0 8px",
            fontSize: 18,
            fontWeight: 600,
            color: "#0f172a",
          }}
        >
          Live auf Tickets bieten
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: "#6b7280",
          }}
        >
          Aktuell sind keine Auktionen live.
        </p>
      </div>
    );
  }

  const hero = auctions[0];
  const featured = auctions.slice(1, 3);
  const others = auctions.slice(3, 8);
  const liveCount = auctions.length; // simple demo: all listed = live

  // helper: place a bid using the entered amount in bidInputs
  function placeCustomBid(auctionId) {
    setAuctions((prev) => {
      const raw = bidInputs[auctionId];
      if (raw == null || raw === "") return prev;

      // allow comma or dot
      const normalized = String(raw).replace(",", ".");
      const amount = parseFloat(normalized);

      if (isNaN(amount) || amount <= 0) {
        return prev;
      }

      return prev.map((a) =>
        a.id === auctionId
          ? { ...a, currentBid: a.currentBid + amount }
          : a
      );
    });

    // clear input after bid
    setBidInputs((prev) => ({
      ...prev,
      [auctionId]: "",
    }));
  }

  // small quick-bid (for the bottom list) still uses minIncrement
  function handleQuickBid(auctionId) {
    setAuctions((prev) =>
      prev.map((a) =>
        a.id === auctionId
          ? { ...a, currentBid: a.currentBid + a.minIncrement }
          : a
      )
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 480,
        margin: "0 auto",
        padding: "0px 0px 24px",
        boxSizing: "border-box",
      }}
    >
{/* HEADER – squared + light trading ticker */}
<div
  style={{
    marginBottom: 18,
    paddingBottom: 10,
    borderBottom: "1px solid #e5e7eb",
  }}
>
  {/* Top: LIVE label */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 6,
    }}
  >
    {/* GREEN LIVE DOT (back again) */}
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, #22c55e 0%, #16a34a 45%, transparent 70%)",
        boxShadow: "0 0 6px rgba(34,197,94,0.6)",
        flexShrink: 0,
      }}
    />

    <span
      style={{
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        color: "#6b7280",
        fontWeight: 600,
      }}
    >
      Ticket-Auktionen · Live
    </span>

    {/* right fade line */}
    <div
      style={{
        flex: 1,
        height: 1,
        background:
          "linear-gradient(to right, rgba(148,163,184,0.5), rgba(148,163,184,0))",
      }}
    />
  </div>

  {/* Title */}
  <h2
    style={{
      margin: 0,
      fontSize: 20,
      fontWeight: 700,
      color: "#111827",
      letterSpacing: -0.2,
      lineHeight: 1.25,
    }}
  >
    Live auf Tickets bieten
  </h2>

  {/* Subtitle */}
  <p
    style={{
      margin: "4px 0 10px",
      fontSize: 12,
      color: "#6b7280",
      maxWidth: 360,
      lineHeight: 1.4,
    }}
  >
    Reale Sitzplätze statt Upgrades – biete gegen andere Fans in Echtzeit.
  </p>

  {/* TICKER — squared, dark-light hybrid, Wall Street style */}
  <div
    style={{
      width: "100%",
      overflow: "hidden",
      backgroundColor: "#f3f4f6",
      border: "1px solid #d1d5db",
      height: 42,
      display: "flex",
      alignItems: "center",
      position: "relative",
    }}
  >
    <div className="recentDealsSquaredTicker">
      {[
        {
          time: "20:14",
          event: "Köln vs Hertha",
          seat: "S3 · 12 · 27",
          price: "89 €",
        },
        {
          time: "20:11",
          event: "Drake World Tour",
          seat: "Floor · 5 · 18",
          price: "145 €",
        },
        {
          time: "20:07",
          event: "Eisbären vs Adler",
          seat: "204 · 8 · 11",
          price: "72 €",
        },
        {
          time: "20:03",
          event: "Köln vs Gladbach",
          seat: "N2 · 18 · 14",
          price: "95 €",
        },
        {
          time: "19:58",
          event: "Drake Zusatzshow",
          seat: "305 · 9 · 32",
          price: "132 €",
        },
      ]
        // duplicate for loop
        .concat([
          {
            time: "20:14",
            event: "Köln vs Hertha",
            seat: "S3 · 12 · 27",
            price: "89 €",
          },
          {
            time: "20:11",
            event: "Drake World Tour",
            seat: "Floor · 5 · 18",
            price: "145 €",
          },
          {
            time: "20:07",
            event: "Eisbären vs Adler",
            seat: "204 · 8 · 11",
            price: "72 €",
          },
          {
            time: "20:03",
            event: "Köln vs Gladbach",
            seat: "N2 · 18 · 14",
            price: "95 €",
          },
          {
            time: "19:58",
            event: "Drake Zusatzshow",
            seat: "305 · 9 · 32",
            price: "132 €",
          },
        ])
        .map((d, idx) => (
          <div
            key={idx}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "0 14px",
              borderRight: "1px solid #d1d5db",
              whiteSpace: "nowrap",
              height: "100%",
            }}
          >
            {/* time */}
            <span
              style={{
                fontSize: 11,
                fontVariantNumeric: "tabular-nums",
                color: "#4b5563",
                minWidth: 40,
              }}
            >
              {d.time}
            </span>

            {/* event */}
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#111827",
                maxWidth: 130,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {d.event}
            </span>

            {/* seat */}
            <span
              style={{
                fontSize: 11,
                color: "#6b7280",
              }}
            >
              {d.seat}
            </span>

            {/* price */}
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              {d.price}
            </span>
          </div>
        ))}
    </div>
  </div>
</div>


      {/* === HERO AUCTION (First) === */}
      <div
        style={{
          marginBottom: 18,
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(15,23,42,0.25)",
          border: "1px solid #e5e7eb",
          backgroundColor: "#000",
        }}
      >
        {/* picture_koeln_hero.jpg as hero */}
        <div
          style={{
            position: "relative",
            height: 200,
            overflow: "hidden",
          }}
        >
          <img
            src={pictureKoelnHero}
            alt={hero.eventName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />

          {/* gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(15,23,42,0.9), rgba(15,23,42,0.2))",
            }}
          />

          {/* hero text */}
          <div
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: 14,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#e5e7eb",
                marginBottom: 2,
              }}
            >
              {hero.venue}
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#f9fafb",
                lineHeight: 1.2,
              }}
            >
              {hero.eventName}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#e5e7eb",
                marginTop: 4,
              }}
            >
              Block {hero.block} · Reihe {hero.row} · Sitz {hero.seat}
            </div>
          </div>

          {/* top-right tag */}
          {hero.tag && (
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                padding: "4px 10px",
                borderRadius: 999,
                backgroundColor: "rgba(15,23,42,0.8)",
                border: "1px solid rgba(148,163,184,0.7)",
                fontSize: 11,
                color: "#e5e7eb",
              }}
            >
              {hero.tag}
            </div>
          )}
        </div>

        {/* hero bottom section */}
        <div
          style={{
            padding: 12,
            backgroundColor: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
              gap: 10,
            }}
          >
            {/* Current bid */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  marginBottom: 2,
                }}
              >
                Aktuelles Gebot
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  {hero.currentBid.toFixed(0)} €
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                  }}
                >
                  + min. 5€
                </span>
              </div>
            </div>

            {/* Time left pill */}
            <div
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                backgroundColor: "#fef9c3",
                border: "1px solid #facc15",
                fontSize: 11,
                color: "#854d0e",
                whiteSpace: "nowrap",
              }}
            >
              ⏱ Endet in {hero.timeLeft}
            </div>
          </div>

          {/* input + button (custom bid) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 4,
            }}
          >
            <input
              type="number"
              min="1"
              value={bidInputs[hero.id] ?? ""}
              onChange={(e) =>
                setBidInputs((prev) => ({
                  ...prev,
                  [hero.id]: e.target.value,
                }))
              }
              placeholder="Eigenes Gebot (€)"
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                backgroundColor: "#f9fafb",
                fontSize: 12,
                color: "#0f172a",
                textAlign: "center",
                outline: "none",
              }}
            />

            <button
              type="button"
              onClick={() => placeCustomBid(hero.id)}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #545554ff, #5d5d5dff)",
                color: "#f9fafb",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "block",
                margin: "0 auto",
              }}
            >
              Jetzt bieten!
            </button>
          </div>
        </div>
      </div>

      {/* === TWO FEATURED BIG BUBBLES === */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 18,
        }}
      >
        {featured.map((a) => (
          <div
            key={a.id}
            style={{
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              backgroundColor: "#ffffff",
              padding: 12,
              boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
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
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#0f172a",
                    marginBottom: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {a.eventName}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                    marginBottom: 4,
                  }}
                >
                  {a.venue}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#4b5563",
                  }}
                >
                  Block {a.block} · Reihe {a.row} · Sitz {a.seat}
                </div>
              </div>

              {a.tag && (
                <span
                  style={{
                    fontSize: 10,
                    padding: "3px 8px",
                    borderRadius: 999,
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    color: "#4b5563",
                    whiteSpace: "nowrap",
                  }}
                >
                  {a.tag}
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 4,
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  {a.currentBid.toFixed(0)} €
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                  }}
                >
                  + min. {a.minIncrement} €
                </span>
              </div>

              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  backgroundColor: "#f3f4f6",
                  fontSize: 11,
                  color: "#4b5563",
                  whiteSpace: "nowrap",
                }}
              >
                ⏱ {a.timeLeft}
              </div>
            </div>

            {/* input + button (custom bid) */}
            <div
              style={{
                marginTop: 4,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <input
                type="number"
                min="1"
                value={bidInputs[a.id] ?? ""}
                onChange={(e) =>
                  setBidInputs((prev) => ({
                    ...prev,
                    [a.id]: e.target.value,
                  }))
                }
                placeholder="Eigenes Gebot (€)"
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 999,
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#f9fafb",
                  fontSize: 12,
                  color: "#0f172a",
                  textAlign: "center",
                  outline: "none",
                }}
              />

              <button
                type="button"
                onClick={() => placeCustomBid(a.id)}
                style={{
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: "none",
                  backgroundColor: "#0f172a",
                  color: "#f9fafb",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Jetzt bieten!
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* TRADE REPUBLIC AD – between featured and list */}
      <div
        style={{
          marginBottom: 18,
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          backgroundColor: "#ffffff",
          boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
        }}
      >
        {/* Image */}
        <div
          style={{
            position: "relative",
            height: 120,
            overflow: "hidden",
            backgroundColor: "#020617",
          }}
        >
          <img
            src={auctionAd}
            alt="Trade Republic Werbung"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />

          {/* small "Werbung" label */}
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              padding: "2px 8px",
              borderRadius: 999,
              backgroundColor: "rgba(15,23,42,0.85)",
              color: "#e5e7eb",
              fontSize: 10,
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            Werbung
          </div>
        </div>

        {/* Text block */}
        <div
          style={{
            padding: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
              gap: 8,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  color: "#6b7280",
                  marginBottom: 2,
                }}
              >
                Trade Republic · Partner
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Abwechslung gesucht zu Tickets?
              </div>
            </div>

            {/* small logo-ish pill */}
            <div
              style={{
                padding: "4px 8px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                backgroundColor: "#f9fafb",
                fontSize: 11,
                color: "#111827",
                whiteSpace: "nowrap",
                fontWeight: 600,
              }}
            >
              TRADE REPUBLIC
            </div>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            Investiere parallel zu deinen Event-Geboten in Aktien, ETFs oder
            Sparpläne – alles in einer App.
          </p>

          <button
            type="button"
            style={{
              marginTop: 10,
              width: "100%",
              padding: 9,
              borderRadius: 10,
              border: "none",
              background:
                "linear-gradient(135deg, #020617, #111827)",
              color: "#f9fafb",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Mehr zu Trade Republic
          </button>
        </div>
      </div>

      {/* === SMALL LIST BELOW (compact auctions) === */}
      {others.length > 0 && (
        <div
          style={{
            marginTop: 4,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#6b7280",
              marginBottom: 6,
            }}
          >
            Weitere Auktionen
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {others.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => handleQuickBid(a.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  padding: 10,
                  cursor: "pointer",
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
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#0f172a",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {a.eventName}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#6b7280",
                    }}
                  >
                    {a.venue}
                  </div>
                </div>

                <div
                  style={{
                    textAlign: "right",
                    fontSize: 11,
                    color: "#4b5563",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    {a.currentBid.toFixed(0)} €
                  </div>
                  <div>{a.timeLeft}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- ACCOUNT TAB ---------- */

function AccountTab() {
  return (
    <div>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>Konto</h2>
      <p style={{ fontSize: 13, color: "#000000ff", marginBottom: 12 }}>
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
    { id: "bidding", label: "Auktion"},
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
          color: "#a9c7a6",
          targetBlock: "INNER CIRCLE",
        });
      } else {
        offers.push({
          id: 11,
          title: "Innenraum-Upgrade",
          description:
            "Vom Sitzplatz in den Innenraum – dichter an der Bühne.",
          priceEuro: 89,
          color: "#a9c7a6",
          targetBlock: "INNENRAUM",
        });
      }

      if (rowStr === "OBER" || trimmed.startsWith("2")) {
        offers.push({
          id: 12,
          title: "Unterrang Frontview",
          description: "Besserer Blickwinkel und geringere Distanz.",
          priceEuro: 49,
          color: "#5D6970",
          targetBlock: "101",
        });
      }

      offers.push({
        id: 13,
        title: "VIP Lounge Paket",
        description:
          "Separater Eingang, Lounge-Zugang, eigene Bar, entspanntes Ankommen.",
        priceEuro: 159,
        color: "#606E8C",
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
        backgroundColor: "#111",
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