import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Coach Active. Ask anything." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({});
  const chatEndRef = useRef(null);

  function detectProfile(input) {
    const text = input.toLowerCase();
    const updates = {};

    if (text.includes("aggressive")) updates.playstyle = "aggressive";
    if (text.includes("sniper")) updates.playstyle = "sniper";
    if (text.includes("passive")) updates.playstyle = "passive";

    if (text.includes("ipad")) updates.device = "ipad";
    if (text.includes("phone")) updates.device = "phone";

    if (text.includes("4 finger")) updates.fingers = 4;

    return updates;
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };

    const updates = detectProfile(input);
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          profile: newProfile,
        }),
      });

      const data = await res.json();

      let replyText = data.text || "No response.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: replyText },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error connecting to AI." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0b0f14", color: "#fff" }}>
      
      <div style={{ padding: 15, borderBottom: "1px solid #222" }}>
        <b>CODM AI COACH</b>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <b>{m.role === "user" ? "You:" : "Coach:"}</b>
            <div>{m.content}</div>
          </div>
        ))}
        {loading && <div>Analyzing...</div>}
        <div ref={chatEndRef} />
      </div>

      <div style={{ display: "flex", padding: 10, borderTop: "1px solid #222" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask your coach..."
          style={{ flex: 1, padding: 10 }}
        />
        <button onClick={send} style={{ padding: "10px 20px" }}>
          Send
        </button>
      </div>
    </div>
  );
}