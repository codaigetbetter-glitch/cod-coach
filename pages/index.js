import { useState, useRef, useEffect } from "react";
import Head from "next/head";

const C = {
  bg:"#07090c", surface:"#0d1117", panel:"#111820", border:"#1a2332",
  orange:"#ff6b00", orangeDim:"rgba(255,107,0,0.12)",
  text:"#c9d1d9", muted:"#4a5568", white:"#f0f6fc",
};

export default function CODMCoach() {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Coach Active. Upload your HUD or Sensitivity settings to begin audit." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [sideTab, setSideTab] = useState("sens");
  const [baseSens, setBaseSens] = useState(70);
  const [isMobile, setIsMobile] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImages(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const send = async () => {
    if (loading || (!input.trim() && images.length === 0)) return;
    const userMsg = { role: "user", content: input, images: [...images] };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setImages([]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      // This line fixes the "AI doesn't respond" issue:
      const reply = data.text || data.content || (data.choices && data.choices[0].message.content) || "System Error: No response.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Check your API key in Vercel settings." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{height:"100vh", display:"flex", flexDirection:"column", background:C.bg, color:C.text, fontFamily:"sans-serif", overflow:"hidden"}}>
      <Head><title>COD COACH AI</title></Head>

      {/* HEADER */}
      <div style={{padding:"12px 20px", background:C.surface, borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <div style={{width:10, height:10, borderRadius:"50%", background:C.orange, boxShadow:`0 0 10px ${C.orange}`}} />
          <span style={{fontWeight:900, letterSpacing:1, color:C.white}}>SYSTEM_COACH</span>
        </div>
        {isMobile && (
          <button onClick={() => setShowTools(!showTools)} style={{background:C.orange, border:"none", borderRadius:6, padding:"6px 12px", color:"#000", fontWeight:800, fontSize:11}}>
            {showTools ? "CLOSE TOOLS" : "OPEN TOOLS"}
          </button>
        )}
      </div>

      <div style={{flex:1, display:"flex", overflow:"hidden"}}>
        {/* CHAT AREA */}
        <div style={{flex:1, display:(isMobile && showTools) ? "none" : "flex", flexDirection:"column"}}>
          <div style={{flex:1, overflowY:"auto", padding:20, display:"flex", flexDirection:"column", gap:15}}>
            {messages.map((m, i) => (
              <div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start", maxWidth:"85%"}}>
                <div style={{background:m.role==="user"?C.orange:C.panel, color:m.role==="user"?"#000":C.text, padding:12, borderRadius:12, fontSize:14, border:m.role==="user"?"none":`1px solid ${C.border}`}}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div style={{color:C.orange, fontSize:11, fontWeight:800}}>ANALYZING...</div>}
            <div ref={chatEndRef} />
          </div>

          {/* INPUT AREA WITH UPLOAD */}
          <div style={{padding:15, background:C.surface, borderTop:`1px solid ${C.border}`}}>
            {images.length > 0 && (
              <div style={{display:"flex", gap:10, marginBottom:10}}>
                {images.map((img, i) => <img key={i} src={img} style={{width:45, height:45, borderRadius:6, border:`1px solid ${C.orange}`}} />)}
              </div>
            )}
            <div style={{display:"flex", gap:10}}>
              <label style={{cursor:"pointer", background:C.panel, padding:10, borderRadius:8, display:"flex", alignItems:"center", border:`1px solid ${C.border}`}}>
                <span style={{fontSize:20}}>📷</span>
                <input type="file" hidden multiple onChange={handleUpload} accept="image/*" />
              </label>
              <input 
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key==="Enter" && send()}
                placeholder="Ask your coach..."
                style={{flex:1, background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 15px", color:C.white, outline:"none"}}
              />
              <button onClick={send} style={{background:C.orange, border:"none", borderRadius:8, width:44, height:44, color:"#000", fontWeight:900, fontSize:20}}>
                ↑
              </button>
            </div>
          </div>
        </div>

        {/* SIDEBAR TOOLS */}
        <div style={{
          display:(isMobile && !showTools) ? "none" : "flex",
          width:isMobile ? "100%" : "300px",
          background:C.surface,
          borderLeft:isMobile ? "none" : `1px solid ${C.border}`,
          flexDirection:"column", padding:20, gap:20
        }}>
          <div style={{fontSize:14, fontWeight:900, color:C.orange, textAlign:"center"}}>SENSITIVITY CALCULATOR</div>
          <div style={{background:C.panel, padding:15, borderRadius:12, border:`1px solid ${C.border}`}}>
            <div style={{fontSize:12, color:C.muted, marginBottom:10}}>Base Sensitivity: {baseSens}</div>
            <input type="range" min="40" max="120" value={baseSens} onChange={e => setBaseSens(parseInt(e.target.value))} style={{width:"100%", accentColor:C.orange}} />
            <div style={{marginTop:15, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
              {[
                {n:"Fixed", v:baseSens}, {n:"ADS", v:Math.round(baseSens*1.25)},
                {n:"Sniper", v:Math.round(baseSens*0.48)}, {n:"3X Scope", v:Math.round(baseSens*0.85)}
              ].map(x => (
                <div key={x.n} style={{background:C.bg, padding:10, borderRadius:8, textAlign:"center", border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:10, color:C.muted}}>{x.n}</div>
                  <div style={{fontSize:16, fontWeight:900, color:C.orange}}>{x.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
