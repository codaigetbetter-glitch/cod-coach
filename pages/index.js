import React, { useState, useEffect, useRef } from 'react';

// --- THEME ---
const C = {
  bg: "#020617",
  card: "#0f172a",
  border: "#1e293b",
  text: "#f8fafc",
  dim: "#64748b",
  accent: "#38bdf8",
  secondary: "#818cf8"
};

export default function CODMobileCoach() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Yo! I'm your COD Mobile Coach. Upload a HUD screenshot or ask me anything." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToolsMobile, setShowToolsMobile] = useState(false);
  const [sens, setSens] = useState(70);
  const [isPC, setIsPC] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsPC(window.innerWidth > 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content || "Ready for your next move." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error: Connection failed." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: C.bg, color: C.text, fontFamily: "sans-serif" }}>
      <div style={{ padding: "15px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: C.card }}>
        <span style={{ fontSize: 18, fontWeight: "800" }}>COD COACH AI</span>
        {!isPC && (
          <button onClick={() => setShowToolsMobile(!showToolsMobile)} style={{ padding: "8px 12px", backgroundColor: C.accent, borderRadius: 8, border: "none", color: "white" }}>
            {showToolsMobile ? "Chat" : "Tools"}
          </button>
        )}
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, display: (isPC || !showToolsMobile) ? "flex" : "none", flexDirection: "column" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: 15, display: "flex", flexDirection: "column", gap: 15 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: "80%", padding: "12px", borderRadius: 12, backgroundColor: m.role === 'user' ? C.accent : C.card }}>
                {m.content}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding: 15, backgroundColor: C.card, borderTop: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask anything..." style={{ flex: 1, backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px", color: "white" }} />
            <button onClick={handleSend} style={{ padding: "10px 20px", backgroundColor: C.accent, borderRadius: 8, border: "none", color: "white" }}>Send</button>
          </div>
        </div>

        {(isPC || showToolsMobile) && (
          <div style={{ width: isPC ? "350px" : "100%", backgroundColor: C.card, padding: 20, overflowY: "auto" }}>
            <h3>Sensitivity Calculator</h3>
            <input type="range" min="40" max="120" value={sens} onChange={(e) => setSens(parseInt(e.target.value))} style={{ width: "100%" }} />
            <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ padding: 10, background: C.bg }}>ADS: {Math.round(sens * 1.25)}</div>
              <div style={{ padding: 10, background: C.bg }}>Sniper: {Math.round(sens * 0.48)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
