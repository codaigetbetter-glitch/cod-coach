import React, { useState, useEffect, useRef } from 'react';
import { Send, Upload, Settings, Shield, Target } from 'lucide-react';

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
    { role: 'assistant', content: "Yo! I'm your COD Mobile Coach. Upload a screenshot of your HUD or Settings, and let's optimize your gameplay." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToolsMobile, setShowToolsMobile] = useState(false);
  const [sens, setSens] = useState(70);
  const [isPC, setIsPC] = useState(false);
  const chatEndRef = useRef(null);

  // Check if screen is PC or Mobile
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
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Check your API key connection." }]);
    } finally {
      setLoading(false);
    }
  };

  const CalculatorUI = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Target size={24} color={C.accent} />
        <h2 style={{ fontSize: 18, fontWeight: "bold" }}>Sensitivity Pro</h2>
      </div>
      <div style={{ backgroundColor: C.bg, padding: 20, borderRadius: 12, border: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
          <span style={{ color: C.dim, fontSize: 13 }}>Standard Rotation</span>
          <span style={{ color: C.accent, fontWeight: "bold" }}>{sens}</span>
        </div>
        <input 
          type="range" min="40" max="120" value={sens} 
          onChange={(e) => setSens(parseInt(e.target.value))}
          style={{ width: "100%", cursor: "pointer", accentColor: C.accent }}
        />
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Standard", val: sens, color: C.accent },
            { label: "ADS", val: Math.round(sens * 1.25), color: C.secondary },
            { label: "Tactical", val: Math.round(sens * 0.9), color: C.dim },
            { label: "Sniper", val: Math.round(sens * 0.48), color: "#f472b6" }
          ].map(s => (
            <div key={s.label} style={{ padding: "12px 8px", backgroundColor: C.card, borderRadius: 8, textAlign: "center", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: "800", color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: C.bg, color: C.text, fontFamily: "Inter, sans-serif" }}>
      
      {/* HEADER */}
      <div style={{ padding: "15px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: C.card }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "linear-gradient(135deg, #38bdf8, #818cf8)", padding: 8, borderRadius: 10 }}>
            <Shield size={22} color="white" />
          </div>
          <span style={{ fontSize: 18, fontWeight: "800", letterSpacing: "-0.5px" }}>COD COACH AI</span>
        </div>
        
        {!isPC && (
          <button 
            onClick={() => setShowToolsMobile(!showToolsMobile)}
            style={{ padding: "8px 16px", backgroundColor: showToolsMobile ? C.accent : C.border, borderRadius: 8, border: "none", color: "white", fontSize: 12, fontWeight: "bold" }}
          >
            {showToolsMobile ? "Back to Chat" : "Tools"}
          </button>
        )}
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        
        {/* CHAT CONTAINER */}
        <div style={{ flex: 1, display: (isPC || !showToolsMobile) ? "flex" : "none", flexDirection: "column", borderRight: isPC ? `1px solid ${C.border}` : "none" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: isPC ? "70%" : "85%",
                padding: "14px 18px",
                borderRadius: m.role === 'user' ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                backgroundColor: m.role === 'user' ? C.accent : C.card,
                color: m.role === 'user' ? "white" : C.text,
                fontSize: 15,
                lineHeight: "1.6",
                border: m.role === 'user' ? "none" : `1px solid ${C.border}`
              }}>
                {m.content}
              </div>
            ))}
            {loading && <div style={{ fontSize: 12, color: C.dim, paddingLeft: 10 }}>Analyzing HUD data...</div>}
            <div ref={chatEndRef} />
          </div>

          {/* INPUT AREA */}
          <div style={{ padding: 20, backgroundColor: C.card, borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", gap: 10, maxWidth: "900px", margin: "0 auto", width: "100%" }}>
              <button style={{ padding: 12, borderRadius: 10, border: "none", backgroundColor: C.bg, color: C.dim, cursor: "pointer" }}>
                <Upload size={20} />
              </button>
              <input 
                value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your coach anything..."
                style={{ flex: 1, backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "0 15px", color: "white", outline: "none" }}
              />
              <button onClick={handleSend} style={{ padding: "0 20px", borderRadius: 10, border: "none", backgroundColor: C.accent, color: "white", fontWeight: "bold", cursor: "pointer" }}>
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* SIDEBAR (PC: Visible | Mobile: Toggleable) */}
        <div style={{ 
          display: (isPC || showToolsMobile) ? "block" : "none", 
          width: isPC ? "380px" : "100%",
          backgroundColor: C.card,
          padding: 25,
          overflowY: "auto"
        }}>
          <CalculatorUI />
          
          <div style={{ marginTop: 40, padding: 20, borderRadius: 12, backgroundColor: "rgba(56, 189, 248, 0.05)", border: `1px dashed ${C.accent}` }}>
            <h3 style={{ fontSize: 14, fontWeight: "bold", color: C.accent, marginBottom: 8 }}>Coach Tip:</h3>
            <p style={{ fontSize: 13, color: C.dim, lineHeight: "1.5" }}>
              Upload your "Sensitivity" screenshot. I can check if your **ADS** vs **Firing** ratio is balanced for Sniping or Aggressive SMG play.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
