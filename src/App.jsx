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

  const teamColor = "#C8102E"; // FC Köln red

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSelectedOffer(null);

    if (!block || !row || !seat) {
      setError("Bitte alle Felder ausfüllen.");
      setOffers([]);
      return;
    }

    let newOffers = [];

    if (block.toUpperCase() === "C") {
      newOffers = [
        {
          id: 1,
          title: "5 Reihen nach vorne",
          description: "Bessere Sicht, näher am Spielfeld.",
          priceEuro: 15,
          color: "#E53935",
        },
        {
          id: 2,
          title: "Upgrade in den Mittelblock",
          description: "Premium-Sicht auf Höhe der Mittellinie.",
          priceEuro: 25,
          color: "#D81B60",
        },
      ];
    } else if (block.toUpperCase() === "D") {
      newOffers = [
        {
          id: 3,
          title: "VIP-Upgrade",
          description: "Gepolsterte Sitze + VIP Bereich.",
          priceEuro: 40,
          color: "#43A047",
        },
      ];
    } else {
      newOffers = [
        {
          id: 4,
          title: "Standard-Upgrade",
          description: "Eine Kategorie besser.",
          priceEuro: 10,
          color: "#FB8C00",
        },
      ];
    }

    setOffers(newOffers);
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
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
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
    padding: "10px 16px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const mainContainer = {
    width: "100%",
    maxWidth: 480,
    padding: "16px",
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

  return (
    <div style={pageStyles}>
      {/* HEADER */}
      <div style={headerOuter}>
        <div style={headerInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={fckoelnLogo}
              alt="FC Köln Logo"
              style={{ width: 36, height: 36, objectFit: "contain" }}
            />
            <strong style={{ fontSize: 18 }}>1. FC Köln – Seat Upgrade</strong>
          </div>
          <div style={{ fontSize: 22, opacity: 0.7 }}>⋮</div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={mainContainer}>
        <h2 style={{ textAlign: "center", marginTop: 10 }}>
          Sitzplatz eingeben
        </h2>

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
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

          <button
            type="submit"
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 10,
              backgroundColor: teamColor,
              color: "#fff",
              fontSize: 16,
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          >
            Upgrade-Angebote anzeigen
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
            <p>Block {block}, Reihe {row}, Sitz {seat}</p>
            <p>{selectedOffer.title}</p>
            <p>{selectedOffer.priceEuro.toFixed(2)} €</p>
          </div>
        )}

        {/* HISTORY */}
        {history.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <h3>Test-Log</h3>
            <ul style={{ color: "#bbb", paddingLeft: 16 }}>
              {history.map((item, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  [{item.time}] Block {item.block}, Reihe {item.row}, Sitz {item.seat} →{" "}
                  <strong>{item.offerTitle}</strong> ({item.priceEuro.toFixed(2)} €)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;