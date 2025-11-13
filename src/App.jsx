import { useState } from "react";

function App() {
  const [block, setBlock] = useState("");
  const [row, setRow] = useState("");
  const [seat, setSeat] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (block && row && seat) {
      setMessage(
        `We found an upgrade for Block ${block}, Row ${row}, Seat ${seat}: ` +
          "move 5 rows closer for +15€ (test example)."
      );
    } else {
      setMessage("Please fill in all fields.");
    }
  }

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "0 auto",
        padding: 16,
        fontFamily: "sans-serif",
      }}
    >
      <h1>Seat Upgrade Test</h1>

      <form onSubmit={handleSubmit}>
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

        <button type="submit">Check for upgrade</button>
      </form>

      {message && (
        <div
          style={{
            marginTop: 16,
            padding: 8,
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default App;