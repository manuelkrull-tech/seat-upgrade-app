import { useState } from "react";

const EVENTS = [
  {
    id: "koeln-hertha",
    name: "1. FC Köln vs Hertha BSC",
    venue: "RheinEnergieSTADION",
    primaryColor: "#C8102E",
    seatLabel: "Block (z. B. S3, N2, O3, W1)",
  },
  {
    id: "drake-uber",
    name: "Drake – World Tour",
    venue: "Uber Arena Berlin",
    primaryColor: "#8E24AA",
    seatLabel: "Bereich (z. B. 211, 103, Innenraum)",
  },
  {
    id: "eisbaeren-adler",
    name: "Eisbären Berlin vs Adler Mannheim",
    venue: "Uber Arena Berlin",
    primaryColor: "#1565C0",
    seatLabel: "Sektion (z. B. 106, 204, 119)",
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
    backgroundColor: "#0b0b0b",
    color: "white",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: 60, // space for bottom nav
  };

  const mainContainer = {
    width: "100%",
    maxWidth: 480,
    padding: 16,
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
      ? "Wähle dein Event, wir kümmern uns um den Rest"
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
        background: "rgba(15, 15, 15, 0.85)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "14px 16px 10px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            margin: "0 auto 6px",
            background: "linear-gradient(135deg, #fff, #888)",
            transform: "rotate(45deg)",
            borderRadius: 3,
            opacity: 0.85,
          }}
        />

        <div
          style={{
            fontWeight: "700",
            fontSize: 19,
            letterSpacing: 0.5,
          }}
        >
          SeatUpgrade
        </div>

        <div
          style={{
            fontSize: 12,
            color: "#bbb",
            marginTop: 4,
            minHeight: 16,
          }}
        >
          {subtitle}
        </div>

        <div
          style={{
            marginTop: 8,
            height: 2,
            width: "60%",
            marginLeft: "auto",
            marginRight: "auto",
            background: `linear-gradient(90deg,
              rgba(255,255,255,0) 0%,
              rgba(255,255,255,0.25) 50%,
              rgba(255,255,255,0) 100%
            )`,
            borderRadius: 2,
            opacity: 0.6,
          }}
        />
      </div>
    </div>
  );
}

/* ---------- EVENTS TAB ---------- */

function EventsTab({ events, selectedEventId, onSelectEvent }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>Event auswählen</h2>
      <p
        style={{
          fontSize: 13,
          color: "#b3b3b3",
          marginBottom: 12,
        }}
      >
        Wähle dein Spiel oder Konzert, gib deinen Sitzplatz ein und prüfe
        mögliche Upgrades in Echtzeit.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {events.map((ev) => {
          const isActive = ev.id === selectedEventId;
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
              }}
            >
              <div style={{ fontWeight: "bold" }}>{ev.name}</div>
              <div style={{ fontSize: 12, color: "#bbb" }}>{ev.venue}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- UPGRADES TAB + GUEST CHECKOUT ---------- */

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
  const [paymentMethod, setPaymentMethod] = useState("card"); // "card" | "paypal" | "apple"

  if (!currentEvent) {
    return <p style={{ color: "#ccc" }}>Kein Event ausgewählt.</p>;
  }

  const hasSeatEntered = block && row && seat;

  // Compute price breakdown for checkout
  const serviceFee = checkoutOffer
    ? Math.round(checkoutOffer.priceEuro * 0.08 * 100) / 100
    : 0;
  const totalPrice = checkoutOffer
    ? Math.round((checkoutOffer.priceEuro + serviceFee) * 100) / 100
    : 0;

  function handleSubmitCheckout(e) {
    e.preventDefault();
    if (!guestEmail) {
      return;
    }
    onConfirmCheckout(checkoutOffer, {
      name: guestName || "Gast",
      email: guestEmail,
      paymentMethod,
    });
  }

  return (
    <div>
      {/* Event info */}
      <div
        style={{
          padding: 12,
          marginBottom: 16,
          borderRadius: 12,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          border: "1px solid rgba(255,255,255,0.08)",
          fontSize: 13,
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: 4 }}>
          {currentEvent.name}
        </div>
        <div style={{ color: "#ccc" }}>{currentEvent.venue}</div>
        <div style={{ marginTop: 6, color: "#aaa", fontSize: 12 }}>
          Demo: Sitzplatz eingeben, mögliche Upgrades werden simuliert.
        </div>
      </div>

      {/* Seat input */}
      <h3 style={{ textAlign: "center", marginTop: 0 }}>Sitzplatz eingeben</h3>
      <p
        style={{
          textAlign: "center",
          color: "#b3b3b3",
          fontSize: 13,
          marginBottom: 16,
        }}
      >
        {currentEvent.id === "koeln-hertha" &&
          "Nutze z. B. S3, N2, O3 oder W1 als Block-Bezeichnung."}
        {currentEvent.id === "drake-uber" &&
          "Nutze typische Arena-Blöcke (z. B. 211, 103) oder 'Innenraum'."}
        {currentEvent.id === "eisbaeren-adler" &&
          "Nutze z. B. 106, 119, 204 als Sektion im Hockey-Setup."}
      </p>

      <form onSubmit={onSubmit}>
        <input
          value={block}
          onChange={(e) => setBlock(e.target.value)}
          placeholder={currentEvent.seatLabel}
          style={inputStyle}
        />
        <input
          value={row}
          onChange={(e) => setRow(e.target.value)}
          placeholder="Reihe (z. B. 12)"
          style={inputStyle}
        />
        <input
          value={seat}
          onChange={(e) => setSeat(e.target.value)}
          placeholder="Sitz (z. B. 27)"
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle} disabled={isLoading}>
          {isLoading ? "Lade Upgrade-Angebote..." : "Upgrade-Angebote anzeigen"}
        </button>
      </form>

      {/* Error */}
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

      {/* If checkoutOffer exists -> show guest checkout page */}
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
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Checkout als Gast</h3>
          <p style={{ fontSize: 13, color: "#ccc", marginBottom: 10 }}>
            Bestätige dein Upgrade ohne Konto. Deine Tickets würden in einer
            echten Version per E-Mail verschickt.
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
              {checkoutOffer.comparison?.toBlock || checkoutOffer.targetBlock}
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
              <span>Upgrade-Preis</span>
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
                        backgroundColor: isActive ? "#2E7D32" : "#1a1a1a",
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

                <p style={{ fontWeight: "bold", marginTop: 8 }}>
                  Preis: {offer.priceEuro.toFixed(2)} €
                </p>

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
                  onClick={() => hasSeatEntered && onStartCheckout(offer)}
                  style={{
                    marginTop: 12,
                    padding: "10px 16px",
                    borderRadius: 8,
                    backgroundColor: hasSeatEntered ? offer.color : "#444",
                    border: "none",
                    color: "#111",
                    fontWeight: "bold",
                    cursor: hasSeatEntered ? "pointer" : "not-allowed",
                    width: "100%",
                  }}
                >
                  {hasSeatEntered
                    ? "Weiter zum Checkout"
                    : "Zuerst Sitzplatz eingeben"}
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
    { id: "events", label: "Events", icon: "🏟️" },
    { id: "upgrades", label: "Upgrades", icon: "⬆️" },
    { id: "saved", label: "Gemerkt", icon: "⭐" },
    { id: "account", label: "Konto", icon: "👤" },
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
        background: "rgba(5, 5, 5, 0.95)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        justifyContent: "center",
        zIndex: 200,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
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
                fontSize: 10,
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

    if (isCurrent && isUpgrade) return "#C8102E";
    if (isCurrent) return "#C8102E";
    if (isUpgrade) return "#FBC02D";
    return "#222";
  }

  const blocks = [
    "N1",
    "N2",
    "N3",
    "N4",
    "S1",
    "S2",
    "S3",
    "S4",
    "O1",
    "O2",
    "O3",
    "O4",
    "W1",
    "W2",
    "W3",
    "W4",
  ];

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

      <svg viewBox="0 0 240 160" style={{ width: "100%", display: "block" }}>
        <path
          d="M 40 40 Q 120 10 200 40 L 215 120 Q 120 155 25 120 Z"
          fill="#101010"
          stroke="#444"
          strokeWidth="2"
        />

        <polygon
          points="85,55 175,55 195,115 65,115"
          fill="#0f3d1a"
          stroke="#2e7d32"
          strokeWidth="1.5"
        />

        <line
          x1="130"
          y1="55"
          x2="130"
          y2="115"
          stroke="#2e7d32"
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* Top blocks */}
        {blocks.slice(0, 4).map((id, idx) => {
          const xStart = 80 + idx * 20;
          const xEnd = xStart + 18;
          const yOuter = 40;
          const yInner = 55;
          return (
            <g key={id}>
              <polygon
                points={`${xStart},${yOuter} ${xEnd},${yOuter} ${
                  xEnd + 3
                },${yInner} ${xStart - 3},${yInner}`}
                fill={getFill(id)}
                stroke="#333"
                strokeWidth="1"
              />
              <text
                x={(xStart + xEnd) / 2}
                y={yOuter - 2}
                fill="#fff"
                fontSize="7"
                textAnchor="middle"
              >
                {id}
              </text>
            </g>
          );
        })}

        {/* Bottom blocks */}
        {blocks.slice(4, 8).map((id, idx) => {
          const xStart = 80 + idx * 20;
          const xEnd = xStart + 18;
          const yOuter = 125;
          const yInner = 115;
          return (
            <g key={id}>
              <polygon
                points={`${xStart - 3},${yInner} ${xEnd + 3},${yInner} ${xEnd},${yOuter} ${xStart},${yOuter}`}
                fill={getFill(id)}
                stroke="#333"
                strokeWidth="1"
              />
              <text
                x={(xStart + xEnd) / 2}
                y={yOuter + 9}
                fill="#fff"
                fontSize="7"
                textAnchor="middle"
              >
                {id}
              </text>
            </g>
          );
        })}

        {/* Right blocks */}
        {blocks.slice(8, 12).map((id, idx) => {
          const yStart = 60 + idx * 12;
          const yEnd = yStart + 10;
          const xOuter = 200;
          const xInner = 185;
          return (
            <g key={id}>
              <polygon
                points={`${xInner},${yStart - 2} ${xOuter},${yStart} ${xOuter},${yEnd} ${xInner},${yEnd + 2}`}
                fill={getFill(id)}
                stroke="#333"
                strokeWidth="1"
              />
              <text
                x={xOuter + 10}
                y={(yStart + yEnd) / 2}
                fill="#fff"
                fontSize="7"
                textAnchor="middle"
              >
                {id}
              </text>
            </g>
          );
        })}

        {/* Left blocks */}
        {blocks.slice(12, 16).map((id, idx) => {
          const yStart = 60 + idx * 12;
          const yEnd = yStart + 10;
          const xOuter = 40;
          const xInner = 55;
          return (
            <g key={id}>
              <polygon
                points={`${xOuter},${yStart} ${xInner},${yStart - 2} ${xInner},${yEnd + 2} ${xOuter},${yEnd}`}
                fill={getFill(id)}
                stroke="#333"
                strokeWidth="1"
              />
              <text
                x={xOuter - 10}
                y={(yStart + yEnd) / 2}
                fill="#fff"
                fontSize="7"
                textAnchor="middle"
              >
                {id}
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

  function getFill(label) {
    const isCurrent =
      currentId === label ||
      (label === "INNENRAUM" && currentId.includes("INNEN"));
    const isUpgrade = upgradeTargets.includes(label);

    if (isCurrent && isUpgrade) return "#8E24AA";
    if (isCurrent) return "#8E24AA";
    if (isUpgrade) return "#FBC02D";
    return "#222";
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
        <span>Uber Arena – Konzert Layout</span>
        <span style={{ fontSize: 11, opacity: 0.8 }}>
          Innenraum + Ränge schematisch
        </span>
      </div>

      <svg viewBox="0 0 220 160" style={{ width: "100%", display: "block" }}>
        <ellipse
          cx="110"
          cy="80"
          rx="90"
          ry="60"
          fill="#101010"
          stroke="#444"
          strokeWidth="2"
        />
        <ellipse
          cx="110"
          cy="80"
          rx="80"
          ry="50"
          fill="#141414"
          stroke="#333"
          strokeWidth="1"
        />
        <ellipse
          cx="110"
          cy="80"
          rx="60"
          ry="35"
          fill="#181818"
          stroke="#333"
          strokeWidth="1"
        />

        <ellipse
          cx="110"
          cy="80"
          rx="36"
          ry="22"
          fill={getFill("INNENRAUM")}
          stroke="#555"
          strokeWidth="1"
        />
        <text
          x="110"
          y="82"
          fill="#fff"
          fontSize="8"
          textAnchor="middle"
        >
          Innenraum
        </text>

        <rect
          x="85"
          y="45"
          width="50"
          height="10"
          fill="#333"
          stroke="#777"
          strokeWidth="1"
          rx="2"
        />
        <text
          x="110"
          y="53"
          fill="#fff"
          fontSize="7"
          textAnchor="middle"
        >
          Bühne
        </text>

        <text
          x="110"
          y="22"
          fill={getFill("211")}
          fontSize="8"
          textAnchor="middle"
        >
          211
        </text>
        <text
          x="170"
          y="80"
          fill={getFill("103")}
          fontSize="8"
          textAnchor="middle"
        >
          103
        </text>
        <text
          x="50"
          y="80"
          fill={getFill("104")}
          fontSize="8"
          textAnchor="middle"
        >
          104
        </text>
        <text
          x="110"
          y="135"
          fill={getFill("204")}
          fontSize="8"
          textAnchor="middle"
        >
          204
        </text>
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

    if (isCurrent && isUpgrade) return "#1565C0";
    if (isCurrent) return "#1565C0";
    if (isUpgrade) return "#FBC02D";
    return "#222";
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
        <span>Uber Arena – Eishockey Layout</span>
        <span style={{ fontSize: 11, opacity: 0.8 }}>
          Neutral · Zentrum · Torbereiche
        </span>
      </div>

      <svg viewBox="0 0 230 160" style={{ width: "100%", display: "block" }}>
        <rect
          x="55"
          y="40"
          width="120"
          height="70"
          rx="18"
          ry="18"
          fill="#e0f2ff"
          stroke="#90caf9"
          strokeWidth="2"
        />

        <line
          x1="115"
          y1="40"
          x2="115"
          y2="110"
          stroke="#f44336"
          strokeWidth="1"
        />
        <line
          x1="85"
          y1="40"
          x2="85"
          y2="110"
          stroke="#1e88e5"
          strokeWidth="1"
        />
        <line
          x1="145"
          y1="40"
          x2="145"
          y2="110"
          stroke="#1e88e5"
          strokeWidth="1"
        />

        <text
          x="115"
          y="25"
          fill={getFill("204")}
          fontSize="8"
          textAnchor="middle"
        >
          204
        </text>
        <text
          x="115"
          y="135"
          fill={getFill("104")}
          fontSize="8"
          textAnchor="middle"
        >
          104
        </text>
        <text
          x="45"
          y="80"
          fill={getFill("106")}
          fontSize="8"
          textAnchor="middle"
        >
          106
        </text>
        <text
          x="185"
          y="80"
          fill={getFill("119")}
          fontSize="8"
          textAnchor="middle"
        >
          119
        </text>
      </svg>
    </div>
  );
}

export default App;