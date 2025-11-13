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
      {/* HEADER WITH GLOWING LOGO */}
      <div style={headerOuter}>
        <div
          style={{
            ...headerInner,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "32px 16px",
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
          Nutze echte Block-Bezeichnungen wie <strong>S15</strong>,{" "}
          <strong>N4</strong>, <strong>O9</strong>, <strong>W3</strong>. Die
          Karte unten zeigt dir grob, in welchem Stadionbereich dein Sitz und
          mögliche Upgrades liegen.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            placeholder="Block (z. B. S15, N4, O9, W3)"
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

        {/* STADIUM MAP WITH REALISTIC STANDS */}
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
 * 💾 Fake API with more realistic block names.
 * Expects blocks like "S15", "N4", "O9", "W3".
 * Uses first letter (S/N/O/W) as stand.
 */
function fetchSeatUpgradeOffers({ block, row, seat }) {
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

      // Fake error case
      if (trimmed === "X1") {
        reject(new Error("Fake API error for block X1"));
        return;
      }

      let offers = [];

      // Süd (Heimfans) – suggest central Süd blocks
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

      // Nord – central Nordtribüne
      if (stand === "N") {
        offers.push({
          id: 2,
          title: "Upgrade in zentrale Nordtribüne",
          description: "Bessere Sicht von hinter dem Tor.",
          priceEuro: 19,
          color: "#E53935",
          targetBlock: "N3",
        });
      }

      // Ost – long side, central
      if (stand === "O") {
        offers.push({
          id: 3,
          title: "Upgrade Ost – Mittellinie",
          description: "Seitliche Premiumsicht auf Höhe der Mittellinie.",
          priceEuro: 35,
          color: "#43A047",
          targetBlock: "O3",
        });
      }

      // West – main stand / business
      if (stand === "W") {
        offers.push({
          id: 4,
          title: "Upgrade West – Businessnah",
          description: "Nähe Business-Seats mit komfortabler Sicht.",
          priceEuro: 39,
          color: "#FB8C00",
          targetBlock: "W3",
        });
      }

      // Generic “closer to pitch” upgrade if far back in the stand
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

      // Fallback if nothing matched
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

/**
 * 🏟 3D-style tilted RheinEnergieSTADION map
 * - Pitch drawn in perspective (top smaller, bottom larger)
 * - Stands as trapezoid blocks around the pitch
 * - Blocks: N1–N4, S1–S4, O1–O4, W1–W4
 * - Highlights:
 *   - currentBlock (e.g. "S3")
 *   - upgrade target blocks from offers
 */
function StadiumMap({ currentBlock, offers, teamColor }) {
  const trimmed = (currentBlock || "").trim().toUpperCase();
  const currentId = trimmed;

  const upgradeBlockIds = Array.from(
    new Set(
      offers
        .map((o) =>
          o.targetBlock ? o.targetBlock.trim().toUpperCase() : null
        )
        .filter(Boolean)
    )
  );

  // Highlight logic
  function getFill(blockId) {
    const isCurrent = blockId === currentId;
    const isUpgrade = upgradeBlockIds.includes(blockId);

    if (isCurrent && isUpgrade) return "#C8102E"; // strong red
    if (isCurrent) return teamColor;              // Köln red for current
    if (isUpgrade) return "#FBC02D";             // yellow for upgrade
    return "#222";                               // default stands
  }

  // Pitch in perspective: top edge shorter, bottom edge wider
  const pitchTopLeft = { x: 85, y: 55 };
  const pitchTopRight = { x: 175, y: 55 };
  const pitchBottomRight = { x: 195, y: 115 };
  const pitchBottomLeft = { x: 65, y: 115 };

  function lerpPoint(a, b, t) {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    };
  }

  function avg(points) {
    const n = points.length;
    const sum = points.reduce(
      (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
      { x: 0, y: 0 }
    );
    return { x: sum.x / n, y: sum.y / n };
  }

  const blocks = [];

  // Helper to create blocks along one stand side
  function addSideBlocks({
    prefix,
    innerStart,
    innerEnd,
    outerStart,
    outerEnd,
    segments,
  }) {
    for (let i = 0; i < segments; i++) {
      const t0 = i / segments;
      const t1 = (i + 1) / segments;

      const innerA = lerpPoint(innerStart, innerEnd, t0);
      const innerB = lerpPoint(innerStart, innerEnd, t1);
      const outerA = lerpPoint(outerStart, outerEnd, t0);
      const outerB = lerpPoint(outerStart, outerEnd, t1);

      const pts = [outerA, outerB, innerB, innerA];
      const center = avg(pts);

      blocks.push({
        id: `${prefix}${i + 1}`,
        points: pts,
        center,
      });
    }
  }

  const segmentsPerSide = 4;

  // NORTH stand (behind top touchline)
  addSideBlocks({
    prefix: "N",
    innerStart: pitchTopLeft,
    innerEnd: pitchTopRight,
    outerStart: { x: pitchTopLeft.x + 5, y: pitchTopLeft.y - 22 },
    outerEnd: { x: pitchTopRight.x + 5, y: pitchTopRight.y - 24 },
    segments: segmentsPerSide,
  });

  // SOUTH stand (behind bottom touchline)
  addSideBlocks({
    prefix: "S",
    innerStart: pitchBottomLeft,
    innerEnd: pitchBottomRight,
    outerStart: { x: pitchBottomLeft.x - 5, y: pitchBottomLeft.y + 22 },
    outerEnd: { x: pitchBottomRight.x - 5, y: pitchBottomRight.y + 20 },
    segments: segmentsPerSide,
  });

  // EAST stand (right long side)
  addSideBlocks({
    prefix: "O",
    innerStart: pitchTopRight,
    innerEnd: pitchBottomRight,
    outerStart: { x: pitchTopRight.x + 22, y: pitchTopRight.y + 5 },
    outerEnd: { x: pitchBottomRight.x + 24, y: pitchBottomRight.y + 5 },
    segments: segmentsPerSide,
  });

  // WEST stand (left long side)
  addSideBlocks({
    prefix: "W",
    innerStart: pitchBottomLeft,
    innerEnd: pitchTopLeft,
    outerStart: { x: pitchBottomLeft.x - 22, y: pitchBottomLeft.y + 5 },
    outerEnd: { x: pitchTopLeft.x - 24, y: pitchTopLeft.y + 5 },
    segments: segmentsPerSide,
  });

  const standNames = {
    N: "Nordtribüne",
    S: "Südtribüne (Heimfans)",
    O: "Osttribüne",
    W: "Westtribüne",
  };

  const currentStandLetter = currentId ? currentId[0] : "";
  const currentStandName = standNames[currentStandLetter];

  return (
    <div
      style={{
        backgroundColor: "#151515",
        borderRadius: 12,
        padding: 14,
        boxSizing: "border-box",
        marginTop: 8,
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
        <span>RheinEnergieSTADION – 3D-Ansicht</span>
        <span style={{ fontSize: 11, opacity: 0.8 }}>
          Rot = aktueller Block · Gelb = Upgrade-Ziel
        </span>
      </div>

      <svg
        viewBox="0 0 240 170"
        style={{ width: "100%", display: "block" }}
      >
        {/* Outer "bowl" as a soft shape */}
        <path
          d={`
            M 40 40
            Q 120 10 200 40
            L 215 120
            Q 120 155 25 120
            Z
          `}
          fill="#101010"
          stroke="#444"
          strokeWidth="2"
        />

        {/* Pitch in perspective */}
        <polygon
          points={`
            ${pitchTopLeft.x},${pitchTopLeft.y}
            ${pitchTopRight.x},${pitchTopRight.y}
            ${pitchBottomRight.x},${pitchBottomRight.y}
            ${pitchBottomLeft.x},${pitchBottomLeft.y}
          `}
          fill="#0f3d1a"
          stroke="#2e7d32"
          strokeWidth="1.5"
        />

        {/* Mid line */}
        <line
          x1={(pitchTopLeft.x + pitchTopRight.x) / 2}
          y1={pitchTopLeft.y}
          x2={(pitchBottomLeft.x + pitchBottomRight.x) / 2}
          y2={pitchBottomLeft.y}
          stroke="#2e7d32"
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* Blocks (stands) */}
        {blocks.map((b) => (
          <g key={b.id}>
            <polygon
              points={b.points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill={getFill(b.id)}
              stroke="#333"
              strokeWidth="1"
            />
            <text
              x={b.center.x}
              y={b.center.y}
              fill="#fff"
              fontSize="7"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {b.id}
            </text>
          </g>
        ))}

        {/* Label for current block & stand */}
        {currentId && (
          <text
            x="120"
            y="165"
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

export default App;
