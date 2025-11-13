import { useState } from "react";

function App() {
  const [block, setBlock] = useState("");
  const [row, setRow] = useState("");
  const [seat, setSeat] = useState("");
  const [offers, setOffers] = useState([]); // list of upgrade options
  const [selectedOffer, setSelectedOffer] = useState(null); // which one user picked
  const [history, setHistory] = useState([]); // log of accepted upgrades
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSelectedOffer(null);

    if (!block || !row || !seat) {
      setError("Please fill in all fields.");
      setOffers([]);
      return;
    }

    // Very simple fake "business logic":
    // Different offers depending on block.
    let newOffers = [];

    if (block.toUpperCase() === "C") {
      newOffers = [
        {
          id: 1,
          title: "Move 5 rows closer",
          description: "Get closer to the pitch in your block.",
          priceEuro: 15,
        },
        {
          id: 2,
          title: "Move to center block",
          description: "Better view near midfield.",
          priceEuro: 25,
        },
      ];
    } else if (block.toUpperCase() === "D") {
      newOffers = [
        {
          id: 3,
          title: "Upgrade to VIP corner",
          description: "Padded seats and better view.",
          priceEuro: 40,
        },
      ];
    } else {
      newOffers = [
        {
          id: 4,
          title: "Standard upgrade",
          description: "Move to a slightly better category.",
          priceEuro: 10,
        },
      ];
    }

    setOffers(newOffers);
  }

  function handleAccept(offer) {
    setSelectedOffer(offer);

    // Add to local history log
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
        maxWidth: 500,
        margin: "0 auto",
        padding: 16,
        fontFamily: "sans-serif",
      }}
    >
      <h1>Seat Upgrade Test</h1>
      <p style={{ fontSize: 14, color: "#555" }}>
        Enter a test seat and see example upgrade offers. This is still a demo
        (no real payments or tickets yet).
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <label>
            Block:{" "}
            <input
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              placeholder="e.g. C"
            />
          </label>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>
            Row:{" "}
            <input
              value={row}
              onChange={(e) => setRow(e.target.value)}
              placeholder="e.g. 12"
            />
          </label>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>
            Seat:{" "}
            <input
              value={seat}
              onChange={(e) => setSeat(e.target.value)}
              placeholder="e.g. 7"
            />
          </label>
        </div>

        <button type="submit">Show upgrade offers</button>
      </form>

      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 8,
            border: "1px solid #f99",
            backgroundColor: "#fee",
            borderRadius: 4,
            color: "#900",
          }}
        >
          {error}
        </div>
      )}

      {/* Offer list */}
      {offers.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Available offers</h2>
          {offers.map((offer) => (
            <div
              key={offer.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: 4,
                padding: 10,
                marginBottom: 8,
              }}
            >
              <strong>{offer.title}</strong>
              <p style={{ margin: "4px 0" }}>{offer.description}</p>
              <p style={{ margin: "4px 0" }}>
                Price: {offer.priceEuro.toFixed(2)} €
              </p>
              <button onClick={() => handleAccept(offer)}>
                Choose this upgrade
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation */}
      {selectedOffer && (
        <div
          style={{
            marginTop: 24,
            padding: 10,
            border: "1px solid #4caf50",
            backgroundColor: "#e8f5e9",
            borderRadius: 4,
          }}
        >
          <h2 style={{ fontSize: 18, marginBottom: 4 }}>Upgrade selected 🎉</h2>
          <p style={{ margin: "4px 0" }}>
            Seat: Block {block}, Row {row}, Seat {seat}
          </p>
          <p style={{ margin: "4px 0" }}>Offer: {selectedOffer.title}</p>
          <p style={{ margin: "4px 0" }}>
            Price: {selectedOffer.priceEuro.toFixed(2)} €
          </p>
          <p style={{ marginTop: 8, fontSize: 13 }}>
            (In the future this will trigger real payment + ticket change.)
          </p>
        </div>
      )}

      {/* Simple local "analytics" */}
      {history.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>Test log (this session)</h2>
          <ul style={{ paddingLeft: 16 }}>
            {history.map((item, index) => (
              <li key={index} style={{ marginBottom: 4, fontSize: 13 }}>
                [{item.time}] Block {item.block}, Row {item.row}, Seat {item.seat} →{" "}
                {item.offerTitle} ({item.priceEuro.toFixed(2)} €)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;