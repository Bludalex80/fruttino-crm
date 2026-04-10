import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yqnfzmsotnkjmwxfonfl.supabase.co";
const SUPABASE_KEY = "sb_publishable_uzB1UMsOAvO76GX84c581w_nChp0Lp1";
const TENANT_ID   = "a0cc5f9d-9326-42cf-a7a4-9b555ca5babc";
const API         = `${SUPABASE_URL}/functions/v1`;
const supabase    = createClient(SUPABASE_URL, SUPABASE_KEY);
const hdrs = { "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

const apiFetch = async (path, opts = {}) => {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(`${API}${path}`, { ...opts, signal: ctrl.signal, headers: { ...hdrs, ...opts.headers } });
    clearTimeout(t);
    const text = await res.text();
    return text ? JSON.parse(text) : { success: false, error: "Pusty odpowiedź" };
  } catch (e) {
    return { success: false, error: e.name === "AbortError" ? "Timeout" : e.message };
  }
};

const C = {
  navy:"#1a2e4a",navyLight:"#233a5c",accent:"#2563aa",bg:"#eef0f3",surface:"#ffffff",
  alt:"#f4f5f7",border:"#d8dce3",borderLight:"#e8eaed",text:"#1a1f2e",mid:"#4a5568",soft:"#8492a6",
  green:"#16a34a",greenBg:"#dcfce7",amber:"#d97706",amberBg:"#fef3c7",
  blue:"#2563eb",blueBg:"#dbeafe",purple:"#7c3aed",purpleBg:"#ede9fe",
  red:"#dc2626",redBg:"#fee2e2",orange:"#ea580c",orangeBg:"#fff7ed",
};
const STATUS = {
  new:        { label:"Nowe",         dot:C.amber,  bg:C.amberBg,  text:"#92400e" },
  processing: { label:"W realizacji", dot:C.blue,   bg:C.blueBg,   text:"#1e40af" },
  shipped:    { label:"Wysłane",      dot:C.purple, bg:C.purpleBg, text:"#5b21b6" },
  delivered:  { label:"Dostarczone",  dot:C.green,  bg:C.greenBg,  text:"#065f46" },
  cancelled:  { label:"Anulowane",    dot:C.red,    bg:C.redBg,    text:"#991b1b" },
};
const SOURCE = {
  allegro:     { color:C.orange, bg:C.orangeBg },
  woocommerce: { color:C.blue,   bg:C.blueBg   },
};

const Pill = ({ label, color, bg, textColor, dot }) => (
  <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:bg,color:textColor,fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:100,whiteSpace:"nowrap" }}>
    {dot && <span style={{ width:5,height:5,borderRadius:"50%",background:color,display:"block" }}/>}
    {label}
  </span>
);
const Spinner = ({ size=32 }) => (
  <div style={{ display:"flex",alignItems:"center",justifyContent:"center",padding:size }}>
    <div style={{ width:size,height:size,border:`3px solid ${C.border}`,borderTopColor:C.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);
const Empty = ({ text }) => <div style={{ textAlign:"center",padding:"48px 20px",color:C.soft,fontSize:14 }}>{text}</div>;
const Card = ({ children, style={} }) => <div style={{ background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,boxShadow:"0 1px 3px rgba(0,0,0,0.05)",...style }}>{children}</div>;

const AuthScreen = () => {
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const login = async () => {
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithOAuth({ provider:"google", options:{ redirectTo: window.location.origin } });
    if (error) { setError(error.message); setLoading(false); }
  };
  return (
    <div style={{ minHeight:"100vh",background:`linear-gradient(135deg,${C.navy} 0%,#2d4e7e 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
      <div style={{ background:C.surface,borderRadius:20,padding:"48px 40px",width:"100%",maxWidth:420,boxShadow:"0 24px 80px rgba(0,0,0,0.3)",textAlign:"center" }}>
        <div style={{ fontSize:64,marginBottom:20 }}>🍇</div>
        <h1 style={{ fontSize:28,fontWeight:800,color:C.navy,marginBottom:8 }}>Fruttino CRM</h1>
        <p style={{ fontSize:15,color:C.soft,marginBottom:36 }}>Panel zarządzania sprzedażą wielokanałową</p>
        <button onClick={login} disabled={loading} style={{ width:"100%",padding:"15px 20px",borderRadius:12,border:`1px solid ${C.border}`,background:C.surface,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:12,fontSize:15,fontWeight:600,color:C.text,fontFamily:"inherit",opacity:loading?0.7:1 }}>
          <svg width="22" height="22" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          {loading ? "Logowanie..." : "Zaloguj się przez Google"}
        </button>
        {error && <div style={{ marginTop:16,padding:"10px 14px",background:C.redBg,borderRadius:10,fontSize:13,color:C.red }}>⚠ {error}</div>}
        <p style={{ fontSize:11,color:C.soft,marginTop:28,lineHeight:1.6 }}>Dostęp tylko dla autoryzowanych użytkowników.</p>
      </div>
    </div>
  );
};

const Sidebar = ({ tab, setTab, stats, user, onLogout }) => {
  const nav = [
    { id:"dashboard", icon:"⊞",  label:"Dashboard"   },
    { id:"orders",    icon:"📦",  label:"Zamówienia",  badge:stats.newOrders },
    { id:"products",  icon:"🌿",  label:"Produkty",    badge:stats.lowStock>0?stats.lowStock:null },
    { id:"channels",  icon:"🔗",  label:"Kanały"       },
    { id:"analytics", icon:"📊",  label:"Analityka"    },
  ];
  return (
    <aside style={{ width:220,background:"#1a2e4a",minHeight:"100vh",display:"flex",flexDirection:"column",position:"fixed",left:0,top:0,bottom:0,zIndex:50 }}>
      <div style={{ padding:"24px 20px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>🍇</div>
          <div>
            <div style={{ fontSize:15,fontWeight:700,color:"#fff",lineHeight:1 }}>Fruttino</div>
            <div style={{ fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:1.5,marginTop:2 }}>CRM PANEL</div>
          </div>
        </div>
      </div>
      <nav style={{ padding:"12px 8px",flex:1 }}>
        {nav.map(item => (
          <button key={item.id} onClick={()=>setTab(item.id)} style={{ width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,border:"none",background:tab===item.id?"rgba(255,255,255,0.12)":"transparent",borderLeft:tab===item.id?"3px solid #60a5fa":"3px solid transparent",color:tab===item.id?"#fff":"rgba(255,255,255,0.5)",fontSize:13,fontWeight:tab===item.id?600:400,cursor:"pointer",fontFamily:"inherit",marginBottom:2,textAlign:"left" }}>
            <span style={{ fontSize:16,width:20,textAlign:"center" }}>{item.icon}</span>
            <span style={{ flex:1 }}>{item.label}</span>
            {item.badge>0 && <span style={{ background:"#ef4444",color:"#fff",borderRadius:100,fontSize:10,fontWeight:700,padding:"1px 6px" }}>{item.badge}</span>}
          </button>
        ))}
      </nav>
      <div style={{ padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:1,marginBottom:8 }}>POŁĄCZENIA</div>
        {[{dot:"#ea580c",label:"Allegro"},{dot:"#4ade80",label:"WooCommerce"}].map(c=>(
          <div key={c.label} style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:4 }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:c.dot,display:"block" }}/>{c.label}
          </div>
        ))}
      </div>
      <div style={{ padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
          <div style={{ width:32,height:32,borderRadius:"50%",overflow:"hidden",background:"rgba(255,255,255,0.15)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
            {user?.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} style={{ width:32,height:32,objectFit:"cover" }}/> : <span style={{ fontSize:12,fontWeight:700,color:"#fff" }}>{user?.email?.slice(0,2).toUpperCase()}</span>}
          </div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:12,fontWeight:600,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.user_metadata?.full_name||"Użytkownik"}</div>
            <div style={{ fontSize:10,color:"rgba(255,255,255,0.4)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ width:"100%",padding:"7px",borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(255,255,255,0.6)",fontSize:12,cursor:"pointer",fontFamily:"inherit" }}>Wyloguj się</button>
      </div>
    </aside>
  );
};

const MobileTopBar = ({ tab, setTab, stats, user, onLogout }) => {
  const tabs = [
    { id:"dashboard",icon:"⊞",label:"Home",   badge:null },
    { id:"orders",   icon:"📦",label:"Zamów.", badge:stats.newOrders },
    { id:"products", icon:"🌿",label:"Prod.",  badge:stats.lowStock>0?stats.lowStock:null },
    { id:"channels", icon:"🔗",label:"Kanały", badge:null },
    { id:"analytics",icon:"📊",label:"Stats",  badge:null },
  ];
  return (
    <div style={{ background:"#1a2e4a",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px 8px" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:22 }}>🍇</span>
          <span style={{ fontSize:15,fontWeight:700,color:"#fff" }}>Fruttino CRM</span>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ width:28,height:28,borderRadius:"50%",overflow:"hidden",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center" }}>
            {user?.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} style={{ width:28,height:28,objectFit:"cover" }}/> : <span style={{ fontSize:10,fontWeight:700,color:"#fff" }}>{user?.email?.slice(0,2).toUpperCase()}</span>}
          </div>
          <button onClick={onLogout} style={{ background:"rgba(255,255,255,0.1)",border:"none",borderRadius:6,padding:"4px 8px",fontSize:11,color:"rgba(255,255,255,0.7)",cursor:"pointer",fontFamily:"inherit" }}>↩</button>
        </div>
      </div>
      <div style={{ display:"flex",borderTop:"1px solid rgba(255,255,255,0.08)" }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1,padding:"8px 2px",background:"transparent",border:"none",borderBottom:tab===t.id?"2px solid #60a5fa":"2px solid transparent",color:tab===t.id?"#fff":"rgba(255,255,255,0.45)",fontSize:10,fontWeight:tab===t.id?600:400,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:2 }}>
            <span style={{ fontSize:14 }}>{t.icon}</span>
            <span>{t.label}</span>
            {t.badge>0 && <span style={{ background:"#ef4444",color:"#fff",borderRadius:100,fontSize:8,fontWeight:700,padding:"0 4px" }}>{t.badge}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

const StatCards = ({ stats, isMobile }) => {
  const items = [
    { label:"Nowe zamówienia",  value:stats.newOrders,     color:"#d97706", icon:"🔔" },
    { label:"Wszystkie zamów.", value:stats.totalOrders,   color:"#2563aa", icon:"📦" },
    { label:"Produkty",         value:stats.totalProducts, color:"#16a34a", icon:"🌿" },
    { label:"Niski stan",       value:stats.lowStock,      color:"#dc2626", icon:"⚠️" },
  ];
  return (
    <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:isMobile?8:16,marginBottom:isMobile?0:24 }}>
      {items.map(s=>(
        <div key={s.label} style={{ background:"#fff",borderRadius:isMobile?10:12,border:"1px solid #d8dce3",padding:isMobile?"11px 8px":"20px",borderTop:`3px solid ${s.color}`,boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
          {!isMobile && <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}><span style={{ fontSize:22 }}>{s.icon}</span></div>}
          <div style={{ fontSize:isMobile?22:32,fontWeight:800,color:s.color,fontFamily:"monospace",lineHeight:1 }}>{s.value}</div>
          <div style={{ fontSize:isMobile?10:13,color:"#8492a6",marginTop:isMobile?3:6,fontWeight:500 }}>{isMobile?s.label.split(" ")[0]:s.label}</div>
        </div>
      ))}
    </div>
  );
};

const DashboardTab = ({ stats }) => (
  <div>
    <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:20 }}>
      <Card style={{ padding:20 }}>
        <div style={{ fontSize:13,fontWeight:700,color:"#8492a6",letterSpacing:1,marginBottom:16 }}>OSTATNIA AKTYWNOŚĆ</div>
        {[
          { icon:"📦", text:"Oczekiwanie na pierwsze zamówienie z Allegro", time:"Skonfiguruj integrację", color:"#ea580c" },
          { icon:"🌿", text:"Dodano produkt: Morele suszone 500g", time:"Dziś", color:"#16a34a" },
          { icon:"🔗", text:"6 kanałów sprzedaży skonfigurowanych", time:"Gotowe", color:"#2563aa" },
          { icon:"✅", text:"CRM Panel uruchomiony pomyślnie", time:"Dziś", color:"#16a34a" },
        ].map((a,i)=>(
          <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:12,paddingBottom:i<3?14:0,marginBottom:i<3?14:0,borderBottom:i<3?"1px solid #e8eaed":"none" }}>
            <div style={{ width:36,height:36,borderRadius:10,background:`${a.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{a.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13,fontWeight:500,color:"#1a1f2e",marginBottom:2 }}>{a.text}</div>
              <div style={{ fontSize:11,color:"#8492a6" }}>{a.time}</div>
            </div>
          </div>
        ))}
      </Card>
      <Card style={{ padding:20 }}>
        <div style={{ fontSize:13,fontWeight:700,color:"#8492a6",letterSpacing:1,marginBottom:16 }}>STATUSY ZAMÓWIEŃ</div>
        {Object.entries(STATUS).map(([key,cfg])=>(
          <div key={key} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
            <span style={{ width:8,height:8,borderRadius:"50%",background:cfg.dot,display:"block",flexShrink:0 }}/>
            <span style={{ flex:1,fontSize:13,color:"#1a1f2e" }}>{cfg.label}</span>
            <span style={{ fontSize:14,fontWeight:700,color:cfg.dot,fontFamily:"monospace" }}>{stats.byStatus?.[key]||0}</span>
          </div>
        ))}
        <div style={{ marginTop:16,paddingTop:16,borderTop:"1px solid #e8eaed",display:"flex",justifyContent:"space-between",fontSize:13 }}>
          <span style={{ color:"#8492a6" }}>Razem</span>
          <span style={{ fontWeight:700,color:"#1a1f2e" }}>{stats.totalOrders}</span>
        </div>
      </Card>
    </div>
  </div>
);
