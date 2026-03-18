import { useState, useRef, useEffect } from "react";
import Head from "next/head";

const C = {
  bg:"#07090c", surface:"#0d1117", panel:"#111820", border:"#1a2332",
  orange:"#ff6b00", orangeDim:"rgba(255,107,0,0.12)",
  green:"#00e676", greenDim:"rgba(0,230,118,0.1)",
  red:"#ff4444", blue:"#38b6ff", gold:"#ffd700", purple:"#a855f7",
  text:"#c9d1d9", muted:"#4a5568", white:"#f0f6fc",
};

const GUN_TYPE_COLOR = { SMG:C.green, AR:C.blue, Sniper:C.purple, LMG:C.gold, Marksman:C.orange, Shotgun:C.red };
const GUN_TYPE_ICON  = { SMG:"⚡", AR:"🎯", Sniper:"🔭", LMG:"💥", Marksman:"🏹", Shotgun:"💢" };
const TIER_COLOR = { S:C.orange, A:C.green, B:C.blue, C:C.muted };

const HUD_DATA = [
  { f:2, rank:"Beginner",    rc:C.blue,   device:"📱 Phone",              desc:"Both thumbs only. Can't move + aim + shoot simultaneously.",         pro:"Zero learning curve",                    con:"Hard ceiling at Gold/Plat",      yt:{title:"2 Finger COD Mobile Tips",        url:"https://www.youtube.com/results?search_query=cod+mobile+2+finger+beginner+tips"} },
  { f:3, rank:"Competitive", rc:C.green,  device:"📱 Phone",              desc:"Right index fires, freeing right thumb to aim while moving.",        pro:"Most popular ranked layout",             con:"1–2 weeks to adapt",             yt:{title:"3 Finger Claw Setup Tutorial",     url:"https://www.youtube.com/results?search_query=cod+mobile+3+finger+claw+setup+tutorial"} },
  { f:4, rank:"Advanced",    rc:C.orange, device:"📱 Phone",              desc:"Both index fingers on triggers. Full input independence.",            pro:"High-level standard — HawksNest, Rated", con:"3–4 weeks to feel natural",      yt:{title:"4 Finger Claw Tutorial COD Mobile",url:"https://www.youtube.com/results?search_query=cod+mobile+4+finger+claw+tutorial"} },
  { f:5, rank:"Pro",         rc:C.purple, device:"📱 Phone (rare) / iPad", desc:"Middle finger on jump or crouch. Thumbs stay on aim and movement.",  pro:"Zero compromise between inputs",         con:"Rare on phone, needs large screen",yt:{title:"5 Finger Claw COD Mobile",         url:"https://www.youtube.com/results?search_query=cod+mobile+5+finger+claw+tutorial"} },
  { f:6, rank:"iPad Elite",  rc:C.gold,   device:"📟 iPad",               desc:"Both middle fingers active. iFerg layout. Maximum possible inputs.",  pro:"Every action has its own finger",        con:"Basically iPad only",            yt:{title:"6 Finger iPad iFerg Setup",        url:"https://www.youtube.com/results?search_query=cod+mobile+6+finger+ipad+iferg+layout"} },
];

const PROS = {
  iFerg:    { region:"🇦🇺 AUS", f:"6F", device:"iPad Pro", color:C.orange, style:"Ultra-aggressive, mid-air flicks, insane movement", note:"6-finger lets him move, aim, jump, crouch, fire and ADS all independently. Uses higher sensitivity across the board.", sens:{"Cam Free":"~85","Cam Fire":"~82","ADS":"~95","3x":"~70","Sniper":"~60","Gyro":"High"}, emoji:"🔥" },
  HawksNest:{ region:"🇺🇸 USA", f:"4F", device:"iPhone",   color:C.blue,   style:"Mathematical, consistent, technical",              note:"Created the HawksNest formula. Free Look ×1.25=ADS, ×0.48=Sniper. Syncs all scopes to the same real-world movement speed.", sens:{"Cam Free":"~70","Cam Fire":"~70","ADS":"~88","3x":"~60","Sniper":"~34","Gyro":"Off"}, emoji:"📐" },
  Rated:    { region:"🇺🇸 USA", f:"4F", device:"Phone",    color:C.green,  style:"Aggressive SMG, fast TTK focused",                  note:"SMG-optimised sensitivity — high ADS for fast snap-to-targets at close range. Lower scope settings since rarely uses high zoom.", sens:{"Cam Free":"~80","Cam Fire":"~78","ADS":"~100","3x":"~65","Sniper":"~55","Gyro":"Off"}, emoji:"⚡" },
  Pxetry:   { region:"🇵🇭 PHL", f:"4-5F",device:"Phone",   color:C.purple, style:"Movement-focused, aggressive, slide-cancel king",   note:"Sensitivity tuned for slide-cancel and fast direction changes. Movement tech over pure aiming precision.", sens:{"Cam Free":"~78","Cam Fire":"~76","ADS":"~90","3x":"~62","Sniper":"~50","Gyro":"Off"}, emoji:"💨" },
};

function generateSens({ base = 70, playstyle, device, fingers }) {
  let free = base;
  if (playstyle === "aggressive") free += 12;
  if (playstyle === "sniper") free -= 12;
  if (device === "ipad") free -= 6;
  if (fingers >= 4) free += 5;
  return {
    camFree: Math.round(free),
    camFire: Math.round(free * 0.95),
    ads: Math.round(free * 1.25),
    redDot: Math.round(free * 1.2),
    x3: Math.round(free * 0.85),
    x4: Math.round(free * 0.80),
    x6: Math.round(free * 0.70),
    sniper: Math.round(free * 0.48),
  };
}

const SUGGESTIONS = [
  "What guns are meta right now?",
  "Build me a loadout for aggressive play",
  "Which finger layout should I use?",
  "Compare iFerg vs HawksNest settings",
  "Explain all sensitivity types",
  "Give me ranked tips to improve",
  "What pro settings should I turn on?",
  "Best sniper setup for ranked?",
];

// ── COMPONENTS ────────────────────────────────────────────────────────────────

function Tag({ label, color }) {
  const c = color || C.orange;
  return <span style={{fontSize:9,padding:"2px 8px",borderRadius:3,fontWeight:800,fontFamily:"monospace",letterSpacing:0.8,textTransform:"uppercase",color:c,background:c+"22",border:"1px solid "+c+"44",whiteSpace:"nowrap"}}>{label}</span>;
}

function YouTubeCard({ yt }) {
  if (!yt) return null;
  return (
    <a href={yt.url} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(255,0,0,0.08)",border:"1px solid rgba(255,0,0,0.3)",borderRadius:8,textDecoration:"none",marginTop:8}}>
      <div style={{fontSize:20,flexShrink:0}}>▶️</div>
      <div style={{flex:1}}>
        <div style={{fontSize:10,color:"#ff4444",fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:2}}>Watch on YouTube</div>
        <div style={{fontSize:13,color:C.white,fontWeight:600}}>{yt.title}</div>
      </div>
      <div style={{color:C.muted,fontSize:16,flexShrink:0}}>›</div>
    </a>
  );
}

function GunCard({ gun }) {
  const tc = GUN_TYPE_COLOR[gun.type] || C.text;
  const ti = GUN_TYPE_ICON[gun.type] || "🔫";
  const terc = TIER_COLOR[gun.tier] || C.muted;
  return (
    <div style={{background:C.panel,border:"1px solid "+terc+"44",borderRadius:10,padding:16,display:"flex",flexDirection:"column",gap:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{fontSize:28}}>{ti}</div>
        <div style={{width:28,height:28,borderRadius:6,background:terc+"22",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:terc,border:"1px solid "+terc+"44"}}>{gun.tier}</div>
      </div>
      <div>
        <div style={{fontWeight:800,color:C.white,fontSize:15}}>{gun.name}</div>
        <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
          <Tag label={gun.type} color={tc} />
          {gun.pick && <Tag label={gun.pick+" pick"} color={C.muted} />}
        </div>
      </div>
      <div style={{fontSize:11,color:C.text,lineHeight:1.6}}>{gun.why}</div>
      {gun.attachments && gun.attachments.filter(a=>a).length > 0 && (
        <div style={{borderTop:"1px solid "+C.border,paddingTop:8}}>
          <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Build</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
            {gun.attachments.filter(a=>a).map((a,i)=>(
              <span key={i} style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:C.surface,border:"1px solid "+C.border,color:C.text}}>{a}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProCard({ name }) {
  const p = PROS[name];
  if (!p) return null;
  return (
    <div style={{background:C.panel,border:"1px solid "+p.color+"33",borderRadius:10,padding:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <div style={{fontSize:28}}>{p.emoji}</div>
        <div>
          <div style={{fontWeight:900,color:p.color,fontSize:16}}>{name}</div>
          <div style={{display:"flex",gap:6,marginTop:3,flexWrap:"wrap"}}>
            <Tag label={p.region} color={p.color} />
            <Tag label={p.f} color={C.muted} />
            <Tag label={p.device} color={C.muted} />
          </div>
        </div>
      </div>
      <div style={{fontSize:12,color:C.text,lineHeight:1.6,padding:"8px 10px",background:C.surface,borderRadius:6,borderLeft:"3px solid "+p.color,marginBottom:10}}>{p.note}</div>
      <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Sensitivity</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
        {Object.entries(p.sens).map(([k,v])=>(
          <div key={k} style={{background:C.surface,borderRadius:6,padding:"6px 8px",textAlign:"center"}}>
            <div style={{fontSize:9,color:C.muted,marginBottom:2}}>{k}</div>
            <div style={{fontWeight:700,color:p.color,fontFamily:"monospace",fontSize:13}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{marginTop:8,fontSize:11,color:C.muted}}><span style={{color:C.text}}>Style:</span> {p.style}</div>
    </div>
  );
}

function HudCard({ hud }) {
  return (
    <div style={{background:C.panel,border:"1px solid "+C.border,borderRadius:10,padding:14}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
        <div style={{fontSize:26,fontWeight:900,color:hud.rc}}>{hud.f}F</div>
        <div>
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            <Tag label={hud.rank} color={hud.rc} />
            <span style={{fontSize:11,color:C.muted}}>{hud.device}</span>
          </div>
          <div style={{fontSize:12,color:C.text,marginTop:3}}>{hud.desc}</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
        <div style={{padding:"6px 8px",background:"rgba(0,230,118,0.08)",borderRadius:6,fontSize:11,color:C.green,borderLeft:"2px solid "+C.green}}>✓ {hud.pro}</div>
        <div style={{padding:"6px 8px",background:"rgba(255,68,68,0.08)",borderRadius:6,fontSize:11,color:C.red,borderLeft:"2px solid "+C.red}}>✗ {hud.con}</div>
      </div>
      <YouTubeCard yt={hud.yt} />
    </div>
  );
}

function SensTable({ table }) {
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
        <thead>
          <tr style={{borderBottom:"1px solid "+C.border}}>
            {["Setting","What it does","Range","Formula","iFerg","HawksNest"].map(h=>(
              <th key={h} style={{padding:"6px 8px",textAlign:"left",color:C.muted,textTransform:"uppercase",letterSpacing:0.7,fontWeight:700,whiteSpace:"nowrap"}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.map((row,i)=>(
            <tr key={i} style={{borderBottom:"1px solid "+C.border,background:i%2===0?"transparent":C.surface+"55"}}>
              <td style={{padding:"8px",fontWeight:600,color:C.white,whiteSpace:"nowrap"}}>{row.setting}</td>
              <td style={{padding:"8px",color:C.text,lineHeight:1.5,maxWidth:180}}>{row.what}</td>
              <td style={{padding:"8px",fontFamily:"monospace",color:C.orange,whiteSpace:"nowrap"}}>{row.range}</td>
              <td style={{padding:"8px",fontFamily:"monospace",color:C.purple,fontSize:10}}>{row.formula||"—"}</td>
              <td style={{padding:"8px",fontFamily:"monospace",color:C.orange}}>{row.iferg||"—"}</td>
              <td style={{padding:"8px",fontFamily:"monospace",color:C.blue}}>{row.hawks||"—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoadoutCard({ data }) {
  const tc = GUN_TYPE_COLOR[data.primary?.type] || C.orange;
  return (
    <div style={{display:"grid",gap:10}}>
      <div style={{background:C.panel,border:"1px solid "+C.orange+"44",borderRadius:10,padding:16}}>
        <div style={{fontSize:9,color:C.orange,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Primary Weapon</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div>
            <div style={{fontWeight:900,color:C.white,fontSize:20}}>{data.primary?.name}</div>
            <Tag label={data.primary?.type||""} color={tc} />
          </div>
          <div style={{fontSize:28}}>{GUN_TYPE_ICON[data.primary?.type]||"🔫"}</div>
        </div>
        <div style={{fontSize:12,color:C.text,lineHeight:1.6,padding:"8px 10px",background:C.surface,borderRadius:6,borderLeft:"3px solid "+C.orange,marginBottom:12}}>{data.primary?.why}</div>
        <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Gunsmith Build</div>
        {data.primary?.attachments && Object.entries(data.primary.attachments).map(([s,v])=>(
          v ? <div key={s} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+C.border}}>
            <span style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:0.7}}>{s}</span>
            <span style={{fontSize:12,fontWeight:600,color:C.white}}>{v}</span>
          </div> : null
        ))}
      </div>
      {data.secondary?.name && (
        <div style={{background:C.panel,border:"1px solid "+C.border,borderRadius:10,padding:14}}>
          <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Secondary</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:700,color:C.white,fontSize:14}}>{data.secondary.name}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{data.secondary.why}</div>
            </div>
            <Tag label={data.secondary.type||""} color={GUN_TYPE_COLOR[data.secondary.type]||C.muted} />
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={{background:C.panel,border:"1px solid "+C.border,borderRadius:10,padding:14}}>
          <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Perks</div>
          {data.perks && ["red","green","blue"].map(col=>(
            <div key={col} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:col,flexShrink:0}}/>
              <span style={{fontSize:12,fontWeight:600,color:C.white}}>{data.perks[col]}</span>
            </div>
          ))}
          {data.perks?.why && <div style={{fontSize:10,color:C.muted,marginTop:6,lineHeight:1.5}}>{data.perks.why}</div>}
        </div>
        <div style={{background:C.panel,border:"1px solid "+C.border,borderRadius:10,padding:14}}>
          <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Operator Skill</div>
          <div style={{fontWeight:700,color:C.white,fontSize:13,marginBottom:4}}>{data.operator}</div>
          <div style={{fontSize:11,color:C.muted,lineHeight:1.5}}>{data.operator_why}</div>
        </div>
      </div>
      {data.scorestreaks && data.scorestreaks.filter(s=>s).length > 0 && (
        <div style={{background:C.panel,border:"1px solid "+C.border,borderRadius:10,padding:14}}>
          <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Scorestreaks</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {data.scorestreaks.filter(s=>s).map((s,i)=>(
              <div key={i} style={{background:C.surface,border:"1px solid "+C.border,borderRadius:6,padding:"5px 10px",fontWeight:700,color:C.white,fontSize:12}}>{s}</div>
            ))}
          </div>
        </div>
      )}
      {data.tip && (
        <div style={{background:C.orangeDim,border:"1px solid "+C.orange+"33",borderRadius:8,padding:12}}>
          <div style={{fontSize:9,color:C.orange,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>⚡ Apply Next Game</div>
          <div style={{fontSize:12,color:C.white,lineHeight:1.6}}>{data.tip}</div>
        </div>
      )}
      {data.mistake && (
        <div style={{background:"rgba(255,68,68,0.07)",border:"1px solid rgba(255,68,68,0.2)",borderRadius:8,padding:12}}>
          <div style={{fontSize:9,color:C.red,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>⚠ Stop Doing This</div>
          <div style={{fontSize:12,color:C.white,lineHeight:1.6}}>{data.mistake}</div>
        </div>
      )}
    </div>
  );
}

function SensCalculator({ profile }) {
  const [base, setBase] = useState(70);
  const s = generateSens({ base, playstyle:profile.playstyle, device:profile.device, fingers:profile.fingers });
  const items = [
    { label:"Camera Free Look", val:s.camFree, color:C.orange },
    { label:"Camera Firing",    val:s.camFire, color:C.orange },
    { label:"ADS Firing",       val:s.ads,     color:C.blue },
    { label:"1x Red Dot",       val:s.redDot,  color:C.text },
    { label:"3x Scope",         val:s.x3,      color:C.text },
    { label:"4x Scope",         val:s.x4,      color:C.text },
    { label:"6x / 8x",          val:s.x6,      color:C.text },
    { label:"Sniper",           val:s.sniper,  color:C.purple },
  ];
  return (
    <div style={{background:C.panel,border:"1px solid "+C.border,borderRadius:10,padding:16}}>
      <div style={{fontSize:13,fontWeight:700,color:C.white,marginBottom:4}}>🎯 Sensitivity Calculator</div>
      <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Drag the slider to find your ideal base sensitivity</div>
      <div style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontSize:11,color:C.muted}}>Base Free Look</span>
          <span style={{fontWeight:800,color:C.orange,fontFamily:"monospace",fontSize:16}}>{base}</span>
        </div>
        <input type="range" min="40" max="120" value={base} onChange={e=>setBase(Number(e.target.value))}
          style={{width:"100%",accentColor:C.orange,cursor:"pointer"}} />
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginTop:4}}>
          <span>40 (slow)</span><span>120 (fast)</span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
        {items.map(item=>(
          <div key={item.label} style={{background:C.surface,borderRadius:8,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,color:C.muted}}>{item.label}</span>
            <span style={{fontWeight:800,color:item.color,fontFamily:"monospace",fontSize:16}}>{item.val}</span>
          </div>
        ))}
      </div>
      {profile.playstyle && (
        <div style={{marginTop:10,fontSize:11,color:C.muted,padding:"8px 10px",background:C.surface,borderRadius:6}}>
          Tuned for <strong style={{color:C.white}}>{profile.playstyle}</strong> playstyle
          {profile.device ? ` · ${profile.device}` : ""}
          {profile.fingers ? ` · ${profile.fingers}F layout` : ""}
        </div>
      )}
    </div>
  );
}

function StatsTracker({ stats, setStats }) {
  const kd = (stats.kills / Math.max(1, stats.deaths)).toFixed(2);
  const wr = stats.games > 0 ? ((stats.wins / stats.games) * 100).toFixed(0) : 0;
  const fields = [
    { label:"Games", key:"games" },
    { label:"Wins",  key:"wins" },
    { label:"Kills", key:"kills" },
    { label:"Deaths",key:"deaths" },
  ];
  return (
    <div style={{background:C.panel,border:"1px solid "+C.border,borderRadius:10,padding:16}}>
      <div style={{fontSize:13,fontWeight:700,color:C.white,marginBottom:12}}>📊 My Stats</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:12}}>
        {fields.map(f=>(
          <div key={f.key}>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>{f.label}</div>
            <input type="number" min="0" value={stats[f.key]} onChange={e=>setStats(prev=>({...prev,[f.key]:parseInt(e.target.value)||0}))}
              style={{width:"100%",background:C.surface,border:"1px solid "+C.border,borderRadius:6,padding:"6px 10px",color:C.white,fontSize:14,fontFamily:"monospace",outline:"none"}} />
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <div style={{background:C.surface,borderRadius:8,padding:"10px 12px",textAlign:"center"}}>
          <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>K/D Ratio</div>
          <div style={{fontSize:22,fontWeight:900,color:parseFloat(kd)>=1.5?C.green:parseFloat(kd)>=1?C.orange:C.red,fontFamily:"monospace"}}>{kd}</div>
        </div>
        <div style={{background:C.surface,borderRadius:8,padding:"10px 12px",textAlign:"center"}}>
          <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>Win Rate</div>
          <div style={{fontSize:22,fontWeight:900,color:parseInt(wr)>=50?C.green:C.orange,fontFamily:"monospace"}}>{wr}%</div>
        </div>
      </div>
    </div>
  );
}

function ProfileBadge({ profile }) {
  if (!Object.keys(profile).length) return null;
  return (
    <div style={{display:"flex",gap:6,flexWrap:"wrap",padding:"6px 0"}}>
      {profile.playstyle && <Tag label={profile.playstyle} color={C.orange} />}
      {profile.device && <Tag label={profile.device} color={C.blue} />}
      {profile.fingers && <Tag label={profile.fingers+"F"} color={C.green} />}
      {profile.rank && <Tag label={profile.rank} color={C.gold} />}
    </div>
  );
}

function renderMessage(msg) {
  const d = msg.data;
  if (!d) return <div style={{fontSize:13,color:C.text,lineHeight:1.85,whiteSpace:"pre-wrap"}}>{msg.text}</div>;
  switch(d.type) {
    case "chat":
      return <div style={{fontSize:13,color:C.text,lineHeight:1.85,whiteSpace:"pre-wrap"}}>{d.text}</div>;
    case "guns":
      return (
        <div>
          {d.text && <div style={{fontSize:13,color:C.text,lineHeight:1.7,marginBottom:14}}>{d.text}</div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
            {(d.guns||[]).map((g,i)=><GunCard key={i} gun={g} />)}
          </div>
        </div>
      );
    case "loadout":
      return (
        <div>
          {d.text && <div style={{fontSize:13,color:C.text,lineHeight:1.7,marginBottom:14}}>{d.text}</div>}
          <LoadoutCard data={d} />
        </div>
      );
    case "sensitivity":
      return (
        <div>
          {d.text && <div style={{fontSize:13,color:C.text,lineHeight:1.7,marginBottom:14}}>{d.text}</div>}
          {d.table && d.table.length > 0 && <SensTable table={d.table} />}
        </div>
      );
    case "pros":
      return (
        <div>
          {d.text && <div style={{fontSize:13,color:C.text,lineHeight:1.7,marginBottom:14}}>{d.text}</div>}
          <div style={{display:"grid",gap:10}}>
            {(d.players||[]).map((name,i)=><ProCard key={i} name={name} />)}
          </div>
        </div>
      );
    case "hud":
      return (
        <div>
          {d.text && <div style={{fontSize:13,color:C.text,lineHeight:1.7,marginBottom:14}}>{d.text}</div>}
          <div style={{display:"grid",gap:8}}>
            {(d.fingers||[]).map(f=>{
              const h = HUD_DATA.find(x=>x.f===f);
              return h ? <HudCard key={f} hud={h} /> : null;
            })}
          </div>
        </div>
      );
    case "scan":
      return <div style={{fontSize:13,color:C.text,lineHeight:1.9,whiteSpace:"pre-wrap"}}>{d.text}</div>;
    case "tips":
      return (
        <div>
          <div style={{fontSize:13,color:C.text,lineHeight:1.85,whiteSpace:"pre-wrap",marginBottom:d.youtube?8:0}}>{d.text}</div>
          {d.youtube && <YouTubeCard yt={d.youtube} />}
        </div>
      );
    default:
      return <div style={{fontSize:13,color:C.text,lineHeight:1.85,whiteSpace:"pre-wrap"}}>{d.text||""}</div>;
  }
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────

export default function CODCoach() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({});
  const [sideTab, setSideTab] = useState("sens");
  const [stats, setStats] = useState({ games:0, wins:0, kills:0, deaths:0 });
  const bottomRef = useRef(null);
  const textRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages, loading]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("codcoach_stats");
      if (saved) setStats(JSON.parse(saved));
      const savedProfile = localStorage.getItem("codcoach_profile");
      if (savedProfile) setProfile(JSON.parse(savedProfile));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("codcoach_stats", JSON.stringify(stats)); } catch {}
  }, [stats]);

  useEffect(() => {
    try { localStorage.setItem("codcoach_profile", JSON.stringify(profile)); } catch {}
  }, [profile]);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(f => new Promise(res => {
      const r = new FileReader();
      r.onload = () => res({name:f.name, data:r.result.split(",")[1], mime:f.type});
      r.readAsDataURL(f);
    }));
    Promise.all(readers).then(imgs => {
      setImages(prev => [...prev, ...imgs].slice(0,4));
      if (!input) setInput("Here are my settings screenshots, please analyse them");
      textRef.current?.focus();
    });
    e.target.value = "";
  };

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim() && images.length === 0) return;
    setInput("");
    if (textRef.current) { textRef.current.style.height = "42px"; }

    const pendingImgs = [...images];
    setImages([]);

    const detected = detectProfile(msg);
    if (Object.keys(detected).length > 0) {
      setProfile(prev => ({ ...prev, ...detected }));
    }

    setMessages(prev => [...prev, { role:"user", text:msg, imgs:pendingImgs }]);

    const apiContent = pendingImgs.length > 0
      ? [...pendingImgs.map(img=>({type:"image",source:{type:"base64",media_type:img.mime,data:img.data}})), {type:"text",text:msg||"Analyse these settings"}]
      : msg;

    const newHistory = [...history, { role:"user", content:apiContent }];
    setHistory(newHistory);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ messages: newHistory, profile }),
      });
      const data = await res.json();
      if (data.detectedProfile && Object.keys(data.detectedProfile).length > 0) {
        setProfile(prev => ({ ...prev, ...data.detectedProfile }));
      }
      setMessages(prev => [...prev, { role:"assistant", text:data.text||"", data }]);
      setHistory(prev => [...prev, { role:"assistant", content:data.text||"" }]);
    } catch {
      setMessages(prev => [...prev, { role:"assistant", text:"Something went wrong. Check your connection.", data:null }]);
    }
    setLoading(false);
  };

  function detectProfile(input) {
    const text = input.toLowerCase();
    const updates = {};
    if (text.includes("aggressive")) updates.playstyle = "aggressive";
    if (text.includes("sniper")) updates.playstyle = "sniper";
    if (text.includes("passive")) updates.playstyle = "passive";
    if (text.includes("ipad")) updates.device = "ipad";
    if (text.includes("phone")) updates.device = "phone";
    if (text.includes("2 finger")) updates.fingers = 2;
    if (text.includes("3 finger")) updates.fingers = 3;
    if (text.includes("4 finger")) updates.fingers = 4;
    if (text.includes("5 finger")) updates.fingers = 5;
    if (text.includes("6 finger")) updates.fingers = 6;
    if (text.includes("legendary")) updates.rank = "legendary";
    if (text.includes("grand master")) updates.rank = "grandmaster";
    return updates;
  }

  const isEmpty = messages.length === 0;

  return (
    <>
      <Head>
        <title>CODCoach — Mobile Multiplayer AI</title>
        <meta name="description" content="AI-powered COD Mobile coach. Get meta loadouts, sensitivity advice, pro settings, and HUD help." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Inter',system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
        <style>{`*{box-sizing:border-box;margin:0;padding:0;}button{cursor:pointer;transition:all 0.15s;}textarea,input{font-family:inherit;}@keyframes spin{0%,100%{transform:scale(0.8);opacity:0.4}50%{transform:scale(1.2);opacity:1}}@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}.msg{animation:fadeUp 0.2s ease forwards}a{text-decoration:none}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}`}</style>

        {/* HEADER */}
        <div style={{background:C.surface,borderBottom:"1px solid "+C.border,padding:"0 16px",flexShrink:0,position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10,height:52,maxWidth:1100,margin:"0 auto"}}>
            <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#ff6b00,#ff2200)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🎮</div>
            <div>
              <div style={{fontWeight:900,fontSize:15,color:C.white}}>COD<span style={{color:C.orange}}>Coach</span></div>
              <div style={{fontSize:10,color:C.muted}}>Mobile · Multiplayer · AI</div>
            </div>
            <div style={{flex:1}} />
            <ProfileBadge profile={profile} />
            <div style={{fontSize:10,padding:"3px 10px",borderRadius:4,background:"rgba(0,230,118,0.1)",color:C.green,border:"1px solid rgba(0,230,118,0.3)",fontWeight:700,letterSpacing:0.8,flexShrink:0}}>● LIVE</div>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div style={{flex:1,display:"flex",maxWidth:1100,margin:"0 auto",width:"100%",overflow:"hidden"}}>

          {/* CHAT */}
          <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
            <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
              {isEmpty && (
                <div style={{textAlign:"center",padding:"40px 0 20px"}} className="msg">
                  <div style={{fontSize:52,marginBottom:12}}>🎮</div>
                  <div style={{fontWeight:800,color:C.white,fontSize:22,marginBottom:6}}>CODCoach</div>
                  <div style={{fontSize:13,color:C.muted,marginBottom:28,lineHeight:1.7}}>Ask anything — meta, loadouts, sensitivity, pro setups, HUD.<br/>Tell me your playstyle and I'll personalise everything for you.</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,maxWidth:520,margin:"0 auto"}}>
                    {SUGGESTIONS.map((s,i)=>(
                      <button key={i} onClick={()=>send(s)} style={{background:C.panel,border:"1px solid "+C.border,borderRadius:8,padding:"11px 12px",textAlign:"left",fontSize:12,color:C.text,lineHeight:1.4}}
                        onMouseEnter={e=>e.currentTarget.style.borderColor=C.orange}
                        onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m,i)=>(
                <div key={i} className="msg" style={{marginBottom:20,display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start"}}>
                  {m.role==="user" ? (
                    <div style={{maxWidth:"78%"}}>
                      {m.imgs && m.imgs.length > 0 && (
                        <div style={{display:"flex",gap:6,marginBottom:6,justifyContent:"flex-end",flexWrap:"wrap"}}>
                          {m.imgs.map((img,j)=>(
                            <img key={j} src={"data:"+img.mime+";base64,"+img.data} alt="" style={{height:70,width:52,objectFit:"cover",borderRadius:6,border:"1px solid "+C.border}} />
                          ))}
                        </div>
                      )}
                      {m.text && <div style={{background:C.orange,color:"#000",borderRadius:"14px 14px 4px 14px",padding:"10px 14px",fontSize:13,fontWeight:500,lineHeight:1.6}}>{m.text}</div>}
                    </div>
                  ) : (
                    <div style={{maxWidth:"94%",width:"100%"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                        <div style={{width:22,height:22,borderRadius:6,background:"linear-gradient(135deg,#ff6b00,#ff2200)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🎮</div>
                        <span style={{fontSize:11,color:C.muted,fontWeight:600}}>CODCoach</span>
                      </div>
                      <div style={{background:C.surface,border:"1px solid "+C.border,borderRadius:"4px 14px 14px 14px",padding:"14px 16px"}}>
                        {renderMessage(m)}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:20}}>
                  <div style={{width:22,height:22,borderRadius:6,background:"linear-gradient(135deg,#ff6b00,#ff2200)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>🎮</div>
                  <div style={{background:C.surface,border:"1px solid "+C.border,borderRadius:"4px 14px 14px 14px",padding:"14px 16px",display:"flex",gap:5,alignItems:"center"}}>
                    {[0,1,2].map(i=>(
                      <div key={i} style={{width:7,height:7,borderRadius:"50%",background:C.orange,animation:`spin 1s ease-in-out ${i*0.2}s infinite`}}/>
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* IMAGE PREVIEWS */}
            {images.length > 0 && (
              <div style={{padding:"0 16px 8px"}}>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {images.map((img,i)=>(
                    <div key={i} style={{position:"relative"}}>
                      <img src={"data:"+img.mime+";base64,"+img.data} alt="" style={{height:56,width:42,objectFit:"cover",borderRadius:6,border:"1px solid "+C.border}} />
                      <button onClick={()=>setImages(prev=>prev.filter((_,j)=>j!==i))} style={{position:"absolute",top:-5,right:-5,width:18,height:18,borderRadius:"50%",background:C.red,border:"2px solid "+C.bg,color:"#fff",fontSize:10,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INPUT BAR */}
            <div style={{background:C.surface,borderTop:"1px solid "+C.border,padding:"12px 16px",flexShrink:0}}>
              <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                <label style={{flexShrink:0,cursor:"pointer"}}>
                  <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} style={{display:"none"}} />
                  <div style={{background:C.panel,border:"1px solid "+C.border,borderRadius:10,width:42,height:42,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:C.muted}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=C.orange}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>📷</div>
                </label>
                <textarea ref={textRef} value={input}
                  onChange={e=>{setInput(e.target.value);e.target.style.height="42px";e.target.style.height=Math.min(e.target.scrollHeight,120)+"px";}}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
                  placeholder="Ask anything — meta, loadouts, sensitivity, HUD, upload screenshots..."
                  rows={1}
                  style={{flex:1,background:C.panel,border:"1px solid "+C.border,borderRadius:10,padding:"10px 14px",color:C.white,fontSize:13,lineHeight:1.5,resize:"none",outline:"none",height:42,maxHeight:120,overflowY:"auto"}}
                  onFocus={e=>e.target.style.borderColor=C.orange}
                  onBlur={e=>e.target.style.borderColor=C.border}
                />
                <button onClick={()=>send()} disabled={loading||(!input.trim()&&images.length===0)}
                  style={{background:loading||(!input.trim()&&images.length===0)?C.panel:C.orange,border:"none",borderRadius:10,width:42,height:42,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,color:loading||(!input.trim()&&images.length===0)?C.muted:"#000",fontWeight:900}}>↑</button>
              </div>
              <div style={{fontSize:10,color:C.muted,textAlign:"center",marginTop:5}}>📷 Upload settings screenshots for instant audit · Enter to send</div>
            </div>
          </div>

          {/* SIDEBAR — desktop only */}
          <div style={{width:300,borderLeft:"1px solid "+C.border,display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto",padding:16,gap:12}}>
            <div style={{display:"flex",gap:6}}>
              {[["sens","🎯 Sens"],["stats","📊 Stats"]].map(([id,label])=>(
                <button key={id} onClick={()=>setSideTab(id)} style={{flex:1,background:sideTab===id?C.orangeDim:C.panel,border:"1px solid "+(sideTab===id?C.orange:C.border),borderRadius:6,padding:"7px 0",fontSize:12,fontWeight:sideTab===id?700:400,color:sideTab===id?C.orange:C.muted}}>{label}</button>
              ))}
            </div>
            {sideTab==="sens" && <SensCalculator profile={profile} />}
            {sideTab==="stats" && <StatsTracker stats={stats} setStats={setStats} />}
          </div>
        </div>
      </div>
    </>
  );
}
