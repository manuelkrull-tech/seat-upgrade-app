import { useState } from "react";
import fckoelnLogo from "./assets/fckoeln.png"; // still using this as app logo for now

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
  const [selectedEventId, setSelectedEventId] = useState("koeln-hertha");
  const [block, setBlock] = useState("");
  const [row, setRow] = useState("");
  const [seat, setSeat] = useState("");
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentEvent = EVENTS.find((e) => e.id === selectedEventId);
  const teamColor = currentEvent?.primaryColor ?? "#C8102E";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSelectedOffer(null);
    setOffers([]);
    setIsLoading(true);

    if (!block || !row || !seat) {
      setIsLoading(false);
      setError("Bitte alle Felder ausfüllen.");
      return;
    }

    try {
      let result = [];
      if (selectedEventId === "koeln-hertha") {
        result = await fetchKoelnOffers({ block, row, seat });
      } else if (selectedEventId === "drake-uber") {
        result = await fetchDrakeOffers({ block, row, seat });
      } else if (selectedEventId === "eisbaeren-adler") {
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

  function handleAccept(offer) {
    setSelectedOffer(offer);

    const entry = {
      time: new Date().toLocaleTimeString(),
      event: currentEvent?.name,
      block,
      row,
      seat,
      offerTitle: offer.title,
      priceEuro: offer.priceEuro,
    };

    setHistory((prev) => [entry, ...prev]);
  }

  const pageStyles = {
    minHeight: "100vh",
    backgroundColor: "#0b0b0b",
    color: "white",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const headerOuter = {
    width: "100%",
    backgroundColor: "#111",
    borderBottom: `4px solid ${teamColor}`,
    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  };

  const headerInner = {
    maxWidth: 480,
    margin: "0 auto",
    boxSizing: "border-box",
    padding: "18px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
    backgroundColor: isLoading ? "#555" : teamColor,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    border: "none",
    cursor: isLoading ? "default" : "pointer",
    boxSizing: "border-box",
    opacity: isLoading ? 0.8 : 1,
  };

  return (
    <div style={pageStyles}>
      {/* HEADER */}
      <div style={headerOuter}>
        <div style={headerInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={fckoelnLogo}
              alt="Logo"
              style={{
                width: 40,
                height: 40,
                objectFit: "contain",
                borderRadius: "50%",
                backgroundColor: "#000",
              }}
            />
            <div>
              <div style={{ fontWeight: "bold", fontSize: 16 }}>
                Seat Upgrade Demo
              </div>
              <div style={{ fontSize: 12, color: "#ccc" }}>
                {currentEvent?.venue || "Wähle ein Event"}
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 22,
              opacity: 0.75,
              padding: "4px 8px",
              borderRadius: 999,
              backgroundColor: "rgba(0,0,0,0.35)",
            }}
          >
            ⋮
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={mainContainer}>
        {/* EVENT SELECTOR */}
        <div>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Event auswählen</h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {EVENTS.map((ev) => {
              const isActive = ev.id === selectedEventId;
              return (
                <button
                  key={ev.id}
                  onClick={() => {
                    setSelectedEventId(ev.id);
                    setOffers([]);
                    setSelectedOffer(null);
                    setError("");
                  }}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    border: `1px solid ${
                      isActive ? ev.primaryColor : "#333"
                    }`,
                    backgroundColor: isActive ? "#1e1e1e" : "#151515",
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

        {/* SEAT INPUT */}
        <h3 style={{ textAlign: "center", marginTop: 8 }}>
          Sitzplatz / Bereich eingeben
        </h3>
        <p
          style={{
            textAlign: "center",
            color: "#b3b3b3",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {selectedEventId === "koeln-hertha" &&
            "Nutze z. B. S3, N2, O3 oder W1 als Block-Bezeichnung."}
          {selectedEventId === "drake-uber" &&
            "Nutze klassische Arena-Blöcke (z. B. 211, 103) oder 'Innenraum'."}
          {selectedEventId === "eisbaeren-adler" &&
            "Nutze z. B. 106, 119, 204 als Sektion im Hockey-Setup."}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            placeholder={currentEvent?.seatLabel || "Block / Bereich"}
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

        {/* ERROR */}
        {error && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 10,
              backgroundColor: "#8B1A1A",
              color: "#ffdddd",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            {error}
          </div>
        )}

        {/* MAPS */}
        <div style={{ marginTop: 24 }}>
          {selectedEventId === "koeln-hertha" && (
            <KoelnStadiumMap
              currentBlock={block}
              offers={offers}
              teamColor={teamColor}
            />
          )}

          {selectedEventId === "drake-uber" && (
            <ConcertArenaMap
              currentBlock={block}
              offers={offers}
              themeColor={teamColor}
            />
          )}

          {selectedEventId === "eisbaeren-adler" && (
            <HockeyArenaMap
              currentBlock={block}
              offers={offers}
              themeColor={teamColor}
            />
          )}
        </div>

        {/* OFFERS */}
        {offers.length > 0 && (
          <div style={{ marginTop: 24 }}>
            {offers.map((offer) => (
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
                <h3 style={{ marginTop: 0 }}>{offer.title}</h3>
                <p style={{ color: "#ccc", marginTop: 4 }}>{offer.description}</p>
                <p style={{ fontWeight: "bold", marginTop: 8 }}>
                  Preis: {offer.priceEuro.toFixed(2)} €
                </p>

                <button
                  onClick={() => handleAccept(offer)}
                  style={{
                    marginTop: 10,
                    padding: "10px 16px",
                    borderRadius: 8,
                    backgroundColor: offer.color,
                    border: "none",
                    color: "#111",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Upgrade auswählen
                </button>
              </div>
            ))}
          </div>
        )}

        {/* CONFIRMATION */}
        {selectedOffer && (
          <div
            style={{
              marginTop: 24,
              padding: 16,
              backgroundColor: "#2E7D32",
              borderRadius: 12,
              boxSizing: "border-box",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Upgrade ausgewählt 🎉</h3>
            <p>{currentEvent?.name}</p>
            <p>
              Platz: {block}, Reihe {row}, Sitz {seat}
            </p>
            <p>{selectedOffer.title}</p>
            <p>{selectedOffer.priceEuro.toFixed(2)} €</p>
          </div>
        )}

        {/* HISTORY */}
        {history.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <h3>Session-Log</h3>
            <ul style={{ color: "#bbb", paddingLeft: 16 }}>
              {history.map((item, i) => (
                <li key={i} style={{ marginBottom: 6, fontSize: 13 }}>
                  [{item.time}] {item.event} – {item.block}/{item.row}/
                  {item.seat} → <strong>{item.offerTitle}</strong> (
                  {item.priceEuro.toFixed(2)} €)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- FAKE APIs FOR EACH EVENT ---------- */

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
            stand === "S" ? "S2" : stand === "N" ? "N2" : stand === "O" ? "O2" : "W2",
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

      resolve(withDynamicText);
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
          description: "Direkt vor der Bühne – maximale Nähe zu Drake.",
          priceEuro: 120,
          color: "#AB47BC",
          targetBlock: "INNER CIRCLE",
        });
      } else {
        offers.push({
          id: 11,
          title: "Innenraum-Upgrade",
          description:
            "Wechsel vom Sitzplatz in den Innenraum – dichter an der Bühne.",
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

      resolve(withDynamicText);
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
          title: "Bessere Sicht auf Angriffsdrittel",
          description: "Upgrade in einen Block mit besserer Sicht auf das Tor.",
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
          description: "Wechsel in eine der unteren Reihen – näher an Checks & Action.",
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

      resolve(withDynamicText);
    }, 700);
  });
}

/* ---------- MAP COMPONENTS FOR EACH EVENT ---------- */

function KoelnStadiumMap({ currentBlock, offers, teamColor }) {
  const trimmed = (currentBlock || "").trim().toUpperCase();
  const currentId = trimmed;
  const standNames = {
    N: "Nordtribüne",
    S: "Südtribüne (Heimfans)",
    O: "Osttribüne",
    W: "Westtribüne",
  };
  const currentStandLetter = currentId ? currentId[0] : "";
  const currentStandName = standNames[currentStandLetter];

  const upgradeBlocks = Array.from(
    new Set(
      offers
        .map((o) =>
          o.targetBlock ? o.targetBlock.trim().toUpperCase() : null
        )
        .filter(Boolean)
    )
  );

  function getFill(blockId) {
    const isCurrent = blockId === currentId;
    const isUpgrade = upgradeBlocks.includes(blockId);

    if (isCurrent && isUpgrade) return "#C8102E";
    if (isCurrent) return teamColor;
    if (isUpgrade) return "#FBC02D";
    return "#222";
  }

  // Simple 3D style: we’ll just reuse block ids N1–N4, S1–S4, O1–O4, W1–W4
  // but only care about first letter for realism.
  const blocks = ["N1", "N2", "N3", "N4", "S1", "S2", "S3", "S4", "O1", "O2", "O3", "O4", "W1", "W2", "W3", "W4"];

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
          Rot = aktueller Block · Gelb = Upgrade-Ziel
        </span>
      </div>

      <svg viewBox="0 0 240 160" style={{ width: "100%", display: "block" }}>
        {/* Outer bowl */}
        <path
          d="M 40 40 Q 120 10 200 40 L 215 120 Q 120 155 25 120 Z"
          fill="#101010"
          stroke="#444"
          strokeWidth="2"
        />

        {/* Pitch */}
        <polygon
          points="85,55 175,55 195,115 65,115"
          fill="#0f3d1a"
          stroke="#2e7d32"
          strokeWidth="1.5"
        />

        {/* Center line */}
        <line
          x1="130"
          y1="55"
          x2="130"
          y2="115"
          stroke="#2e7d32"
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* Just draw four segments per side, labelled generically */}
        {/* Top/North blocks */}
        {blocks.slice(0, 4).map((id, idx) => {
          const xStart = 80 + idx * 20;
          const xEnd = xStart + 18;
          const yOuter = 40;
          const yInner = 55;
          return (
            <g key={id}>
              <polygon
                points={`${xStart},${yOuter} ${xEnd},${yOuter} ${xEnd + 3},${yInner} ${xStart - 3},${yInner}`}
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

        {/* Bottom/South blocks */}
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

        {/* Right/East blocks */}
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

        {/* Left/West blocks */}
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

        {currentId && (
          <text
            x="120"
            y="155"
            fill="#ccc"
            fontSize="11"
            textAnchor="middle"
          >
            Aktueller Block: {currentId}
            {currentStandName ? ` · ${currentStandName}` : ""}
          </text>
        )}
      </svg>
    </div>
  );
}

function ConcertArenaMap({ currentBlock, offers, themeColor }) {
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

    if (isCurrent && isUpgrade) return themeColor;
    if (isCurrent) return themeColor;
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
          Mitte: Bühne · Ringe = Ränge
        </span>
      </div>

      <svg viewBox="0 0 220 160" style={{ width: "100%", display: "block" }}>
        {/* Outer bowl */}
        <ellipse
          cx="110"
          cy="80"
          rx="90"
          ry="60"
          fill="#101010"
          stroke="#444"
          strokeWidth="2"
        />

        {/* Upper tier */}
        <ellipse
          cx="110"
          cy="80"
          rx="80"
          ry="50"
          fill="#141414"
          stroke="#333"
          strokeWidth="1"
        />

        {/* Lower bowl */}
        <ellipse
          cx="110"
          cy="80"
          rx="60"
          ry="35"
          fill="#181818"
          stroke="#333"
          strokeWidth="1"
        />

        {/* Floor / Innenraum */}
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

        {/* Stage rectangle at one side */}
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

        {/* A few labeled sections */}
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

function HockeyArenaMap({ currentBlock, offers, themeColor }) {
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

    if (isCurrent && isUpgrade) return themeColor;
    if (isCurrent) return themeColor;
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
          Mitte: Eis · Blöcke = Sektionen
        </span>
      </div>

      <svg viewBox="0 0 230 160" style={{ width: "100%", display: "block" }}>
        {/* Rink */}
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

        {/* Center line */}
        <line
          x1="115"
          y1="40"
          x2="115"
          y2="110"
          stroke="#f44336"
          strokeWidth="1"
        />

        {/* Blue lines */}
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

        {/* Few key sections */}
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