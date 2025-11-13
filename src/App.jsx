import { useState } from "react";
import fckoelnLogo from "./assets/fckoeln.png"; // ← FC Köln logo

function App() {
  const [block, setBlock] = useState("");
  const [row, setRow] = useState("");
  const [seat, setSeat] = useState("");
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  // ⭐ FC Köln branding colors
  const teamColor = "#C8102E"; // FC Köln red
  const teamSecondary = "#ffffff";

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

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f0f0f",
        color: "white",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* ⭐ TOP BAR WITH FC KÖLN LOGO */}
      <div
        style={{
          width: "100%",
          backgroundColor: "#111",
          padding: "14px 20px",
          borderBottom: `4px solid ${teamColor}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={fckoelnLogo}
            alt="FC Köln Logo"
            style={{
              width: 40,
              height: 40,
              objectFit: "contain",
            }}
          />
          <strong style={{ fontSize: 18 }}>1. FC Köln – Seat Upgrade</strong>
        </div>

        <div style={{ fontSize: 22, opacity: 0.7 }}>⋮</div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 20 }}>
        <h2 style={{ textAlign: "center", marginTop: 10 }}>
          Sitzplatz Eingeben
        </h2>

        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          <input
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            placeholder="Block (z. B. C)"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #333",
              backgroundColor: "#1a1a1a",
              color: "white",
              fontSize: 16,
              textAlign: "center",
              marginBottom: 12,
            }}
          />

          <input
            value={row}
            onChange={(e) => setRow(e.target.value)}
            placeholder="Reihe (z. B. 12)"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #333",
              backgroundColor: "#1a1a1a",
              color: "white",
              fontSize: 16,
              textAlign: "center",
              marginBottom: 12,
            }}
          />

          <input
            value={seat}
            onChange={(e) => setSeat(e.target.value)}
            placeholder="Sitz (z. B. 7)"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #333",
              backgroundColor: "#1a1a1a",
              color: "white",
              fontSize: 16,
              textAlign: "center",
              marginBottom: 12,
            }}
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
            }}
          >
            Upgrade-Angebote Anzeigen
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
            }}
          >
            {error}
          </div>
        )}

        {/* OFFERS */}
        {offers.length > 0 && (
          <div style={{ marginTop: 30 }}>
            {offers.map((offer) => (
              <div
                key={offer.id}
                style={{
                  backgroundColor: "#1a1a1a",
                  borderLeft: `6px solid ${offer.color}`,
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 14,
                }}
              >
                <h3>{offer.title}</h3>
                <p style={{ color: "#ccc" }}>{offer.description}</p>
                <p style={{ fontWeight: "bold" }}>
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
                  Upgrade Auswählen
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
            }}
          >
            <h3>Upgrade ausgewählt 🎉</h3>
            <p>Block {block}, Reihe {row}, Sitz {seat}</p>
            <p>{selectedOffer.title}</p>
            <p>{selectedOffer.priceEuro.toFixed(2)} €</p>
          </div>
        )}

        {/* HISTORY */}
        {history.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h3>Test-Log</h3>
            <ul style={{ color: "#bbb", paddingLeft: 16 }}>
              {history.map((item, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
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

export default App;