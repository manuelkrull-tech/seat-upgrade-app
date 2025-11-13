import { useState } from "react";
import fckoelnLogo from "./assets/fckoeln.png"; // FC Köln logo

function App() {
  const [block, setBlock] = useState("");
  const [row, setRow] = useState("");
  const [seat, setSeat] = useState("");
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const teamColor = "#C8102E"; // FC Köln red

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
      const result = await fetchSeatUpgradeOffers({ block, row, seat });
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
    backgroundColor: "#0f0f0f",
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
        <div
          style={{
            ...headerInner,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "32px 16px", // controls header height
          }}
        >
          {/* CENTERED LOGO WITH RED GLOW */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(200,16,46,0.7) 0%, rgba(200,16,46,0.1) 55%, transparent 75%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={fckoelnLogo}
                alt="FC Köln Logo"
                className="logo-glow"
                style={{
                  width: 52,
                  height: 52,
                  objectFit: "contain",
                }}
              />
            </div>
          </div>

          {/* RIGHT MENU ICON */}
          <div
            style={{
              fontSize: 26,
              opacity: 0.75,
              padding: "6px 10px",
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
        <h2 style={{ textAlign: "center", marginTop: 10 }}>Sitzplatz eingeben</h2>
        <p
          style={{
            textAlign: "center",
            color: "#b3b3b3",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          Diese Demo nutzt eine Fake-API und zeigt unten eine vereinfachte
          Stadiongrafik mit markierten Blöcken.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            placeholder="Block (z. B. C)"
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
            placeholder="Sitz (z. B. 7)"
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

        {/* STADIUM MAP */}
        <div style={{ marginTop: 24 }}>
          <StadiumMap currentBlock={block} offers={offers} teamColor={teamColor} />
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
            <p>
              Block {block}, Reihe {row}, Sitz {seat}
            </p>
            <p>{selectedOffer.title}</p>
            <p>{selectedOffer.priceEuro.toFixed(2)} €</p>
            <p style={{ fontSize: 12, marginTop: 8, color: "#e6e6e6" }}>
              In einer echten Version würde hier eine API das Ticket und die
              Zahlung aktualisieren.
            </p>
          </div>
        )}

        {/* HISTORY */}
        {history.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <h3>Test-Log</h3>
            <ul style={{ color: "#bbb", paddingLeft: 16 }}>
              {history.map((item, i) => (
                <li key={i} style={{ marginBottom: 6, fontSize: 13 }}>
                  [{item.time}] Block {item.block}, Reihe {item.row}, Sitz{" "}
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

/**
 * 💾 Fake API function (mock backend)
 * Now includes a "targetBlock" field for each offer,
 * so the stadium map can highlight upgrade blocks.
 */
function fetchSeatUpgradeOffers({ block, row, seat }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const upperBlock = block.toUpperCase();
      const rowNumber = parseInt(row, 10);
      const seatNumber = parseInt(seat, 10);

      if (upperBlock === "Z") {
        reject(new Error("Fake API error for block Z"));
        return;
      }

      let offers = [];

      // Example logic: center / VIP upgrades by block
      if (upperBlock === "C") {
        offers.push(
          {
            id: 1,
            title: "Upgrade Mittelblock",
            description: "Bessere Sicht auf Höhe der Mittellinie.",
            priceEuro: 25,
            color: "#D81B60",
            targetBlock: "C",
          },
          {
            id: 2,
            title: "VIP-Upgrade Gegengerade",
            description: "Premium-Sitze auf der Gegengerade.",
            priceEuro: 39,
            color: "#43A047",
            targetBlock: "B",
          }
        );
      }

      if (upperBlock === "D") {
        offers.push({
          id: 3,
          title: "VIP-Upgrade Südkurve",
          description: "Gepolsterte Sitze + VIP-Bereich.",
          priceEuro: 45,
          color: "#43A047",
          targetBlock: "D",
        });
      }

      if (!isNaN(rowNumber) && rowNumber > 15) {
        offers.push({
          id: 4,
          title: "Näher ans Spielfeld",
          description: "Wechsel in eine Reihe näher am Feld.",
          priceEuro: 18,
          color: "#E53935",
          targetBlock: upperBlock || "C",
        });
      }

      if (offers.length === 0) {
        offers.push({
          id: 5,
          title: "Standard-Upgrade",
          description: "Eine Kategorie höher mit etwas besserer Sicht.",
          priceEuro: 12,
          color: "#FB8C00",
          targetBlock: "B",
        });
      }

      const withDynamicText = offers.map((offer) => ({
        ...offer,
        description:
          offer.description +
          (isNaN(seatNumber)
            ? ""
            : ` (Sitz ${seatNumber} – begrenztes Kontingent)`)
      }));

      resolve(withDynamicText);
    }, 700);
  });
}

/**
 * 🏟 Simple Stadium Map (SVG)
 * - Shows blocks A, B, C, D
 * - Highlights current block
 * - Highlights upgrade target blocks from offers
 */
function StadiumMap({ currentBlock, offers, teamColor }) {
  const upperCurrent = (currentBlock || "").trim().toUpperCase();

  const upgradeBlocks = Array.from(
    new Set(
      offers
        .map((o) => (o.targetBlock ? o.targetBlock.toUpperCase() : null))
        .filter(Boolean)
    )
  );

  const allBlocks = ["A", "B", "C", "D"];

  function getFill(blockId) {
    const isCurrent = blockId === upperCurrent;
    const isUpgrade = upgradeBlocks.includes(blockId);

    if (isCurrent && isUpgrade) {
      return "#C8102E"; // both current + upgrade: strong red
    }
    if (isCurrent) {
      return teamColor;
    }
    if (isUpgrade) {
      return "#FBC02D"; // yellow highlight for upgrade blocks
    }
    return "#222"; // default
  }

  return (
    <div
      style={{
        backgroundColor: "#151515",
        borderRadius: 12,
        padding: 14,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#ccc",
          marginBottom: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Stadion-Übersicht (vereinfacht)</span>
        <span style={{ fontSize: 11, opacity: 0.8 }}>
          Rot = aktueller Block, Gelb = Upgrade
        </span>
      </div>

      <svg
        viewBox="0 0 200 120"
        style={{ width: "100%", display: "block" }}
      >
        {/* Outer stadium shape */}
        <rect
          x="10"
          y="10"
          width="180"
          height="100"
          rx="18"
          ry="18"
          fill="#111"
          stroke="#555"
          strokeWidth="2"
        />

        {/* Pitch */}
        <rect
          x="55"
          y="30"
          width="90"
          height="60"
          fill="#0d3b1e"
          stroke="#2e7d32"
          strokeWidth="1.5"
        />

        {/* Center line */}
        <line
          x1="100"
          y1="30"
          x2="100"
          y2="90"
          stroke="#2e7d32"
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* Blocks A, B, C, D */}
        {/* Top row: A, B */}
        <rect
          x="25"
          y="15"
          width="60"
          height="20"
          fill={getFill("A")}
          stroke="#555"
          strokeWidth="1"
        />
        <rect
          x="115"
          y="15"
          width="60"
          height="20"
          fill={getFill("B")}
          stroke="#555"
          strokeWidth="1"
        />

        {/* Bottom row: C, D */}
        <rect
          x="25"
          y="85"
          width="60"
          height="20"
          fill={getFill("C")}
          stroke="#555"
          strokeWidth="1"
        />
        <rect
          x="115"
          y="85"
          width="60"
          height="20"
          fill={getFill("D")}
          stroke="#555"
          strokeWidth="1"
        />

        {/* Block labels */}
        <text x="55" y="29" fill="#fff" fontSize="10" textAnchor="middle">
          A
        </text>
        <text x="145" y="29" fill="#fff" fontSize="10" textAnchor="middle">
          B
        </text>
        <text x="55" y="99" fill="#fff" fontSize="10" textAnchor="middle">
          C
        </text>
        <text x="145" y="99" fill="#fff" fontSize="10" textAnchor="middle">
          D
        </text>

        {/* "You are here" indicator if current block is known */}
        {allBlocks.includes(upperCurrent) && (
          <text
            x="100"
            y="110"
            fill="#ccc"
            fontSize="10"
            textAnchor="middle"
          >
            Aktueller Block: {upperCurrent}
          </text>
        )}
      </svg>
    </div>
  );
}

export default App;