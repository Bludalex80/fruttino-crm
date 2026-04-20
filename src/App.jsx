import { useState, useEffect, useCallback, useRef } from "react";
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

// ── THEME TOKENS ───────────────────────────────────────────
const THEMES = {
  light: {
    navy:"#1a2e4a", accent:"#2563aa", bg:"#eef0f3", surface:"#ffffff",
    alt:"#f4f5f7", border:"#d8dce3", borderLight:"#e8eaed",
    text:"#1a1f2e", mid:"#4a5568", soft:"#8492a6",
    green:"#16a34a", greenBg:"#dcfce7", amber:"#d97706", amberBg:"#fef3c7",
    blue:"#2563eb", blueBg:"#dbeafe", purple:"#7c3aed", purpleBg:"#ede9fe",
    red:"#dc2626", redBg:"#fee2e2", orange:"#ea580c", orangeBg:"#fff7ed",
    sidebarBg:"#1a2e4a", headerBg:"#ffffff",
  },
  dark: {
    navy:"#0f1923", accent:"#3b82f6", bg:"#111827", surface:"#1f2937",
    alt:"#273142", border:"#374151", borderLight:"#2d3748",
    text:"#f9fafb", mid:"#d1d5db", soft:"#9ca3af",
    green:"#34d399", greenBg:"#064e3b", amber:"#fbbf24", amberBg:"#451a03",
    blue:"#60a5fa", blueBg:"#1e3a5f", purple:"#a78bfa", purpleBg:"#2e1065",
    red:"#f87171", redBg:"#450a0a", orange:"#fb923c", orangeBg:"#431407",
    sidebarBg:"#0f1923", headerBg:"#1f2937",
  },
};

const STATUS_CFG = {
  new:        { label:"Nowe",         dot:"#d97706", bg:"#fef3c7", text:"#92400e" },
  processing: { label:"W realizacji", dot:"#2563eb", bg:"#dbeafe", text:"#1e40af" },
  shipped:    { label:"Wysłane",      dot:"#7c3aed", bg:"#ede9fe", text:"#5b21b6" },
  delivered:  { label:"Dostarczone",  dot:"#16a34a", bg:"#dcfce7", text:"#065f46" },
  cancelled:  { label:"Anulowane",    dot:"#dc2626", bg:"#fee2e2", text:"#991b1b" },
};
const SOURCE = {
  allegro:     { color:"#ea580c", bg:"#fff7ed" },
  woocommerce: { color:"#2563eb", bg:"#dbeafe" },
};

const DELIVERY_STATUS = {
  pending:   { label:"Oczekiwanie", dot:"#d97706", bg:"#fef3c7", text:"#92400e" },
  transit:   { label:"W drodze",    dot:"#2563eb", bg:"#dbeafe", text:"#1e40af" },
  delivered: { label:"Dostarczone", dot:"#16a34a", bg:"#dcfce7", text:"#065f46" },
  complaint: { label:"Reklamacja",  dot:"#dc2626", bg:"#fee2e2", text:"#991b1b" },
};
const COUNTRY_FLAGS = { TR:"🇹🇷", IR:"🇮🇷", UZ:"🇺🇿", PL:"🇵🇱", DE:"🇩🇪", CN:"🇨🇳", IN:"🇮🇳" };
const MOCK_DELIVERIES = [
  { id:"DEL-001", supplier:"Importex Sp. z o.o.", country:"TR", products:[{name:"Morele suszone 500g",qty_expected:500,qty_received:0,ean:"5901234567890"},{name:"Figi suszone 250g",qty_expected:200,qty_received:0,ean:"5901234567891"}], tracking:"PC123456789PL", carrier:"DHL", amount:4850.00, status:"transit", created_at:"2026-04-18T10:00:00Z", updated_at:"2026-04-19T09:00:00Z" },
  { id:"DEL-002", supplier:"DryFruits PL", country:"IR", products:[{name:"Pistacje solone 1kg",qty_expected:100,qty_received:97,ean:"5901234567892"}], tracking:"PC987654321PL", carrier:"InPost", amount:2200.00, status:"delivered", created_at:"2026-04-10T08:00:00Z", updated_at:"2026-04-15T14:00:00Z" },
  { id:"DEL-003", supplier:"Bakaliowe.pl", country:"UZ", products:[{name:"Rodzynki sułtańskie 500g",qty_expected:300,qty_received:0,ean:"5901234567893"},{name:"Daktyle Medjool 1kg",qty_expected:150,qty_received:0,ean:"5901234567894"}], tracking:null, carrier:null, amount:1900.00, status:"pending", created_at:"2026-04-20T09:00:00Z", updated_at:"2026-04-20T09:00:00Z" },
];

// ── SHARED ─────────────────────────────────────────────────
const Pill = ({ label, color, bg, textColor, dot }) => (
  <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:bg,color:textColor,fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:100,whiteSpace:"nowrap" }}>
    {dot && <span style={{ width:5,height:5,borderRadius:"50%",background:color,display:"block" }}/>}
    {label}
  </span>
);
const Spinner = ({ size=32, C }) => (
  <div style={{ display:"flex",alignItems:"center",justifyContent:"center",padding:size }}>
    <div style={{ width:size,height:size,border:`3px solid ${C.border}`,borderTopColor:C.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);
const Empty = ({ text, C }) => <div style={{ textAlign:"center",padding:"48px 20px",color:C.soft,fontSize:14 }}>{text}</div>;
const Card = ({ children, style={}, C }) => <div style={{ background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,boxShadow:"0 1px 3px rgba(0,0,0,0.05)",...style }}>{children}</div>;
const ComingSoon = ({ title, C }) => (
  <div>
    <h2 style={{ fontSize:20,fontWeight:700,color:C.text,marginBottom:20 }}>{title}</h2>
    <Card C={C} style={{ padding:40,textAlign:"center" }}>
      <div style={{ fontSize:40,marginBottom:16 }}>🚧</div>
      <div style={{ fontSize:16,fontWeight:600,color:C.text,marginBottom:8 }}>W przygotowaniu</div>
      <div style={{ fontSize:14,color:C.soft }}>Ta funkcja zostanie dodana wkrótce.</div>
    </Card>
  </div>
);

const Modal = ({ title, onClose, children, width=520, C }) => (
  <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }} onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{ background:C.surface,borderRadius:16,width:"100%",maxWidth:width,boxShadow:"0 24px 80px rgba(0,0,0,0.4)",maxHeight:"92vh",overflow:"auto",border:`1px solid ${C.border}` }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 24px",borderBottom:`1px solid ${C.border}` }}>
        <h3 style={{ fontSize:17,fontWeight:700,color:C.text }}>{title}</h3>
        <button onClick={onClose} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,cursor:"pointer",fontSize:16,color:C.mid,display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
      </div>
      <div style={{ padding:24 }}>{children}</div>
    </div>
  </div>
);

// ── AUTH ───────────────────────────────────────────────────
const AuthScreen = () => {
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const login = async () => {
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithOAuth({ provider:"google", options:{ redirectTo: window.location.origin } });
    if (error) { setError(error.message); setLoading(false); }
  };
  const C = THEMES.light;
  return (
    <div style={{ minHeight:"100vh",background:`linear-gradient(135deg,${C.navy} 0%,#2d4e7e 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
      <div style={{ background:C.surface,borderRadius:20,padding:"48px 40px",width:"100%",maxWidth:420,boxShadow:"0 24px 80px rgba(0,0,0,0.3)",textAlign:"center" }}>
        <div style={{ fontSize:64,marginBottom:20 }}>🍇</div>
        <h1 style={{ fontSize:28,fontWeight:800,color:C.navy,marginBottom:8 }}>Fruttino CRM</h1>
        <p style={{ fontSize:15,color:C.soft,marginBottom:36 }}>Panel zarządzania sprzedażą wielokanałową</p>
        <button onClick={login} disabled={loading} style={{ width:"100%",padding:"15px 20px",borderRadius:12,border:`1px solid ${C.border}`,background:C.surface,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:12,fontSize:15,fontWeight:600,color:C.text,fontFamily:"inherit",opacity:loading?0.7:1 }}>
          <svg width="22" height="22" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
          {loading ? "Logowanie..." : "Zaloguj się przez Google"}
        </button>
        {error && <div style={{ marginTop:16,padding:"10px 14px",background:"#fee2e2",borderRadius:10,fontSize:13,color:"#dc2626" }}>⚠ {error}</div>}
      </div>
    </div>
  );
};

// ── PROFILE MENU ───────────────────────────────────────────
const ProfileMenu = ({ user, onLogout, theme, setTheme, C }) => {
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{ const h=(e)=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); }; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);
  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button onClick={()=>setOpen(!open)} style={{ width:34,height:34,borderRadius:"50%",overflow:"hidden",border:"2px solid rgba(255,255,255,0.25)",cursor:"pointer",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",padding:0 }}>
        {user?.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} style={{ width:34,height:34,objectFit:"cover" }}/> : <span style={{ fontSize:12,fontWeight:700,color:"#fff" }}>{user?.email?.slice(0,2).toUpperCase()}</span>}
      </button>
      {open && (
        <div style={{ position:"absolute",right:0,top:42,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.2)",minWidth:230,zIndex:200 }}>
          <div style={{ padding:"12px 16px",borderBottom:`1px solid ${C.border}`,background:C.alt,borderRadius:"12px 12px 0 0" }}>
            <div style={{ fontSize:13,fontWeight:600,color:C.text }}>{user?.user_metadata?.full_name||"Użytkownik"}</div>
            <div style={{ fontSize:11,color:C.soft }}>{user?.email}</div>
          </div>
          {[{icon:"👤",label:"Moje konto"},{icon:"👥",label:"Profile pracowników"},{icon:"💳",label:"Abonament i płatności"}].map(item=>(
            <button key={item.label} style={{ width:"100%",padding:"10px 16px",border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:10,fontSize:13,color:C.text,fontFamily:"inherit",textAlign:"left" }}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
          <div style={{ padding:"10px 16px",borderTop:`1px solid ${C.border}` }}>
            <div style={{ fontSize:11,color:C.soft,marginBottom:8,fontWeight:600 }}>MOTYW PLATFORMY</div>
            <div style={{ display:"flex",gap:4 }}>
              {[{id:"light",icon:"☀️",label:"Jasny"},{id:"dark",icon:"🌙",label:"Ciemny"},{id:"auto",icon:"⚙️",label:"Auto"}].map(t=>(
                <button key={t.id} onClick={()=>{ setTheme(t.id); setOpen(false); }} style={{ flex:1,padding:"6px 2px",borderRadius:7,border:`1px solid ${theme===t.id?C.accent:C.border}`,background:theme===t.id?C.blueBg:C.surface,color:theme===t.id?C.accent:C.mid,fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:theme===t.id?600:400 }}>{t.icon} {t.label}</button>
              ))}
            </div>
          </div>
          <button onClick={onLogout} style={{ width:"100%",padding:"10px 16px",border:"none",borderTop:`1px solid ${C.border}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:10,fontSize:13,color:"#dc2626",fontFamily:"inherit",textAlign:"left",borderRadius:"0 0 12px 12px" }}>
            <span>↩</span> Wyloguj się
          </button>
        </div>
      )}
    </div>
  );
};

// ── TOP BAR ────────────────────────────────────────────────
const TopBar = ({ user, onLogout, theme, setTheme, C, onSearch }) => {
  const [search,setSearch]=useState("");
  const handleSearch=(e)=>{ if(e.key==="Enter"||e.type==="click") onSearch(search); };
  return (
    <header style={{ height:54,background:C.headerBg,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",paddingLeft:236,paddingRight:20,gap:12,position:"fixed",top:0,left:0,right:0,zIndex:90,boxShadow:`0 1px 3px rgba(0,0,0,${theme==="dark"?0.3:0.06})` }}>
      <button style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:C.alt,fontSize:13,color:C.mid,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",flexShrink:0 }}>⚡ Szybki dostęp <span style={{ fontSize:10 }}>▾</span></button>
      <div style={{ flex:1,maxWidth:460,position:"relative" }}>
        <span style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:C.soft,fontSize:13 }}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={handleSearch} placeholder="Szukaj zamówień, produktów, klientów..." style={{ width:"100%",padding:"7px 36px 7px 32px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:C.alt,outline:"none",color:C.text,boxSizing:"border-box" }}/>
        {search && <button onClick={handleSearch} style={{ position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",border:"none",background:C.accent,color:"#fff",cursor:"pointer",fontSize:11,padding:"3px 8px",borderRadius:5 }}>→</button>}
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:6,marginLeft:"auto" }}>
        {[{icon:"❓",tip:"Pomoc"},{icon:"✦",tip:"AI"}].map(b=>(
          <button key={b.tip} title={b.tip} style={{ width:34,height:34,borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,cursor:"pointer",fontSize:14,color:C.mid,display:"flex",alignItems:"center",justifyContent:"center" }}>{b.icon}</button>
        ))}
        <button style={{ width:34,height:34,borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,cursor:"pointer",fontSize:14,color:C.mid,display:"flex",alignItems:"center",justifyContent:"center",position:"relative" }}>
          🔔<span style={{ position:"absolute",top:-4,right:-4,background:"#dc2626",color:"#fff",borderRadius:"50%",fontSize:9,fontWeight:700,width:15,height:15,display:"flex",alignItems:"center",justifyContent:"center" }}>3</span>
        </button>
        <button style={{ width:34,height:34,borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,cursor:"pointer",fontSize:14,color:C.mid,display:"flex",alignItems:"center",justifyContent:"center" }}>🏪</button>
        <ProfileMenu user={user} onLogout={onLogout} theme={theme} setTheme={setTheme} C={C}/>
      </div>
    </header>
  );
};

// ── SIDEBAR ────────────────────────────────────────────────
const Sidebar = ({ tab, setTab, subTab, setSubTab, stats, C }) => {
  const [expanded,setExpanded]=useState({ orders:false, products:false });
  const nav=[
    { id:"dashboard", icon:"⊞", label:"Dashboard" },
    { id:"orders", icon:"🛒", label:"Zamówienia", badge:stats.newOrders,
      sub:[{id:"orders-list",label:"Lista zamówień"},{id:"orders-invoices",label:"Faktury"},{id:"orders-returns",label:"Zwroty"},{id:"orders-clients",label:"Klienci"},{id:"orders-statuses",label:"Statusy zamówień"},{id:"orders-templates",label:"Szablony E-mail/SMS"},{id:"orders-actions",label:"Automatyczne akcje"},{id:"orders-exports",label:"Wydruki i eksporty"},{id:"orders-imports",label:"Import przelewów"},{id:"orders-settings",label:"Ustawienia"}]
    },
    { id:"products", icon:"🌿", label:"Produkty", badge:stats.lowStock>0?stats.lowStock:null,
      sub:[{id:"products-list",label:"Lista produktów"},{id:"products-stock",label:"Kontrola magazynu"},{id:"products-actions",label:"Automatyczne akcje"},{id:"products-import",label:"Import/Eksport"},{id:"products-settings",label:"Ustawienia"}]
    },
    { id:"channels",   icon:"🔗", label:"Kanały sprzedaży" },
    { id:"couriers",   icon:"🚚", label:"Kurierzy" },
    { id:"deliveries", icon:"📥", label:"Dostawy" },
    { id:"analytics",  icon:"📊", label:"Analityka" },
  ];
  const toggle=(id)=>setExpanded(p=>({...p,[id]:!p[id]}));
  return (
    <aside style={{ width:220,background:C.sidebarBg,minHeight:"100vh",display:"flex",flexDirection:"column",position:"fixed",left:0,top:0,bottom:0,zIndex:100,overflowY:"auto" }}>
      <div style={{ padding:"16px",borderBottom:"1px solid rgba(255,255,255,0.08)",flexShrink:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:34,height:34,borderRadius:9,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>🍇</div>
          <div><div style={{ fontSize:14,fontWeight:700,color:"#fff",lineHeight:1 }}>Fruttino</div><div style={{ fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:1.5,marginTop:2 }}>CRM PANEL</div></div>
        </div>
      </div>
      <nav style={{ flex:1,padding:"8px 6px" }}>
        {nav.map(item=>{
          const isActive=tab===item.id;const hasActiveSub=item.sub&&item.sub.some(s=>s.id===subTab);const isExp=expanded[item.id];
          return (
            <div key={item.id}>
              <button onClick={()=>{ if(item.sub){toggle(item.id);setTab(item.id);if(!hasActiveSub)setSubTab(item.sub[0].id);}else{setTab(item.id);setSubTab(null);} }} style={{ width:"100%",display:"flex",alignItems:"center",gap:8,padding:"9px 10px",borderRadius:8,border:"none",background:(isActive||hasActiveSub)&&!item.sub?"rgba(255,255,255,0.12)":"transparent",borderLeft:(isActive||hasActiveSub)?"3px solid #60a5fa":"3px solid transparent",color:(isActive||hasActiveSub)?"#fff":"rgba(255,255,255,0.5)",fontSize:13,fontWeight:(isActive||hasActiveSub)?600:400,cursor:"pointer",fontFamily:"inherit",marginBottom:1,textAlign:"left" }}>
                <span style={{ fontSize:14,width:18,textAlign:"center",flexShrink:0 }}>{item.icon}</span>
                <span style={{ flex:1 }}>{item.label}</span>
                {item.badge>0&&<span style={{ background:"#ef4444",color:"#fff",borderRadius:100,fontSize:9,fontWeight:700,padding:"1px 5px",flexShrink:0 }}>{item.badge}</span>}
                {item.sub&&<span style={{ fontSize:10,opacity:0.5,flexShrink:0 }}>{isExp?"▾":"▸"}</span>}
              </button>
              {item.sub&&isExp&&<div style={{ marginLeft:10,marginBottom:4 }}>{item.sub.map(s=><button key={s.id} onClick={()=>{setTab(item.id);setSubTab(s.id);}} style={{ width:"100%",padding:"7px 10px",border:"none",borderLeft:`2px solid ${subTab===s.id?"#60a5fa":"rgba(255,255,255,0.08)"}`,background:"transparent",color:subTab===s.id?"#fff":"rgba(255,255,255,0.4)",fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:1,borderRadius:"0 6px 6px 0",display:"block" }}>{s.label}</button>)}</div>}
            </div>
          );
        })}
      </nav>
      <div style={{ padding:"10px 14px",borderTop:"1px solid rgba(255,255,255,0.08)",flexShrink:0 }}>
        <div style={{ fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:1,marginBottom:6 }}>POŁĄCZENIA</div>
        {[{dot:"#ea580c",label:"Allegro"},{dot:"#4ade80",label:"WooCommerce"}].map(c=>(
          <div key={c.label} style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:3 }}><span style={{ width:5,height:5,borderRadius:"50%",background:c.dot,display:"block",flexShrink:0 }}/>{c.label}</div>
        ))}
      </div>
    </aside>
  );
};

// ── MOBILE TOP BAR ─────────────────────────────────────────
const MobileTopBar = ({ tab, setTab, stats, user, onLogout, theme, setTheme, C }) => {
  const tabs=[{id:"dashboard",icon:"⊞",label:"Home"},{id:"orders",icon:"🛒",label:"Zamów.",badge:stats.newOrders},{id:"products",icon:"🌿",label:"Prod.",badge:stats.lowStock>0?stats.lowStock:null},{id:"channels",icon:"🔗",label:"Kanały"},{id:"couriers",icon:"🚚",label:"Kurier"}];
  return (
    <div style={{ background:C.sidebarBg,position:"sticky",top:0,zIndex:100 }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px 6px" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}><span style={{ fontSize:20 }}>🍇</span><span style={{ fontSize:14,fontWeight:700,color:"#fff" }}>Fruttino CRM</span></div>
        <ProfileMenu user={user} onLogout={onLogout} theme={theme} setTheme={setTheme} C={C}/>
      </div>
      <div style={{ display:"flex",borderTop:"1px solid rgba(255,255,255,0.08)" }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1,padding:"7px 2px",background:"transparent",border:"none",borderBottom:tab===t.id?"2px solid #60a5fa":"2px solid transparent",color:tab===t.id?"#fff":"rgba(255,255,255,0.45)",fontSize:9,fontWeight:tab===t.id?600:400,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:1 }}>
            <span style={{ fontSize:13 }}>{t.icon}</span><span>{t.label}</span>
            {t.badge>0&&<span style={{ background:"#ef4444",color:"#fff",borderRadius:100,fontSize:8,fontWeight:700,padding:"0 3px" }}>{t.badge}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

// ── STAT CARDS ─────────────────────────────────────────────
const StatCards = ({ stats, isMobile, C }) => (
  <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:isMobile?8:16,marginBottom:isMobile?0:24 }}>
    {[{label:"Nowe zamówienia",value:stats.newOrders,color:C.amber,icon:"🔔"},{label:"Wszystkie zamów.",value:stats.totalOrders,color:C.accent,icon:"📦"},{label:"Produkty",value:stats.totalProducts,color:C.green,icon:"🌿"},{label:"Niski stan",value:stats.lowStock,color:C.red,icon:"⚠️"}].map(s=>(
      <div key={s.label} style={{ background:C.surface,borderRadius:isMobile?10:12,border:`1px solid ${C.border}`,padding:isMobile?"11px 8px":"20px",borderTop:`3px solid ${s.color}` }}>
        {!isMobile&&<div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}><span style={{ fontSize:20 }}>{s.icon}</span></div>}
        <div style={{ fontSize:isMobile?22:30,fontWeight:800,color:s.color,fontFamily:"monospace",lineHeight:1 }}>{s.value}</div>
        <div style={{ fontSize:isMobile?10:13,color:C.soft,marginTop:isMobile?3:6,fontWeight:500 }}>{isMobile?s.label.split(" ")[0]:s.label}</div>
      </div>
    ))}
  </div>
);

// ── SEARCH RESULTS ──────────────────────────────────────────
const SearchResults = ({ query, C, onClose }) => {
  const [orders,setOrders]=useState([]);
  const [products,setProducts]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    (async()=>{
      setLoading(true);
      const [oRes,pRes]=await Promise.all([
        apiFetch(`/orders?tenant_id=${TENANT_ID}`),
        apiFetch(`/products?tenant_id=${TENANT_ID}&search=${encodeURIComponent(query)}`),
      ]);
      const q=query.toLowerCase();
      const filteredOrders=(oRes.data||[]).filter(o=>(o.customer_name||"").toLowerCase().includes(q)||(o.customer_email||"").toLowerCase().includes(q)||(o.external_id||"").toLowerCase().includes(q));
      setOrders(filteredOrders.slice(0,5));
      setProducts((pRes.data||[]).slice(0,5));
      setLoading(false);
    })();
  },[query]);
  return (
    <Modal title={`Wyniki dla: "${query}"`} onClose={onClose} C={C} width={600}>
      {loading?<Spinner size={24} C={C}/>:(
        <div>
          {orders.length>0&&<>
            <div style={{ fontSize:12,fontWeight:700,color:C.soft,letterSpacing:1,marginBottom:10 }}>ZAMÓWIENIA ({orders.length})</div>
            {orders.map(o=><div key={o.id} style={{ padding:"10px 12px",background:C.alt,borderRadius:8,marginBottom:8 }}><div style={{ fontSize:14,fontWeight:600,color:C.text }}>{o.customer_name||"Klient"}</div><div style={{ fontSize:12,color:C.soft }}>{o.customer_email} · {o.external_id}</div></div>)}
          </>}
          {products.length>0&&<>
            <div style={{ fontSize:12,fontWeight:700,color:C.soft,letterSpacing:1,marginBottom:10,marginTop:orders.length>0?20:0 }}>PRODUKTY ({products.length})</div>
            {products.map(p=><div key={p.id} style={{ padding:"10px 12px",background:C.alt,borderRadius:8,marginBottom:8 }}><div style={{ fontSize:14,fontWeight:600,color:C.text }}>{p.name}</div><div style={{ fontSize:12,color:C.soft }}>{p.sku} · {parseFloat(p.price||0).toFixed(2)} zł</div></div>)}
          </>}
          {orders.length===0&&products.length===0&&<Empty text={`Brak wyników dla "${query}"`} C={C}/>}
        </div>
      )}
    </Modal>
  );
};

// ── DASHBOARD ──────────────────────────────────────────────
const DashboardTab = ({ stats, C }) => (
  <div>
    <StatCards stats={stats} isMobile={false} C={C}/>
    <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:20 }}>
      <Card C={C} style={{ padding:20 }}>
        <div style={{ fontSize:12,fontWeight:700,color:C.soft,letterSpacing:1,marginBottom:16 }}>OSTATNIA AKTYWNOŚĆ</div>
        {[{icon:"📦",text:"Oczekiwanie na pierwsze zamówienie z Allegro",time:"Skonfiguruj integrację",color:C.orange},{icon:"🌿",text:"Dodano produkt: Morele suszone 500g",time:"Dziś",color:C.green},{icon:"🔗",text:"6 kanałów sprzedaży skonfigurowanych",time:"Gotowe",color:C.blue},{icon:"✅",text:"CRM Panel uruchomiony pomyślnie",time:"Dziś",color:C.green}].map((a,i)=>(
          <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:12,paddingBottom:i<3?14:0,marginBottom:i<3?14:0,borderBottom:i<3?`1px solid ${C.borderLight}`:"none" }}>
            <div style={{ width:36,height:36,borderRadius:10,background:`${a.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{a.icon}</div>
            <div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:500,color:C.text,marginBottom:2 }}>{a.text}</div><div style={{ fontSize:11,color:C.soft }}>{a.time}</div></div>
          </div>
        ))}
      </Card>
      <Card C={C} style={{ padding:20 }}>
        <div style={{ fontSize:12,fontWeight:700,color:C.soft,letterSpacing:1,marginBottom:16 }}>STATUSY ZAMÓWIEŃ</div>
        {Object.entries(STATUS_CFG).map(([key,cfg])=>(
          <div key={key} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
            <span style={{ width:8,height:8,borderRadius:"50%",background:cfg.dot,display:"block",flexShrink:0 }}/>
            <span style={{ flex:1,fontSize:13,color:C.text }}>{cfg.label}</span>
            <span style={{ fontSize:14,fontWeight:700,color:cfg.dot,fontFamily:"monospace" }}>{stats.byStatus?.[key]||0}</span>
          </div>
        ))}
        <div style={{ marginTop:16,paddingTop:16,borderTop:`1px solid ${C.borderLight}`,display:"flex",justifyContent:"space-between",fontSize:13 }}>
          <span style={{ color:C.soft }}>Razem</span>
          <span style={{ fontWeight:700,color:C.text }}>{stats.totalOrders}</span>
        </div>
      </Card>
    </div>
  </div>
);

// ── PRODUCT CARD BLOCK ─────────────────────────────────────
const Block = ({ num, title, children, C }) => (
  <div style={{ marginBottom:24 }}>
    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14,paddingBottom:10,borderBottom:`2px solid ${C.accent}` }}>
      <div style={{ width:26,height:26,borderRadius:"50%",background:C.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff",flexShrink:0 }}>{num}</div>
      <div style={{ fontSize:15,fontWeight:700,color:C.text }}>{title}</div>
    </div>
    {children}
  </div>
);

// ── PRODUCT CARD MODAL (Allegro style) ─────────────────────
const ProductCardModal = ({ product, onClose, onSave, C }) => {
  const [form,setForm]=useState({
    sku:product?.sku||"", name:product?.name||"", description:product?.description||"",
    short_description:product?.short_description||"", price:product?.price||"",
    price_czk:product?.price_czk||"", price_eur:product?.price_eur||"",
    vat_rate:product?.vat_rate||"5", brand:product?.brand||"",
    weight_kg:product?.weight_kg||"", ean:"", category:"",
    stan:"nowy", sklad:"", kraj_pochodzenia:"Turcja", alergeny:"",
    dostawa_dni:"2", status:product?.status||"draft",
    tenant_id:TENANT_ID,
  });
  const [images,setImages]=useState(product?.images||[]);
  const [uploading,setUploading]=useState(false);
  const [saving,setSaving]=useState(false);
  const [activeImg,setActiveImg]=useState(0);
  const fileRef=useRef(null);
  const [rates,setRates]=useState({ EUR:null, CZK:null, date:null });
  const [loadingRates,setLoadingRates]=useState(false);

  // Pobierz kursy NBP przy otwarciu
  useEffect(()=>{
    (async()=>{
      setLoadingRates(true);
      try {
        const [eurRes,czkRes]=await Promise.all([
          fetch("https://api.nbp.pl/api/exchangerates/rates/A/EUR/?format=json"),
          fetch("https://api.nbp.pl/api/exchangerates/rates/A/CZK/?format=json"),
        ]);
        const eurData=await eurRes.json();
        const czkData=await czkRes.json();
        const eurRate=eurData.rates[0].mid;
        const czkRate=czkData.rates[0].mid;
        setRates({ EUR:eurRate, CZK:czkRate, date:eurData.rates[0].effectiveDate });
      } catch(e){ console.error("NBP error:",e); }
      setLoadingRates(false);
    })();
  },[]);

  // Przelicz ceny przy zmianie PLN lub kursów
  const recalcPrices=(pricePLN)=>{
    if(!pricePLN||!rates.EUR||!rates.CZK) return;
    const pln=parseFloat(pricePLN);
    if(isNaN(pln)||pln<=0) return;
    setForm(f=>({...f,
      price_eur:(pln/rates.EUR).toFixed(2),
      price_czk:(pln/rates.CZK).toFixed(2),
    }));
  };

  const uploadImage=async(file)=>{
    if(images.length>=10){ alert("Maksimum 10 zdjęć"); return; }
    setUploading(true);
    try {
      const ext=file.name.split(".").pop();
      const path=`${TENANT_ID}/${product?.id||"new"}/${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from("product-images").upload(path, file, { upsert:true });
      if(error) throw error;
      const { data:{ publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
      const newImgs=[...images, publicUrl];
      setImages(newImgs);
      setActiveImg(newImgs.length-1);
    } catch(e){ alert("Błąd uploadu: "+e.message); }
    setUploading(false);
  };

  const removeImage=(i)=>{ const ni=images.filter((_,idx)=>idx!==i); setImages(ni); if(activeImg>=ni.length) setActiveImg(Math.max(0,ni.length-1)); };

  const save=async()=>{
    setSaving(true);
    const toNum=(v)=>v===''||v===null||v===undefined?null:parseFloat(v)||null;
    const toInt=(v)=>v===''||v===null||v===undefined?null:parseInt(v)||null;
    const payload={ ...form,
      price:parseFloat(form.price)||0,
      price_czk:toNum(form.price_czk),
      price_eur:toNum(form.price_eur),
      weight_kg:toNum(form.weight_kg),
      dostawa_dni:toInt(form.dostawa_dni),
      ean:form.ean||null,
      category:form.category||null,
      stan:form.stan||'nowy',
      sklad:form.sklad||null,
      kraj_pochodzenia:form.kraj_pochodzenia||null,
      alergeny:form.alergeny||null,
      images,
    };
    let res;
    if(product?.id) res=await apiFetch(`/products/${product.id}`,{method:"PUT",body:JSON.stringify(payload)});
    else res=await apiFetch("/products",{method:"POST",body:JSON.stringify({...payload,initial_quantity:0})});
    setSaving(false);
    if(res.success){ onSave(); onClose(); }
    else alert("Błąd: "+res.error);
  };

  const inp=(key,label,type="text",ph="",opts={})=>(
    <div style={{ ...opts.style }}>
      <div style={{ fontSize:11,fontWeight:600,color:C.soft,marginBottom:5 }}>{label}</div>
      {opts.select ? (
        <select value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} style={{ width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:C.surface,color:C.text,outline:"none" }}>
          {opts.options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : opts.textarea ? (
        <textarea value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={ph} rows={4} style={{ width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:C.surface,color:C.text,outline:"none",resize:"vertical",boxSizing:"border-box" }}/>
      ) : (
        <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={ph} style={{ width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:C.surface,color:C.text,outline:"none",boxSizing:"border-box" }}/>
      )}
    </div>
  );



  return (
    <Modal title={product?.id?"Edytuj produkt":"Nowy produkt (karta Allegro)"} onClose={onClose} C={C} width={720}>
      {/* BLOK 1: Zdjęcia */}
      <Block C={C} num="1" title="Zdjęcia produktu">
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
          <div>
            <div style={{ width:"100%",aspectRatio:"1",background:C.alt,borderRadius:10,border:`2px solid ${C.border}`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8 }}>
              {images[activeImg] ? <img src={images[activeImg]} style={{ width:"100%",height:"100%",objectFit:"contain" }}/> : <div style={{ textAlign:"center",color:C.soft }}><div style={{ fontSize:40,marginBottom:8 }}>📷</div><div style={{ fontSize:13 }}>Brak zdjęcia</div></div>}
            </div>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              {images.map((img,i)=>(
                <div key={i} style={{ position:"relative",width:48,height:48,borderRadius:6,overflow:"hidden",border:`2px solid ${activeImg===i?C.accent:C.border}`,cursor:"pointer" }} onClick={()=>setActiveImg(i)}>
                  <img src={img} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                  <button onClick={e=>{e.stopPropagation();removeImage(i);}} style={{ position:"absolute",top:1,right:1,width:16,height:16,borderRadius:"50%",background:"rgba(220,38,38,0.9)",border:"none",color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1 }}>✕</button>
                </div>
              ))}
              {images.length<10&&(
                <button onClick={()=>fileRef.current?.click()} disabled={uploading} style={{ width:48,height:48,borderRadius:6,border:`2px dashed ${C.border}`,background:C.alt,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:C.soft }}>
                  {uploading?"⏳":"+"}
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e=>Array.from(e.target.files).forEach(f=>uploadImage(f))}/>
            <div style={{ fontSize:11,color:C.soft,marginTop:6 }}>{images.length}/10 zdjęć · maks. 5MB każde</div>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            <div style={{ padding:"12px",background:C.blueBg,borderRadius:8,fontSize:12,color:C.blue }}>
              💡 Pierwsze zdjęcie to zdjęcie główne. Białe tło wymagane przez Allegro.
            </div>
            <div style={{ padding:"12px",background:C.alt,borderRadius:8,fontSize:12,color:C.soft }}>
              <strong>Wymagania Allegro:</strong><br/>
              • Białe tło (RGB 255,255,255)<br/>
              • Min. 400×400 px<br/>
              • Format: JPG, PNG, WebP<br/>
              • Maks. 10 zdjęć na ofertę
            </div>
          </div>
        </div>
      </Block>

      {/* BLOK 2: Tytuł */}
      <Block C={C} num="2" title="Tytuł oferty">
        {inp("name","Tytuł *","text","np. Morele suszone premium 500g | bez pestek | Turcja")}
        <div style={{ fontSize:11,color:C.soft,marginTop:4 }}>{form.name.length}/75 znaków (rekomendowane słowa kluczowe na początku)</div>
      </Block>

      {/* BLOK 3: Kategoria i EAN */}
      <Block C={C} num="3" title="Kategoria i kod produktu">
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          {inp("ean","Kod EAN / GTIN","text","np. 5901234567890")}
          {inp("category","Kategoria","text","np. Owoce suszone")}
        </div>
      </Block>

      {/* BLOK 4: Parametry */}
      <Block C={C} num="4" title="Parametry (cechy)">
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          {inp("brand","Marka","text","np. Kaukaz")}
          {inp("stan","Stan","text","",{select:true,options:[{value:"nowy",label:"Nowy"},{value:"używany",label:"Używany"}]})}
          {inp("weight_kg","Waga (kg)","number","np. 0.5")}
          {inp("kraj_pochodzenia","Kraj pochodzenia","text","np. Turcja")}
          {inp("sklad","Skład","text","np. morele 100%")}
          {inp("alergeny","Alergeny","text","np. może zawierać orzechy")}
        </div>
      </Block>

      {/* BLOK 5: Opis */}
      <Block C={C} num="5" title="Opis produktu">
        {inp("short_description","Krótki opis (nagłówek)","text","np. Premium suszone morele bez pestek")}
        <div style={{ marginTop:12 }}>{inp("description","Pełny opis","text","",{textarea:true})}</div>
      </Block>

      {/* BLOK 6: Cena i VAT */}
      <Block C={C} num="6" title="Cena i VAT">
        {/* Kursy NBP */}
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14,padding:"10px 14px",background:C.alt,borderRadius:10,border:`1px solid ${C.border}` }}>
          <span style={{ fontSize:16 }}>🏦</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11,fontWeight:600,color:C.soft,marginBottom:2 }}>KURSY NBP{rates.date?` (${rates.date})`:""}</div>
            <div style={{ fontSize:13,color:C.text }}>
              {loadingRates ? "Pobieranie kursów..." : rates.EUR ? (
                `1 EUR = ${rates.EUR?.toFixed(4)} PLN · 1 CZK = ${rates.CZK?.toFixed(4)} PLN`
              ) : "Nie udało się pobrać kursów NBP"}
            </div>
          </div>
          <button onClick={()=>recalcPrices(form.price)} disabled={!rates.EUR||!form.price||loadingRates} style={{ padding:"7px 14px",borderRadius:8,border:"none",background:rates.EUR&&form.price?C.accent:C.border,color:"#fff",fontSize:12,fontWeight:600,cursor:rates.EUR&&form.price?"pointer":"not-allowed",fontFamily:"inherit",whiteSpace:"nowrap",opacity:loadingRates?0.6:1 }}>
            ↻ Przelicz
          </button>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12 }}>
          <div>
            <div style={{ fontSize:11,fontWeight:600,color:C.soft,marginBottom:5 }}>Cena PLN *</div>
            <input type="number" value={form.price} onChange={e=>{ setForm({...form,price:e.target.value}); recalcPrices(e.target.value); }} placeholder="18.50" style={{ width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${C.accent}`,fontSize:13,fontFamily:"inherit",background:C.surface,color:C.text,outline:"none",boxSizing:"border-box",fontWeight:600 }}/>
            {rates.EUR&&form.price&&<div style={{ fontSize:10,color:C.soft,marginTop:3 }}>Zmień → auto przelicz</div>}
          </div>
          {inp("price_czk","Cena CZK (auto)","number","auto")}
          {inp("price_eur","Cena EUR (auto)","number","auto")}
          {inp("vat_rate","Stawka VAT","text","",{select:true,options:[{value:"23",label:"23%"},{value:"8",label:"8%"},{value:"5",label:"5%"},{value:"0",label:"0%"}]})}
        </div>
      </Block>

      {/* BLOK 7: Dostawa */}
      <Block C={C} num="7" title="Dostawa">
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          {inp("dostawa_dni","Czas wysyłki (dni)","number","2")}
          <div>
            <div style={{ fontSize:11,fontWeight:600,color:C.soft,marginBottom:5 }}>Metody dostawy</div>
            <div style={{ padding:"9px 12px",background:C.alt,borderRadius:8,fontSize:13,color:C.soft }}>🚚 Wysyłam z Allegro, InPost, DPD (konfiguruj w Kurierzy)</div>
          </div>
        </div>
      </Block>

      {/* BLOK 8: Stan magazynowy */}
      <Block C={C} num="8" title="Stan magazynowy i kanały">
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          {inp("sku","SKU *","text","np. MOR-500")}
          {inp("status","Status oferty","text","",{select:true,options:[{value:"draft",label:"Szkic"},{value:"active",label:"Aktywna"},{value:"inactive",label:"Nieaktywna"}]})}
        </div>
      </Block>

      {/* Buttons */}
      <div style={{ display:"flex",gap:10,marginTop:8,borderTop:`1px solid ${C.border}`,paddingTop:20 }}>
        <button onClick={onClose} style={{ flex:1,padding:11,borderRadius:9,border:`1px solid ${C.border}`,background:C.surface,fontSize:14,cursor:"pointer",color:C.mid,fontFamily:"inherit" }}>Anuluj</button>
        <button onClick={()=>{ setForm({...form,status:"draft"}); save(); }} disabled={saving} style={{ flex:1,padding:11,borderRadius:9,border:`1px solid ${C.border}`,background:C.alt,fontSize:14,cursor:"pointer",color:C.text,fontFamily:"inherit" }}>💾 Zapisz szkic</button>
        <button onClick={()=>{ setForm({...form,status:"active"}); save(); }} disabled={saving} style={{ flex:2,padding:11,borderRadius:9,border:"none",background:C.accent,color:"#fff",fontSize:14,fontWeight:600,cursor:saving?"not-allowed":"pointer",fontFamily:"inherit",opacity:saving?0.7:1 }}>{saving?"Zapisywanie...":"🚀 Zapisz i opublikuj"}</button>
      </div>
    </Modal>
  );
};

// ── ORDER DETAIL VIEW ──────────────────────────────────────
const OrderDetailView = ({ order: initialOrder, orders, onBack, C, onStatusUpdate }) => {
  const [order, setOrder] = useState(initialOrder);
  const [updating, setUpdating] = useState(false);
  const idx = orders.findIndex(o => o.id === order.id);
  const st = STATUS_CFG[order.status] || STATUS_CFG.new;
  const src = SOURCE[order.channels?.type] || SOURCE.allegro;
  const items = Array.isArray(order.items) ? order.items : [];
  const totalAmount = parseFloat(order.total_amount || 0);
  const navigate = (newOrder) => setOrder(newOrder);
  const changeStatus = async (newStatus) => {
    setUpdating(true);
    const res = await apiFetch(`/orders/${order.id}`, { method:"PUT", body:JSON.stringify({ status:newStatus }) });
    if (res.success) { setOrder(prev=>({...prev,status:newStatus,updated_at:new Date().toISOString()})); onStatusUpdate&&onStatusUpdate(order.id,newStatus); }
    setUpdating(false);
  };
  return (
    <div>
      {/* Nav bar */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <button onClick={onBack} style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 16px",borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,color:C.mid,fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:500 }}>← Wróć do listy zamówień</button>
          <div style={{ display:"flex",gap:4,alignItems:"center" }}>
            <button onClick={()=>idx>0&&navigate(orders[idx-1])} disabled={idx<=0} style={{ width:28,height:28,borderRadius:6,border:`1px solid ${C.border}`,background:C.surface,cursor:idx>0?"pointer":"not-allowed",color:idx>0?C.text:C.soft,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",opacity:idx<=0?0.35:1 }}>‹</button>
            <span style={{ fontSize:12,color:C.soft,minWidth:60,textAlign:"center" }}>{idx+1} / {orders.length}</span>
            <button onClick={()=>idx<orders.length-1&&navigate(orders[idx+1])} disabled={idx>=orders.length-1} style={{ width:28,height:28,borderRadius:6,border:`1px solid ${C.border}`,background:C.surface,cursor:idx<orders.length-1?"pointer":"not-allowed",color:idx<orders.length-1?C.text:C.soft,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",opacity:idx>=orders.length-1?0.35:1 }}>›</button>
          </div>
        </div>
        <div style={{ display:"flex",gap:6 }}>
          {[{l:"🧾 Paragon"},{l:"📄 Faktura"},{l:"🖨 Drukuj",onClick:()=>window.print()},{l:"📦 Pakuj"},{l:"⚡ Akcje"}].map(btn=>(
            <button key={btn.l} onClick={btn.onClick} style={{ padding:"7px 12px",borderRadius:7,border:`1px solid ${C.border}`,background:C.surface,color:C.mid,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:500 }}>{btn.l}</button>
          ))}
        </div>
      </div>
      {/* Title */}
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24 }}>
        <div>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:4 }}>
            <h1 style={{ fontSize:22,fontWeight:800,color:C.text }}>#{order.external_id||order.id?.slice(0,12)}</h1>
            <Pill label={st.label} color={st.dot} bg={st.bg} textColor={st.text} dot={true}/>
          </div>
          <div style={{ fontSize:14,color:C.soft }}>{order.customer_name} · {order.created_at?new Date(order.created_at).toLocaleString("pl-PL"):""}</div>
        </div>
      </div>
      {/* Two-column layout */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 300px",gap:20 }}>
        {/* LEFT */}
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
          {/* Order info block */}
          <Card C={C} style={{ padding:20 }}>
            <div style={{ fontSize:11,fontWeight:700,color:C.soft,letterSpacing:1,marginBottom:14 }}>INFORMACJE O ZAMÓWIENIU</div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
              <div><div style={{ fontSize:11,color:C.soft,marginBottom:3 }}>KWOTA PŁATNOŚCI</div><div style={{ fontSize:24,fontWeight:800,color:C.text,fontFamily:"monospace" }}>{totalAmount.toFixed(2)}</div><div style={{ fontSize:12,color:C.soft }}>{order.currency||"PLN"}</div></div>
              <div><div style={{ fontSize:11,color:C.soft,marginBottom:3 }}>KLIENT</div><div style={{ fontSize:14,fontWeight:600,color:C.text }}>{order.customer_name||"—"}</div><div style={{ fontSize:12,color:C.soft }}>{order.customer_email||"—"}</div></div>
              <div><div style={{ fontSize:11,color:C.soft,marginBottom:3 }}>ŹRÓDŁO</div><Pill label={order.channels?.name||"Kanał"} color={src.color} bg={src.bg} textColor={src.color}/><div style={{ fontSize:11,color:C.soft,marginTop:4,fontFamily:"monospace" }}>{order.external_id}</div></div>
              <div><div style={{ fontSize:11,color:C.soft,marginBottom:3 }}>DOSTAWA</div><div style={{ fontSize:13,color:C.text }}>{order.carrier||"Nie wybrano"}</div>{order.tracking_number&&<div style={{ fontSize:11,color:C.soft,fontFamily:"monospace" }}>{order.tracking_number}</div>}</div>
              <div><div style={{ fontSize:11,color:C.soft,marginBottom:3 }}>METODA PŁATNOŚCI</div><div style={{ fontSize:13,color:C.text }}>Płatność online</div></div>
              <div><div style={{ fontSize:11,color:C.soft,marginBottom:3 }}>DATA ZAMÓWIENIA</div><div style={{ fontSize:13,color:C.text }}>{order.created_at?new Date(order.created_at).toLocaleDateString("pl-PL"):"—"}</div><div style={{ fontSize:11,color:C.soft }}>VAT: {order.vat_rate||0}%</div></div>
            </div>
          </Card>
          {/* Items */}
          <Card C={C} style={{ overflow:"hidden" }}>
            <div style={{ padding:"14px 20px",borderBottom:`1px solid ${C.border}` }}><div style={{ fontSize:11,fontWeight:700,color:C.soft,letterSpacing:1 }}>POZYCJE ZAMÓWIENIA</div></div>
            {items.length===0 ? <Empty text="Brak pozycji zamówienia" C={C}/> : (
              <table style={{ width:"100%",borderCollapse:"collapse" }}>
                <thead><tr style={{ background:C.alt }}>{["Produkt","Ilość","Cena jedn.","Wartość"].map(h=><th key={h} style={{ padding:"9px 16px",textAlign:"left",fontSize:11,color:C.soft,fontWeight:600 }}>{h}</th>)}</tr></thead>
                <tbody>{items.map((item,i)=>(
                  <tr key={i} style={{ borderBottom:`1px solid ${C.borderLight}` }}>
                    <td style={{ padding:"11px 16px",fontSize:13,fontWeight:500,color:C.text }}>{item.name||"Produkt"}</td>
                    <td style={{ padding:"11px 16px",fontSize:13,color:C.mid }}>{item.quantity||1}</td>
                    <td style={{ padding:"11px 16px",fontSize:13,color:C.mid,fontFamily:"monospace" }}>{parseFloat(item.price||0).toFixed(2)} {order.currency||"PLN"}</td>
                    <td style={{ padding:"11px 16px",fontSize:14,fontWeight:700,color:C.text,fontFamily:"monospace" }}>{(parseFloat(item.price||0)*(item.quantity||1)).toFixed(2)} {order.currency||"PLN"}</td>
                  </tr>
                ))}</tbody>
                <tfoot><tr style={{ background:C.alt,borderTop:`1px solid ${C.border}` }}><td colSpan={3} style={{ padding:"11px 16px",textAlign:"right",fontSize:12,fontWeight:600,color:C.soft }}>SUMA</td><td style={{ padding:"11px 16px",fontSize:16,fontWeight:800,color:C.text,fontFamily:"monospace" }}>{totalAmount.toFixed(2)} {order.currency||"PLN"}</td></tr></tfoot>
              </table>
            )}
          </Card>
          {/* Addresses */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
            <Card C={C} style={{ padding:20 }}>
              <div style={{ fontSize:11,fontWeight:700,color:C.soft,letterSpacing:1,marginBottom:12 }}>ADRES DOSTAWY</div>
              <div style={{ fontSize:14,fontWeight:600,color:C.text,marginBottom:6 }}>{order.customer_name||"—"}</div>
              <div style={{ fontSize:13,color:C.mid,lineHeight:1.9 }}>
                <div>{order.delivery_address?.street||"ul. —"}</div>
                <div>{order.delivery_address?.zip||"00-000"} {order.delivery_address?.city||"—"}</div>
                <div>{order.customer_country||"PL"}</div>
              </div>
            </Card>
            <Card C={C} style={{ padding:20 }}>
              <div style={{ fontSize:11,fontWeight:700,color:C.soft,letterSpacing:1,marginBottom:12 }}>DANE DO FAKTURY</div>
              <div style={{ fontSize:13,color:C.mid,lineHeight:1.9 }}>
                <div style={{ fontWeight:600,color:C.text }}>{order.invoice_data?.name||order.customer_name||"—"}</div>
                <div>{order.invoice_data?.address||"Adres nie podany"}</div>
                {order.invoice_data?.nip&&<div style={{ fontSize:12,color:C.soft }}>NIP: {order.invoice_data.nip}</div>}
              </div>
            </Card>
          </div>
          {/* Shipment */}
          <Card C={C} style={{ padding:20 }}>
            <div style={{ fontSize:11,fontWeight:700,color:C.soft,letterSpacing:1,marginBottom:14 }}>PRZESYŁKA</div>
            {order.tracking_number ? (
              <div>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
                  <div><div style={{ fontSize:15,fontWeight:700,color:C.text }}>{order.carrier||"Kurier"}</div><div style={{ fontSize:12,color:C.soft,fontFamily:"monospace",marginTop:2 }}>Nr: {order.tracking_number}</div></div>
                  <Pill label="W drodze" color={C.blue} bg={C.blueBg} textColor={C.blue}/>
                </div>
                <div style={{ position:"relative",margin:"24px 0 8px" }}>
                  <div style={{ position:"absolute",top:10,left:"12%",right:"12%",height:2,background:C.border,zIndex:0 }}>
                    <div style={{ height:"100%",width:"50%",background:C.accent }}/>
                  </div>
                  <div style={{ display:"flex",justifyContent:"space-between",position:"relative",zIndex:1 }}>
                    {["Nadano","W sortowni","W drodze","Dostarczone"].map((s,i)=>(
                      <div key={s} style={{ textAlign:"center",flex:1 }}>
                        <div style={{ width:22,height:22,borderRadius:"50%",background:i<2?C.accent:C.border,margin:"0 auto 6px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:i<2?"#fff":C.soft,fontWeight:700 }}>{i<2?"✓":""}</div>
                        <div style={{ fontSize:10,color:i<2?C.text:C.soft,fontWeight:i<2?600:400 }}>{s}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign:"center",padding:"20px 0" }}>
                <div style={{ fontSize:32,marginBottom:8 }}>🚚</div>
                <div style={{ fontSize:13,color:C.soft,marginBottom:12 }}>Przesyłka nie nadana</div>
                <button style={{ padding:"8px 18px",borderRadius:8,border:`1px solid ${C.accent}`,background:C.blueBg,color:C.accent,fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:600 }}>+ Nadaj przesyłkę</button>
              </div>
            )}
          </Card>
          {/* Messages */}
          <Card C={C} style={{ padding:20 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
              <div style={{ fontSize:11,fontWeight:700,color:C.soft,letterSpacing:1 }}>WIADOMOŚCI (RESPONSO)</div>
              <button style={{ padding:"6px 14px",borderRadius:7,border:`1px solid ${C.border}`,background:C.surface,color:C.mid,fontSize:12,cursor:"pointer",fontFamily:"inherit" }}>✉ Napisz wiadomość</button>
            </div>
            <div style={{ fontSize:13,color:C.soft,textAlign:"center",padding:"24px 0" }}>💬 Brak wiadomości z klientem</div>
          </Card>
        </div>
        {/* RIGHT sidebar */}
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <Card C={C} style={{ padding:16 }}>
            <div style={{ fontSize:11,fontWeight:700,color:C.soft,letterSpacing:1,marginBottom:12 }}>ZMIEŃ STATUS</div>
            <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
              {Object.entries(STATUS_CFG).map(([k,v])=>(
                <button key={k} onClick={()=>changeStatus(k)} disabled={order.status===k||updating} style={{ padding:"8px 12px",borderRadius:8,border:`1px solid ${order.status===k?v.dot:C.border}`,background:order.status===k?v.bg:C.surface,color:order.status===k?v.text:C.mid,fontSize:12,cursor:order.status===k||updating?"default":"pointer",fontFamily:"inherit",fontWeight:order.status===k?700:400,textAlign:"left",display:"flex",alignItems:"center",gap:7,opacity:updating?0.6:1 }}>
                  <span style={{ width:7,height:7,borderRadius:"50%",background:v.dot,display:"block",flexShrink:0 }}/>{v.label}{order.status===k&&<span style={{ marginLeft:"auto",fontSize:10 }}>✓</span>}
                </button>
              ))}
            </div>
          </Card>
          <Card C={C} style={{ padding:16 }}>
            <div style={{ fontSize:11,fontWeight:700,color:C.soft,letterSpacing:1,marginBottom:12 }}>DODATKOWE INFORMACJE</div>
            {[["ID transakcji",order.external_id||"—"],["Realizuje",order.channels?.name||"—"],["Waluta",order.currency||"PLN"],["VAT",`${order.vat_rate||0}%`],["Kraj",order.customer_country||"—"]].map(([label,value])=>(
              <div key={label} style={{ display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.borderLight}`,fontSize:12 }}>
                <span style={{ color:C.soft }}>{label}</span>
                <span style={{ color:C.text,fontWeight:500,fontFamily:"monospace",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{value}</span>
              </div>
            ))}
          </Card>
          <Card C={C} style={{ padding:16 }}>
            <div style={{ fontSize:11,fontWeight:700,color:C.soft,letterSpacing:1,marginBottom:12 }}>HISTORIA STATUSÓW</div>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {[{status:"new",date:order.created_at,label:"Zamówienie złożone"},...(order.status!=="new"?[{status:order.status,date:order.updated_at,label:STATUS_CFG[order.status]?.label||order.status}]:[])].map((h,i)=>{
                const cfg=STATUS_CFG[h.status]||STATUS_CFG.new;
                return (<div key={i} style={{ display:"flex",gap:8,alignItems:"flex-start" }}><div style={{ width:8,height:8,borderRadius:"50%",background:cfg.dot,marginTop:4,flexShrink:0 }}/><div><div style={{ fontSize:12,fontWeight:600,color:C.text }}>{h.label}</div><div style={{ fontSize:10,color:C.soft }}>{h.date?new Date(h.date).toLocaleString("pl-PL"):""}</div></div></div>);
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ── ORDERS TAB ─────────────────────────────────────────────
const OrdersTab = ({ subTab, isMobile, C }) => {
  const [orders,setOrders]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selected,setSelected]=useState(null);
  const [detailOrder,setDetailOrder]=useState(null);
  const [fStatus,setFStatus]=useState("all");
  const [fSource,setFSource]=useState("all");
  const [updating,setUpdating]=useState(null);
  const [error,setError]=useState("");
  const [creatingTest,setCreatingTest]=useState(false);

  const load=useCallback(async()=>{
    setLoading(true);setError("");
    const p=new URLSearchParams({tenant_id:TENANT_ID});
    if(fStatus!=="all") p.set("status",fStatus);
    const res=await apiFetch(`/orders?${p}`);
    if(res.success) setOrders(res.data||[]); else setError(res.error);
    setLoading(false);
  },[fStatus]);

  useEffect(()=>{load();},[load]);

  const updateStatus=async(id,status)=>{ setUpdating(id);await apiFetch(`/orders/${id}`,{method:"PUT",body:JSON.stringify({status})});await load();setUpdating(null);setSelected(null); };

  const createTestOrder=async()=>{
    setCreatingTest(true);
    const channels=await apiFetch("/channels");
    const ch=channels.data?.[0];
    const names=["Jan Kowalski","Anna Nowak","Piotr Wiśniewski","Maria Zielińska","Tomasz Wróbel"];
    const cities=["Warszawa","Kraków","Gdańsk","Wrocław","Poznań"];
    const countries=["PL","CZ","SK"];
    const rand=(arr)=>arr[Math.floor(Math.random()*arr.length)];
    const amount=(Math.random()*200+20).toFixed(2);
    const country=rand(countries);
    await apiFetch("/orders",{method:"POST",body:JSON.stringify({
      id:`TEST-${Date.now()}`,
      external_id:`TEST-${Math.floor(Math.random()*9000+1000)}`,
      channel_id:ch?.id,
      customer_name:rand(names),
      customer_email:`test${Math.floor(Math.random()*1000)}@example.com`,
      customer_country:country,
      billing:{ country },
      items:[{name:"Morele suszone 500g",quantity:Math.ceil(Math.random()*3),price:18.50}],
      total:amount,
      currency:country==="CZ"?"CZK":country==="SK"?"EUR":"PLN",
      vat_rate:country==="PL"?5:21,
      status:"new",
      tenant_id:TENANT_ID,
    })});
    setCreatingTest(false);
    await load();
  };

  const subLabels={"orders-invoices":"Faktury","orders-returns":"Zwroty","orders-clients":"Klienci","orders-statuses":"Statusy zamówień","orders-templates":"Szablony E-mail/SMS","orders-actions":"Automatyczne akcje","orders-exports":"Wydruki i eksporty","orders-imports":"Import przelewów","orders-settings":"Ustawienia"};
  if(subTab&&subTab!=="orders-list") return <ComingSoon title={subLabels[subTab]||subTab} C={C}/>;

  if(detailOrder) return <OrderDetailView order={detailOrder} orders={orders.filter(o=>fSource==="all"||o.channels?.type===fSource)} onBack={()=>setDetailOrder(null)} C={C} onStatusUpdate={(id,status)=>{ setOrders(prev=>prev.map(o=>o.id===id?{...o,status}:o)); }}/>;

  const filtered=orders.filter(o=>fSource==="all"||o.channels?.type===fSource);
  const sel={style:{background:C.surface,color:C.text,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"inherit",cursor:"pointer",outline:"none"}};

  if(isMobile) return (
    <div style={{ padding:"12px 12px 20px" }}>
      <div style={{ display:"flex",gap:8,marginBottom:12,flexWrap:"wrap" }}>
        <select {...sel} value={fSource} onChange={e=>setFSource(e.target.value)}><option value="all">Wszystkie źródła</option><option value="allegro">Allegro</option><option value="woocommerce">WooCommerce</option></select>
        <select {...sel} value={fStatus} onChange={e=>setFStatus(e.target.value)}><option value="all">Każdy status</option>{Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
        <button onClick={createTestOrder} disabled={creatingTest} style={{ padding:"8px 12px",borderRadius:8,border:"none",background:C.green,color:"#fff",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:600 }}>{creatingTest?"...":"+ Test"}</button>
      </div>
      {error&&<div style={{ fontSize:12,color:C.red,marginBottom:10,padding:"8px 12px",background:C.redBg,borderRadius:8 }}>⚠ {error}</div>}
      {loading?<Spinner size={24} C={C}/>:filtered.length===0?<Empty text="Brak zamówień" C={C}/>:(
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {filtered.map(o=>{
            const st=STATUS_CFG[o.status]||STATUS_CFG.new;const src=SOURCE[o.channels?.type]||SOURCE.allegro;const isOpen=selected===o.id;
            return (
              <Card key={o.id} C={C} style={{ overflow:"hidden",border:isOpen?`1px solid ${C.accent}`:`1px solid ${C.border}` }}>
                <div onClick={()=>setSelected(isOpen?null:o.id)} style={{ padding:"13px 14px",cursor:"pointer" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                    <div style={{ display:"flex",gap:6,alignItems:"center" }}><Pill label={o.channels?.name||"Kanał"} color={src.color} bg={src.bg} textColor={src.color}/><span style={{ fontSize:11,color:C.soft }}>{o.external_id||o.id?.slice(0,8)}</span></div>
                    <span style={{ fontSize:11,color:C.soft }}>{o.created_at?new Date(o.created_at).toLocaleDateString("pl-PL"):""}</span>
                  </div>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                    <div style={{ flex:1 }}><div style={{ fontSize:15,fontWeight:700,color:C.text,marginBottom:3 }}>{o.customer_name||"Klient"}</div><div style={{ fontSize:12,color:C.mid }}>{o.customer_country} · {o.customer_email||"—"}</div></div>
                    <div style={{ textAlign:"right",flexShrink:0,marginLeft:12 }}><div style={{ fontSize:19,fontWeight:800,color:C.navy||C.text }}>{parseFloat(o.total_amount||0).toFixed(2)}</div><div style={{ fontSize:10,color:C.soft }}>{o.currency||"PLN"}</div></div>
                  </div>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10 }}><Pill label={st.label} color={st.dot} bg={st.bg} textColor={st.text} dot={true}/><span style={{ fontSize:12,color:C.soft }}>{isOpen?"▲":"▼"}</span></div>
                </div>
                {isOpen&&<div style={{ borderTop:`1px solid ${C.border}`,background:C.alt,padding:"12px 14px" }}><div style={{ fontSize:12,color:C.soft,marginBottom:8 }}>Zmień status:</div><div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>{Object.entries(STATUS_CFG).map(([k,v])=><button key={k} onClick={()=>updateStatus(o.id,k)} disabled={o.status===k||updating===o.id} style={{ padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:500,cursor:o.status===k?"default":"pointer",border:`1px solid ${o.status===k?v.dot:C.border}`,background:o.status===k?v.bg:C.surface,color:o.status===k?v.text:C.mid,fontFamily:"inherit",opacity:updating===o.id?0.6:1 }}>{v.label}</button>)}</div></div>}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h2 style={{ fontSize:20,fontWeight:700,color:C.text }}>Lista zamówień</h2>
        <div style={{ display:"flex",gap:10 }}>
          <select {...sel} value={fSource} onChange={e=>setFSource(e.target.value)}><option value="all">Wszystkie źródła</option><option value="allegro">Allegro</option><option value="woocommerce">WooCommerce</option></select>
          <select {...sel} value={fStatus} onChange={e=>setFStatus(e.target.value)}><option value="all">Każdy status</option>{Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
          <button onClick={createTestOrder} disabled={creatingTest} style={{ padding:"8px 16px",borderRadius:8,border:"none",background:C.green,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:creatingTest?0.7:1 }}>{creatingTest?"Tworzenie...":"🧪 Testowe zamówienie"}</button>
          <button onClick={load} style={{ padding:"8px 16px",borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,fontSize:13,cursor:"pointer",color:C.mid,fontFamily:"inherit" }}>↻ Odśwież</button>
        </div>
      </div>
      {error&&<div style={{ fontSize:13,color:C.red,marginBottom:16,padding:"10px 16px",background:C.redBg,borderRadius:8 }}>⚠ {error}</div>}
      <Card C={C} style={{ overflow:"hidden" }}>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead><tr style={{ background:C.alt,borderBottom:`1px solid ${C.border}` }}>{["Źródło/ID","Klient","Kwota","Status","Data","Akcje"].map(h=><th key={h} style={{ padding:"12px 16px",textAlign:"left",fontSize:11,color:C.soft,fontWeight:600,letterSpacing:0.8 }}>{h.toUpperCase()}</th>)}</tr></thead>
          <tbody>
            {loading?<tr><td colSpan={6}><Spinner size={24} C={C}/></td></tr>
            :filtered.length===0?<tr><td colSpan={6}><Empty text="Brak zamówień. Kliknij 🧪 aby stworzyć testowe zamówienie." C={C}/></td></tr>
            :filtered.map((o,i)=>{
              const st=STATUS_CFG[o.status]||STATUS_CFG.new;const src=SOURCE[o.channels?.type]||SOURCE.allegro;const isOpen=selected===o.id;
              return [
                <tr key={o.id} style={{ borderBottom:`1px solid ${C.borderLight}`,background:isOpen?`${C.accent}10`:i%2===0?C.surface:C.alt }}>
                  <td style={{ padding:"14px 16px" }}><div style={{ marginBottom:4 }}><Pill label={o.channels?.name||"Kanał"} color={src.color} bg={src.bg} textColor={src.color}/></div><div style={{ fontSize:11,color:C.soft,fontFamily:"monospace" }}>{o.external_id||o.id?.slice(0,12)}</div></td>
                  <td style={{ padding:"14px 16px" }}><div style={{ fontSize:14,fontWeight:600,color:C.text,marginBottom:2 }}>{o.customer_name||"Klient"}</div><div style={{ fontSize:12,color:C.soft }}>{o.customer_email||"—"}</div></td>
                  <td style={{ padding:"14px 16px" }}><div style={{ fontSize:15,fontWeight:700,color:C.text,fontFamily:"monospace" }}>{parseFloat(o.total_amount||0).toFixed(2)}</div><div style={{ fontSize:11,color:C.soft }}>{o.currency||"PLN"}</div></td>
                  <td style={{ padding:"14px 16px" }}><Pill label={st.label} color={st.dot} bg={st.bg} textColor={st.text} dot={true}/></td>
                  <td style={{ padding:"14px 16px",fontSize:13,color:C.soft }}>{o.created_at?new Date(o.created_at).toLocaleDateString("pl-PL"):"—"}</td>
                  <td style={{ padding:"14px 16px" }}><button onClick={()=>setDetailOrder(o)} style={{ padding:"6px 14px",borderRadius:7,border:"none",background:C.accent,color:"#fff",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:600 }}>→ Szczegóły</button></td>
                </tr>,
                null
              ];
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ── PRODUCT IMPORT TAB ─────────────────────────────────────
const ProductImportTab = ({ products, onReload, C }) => {
  const [importFile,setImportFile]=useState(null);
  const [importing,setImporting]=useState(false);
  const [importResult,setImportResult]=useState(null);
  const [isDragging,setIsDragging]=useState(false);
  const fileInputRef=useRef(null);

  const exportCSV=()=>{
    const headers=["sku*","name*","price*","vat_rate","initial_quantity","brand","weight_kg","description","ean","category","sklad","kraj_pochodzenia","alergeny","stan","dostawa_dni"];
    const rows=products.map(p=>[p.sku,p.name,p.price,p.vat_rate,"",p.brand||"",p.weight_kg||"",p.description||"","","","","","","nowy",""]);
    const csv="\uFEFF"+[headers,...rows].map(r=>r.join(",")).join("\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download="fruttino_katalog.csv";a.click();
  };

  const downloadTemplate=()=>{
    const lines=["# FRUTTINO CRM — Master plik importu produktów","# * = pole obowiązkowe | bez * = pole opcjonalne","sku*,name*,price*,vat_rate,initial_quantity,brand,weight_kg,description,ean,category,sklad,kraj_pochodzenia,alergeny,stan,dostawa_dni","MOR-500,Morele suszone 500g,18.50,5,100,Kaukaz,0.5,Premium suszone morele,5901234567890,Owoce suszone,morele,Turcja,orzechy,nowy,2"];
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\uFEFF"+lines.join("\n")],{type:"text/csv;charset=utf-8"}));a.download="fruttino_master_template.csv";a.click();
  };

  const handleFileDrop=(file)=>{ if(!file) return; if(!file.name.match(/\.(csv)$/i)){alert("Proszę wybrać plik .CSV");return;} setImportFile(file);setImportResult(null); };

  const translateApiError=(raw="")=>{
    const s=String(raw).toLowerCase();
    if(s.includes("duplicate")||s.includes("unique")||s.includes("already exists")||s.includes("conflict")) return "Produkt z tym SKU już istnieje w bazie";
    if(s.includes("not null")||s.includes("required")||s.includes("missing")) return "Brak wymaganego pola (SKU, nazwa lub cena)";
    if(s.includes("invalid input")||s.includes("syntax")||s.includes("numeric")||s.includes("type")) return "Nieprawidłowy format danych (sprawdź cenę lub VAT)";
    if(s.includes("unauthorized")||s.includes("401")||s.includes("403")||s.includes("forbidden")) return "Brak uprawnień — sprawdź klucz API";
    if(s.includes("not found")||s.includes("404")) return "Nie znaleziono zasobu";
    if(s.includes("timeout")||s.includes("network")||s.includes("fetch")) return "Błąd połączenia z serwerem";
    if(s.includes("too large")||s.includes("payload")) return "Plik jest za duży";
    if(raw&&raw.length<120) return raw;
    return "Nieznany błąd serwera";
  };

  const importCSV=async()=>{
    if(!importFile) return; setImporting(true);
    try {
      const text=await importFile.text();
      const lines=text.split("\n").filter(l=>l.trim()&&!l.startsWith("#"));
      if(lines.length<2){alert("Plik jest pusty lub zawiera tylko nagłówki");setImporting(false);return;}
      const headers=lines[0].split(",").map(h=>h.trim().replace("*","").replace(/\uFEFF/g,""));
      const rows=lines.slice(1).map(line=>{const vals=line.split(",");const obj={};headers.forEach((h,i)=>{if(vals[i]!==undefined)obj[h]=vals[i].trim();});return obj;}).filter(p=>p.sku&&p.name&&p.price);
      let success=0; const errorDetails=[];
      for(const p of rows){
        const payload={...p,price:parseFloat(p.price)||0,vat_rate:p.vat_rate?parseInt(p.vat_rate):23,tenant_id:TENANT_ID,initial_quantity:parseInt(p.initial_quantity)||0,weight_kg:p.weight_kg?parseFloat(p.weight_kg):null,dostawa_dni:p.dostawa_dni?parseInt(p.dostawa_dni):null};
        const res=await apiFetch("/products",{method:"POST",body:JSON.stringify(payload)});
        if(res.success||res.id) success++;
        else errorDetails.push({sku:p.sku, msg: translateApiError(res.error||res.message||res.details||JSON.stringify(res))});
      }
      setImportResult({success,errors:errorDetails.length,total:rows.length,errorDetails});
      if(success>0) onReload();
    } catch(e){alert("Błąd parsowania: "+e.message);}
    setImporting(false);
  };

  return (
    <div>
      <h2 style={{ fontSize:20,fontWeight:700,color:C.text,marginBottom:20 }}>Import / Eksport katalogu</h2>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20 }}>
        <Card C={C} style={{ padding:24 }}>
          <div style={{ fontSize:32,marginBottom:12 }}>📥</div>
          <h3 style={{ fontSize:16,fontWeight:700,color:C.text,marginBottom:8 }}>Import produktów</h3>
          <p style={{ fontSize:13,color:C.soft,marginBottom:16,lineHeight:1.6 }}>Załaduj plik CSV z produktami. System automatycznie utworzy lub zaktualizuje karty produktów.</p>
          <div onDragOver={e=>{e.preventDefault();setIsDragging(true);}} onDragLeave={()=>setIsDragging(false)} onDrop={e=>{e.preventDefault();setIsDragging(false);handleFileDrop(e.dataTransfer.files[0]);}} onClick={()=>fileInputRef.current?.click()} style={{ border:`2px dashed ${isDragging?C.accent:C.border}`,borderRadius:10,padding:24,textAlign:"center",marginBottom:16,background:isDragging?C.blueBg:C.alt,cursor:"pointer",transition:"all 0.2s" }}>
            {importFile ? <><div style={{ fontSize:28,marginBottom:6 }}>📄</div><div style={{ fontSize:14,fontWeight:600,color:C.text,marginBottom:2 }}>{importFile.name}</div><div style={{ fontSize:11,color:C.soft }}>{(importFile.size/1024).toFixed(0)} KB — kliknij aby zmienić</div></> : <><div style={{ fontSize:28,marginBottom:8 }}>📂</div><div style={{ fontSize:13,color:C.mid,marginBottom:4 }}>Przeciągnij plik lub kliknij aby wybrać</div><div style={{ fontSize:11,color:C.soft }}>CSV — maks. 5000 produktów</div></>}
          </div>
          <input ref={fileInputRef} type="file" accept=".csv" style={{ display:"none" }} onChange={e=>handleFileDrop(e.target.files[0])}/>
          {importResult&&<div style={{ borderRadius:8,background:importResult.errors===0?C.greenBg:C.amberBg,marginBottom:12,overflow:"hidden" }}>
            <div style={{ padding:"10px 14px",color:importResult.errors===0?"#065f46":"#92400e",fontSize:13,fontWeight:600 }}>{importResult.errors===0?"✅":"⚠️"} Zaimportowano {importResult.success}/{importResult.total} produktów{importResult.errors>0&&` (${importResult.errors} błędów)`}</div>
            {importResult.errorDetails?.length>0&&<div style={{ borderTop:"1px solid rgba(0,0,0,0.1)",padding:"8px 14px",maxHeight:160,overflowY:"auto" }}>
              {importResult.errorDetails.map((e,i)=><div key={i} style={{ fontSize:12,color:"#92400e",marginBottom:4,fontFamily:"monospace" }}>❌ SKU <strong>{e.sku}</strong>: {e.msg}</div>)}
            </div>}
          </div>}
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={downloadTemplate} style={{ flex:1,padding:10,borderRadius:8,border:`1px solid ${C.accent}`,background:C.blueBg,color:C.accent,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>📋 Pobierz szablon</button>
            <button onClick={importCSV} disabled={!importFile||importing} style={{ flex:2,padding:10,borderRadius:8,border:"none",background:importFile?C.accent:C.border,color:"#fff",fontSize:13,fontWeight:600,cursor:importFile&&!importing?"pointer":"not-allowed",fontFamily:"inherit",opacity:importing?0.7:1 }}>{importing?"⏳ Importuję...":"⬆ Importuj plik"}</button>
          </div>
        </Card>
        <Card C={C} style={{ padding:24 }}>
          <div style={{ fontSize:32,marginBottom:12 }}>📤</div>
          <h3 style={{ fontSize:16,fontWeight:700,color:C.text,marginBottom:8 }}>Eksport katalogu</h3>
          <p style={{ fontSize:13,color:C.soft,marginBottom:16,lineHeight:1.6 }}>Pobierz pełny katalog produktów w formacie CSV.</p>
          <div style={{ background:C.alt,borderRadius:10,padding:16,marginBottom:16 }}>
            {["SKU, nazwa, cena, VAT","Stan magazynowy","Marka, waga, opis","EAN, kategoria","Parametry (sklad, alergeny, kraj)"].map(item=><div key={item} style={{ fontSize:12,color:C.mid,marginBottom:4,display:"flex",alignItems:"center",gap:6 }}><span style={{ color:C.green }}>✓</span>{item}</div>)}
          </div>
          <button onClick={exportCSV} style={{ width:"100%",padding:10,borderRadius:8,border:"none",background:C.navy||C.accent,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>⬇ Eksportuj katalog ({products.length} produktów)</button>
        </Card>
      </div>
      <Card C={C} style={{ padding:24 }}>
        <h3 style={{ fontSize:15,fontWeight:700,color:C.text,marginBottom:16 }}>📋 Opis pól pliku wzorcowego</h3>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead><tr style={{ background:C.alt }}>{["Pole","Typ","Wymagane","Opis / Przykład"].map(h=><th key={h} style={{ padding:"10px 14px",textAlign:"left",fontSize:11,color:C.soft,fontWeight:600,letterSpacing:0.5 }}>{h.toUpperCase()}</th>)}</tr></thead>
          <tbody>
            {[["sku","tekst","⭐ TAK","Unikalny kod produktu. Np: MOR-500"],["name","tekst","⭐ TAK","Pełna nazwa produktu. Np: Morele suszone 500g"],["price","liczba","⭐ TAK","Cena w PLN. Np: 18.50"],["vat_rate","liczba","○ nie","Stawka VAT: 23, 8, 5, 0. Domyślnie: 23"],["initial_quantity","liczba","○ nie","Stan magazynowy. Domyślnie: 0"],["brand","tekst","○ nie","Marka / producent. Np: Kaukaz"],["weight_kg","liczba","○ nie","Waga w kg. Np: 0.5"],["description","tekst","○ nie","Opis produktu do oferty"],["ean","tekst","○ nie","Kod EAN/GTIN. Np: 5901234567890"],["category","tekst","○ nie","Kategoria. Np: Owoce suszone"],["sklad","tekst","○ nie","Skład produktu. Np: morele 100%"],["kraj_pochodzenia","tekst","○ nie","Np: Turcja, Iran, Uzbekistan"],["alergeny","tekst","○ nie","Np: może zawierać orzechy"],["stan","tekst","○ nie","nowy / używany. Domyślnie: nowy"],["dostawa_dni","liczba","○ nie","Czas wysyłki w dniach. Np: 2"]].map(([field,type,req,desc],i)=>(
              <tr key={field} style={{ borderBottom:`1px solid ${C.borderLight}`,background:i%2===0?C.surface:C.alt }}>
                <td style={{ padding:"10px 14px",fontFamily:"monospace",fontSize:12,fontWeight:600,color:C.accent }}>{field}</td>
                <td style={{ padding:"10px 14px",fontSize:12,color:C.soft }}>{type}</td>
                <td style={{ padding:"10px 14px" }}><span style={{ fontSize:11,fontWeight:600,color:req.includes("TAK")?C.red:C.soft }}>{req}</span></td>
                <td style={{ padding:"10px 14px",fontSize:12,color:C.mid }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ── PRODUCTS TAB ───────────────────────────────────────────
const ProductsTab = ({ subTab, isMobile, C }) => {
  const [products,setProducts]=useState([]);
  const [loading,setLoading]=useState(true);
  const [editProduct,setEditProduct]=useState(null);
  const [showNewForm,setShowNewForm]=useState(false);
  const [search,setSearch]=useState("");
  const [error,setError]=useState("");

  const load=useCallback(async()=>{
    setLoading(true);setError("");
    const p=new URLSearchParams({tenant_id:TENANT_ID});
    if(search) p.set("search",search);
    const res=await apiFetch(`/products?${p}`);
    if(res.success) setProducts(res.data||[]); else setError(res.error);
    setLoading(false);
  },[search]);

  useEffect(()=>{load();},[load]);

  const exportCSV=()=>{
    const headers=["sku*","name*","price*","vat_rate","initial_quantity","brand","weight_kg","description","ean","category","sklad","kraj_pochodzenia","alergeny","stan","dostawa_dni"];
    const rows=products.map(p=>[p.sku,p.name,p.price,p.vat_rate,"",p.brand||"",p.weight_kg||"",p.description||"","","","","","","nowy",""]);
    const csv="\uFEFF"+[headers,...rows].map(r=>r.join(",")).join("\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download="fruttino_katalog.csv";a.click();
  };

  if(subTab==="products-import") return <ProductImportTab products={products} onReload={load} C={C}/>;

  if(subTab&&!["products-list","products-import"].includes(subTab)) return <ComingSoon title={subTab} C={C}/>;

  if(isMobile) return (
    <div style={{ padding:"12px 12px 20px" }}>
      <div style={{ display:"flex",gap:8,marginBottom:12 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Szukaj..." style={{ flex:1,padding:"9px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:C.surface,color:C.text,outline:"none" }}/>
        <button onClick={()=>setShowNewForm(true)} style={{ padding:"9px 14px",borderRadius:8,border:"none",background:C.navy||C.accent,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap" }}>+Dodaj</button>
      </div>
      {error&&<div style={{ fontSize:12,color:C.red,marginBottom:10,padding:"8px 12px",background:C.redBg,borderRadius:8 }}>⚠ {error}</div>}
      {loading?<Spinner size={24} C={C}/>:products.length===0?<Empty text="Brak produktów!" C={C}/>:(
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {products.map(p=>{const inv=p.inventory?.[0]||{};const stock=(inv.quantity||0)-(inv.reserved||0);const isLow=stock<=(inv.min_threshold||5);
            return <Card key={p.id} C={C} style={{ padding:"13px 14px",borderLeft:`4px solid ${isLow?C.red:C.accent}` }}><div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}><div style={{ flex:1 }}><div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:5,flexWrap:"wrap" }}><span style={{ fontSize:14,fontWeight:700,color:C.text }}>{p.name}</span>{p.status==="draft"&&<span style={{ fontSize:10,background:C.amberBg,color:"#92400e",padding:"2px 7px",borderRadius:100,fontWeight:600 }}>SZKIC</span>}</div><span style={{ fontSize:11,background:C.alt,color:C.mid,padding:"2px 8px",borderRadius:6,border:`1px solid ${C.border}` }}>{p.sku}</span></div><div style={{ textAlign:"right",flexShrink:0,marginLeft:10 }}><div style={{ fontSize:17,fontWeight:800,color:C.text }}>{parseFloat(p.price||0).toFixed(2)} zł</div><div style={{ fontSize:13,fontWeight:700,marginTop:3,color:isLow?C.red:C.green }}>{stock} szt.</div></div></div><button onClick={()=>setEditProduct(p)} style={{ marginTop:8,width:"100%",padding:"6px",borderRadius:7,border:`1px solid ${C.border}`,background:C.surface,fontSize:12,cursor:"pointer",color:C.mid,fontFamily:"inherit" }}>✏ Edytuj kartę produktu</button></Card>;
          })}
        </div>
      )}
      {(showNewForm||editProduct)&&<ProductCardModal product={editProduct} onClose={()=>{setShowNewForm(false);setEditProduct(null);}} onSave={load} C={C}/>}
    </div>
  );

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h2 style={{ fontSize:20,fontWeight:700,color:C.text }}>Katalog produktów</h2>
        <div style={{ display:"flex",gap:10 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Szukaj produktu..." style={{ width:260,padding:"8px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:C.surface,color:C.text,outline:"none" }}/>
          <button onClick={exportCSV} style={{ padding:"8px 16px",borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,fontSize:13,cursor:"pointer",color:C.mid,fontFamily:"inherit" }}>⬇ Eksport</button>
          <button onClick={()=>setShowNewForm(true)} style={{ padding:"8px 20px",borderRadius:8,border:"none",background:C.navy||C.accent,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap" }}>+ Dodaj produkt</button>
        </div>
      </div>
      {error&&<div style={{ fontSize:13,color:C.red,marginBottom:16,padding:"10px 16px",background:C.redBg,borderRadius:8 }}>⚠ {error}</div>}
      <Card C={C} style={{ overflow:"hidden" }}>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead><tr style={{ background:C.alt,borderBottom:`1px solid ${C.border}` }}>{["SKU","Produkt","VAT","Cena","Stan","Status","Akcje"].map(h=><th key={h} style={{ padding:"12px 16px",textAlign:"left",fontSize:11,color:C.soft,fontWeight:600,letterSpacing:0.8 }}>{h.toUpperCase()}</th>)}</tr></thead>
          <tbody>
            {loading?<tr><td colSpan={7}><Spinner size={24} C={C}/></td></tr>
            :products.length===0?<tr><td colSpan={7}><Empty text="Brak produktów. Dodaj pierwszy!" C={C}/></td></tr>
            :products.map((p,i)=>{const inv=p.inventory?.[0]||{};const stock=(inv.quantity||0)-(inv.reserved||0);const isLow=stock<=(inv.min_threshold||5);
              return <tr key={p.id} style={{ borderBottom:`1px solid ${C.borderLight}`,background:i%2===0?C.surface:C.alt }}>
                <td style={{ padding:"14px 16px",fontFamily:"monospace",fontSize:12,color:C.soft }}>{p.sku}</td>
                <td style={{ padding:"14px 16px" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    {p.images?.[0]?<img src={p.images[0]} style={{ width:40,height:40,borderRadius:6,objectFit:"cover",border:`1px solid ${C.border}` }}/>:<div style={{ width:40,height:40,borderRadius:6,background:C.alt,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>📦</div>}
                    <div><div style={{ fontSize:14,fontWeight:600,color:C.text,marginBottom:2 }}>{p.name}</div>{p.brand&&<div style={{ fontSize:12,color:C.soft }}>{p.brand}</div>}</div>
                  </div>
                </td>
                <td style={{ padding:"14px 16px",fontSize:13,color:C.mid }}>{p.vat_rate}%</td>
                <td style={{ padding:"14px 16px",fontFamily:"monospace",fontSize:14,fontWeight:700,color:C.text }}>{parseFloat(p.price||0).toFixed(2)} zł</td>
                <td style={{ padding:"14px 16px" }}><div style={{ display:"flex",alignItems:"center",gap:8 }}><div style={{ width:60,height:6,background:C.border,borderRadius:3,overflow:"hidden" }}><div style={{ height:"100%",width:`${Math.min(((inv.quantity||0)/100)*100,100)}%`,background:isLow?C.red:C.accent,borderRadius:3 }}/></div><span style={{ fontSize:13,fontWeight:700,color:isLow?C.red:C.green }}>{stock}</span></div></td>
                <td style={{ padding:"14px 16px" }}>{p.status==="draft"?<Pill label="Szkic" color={C.amber} bg={C.amberBg} textColor="#92400e"/>:<Pill label="Aktywny" color={C.green} bg={C.greenBg} textColor="#065f46"/>}</td>
                <td style={{ padding:"14px 16px" }}><button onClick={()=>setEditProduct(p)} style={{ padding:"6px 14px",borderRadius:7,border:`1px solid ${C.border}`,background:C.surface,fontSize:12,cursor:"pointer",color:C.mid,fontFamily:"inherit" }}>✏ Edytuj</button></td>
              </tr>;
            })}
          </tbody>
        </table>
      </Card>
      {(showNewForm||editProduct)&&<ProductCardModal product={editProduct} onClose={()=>{setShowNewForm(false);setEditProduct(null);}} onSave={load} C={C}/>}
    </div>
  );
};

// ── ALLEGRO AUTH MODAL (Device Flow) ───────────────────────
const AllegroAuthModal = ({ channel, onClose, onSuccess, C }) => {
  const [step,setStep]=useState("start"); // start | waiting | done | error
  const [authData,setAuthData]=useState(null);
  const [message,setMessage]=useState("");
  const [pollTimer,setPollTimer]=useState(null);

  const startAuth=async()=>{
    setStep("loading");setMessage("Uruchamianie autoryzacji...");
    const res=await apiFetch(`/allegro?action=auth-start`,{method:"POST",body:JSON.stringify({channel_id:channel.id})});
    if(!res.success){setStep("error");setMessage(res.error||"Błąd autoryzacji");return;}
    setAuthData(res.data);
    setStep("waiting");
    setMessage("Otwórz link poniżej i zaloguj się na swoje konto Allegro");
    // Start polling
    const interval=setInterval(async()=>{
      const poll=await apiFetch(`/allegro?action=auth-poll`,{method:"POST",body:JSON.stringify({channel_id:channel.id,device_code:res.data.device_code})});
      console.log("Poll response:", JSON.stringify(poll));
      const status = poll?.data?.status || poll?.status;
      if(status==="authorized" || poll?.data?.access_token){
        clearInterval(interval);setStep("done");setMessage("✅ Połączono z Allegro!");
        setTimeout(()=>{onSuccess();onClose();},1500);
      } else if(status==="pending" || poll?.data?.error==="authorization_pending"){
        // nadal czekamy
      } else if(poll?.success===false){
        clearInterval(interval);setStep("error");setMessage(poll.error||"Błąd podczas autoryzacji");
      }
    },(res.data.interval||5)*1000);
    setPollTimer(interval);
  };

  useEffect(()=>()=>{ if(pollTimer) clearInterval(pollTimer); },[pollTimer]);

  return (
    <Modal title={`Połącz z Allegro — ${channel.name}`} onClose={onClose} C={C} width={520}>
      {/* Krok 1 — start */}
      {step==="start"&&(
        <div style={{ textAlign:"center",padding:"20px 0" }}>
          <div style={{ fontSize:48,marginBottom:16 }}>🛒</div>
          <div style={{ fontSize:16,fontWeight:700,color:C.text,marginBottom:8 }}>Autoryzacja przez Allegro OAuth 2.0</div>
          <div style={{ fontSize:13,color:C.soft,marginBottom:24,lineHeight:1.7 }}>
            Kliknij przycisk poniżej. Otworzymy stronę Allegro<br/>gdzie zalogujesz się i zatwierdzisz dostęp.
          </div>
          <div style={{ background:C.alt,borderRadius:10,padding:16,marginBottom:24,textAlign:"left" }}>
            <div style={{ fontSize:12,fontWeight:600,color:C.soft,marginBottom:8 }}>CO OTRZYMA DOSTĘP:</div>
            {["Odczyt zamówień","Aktualizacja stanów magazynowych","Zarządzanie ofertami","Dane konta"].map(p=>(
              <div key={p} style={{ display:"flex",alignItems:"center",gap:8,fontSize:13,color:C.mid,marginBottom:4 }}><span style={{ color:C.green }}>✓</span>{p}</div>
            ))}
          </div>
          <button onClick={startAuth} style={{ width:"100%",padding:"14px",borderRadius:10,border:"none",background:C.orange,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
            🔐 Połącz z Allegro
          </button>
        </div>
      )}

      {/* Krok 2 — loading */}
      {step==="loading"&&(
        <div style={{ textAlign:"center",padding:"32px 0" }}>
          <Spinner size={24} C={C}/>
          <div style={{ fontSize:14,color:C.mid,marginTop:16 }}>{message}</div>
        </div>
      )}

      {/* Krok 3 — czekamy na użytkownika */}
      {step==="waiting"&&authData&&(
        <div>
          <div style={{ background:C.orangeBg,borderRadius:12,padding:20,marginBottom:20,border:`1px solid ${C.orange}33` }}>
            <div style={{ fontSize:13,fontWeight:600,color:C.orange,marginBottom:8 }}>KROK 1 — Otwórz link i zaloguj się</div>
            <a href={authData.verification_uri} target="_blank" rel="noreferrer" style={{ display:"block",padding:"12px 16px",background:C.orange,color:"#fff",borderRadius:9,textDecoration:"none",fontSize:14,fontWeight:700,textAlign:"center",marginBottom:10 }}>
              🔗 Otwórz stronę autoryzacji Allegro
            </a>
            <div style={{ fontSize:12,color:C.soft,textAlign:"center" }}>lub wpisz ręcznie: <strong style={{ color:C.text }}>allegro.pl/autoryzacja</strong></div>
          </div>

          <div style={{ background:C.alt,borderRadius:12,padding:20,marginBottom:20,textAlign:"center" }}>
            <div style={{ fontSize:12,fontWeight:600,color:C.soft,marginBottom:8 }}>KROK 2 — Wpisz kod na stronie Allegro</div>
            <div style={{ fontSize:32,fontWeight:800,color:C.accent,letterSpacing:6,fontFamily:"monospace" }}>
              {authData.user_code}
            </div>
          </div>

          <div style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:C.blueBg,borderRadius:10 }}>
            <div style={{ width:20,height:20,border:`2px solid ${C.accent}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",flexShrink:0 }}/>
            <div style={{ fontSize:13,color:C.blue }}>Oczekiwanie na autoryzację... Polling co {authData.interval||5}s</div>
          </div>
        </div>
      )}

      {/* Krok 4 — sukces */}
      {step==="done"&&(
        <div style={{ textAlign:"center",padding:"32px 0" }}>
          <div style={{ fontSize:48,marginBottom:16 }}>🎉</div>
          <div style={{ fontSize:18,fontWeight:700,color:C.green,marginBottom:8 }}>Połączono z Allegro!</div>
          <div style={{ fontSize:14,color:C.soft }}>Kanał jest teraz aktywny. Możesz synchronizować zamówienia.</div>
        </div>
      )}

      {/* Błąd */}
      {step==="error"&&(
        <div style={{ textAlign:"center",padding:"20px 0" }}>
          <div style={{ fontSize:48,marginBottom:16 }}>❌</div>
          <div style={{ fontSize:16,fontWeight:600,color:C.red,marginBottom:8 }}>Błąd autoryzacji</div>
          <div style={{ fontSize:13,color:C.soft,marginBottom:20 }}>{message}</div>
          <button onClick={()=>setStep("start")} style={{ padding:"10px 24px",borderRadius:9,border:"none",background:C.accent,color:"#fff",fontSize:14,cursor:"pointer",fontFamily:"inherit",fontWeight:600 }}>Spróbuj ponownie</button>
        </div>
      )}
    </Modal>
  );
};

// ── CHANNELS TAB ───────────────────────────────────────────
const ChannelsTab = ({ isMobile, C }) => {
  const [channels,setChannels]=useState([]);
  const [loading,setLoading]=useState(true);
  const [testing,setTesting]=useState(null);
  const [syncing,setSyncing]=useState(null);
  const [testResult,setTestResult]=useState({});
  const [configModal,setConfigModal]=useState(null);
  const [allegroModal,setAllegroModal]=useState(null);
  const [configData,setConfigData]=useState({});
  const [saving,setSaving]=useState(false);
  const [editingName,setEditingName]=useState(null);
  const [newName,setNewName]=useState("");

  const loadCh=async()=>{ setLoading(true);const res=await apiFetch("/channels");if(res.success)setChannels(res.data||[]);setLoading(false); };
  useEffect(()=>{loadCh();},[]);

  const testConn=async(id)=>{ setTesting(id);const res=await apiFetch(`/channels/${id}/test`,{method:"POST",body:"{}"});setTestResult(p=>({...p,[id]:res.data||res}));setTesting(null); };

  const syncOrders=async(ch)=>{
    setSyncing(ch.id);
    const res=await apiFetch(`/allegro?action=sync-orders`,{method:"POST",body:JSON.stringify({channel_id:ch.id,tenant_id:TENANT_ID})});
    setTestResult(p=>({...p,[ch.id]:{ has_keys:res.success, message:res.data?.message||res.error||"Błąd synchronizacji" }}));
    setSyncing(null);
  };

  const saveName=async(id)=>{
    await apiFetch(`/channels/${id}`,{method:"PUT",body:JSON.stringify({name:newName})});
    setEditingName(null);setNewName("");await loadCh();
  };

  const saveConfig=async()=>{
    setSaving(true);
    await apiFetch(`/channels/${configModal.id}`,{method:"PUT",body:JSON.stringify(configData)});
    setSaving(false);setConfigModal(null);await loadCh();
  };

  const inp={style:{width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:C.surface,color:C.text,outline:"none",boxSizing:"border-box"}};

  const ConfigFields=({ch})=> ch.type==="woocommerce"?(
    <>
      <div style={{ fontSize:13,color:C.mid,marginBottom:16,padding:"10px 12px",background:C.blueBg,borderRadius:8 }}>WooCommerce → Ustawienia → Zaawansowane → REST API</div>
      {[{key:"shop_url",label:"URL sklepu",ph:"https://twojsklep.pl"},{key:"api_key",label:"Consumer Key",ph:"ck_xxxxxxxxxxxxxxxxxxxx"},{key:"api_secret",label:"Consumer Secret",ph:"cs_xxxxxxxxxxxxxxxxxxxx"}].map(f=>(
        <div key={f.key} style={{ marginBottom:14 }}><div style={{ fontSize:11,fontWeight:600,color:C.soft,marginBottom:6 }}>{f.label}</div><input {...inp} placeholder={f.ph} value={configData[f.key]||""} onChange={e=>setConfigData({...configData,[f.key]:e.target.value})} type={f.key==="api_secret"?"password":"text"}/></div>
      ))}
    </>
  ):<div style={{ fontSize:13,color:C.soft }}>Konfiguracja w przygotowaniu.</div>;

  return (
    <div style={{ padding:isMobile?"12px 12px 20px":0 }}>
      {!isMobile&&<div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h2 style={{ fontSize:20,fontWeight:700,color:C.text }}>Kanały sprzedaży</h2>
        <div style={{ fontSize:13,color:C.soft }}>{channels.length} kanałów · <span style={{ color:C.green }}>Allegro Sandbox</span></div>
      </div>}
      {loading?<Spinner size={24} C={C}/>:(
        <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill,minmax(340px,1fr))",gap:isMobile?8:16 }}>
          {channels.map(ch=>{
            const src=ch.type==="allegro"?SOURCE.allegro:SOURCE.woocommerce;
            const tr=testResult[ch.id];
            const isEditing=editingName===ch.id;
            const isAllegro=ch.type==="allegro";
            const isConnected=ch.is_active&&(ch.access_token||ch.token_expires_at||ch.has_token);

            return (
              <Card key={ch.id} C={C} style={{ padding:20,border:isConnected?`1px solid ${C.green}`:`1px solid ${C.border}` }}>
                {/* Nagłówek */}
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                      <Pill label={isAllegro?"Allegro":"WooCommerce"} color={src.color} bg={src.bg} textColor={src.color}/>
                      <span style={{ fontSize:12,background:C.alt,color:C.mid,padding:"2px 8px",borderRadius:6,border:`1px solid ${C.border}` }}>{ch.country}</span>
                      {isAllegro&&<span style={{ fontSize:10,background:"#fff7ed",color:"#ea580c",padding:"2px 6px",borderRadius:4,fontWeight:600 }}>SANDBOX</span>}
                    </div>
                    {isEditing?(
                      <div style={{ display:"flex",gap:6,alignItems:"center" }}>
                        <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveName(ch.id)} autoFocus style={{ flex:1,padding:"6px 10px",borderRadius:7,border:`1px solid ${C.accent}`,fontSize:14,fontWeight:600,fontFamily:"inherit",background:C.surface,color:C.text,outline:"none" }}/>
                        <button onClick={()=>saveName(ch.id)} style={{ padding:"6px 12px",borderRadius:7,border:"none",background:C.accent,color:"#fff",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:600 }}>✓</button>
                        <button onClick={()=>setEditingName(null)} style={{ padding:"6px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:C.surface,color:C.mid,fontSize:12,cursor:"pointer",fontFamily:"inherit" }}>✕</button>
                      </div>
                    ):(
                      <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                        <div style={{ fontSize:16,fontWeight:700,color:C.text }}>{ch.name}</div>
                        <button onClick={()=>{setEditingName(ch.id);setNewName(ch.name);}} style={{ border:"none",background:"transparent",cursor:"pointer",color:C.soft,fontSize:13,padding:2 }}>✏</button>
                      </div>
                    )}
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:5,flexShrink:0 }}>
                    <span style={{ width:8,height:8,borderRadius:"50%",background:isConnected?C.green:C.soft,display:"block" }}/>
                    <span style={{ fontSize:11,color:isConnected?C.green:C.soft,fontWeight:600 }}>{isConnected?"Połączony":"Niepołączony"}</span>
                  </div>
                </div>

                {/* Wynik testu / synchronizacji */}
                {tr&&<div style={{ marginBottom:12,fontSize:13,padding:"8px 12px",borderRadius:8,background:tr.has_keys?C.greenBg:C.amberBg,color:tr.has_keys?"#065f46":"#92400e" }}>{tr.has_keys?"✅":"⚠️"} {tr.message}</div>}

                {/* Przyciski akcji */}
                {isAllegro?(
                  <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                    <button onClick={()=>setAllegroModal(ch)} style={{ width:"100%",padding:"10px",borderRadius:9,border:isConnected?`1px solid ${C.green}`:"none",background:isConnected?C.greenBg:C.orange,color:isConnected?"#065f46":"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
                      {isConnected?"✅ Połączono — odśwież token":"🔐 Połącz z Allegro (OAuth)"}
                    </button>
                    {isConnected&&(
                      <div style={{ display:"flex",gap:8 }}>
                        <button onClick={()=>testConn(ch.id)} disabled={testing===ch.id} style={{ flex:1,padding:"8px",borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,fontSize:12,cursor:"pointer",color:C.mid,fontFamily:"inherit",opacity:testing===ch.id?0.6:1 }}>
                          {testing===ch.id?"...":"🔍 Status"}
                        </button>
                        <button onClick={()=>syncOrders(ch)} disabled={syncing===ch.id} style={{ flex:2,padding:"8px",borderRadius:8,border:"none",background:C.accent,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:syncing===ch.id?0.6:1 }}>
                          {syncing===ch.id?"⏳ Synchronizacja...":"⬇ Synchronizuj zamówienia"}
                        </button>
                      </div>
                    )}
                  </div>
                ):(
                  <div style={{ display:"flex",gap:8 }}>
                    <button onClick={()=>testConn(ch.id)} disabled={testing===ch.id} style={{ flex:1,padding:"8px",borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,fontSize:13,cursor:"pointer",color:C.mid,fontFamily:"inherit",opacity:testing===ch.id?0.6:1 }}>{testing===ch.id?"Testowanie...":"🔍 Testuj"}</button>
                    <button onClick={()=>{setConfigModal(ch);setConfigData({});}} style={{ padding:"8px 16px",borderRadius:8,border:"none",background:C.accent,color:"#fff",fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:600 }}>⚙ Konfiguruj</button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal WooCommerce config */}
      {configModal&&(
        <Modal title={`Konfiguracja: ${configModal.name}`} onClose={()=>setConfigModal(null)} C={C}>
          <ConfigFields ch={configModal}/>
          <div style={{ display:"flex",gap:10,marginTop:20 }}>
            <button onClick={()=>setConfigModal(null)} style={{ flex:1,padding:10,borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,fontSize:13,cursor:"pointer",color:C.mid,fontFamily:"inherit" }}>Anuluj</button>
            <button onClick={saveConfig} disabled={saving} style={{ flex:2,padding:10,borderRadius:8,border:"none",background:C.navy||C.accent,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:saving?0.7:1 }}>{saving?"Zapisywanie...":"💾 Zapisz i połącz"}</button>
          </div>
        </Modal>
      )}

      {/* Modal Allegro OAuth */}
      {allegroModal&&(
        <AllegroAuthModal channel={allegroModal} onClose={()=>setAllegroModal(null)} onSuccess={loadCh} C={C}/>
      )}
    </div>
  );
};

// ── COURIERS TAB ───────────────────────────────────────────
const CouriersTab = ({ isMobile, C }) => {
  const [configModal,setConfigModal]=useState(null);
  const [configData,setConfigData]=useState({});
  const [saving,setSaving]=useState(false);
  const [connected,setConnected]=useState({});
  const couriers=[
    {id:"allegro_delivery",name:"Wysyłam z Allegro",logo:"🛒",color:"#ea580c",bg:"#fff7ed",description:"Oficjalna usługa dostawy Allegro. Automatyczne nadawanie przesyłek z panelu.",features:["Automatyczne etykiety","Śledzenie przesyłek","Allegro Smart!","InPost, DPD, DHL i inne"],fields:[{key:"allegro_account",label:"Konto Allegro",ph:"login@allegro.pl"},{key:"allegro_delivery_token",label:"Token API dostawy",ph:"Token z ustawień konta Allegro"}]},
    {id:"inpost",name:"InPost Paczkomaty",logo:"📦",color:"#f59e0b",bg:"#fffde7",description:"Sieć Paczkomatów InPost — najpopularniejsza dostawa w Polsce.",features:["24/7 odbiór","Paczkomaty","Kurier InPost","API v3"],fields:[{key:"inpost_token",label:"Token API InPost",ph:"Token z manager.inpost.pl"},{key:"inpost_org_id",label:"ID organizacji",ph:"Np: 12345"}]},
    {id:"dpd",name:"DPD Polska",logo:"🚚",color:"#dc2626",bg:"#fff0f0",description:"Kurier DPD — szybka dostawa na terenie Polski i Europy.",features:["Dostawa krajowa","Dostawa do Europy","Kurier na żądanie","Śledzenie online"],fields:[{key:"dpd_login",label:"Login DPD",ph:"login@firma.pl"},{key:"dpd_password",label:"Hasło API",ph:"Hasło z umowy DPD"},{key:"dpd_fid",label:"FID (numer umowy)",ph:"Np: 123456"}]},
    {id:"dhl",name:"DHL Express",logo:"✈️",color:"#d97706",bg:"#fffbeb",description:"DHL Express — ekspresowa dostawa krajowa i międzynarodowa.",features:["Ekspresowa dostawa","Dostawa międzynarodowa","Śledzenie real-time","Ubezpieczenie"],fields:[{key:"dhl_account",label:"Numer konta DHL",ph:"Np: 123456789"},{key:"dhl_key",label:"Klucz API",ph:"Klucz z portalu DHL"},{key:"dhl_password",label:"Hasło API",ph:"Hasło API DHL"}]},
  ];
  const inp={style:{width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:C.surface,color:C.text,outline:"none",boxSizing:"border-box"}};
  const saveConfig=async()=>{ setSaving(true);await new Promise(r=>setTimeout(r,800));setConnected(p=>({...p,[configModal.id]:true}));setSaving(false);setConfigModal(null); };
  return (
    <div style={{ padding:isMobile?"12px 12px 20px":0 }}>
      {!isMobile&&<div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}><h2 style={{ fontSize:20,fontWeight:700,color:C.text }}>Kurierzy</h2><div style={{ fontSize:13,color:C.soft }}>{Object.values(connected).filter(Boolean).length} połączonych</div></div>}
      <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill,minmax(320px,1fr))",gap:isMobile?12:16 }}>
        {couriers.map(c=>{ const isConn=connected[c.id]; return (
          <Card key={c.id} C={C} style={{ padding:20,border:isConn?`1px solid ${C.green}`:`1px solid ${C.border}` }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}><div style={{ width:44,height:44,borderRadius:10,background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`1px solid ${c.color}33`,flexShrink:0 }}>{c.logo}</div><div><div style={{ fontSize:15,fontWeight:700,color:C.text }}>{c.name}</div><div style={{ fontSize:11,color:C.soft,marginTop:2 }}>API Integration</div></div></div>
              <div style={{ display:"flex",alignItems:"center",gap:5 }}><span style={{ width:7,height:7,borderRadius:"50%",background:isConn?C.green:C.soft,display:"block" }}/><span style={{ fontSize:11,color:isConn?C.green:C.soft,fontWeight:600 }}>{isConn?"Połączony":"Niepołączony"}</span></div>
            </div>
            <p style={{ fontSize:13,color:C.mid,marginBottom:12,lineHeight:1.5 }}>{c.description}</p>
            <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:14 }}>{c.features.map(f=><span key={f} style={{ fontSize:11,background:C.alt,color:C.mid,padding:"3px 8px",borderRadius:100,border:`1px solid ${C.border}` }}>{f}</span>)}</div>
            <button onClick={()=>{setConfigModal(c);setConfigData({});}} style={{ width:"100%",padding:"9px",borderRadius:8,border:isConn?`1px solid ${C.green}`:"none",background:isConn?C.greenBg:C.navy||C.accent,color:isConn?"#065f46":"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>{isConn?"✅ Skonfigurowany — edytuj":"⚙ Konfiguruj połączenie API"}</button>
          </Card>
        );})}
      </div>
      {configModal&&(
        <Modal title={`Konfiguracja: ${configModal.name}`} onClose={()=>setConfigModal(null)} C={C}>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:20,padding:"12px 14px",background:configModal.bg,borderRadius:10,border:`1px solid ${configModal.color}33` }}><span style={{ fontSize:24 }}>{configModal.logo}</span><div><div style={{ fontSize:14,fontWeight:600,color:C.text }}>{configModal.name}</div><div style={{ fontSize:12,color:C.soft }}>{configModal.description}</div></div></div>
          {configModal.fields.map(f=><div key={f.key} style={{ marginBottom:14 }}><div style={{ fontSize:11,fontWeight:600,color:C.soft,marginBottom:6 }}>{f.label}</div><input {...inp} placeholder={f.ph} value={configData[f.key]||""} onChange={e=>setConfigData({...configData,[f.key]:e.target.value})} type={f.key.includes("password")||f.key.includes("token")||f.key.includes("secret")?"password":"text"}/></div>)}
          <div style={{ padding:"10px 12px",background:C.alt,borderRadius:8,marginBottom:16 }}><div style={{ fontSize:11,color:C.soft,marginBottom:4,fontWeight:600 }}>DOSTĘPNE FUNKCJE:</div>{configModal.features.map(f=><div key={f} style={{ fontSize:12,color:C.mid,display:"flex",alignItems:"center",gap:6,marginBottom:2 }}><span style={{ color:C.green }}>✓</span>{f}</div>)}</div>
          <div style={{ display:"flex",gap:10 }}>
            <button onClick={()=>setConfigModal(null)} style={{ flex:1,padding:10,borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,fontSize:13,cursor:"pointer",color:C.mid,fontFamily:"inherit" }}>Anuluj</button>
            <button onClick={saveConfig} disabled={saving} style={{ flex:2,padding:10,borderRadius:8,border:"none",background:C.navy||C.accent,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:saving?0.7:1 }}>{saving?"Łączenie...":"💾 Zapisz i połącz"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── DELIVERIES TAB ─────────────────────────────────────────
const DeliveriesTab = ({ C }) => {
  const [deliveries,setDeliveries]=useState(MOCK_DELIVERIES);
  const [selected,setSelected]=useState(null);
  const [fStatus,setFStatus]=useState("all");
  const [receiving,setReceiving]=useState(null);
  const [receiveData,setReceiveData]=useState({});
  const [showNewModal,setShowNewModal]=useState(false);
  const [newDel,setNewDel]=useState({ supplier:"", country:"PL", tracking:"", carrier:"DHL", amount:"", status:"pending", products:[{name:"",qty_expected:1,ean:""}] });
  const filtered=fStatus==="all"?deliveries:deliveries.filter(d=>d.status===fStatus);
  const sel={style:{background:C.surface,color:C.text,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"inherit",cursor:"pointer",outline:"none"}};
  const totalItems=(d)=>d.products.reduce((s,p)=>s+p.qty_expected,0);
  const addDelivery=()=>{
    const d={...newDel,id:`DEL-${String(deliveries.length+1).padStart(3,"0")}`,amount:parseFloat(newDel.amount)||0,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
    setDeliveries(prev=>[d,...prev]);setShowNewModal(false);setNewDel({supplier:"",country:"PL",tracking:"",carrier:"DHL",amount:"",status:"pending",products:[{name:"",qty_expected:1,ean:""}]});
  };
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h2 style={{ fontSize:20,fontWeight:700,color:C.text }}>Dostawy — Przyjęcia towarów</h2>
        <div style={{ display:"flex",gap:10 }}>
          <select {...sel} value={fStatus} onChange={e=>setFStatus(e.target.value)}>
            <option value="all">Wszystkie statusy</option>
            {Object.entries(DELIVERY_STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
          <button onClick={()=>setShowNewModal(true)} style={{ padding:"8px 20px",borderRadius:8,border:"none",background:C.navy||C.accent,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>+ Nowe przyjęcie</button>
        </div>
      </div>
      {/* Summary badges */}
      <div style={{ display:"flex",gap:10,marginBottom:20 }}>
        {Object.entries(DELIVERY_STATUS).map(([k,v])=>{const count=deliveries.filter(d=>d.status===k).length;return(<div key={k} style={{ padding:"8px 16px",borderRadius:9,background:v.bg,border:`1px solid ${v.dot}33`,fontSize:13,fontWeight:600,color:v.text,display:"flex",alignItems:"center",gap:6 }}><span style={{ width:7,height:7,borderRadius:"50%",background:v.dot,display:"block" }}/>{v.label}: {count}</div>);})}
      </div>
      <Card C={C} style={{ overflow:"hidden" }}>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead><tr style={{ background:C.alt,borderBottom:`1px solid ${C.border}` }}>
            {["# Numer","Dostawca","Produkty","Dostawa","Kwota","Status","Data","Akcje"].map(h=><th key={h} style={{ padding:"12px 16px",textAlign:"left",fontSize:11,color:C.soft,fontWeight:600,letterSpacing:0.8 }}>{h.toUpperCase()}</th>)}
          </tr></thead>
          <tbody>
            {filtered.length===0?<tr><td colSpan={8}><Empty text="Brak dochodząc towarów" C={C}/></td></tr>:filtered.map((d,i)=>{
              const st=DELIVERY_STATUS[d.status]||DELIVERY_STATUS.pending;const isOpen=selected===d.id;
              return [
                <tr key={d.id} style={{ borderBottom:`1px solid ${C.borderLight}`,background:isOpen?`${C.accent}08`:i%2===0?C.surface:C.alt }}>
                  <td style={{ padding:"14px 16px",fontFamily:"monospace",fontSize:12,fontWeight:700,color:C.accent }}>{d.id}</td>
                  <td style={{ padding:"14px 16px" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={{ fontSize:18 }}>{COUNTRY_FLAGS[d.country]||"🌍"}</span><div><div style={{ fontSize:13,fontWeight:600,color:C.text }}>{d.supplier}</div><div style={{ fontSize:11,color:C.soft }}>{d.country}</div></div></div>
                  </td>
                  <td style={{ padding:"14px 16px" }}>
                    <div style={{ fontSize:13,color:C.text }}>{d.products[0]?.name}{d.products.length>1&&<span style={{ fontSize:11,color:C.soft }}> +{d.products.length-1} więcej</span>}</div>
                    <div style={{ fontSize:11,color:C.soft }}>{totalItems(d)} szt. łącznie</div>
                  </td>
                  <td style={{ padding:"14px 16px" }}>{d.tracking?<div><div style={{ fontSize:12,color:C.text,fontFamily:"monospace" }}>{d.tracking}</div><div style={{ fontSize:11,color:C.soft }}>{d.carrier}</div></div>:<span style={{ fontSize:12,color:C.soft }}>—</span>}</td>
                  <td style={{ padding:"14px 16px",fontFamily:"monospace",fontSize:14,fontWeight:700,color:C.text }}>{d.amount.toFixed(2)} PLN</td>
                  <td style={{ padding:"14px 16px" }}><Pill label={st.label} color={st.dot} bg={st.bg} textColor={st.text} dot={true}/></td>
                  <td style={{ padding:"14px 16px",fontSize:12,color:C.soft }}>{new Date(d.created_at).toLocaleDateString("pl-PL")}</td>
                  <td style={{ padding:"14px 16px" }}>
                    <div style={{ display:"flex",gap:5 }}>
                      <button onClick={()=>setSelected(isOpen?null:d.id)} style={{ padding:"5px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:isOpen?C.accent:C.surface,color:isOpen?"#fff":C.mid,fontSize:11,cursor:"pointer",fontFamily:"inherit" }}>{isOpen?"↑":"↓ Szczegóły"}</button>
                      {(d.status==="transit"||d.status==="pending")&&<button onClick={()=>{setReceiving(d);setReceiveData(Object.fromEntries(d.products.map(p=>[p.ean,p.qty_expected])));}} style={{ padding:"5px 10px",borderRadius:6,border:"none",background:C.green,color:"#fff",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:600 }}>$ Przyjmij</button>}
                    </div>
                  </td>
                </tr>,
                isOpen&&<tr key={`${d.id}-det`}><td colSpan={8} style={{ padding:"0 16px 16px",background:`${C.accent}06`,borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ padding:16,background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,marginTop:8 }}>
                    <div style={{ fontSize:11,fontWeight:700,color:C.soft,letterSpacing:1,marginBottom:10 }}>LISTA PRODUKTÓW</div>
                    <table style={{ width:"100%",borderCollapse:"collapse",marginBottom:16 }}>
                      <thead><tr style={{ background:C.alt }}>{["Produkt","EAN","Oczekiwano","Przyjęto","Różnica"].map(h=><th key={h} style={{ padding:"7px 12px",textAlign:"left",fontSize:11,color:C.soft,fontWeight:600 }}>{h}</th>)}</tr></thead>
                      <tbody>{d.products.map((p,pi)=>{const diff=p.qty_received-p.qty_expected;return(
                        <tr key={pi} style={{ borderBottom:`1px solid ${C.borderLight}` }}>
                          <td style={{ padding:"9px 12px",fontSize:13,color:C.text,fontWeight:500 }}>{p.name}</td>
                          <td style={{ padding:"9px 12px",fontSize:11,color:C.soft,fontFamily:"monospace" }}>{p.ean}</td>
                          <td style={{ padding:"9px 12px",fontSize:13,color:C.mid }}>{p.qty_expected}</td>
                          <td style={{ padding:"9px 12px",fontSize:13,fontWeight:700,color:d.status==="delivered"?C.green:C.soft }}>{d.status==="delivered"?p.qty_received:"—"}</td>
                          <td style={{ padding:"9px 12px",fontSize:13,fontWeight:700,color:diff>0?C.green:diff<0?C.red:C.mid }}>{d.status==="delivered"?(diff>0?`+${diff}`:diff<0?`${diff}`:"✓ OK"):"—"}</td>
                        </tr>
                      );})}</tbody>
                    </table>
                    <div style={{ display:"flex",gap:24,fontSize:12,color:C.mid }}>
                      <div><span style={{ color:C.soft }}>Utworzono: </span>{new Date(d.created_at).toLocaleString("pl-PL")}</div>
                      <div><span style={{ color:C.soft }}>Ostatnia zmiana: </span>{new Date(d.updated_at).toLocaleString("pl-PL")}</div>
                    </div>
                  </div>
                </td></tr>
              ];
            })}
          </tbody>
        </table>
      </Card>
      {/* Receive modal */}
      {receiving&&(
        <Modal title={`Przyjmij towar — ${receiving.id}`} onClose={()=>setReceiving(null)} C={C}>
          <div style={{ marginBottom:16,padding:"10px 14px",background:C.blueBg,borderRadius:8,fontSize:13,color:C.blue }}>📦 Zatwierdź przyjęcie towaru od: <strong>{receiving.supplier}</strong></div>
          {receiving.products.map(p=>(
            <div key={p.ean} style={{ marginBottom:14,padding:"12px",background:C.alt,borderRadius:9,border:`1px solid ${C.border}` }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                <div style={{ fontSize:13,fontWeight:600,color:C.text }}>{p.name}</div>
                <div style={{ fontSize:11,color:C.soft,fontFamily:"monospace" }}>{p.ean}</div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div><div style={{ fontSize:11,color:C.soft,marginBottom:4 }}>Oczekiwano</div><div style={{ fontSize:20,fontWeight:800,color:C.mid,fontFamily:"monospace" }}>{p.qty_expected}</div></div>
                <div>
                  <div style={{ fontSize:11,color:C.soft,marginBottom:4 }}>Przyjęto faktycznie</div>
                  <input type="number" value={receiveData[p.ean]??p.qty_expected} onChange={e=>setReceiveData(prev=>({...prev,[p.ean]:parseInt(e.target.value)||0}))} style={{ width:"100%",padding:"7px 10px",borderRadius:7,border:`1px solid ${C.accent}`,fontSize:16,fontWeight:700,fontFamily:"monospace",background:C.surface,color:C.text,outline:"none",boxSizing:"border-box" }}/>
                </div>
              </div>
            </div>
          ))}
          <div style={{ display:"flex",gap:10,marginTop:16 }}>
            <button onClick={()=>setReceiving(null)} style={{ flex:1,padding:10,borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,fontSize:13,cursor:"pointer",color:C.mid,fontFamily:"inherit" }}>Anuluj</button>
            <button onClick={()=>{setDeliveries(prev=>prev.map(d=>d.id===receiving.id?{...d,status:"delivered",updated_at:new Date().toISOString(),products:d.products.map(p=>({...p,qty_received:receiveData[p.ean]??p.qty_expected}))}:d));setReceiving(null);}} style={{ flex:2,padding:10,borderRadius:8,border:"none",background:C.green,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>✅ Zatwierdź przyjęcie towaru</button>
          </div>
        </Modal>
      )}
      {/* New delivery modal */}
      {showNewModal&&(
        <Modal title="Nowe przyjęcie towaru" onClose={()=>setShowNewModal(false)} C={C} width={560}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16 }}>
            {[{key:"supplier",label:"Dostawca *",ph:"Nazwa firmy"},{key:"country",label:"Kraj",ph:"PL"},{key:"tracking",label:"Nr listu przewozowego",ph:"PC123456789PL"},{key:"carrier",label:"Przewoźnik",ph:"DHL"},{key:"amount",label:"Kwota (PLN)",ph:"1500.00"}].map(f=>(
              <div key={f.key}><div style={{ fontSize:11,fontWeight:600,color:C.soft,marginBottom:5 }}>{f.label}</div><input value={newDel[f.key]} onChange={e=>setNewDel({...newDel,[f.key]:e.target.value})} placeholder={f.ph} style={{ width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:C.surface,color:C.text,outline:"none",boxSizing:"border-box" }}/></div>
            ))}
          </div>
          <div style={{ fontSize:11,fontWeight:600,color:C.soft,marginBottom:8 }}>PRODUKTY</div>
          {newDel.products.map((p,i)=>(
            <div key={i} style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1.5fr auto",gap:8,marginBottom:8 }}>
              <input value={p.name} onChange={e=>{const pr=[...newDel.products];pr[i]={...pr[i],name:e.target.value};setNewDel({...newDel,products:pr});}} placeholder="Nazwa produktu" style={{ padding:"8px 10px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:12,fontFamily:"inherit",background:C.surface,color:C.text,outline:"none" }}/>
              <input type="number" value={p.qty_expected} onChange={e=>{const pr=[...newDel.products];pr[i]={...pr[i],qty_expected:parseInt(e.target.value)||1};setNewDel({...newDel,products:pr});}} placeholder="Ilość" style={{ padding:"8px 10px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:12,fontFamily:"monospace",background:C.surface,color:C.text,outline:"none" }}/>
              <input value={p.ean} onChange={e=>{const pr=[...newDel.products];pr[i]={...pr[i],ean:e.target.value};setNewDel({...newDel,products:pr});}} placeholder="EAN" style={{ padding:"8px 10px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:12,fontFamily:"monospace",background:C.surface,color:C.text,outline:"none" }}/>
              <button onClick={()=>setNewDel({...newDel,products:newDel.products.filter((_,j)=>j!==i)})} style={{ width:32,borderRadius:7,border:`1px solid ${C.border}`,background:C.surface,color:C.red,cursor:"pointer",fontSize:14 }}>✕</button>
            </div>
          ))}
          <button onClick={()=>setNewDel({...newDel,products:[...newDel.products,{name:"",qty_expected:1,ean:""}]})} style={{ width:"100%",padding:"7px",borderRadius:7,border:`1px dashed ${C.border}`,background:C.alt,color:C.mid,fontSize:12,cursor:"pointer",fontFamily:"inherit",marginBottom:16 }}>+ Dodaj produkt</button>
          <div style={{ display:"flex",gap:10 }}>
            <button onClick={()=>setShowNewModal(false)} style={{ flex:1,padding:10,borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,fontSize:13,cursor:"pointer",color:C.mid,fontFamily:"inherit" }}>Anuluj</button>
            <button onClick={addDelivery} disabled={!newDel.supplier} style={{ flex:2,padding:10,borderRadius:8,border:"none",background:C.navy||C.accent,color:"#fff",fontSize:13,fontWeight:600,cursor:newDel.supplier?"pointer":"not-allowed",fontFamily:"inherit",opacity:newDel.supplier?1:0.5 }}>💾 Zapisz przyjęcie</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── ANALYTICS ──────────────────────────────────────────────
const AnalyticsTab = ({ stats, user, isMobile, C }) => (
  <div style={{ display:"flex",flexDirection:"column",gap:isMobile?12:20 }}>
    {!isMobile&&<h2 style={{ fontSize:20,fontWeight:700,color:C.text }}>Analityka sprzedaży</h2>}
    <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:isMobile?12:20 }}>
      <Card C={C} style={{ padding:isMobile?14:20 }}>
        <div style={{ fontSize:12,fontWeight:700,color:C.soft,letterSpacing:1,marginBottom:16 }}>STATUSY ZAMÓWIEŃ</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          {Object.entries(STATUS_CFG).map(([key,cfg])=>(
            <div key={key} style={{ background:cfg.bg,borderRadius:10,padding:14,border:`1px solid ${cfg.dot}33` }}>
              <div style={{ fontSize:28,fontWeight:800,color:cfg.dot,fontFamily:"monospace" }}>{stats.byStatus?.[key]||0}</div>
              <div style={{ fontSize:12,color:cfg.text,fontWeight:600,marginTop:4 }}>{cfg.label}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card C={C} style={{ padding:isMobile?14:20 }}>
        <div style={{ fontSize:12,fontWeight:700,color:C.soft,letterSpacing:1,marginBottom:16 }}>PODSUMOWANIE</div>
        {[{label:"Wszystkich zamówień",value:stats.totalOrders,color:C.accent},{label:"Produktów w katalogu",value:stats.totalProducts,color:C.green},{label:"Aktywnych kanałów",value:6,color:C.blue},{label:"Niski stan magazyn.",value:stats.lowStock,color:C.red}].map(s=>(
          <div key={s.label} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.borderLight}` }}>
            <span style={{ fontSize:14,color:C.text }}>{s.label}</span>
            <span style={{ fontSize:18,fontWeight:800,color:s.color,fontFamily:"monospace" }}>{s.value}</span>
          </div>
        ))}
      </Card>
    </div>
    <Card C={C} style={{ padding:isMobile?14:20 }}>
      <div style={{ fontSize:12,fontWeight:700,color:C.soft,letterSpacing:1,marginBottom:16 }}>ZALOGOWANY UŻYTKOWNIK</div>
      <div style={{ display:"flex",alignItems:"center",gap:14 }}>
        {user?.user_metadata?.avatar_url&&<img src={user.user_metadata.avatar_url} style={{ width:48,height:48,borderRadius:"50%",border:`2px solid ${C.border}` }}/>}
        <div><div style={{ fontSize:16,fontWeight:700,color:C.text }}>{user?.user_metadata?.full_name||"Użytkownik"}</div><div style={{ fontSize:13,color:C.soft }}>{user?.email}</div><div style={{ fontSize:11,color:C.soft,marginTop:2 }}>Tenant: Bazár Kaukazu</div></div>
      </div>
    </Card>
  </div>
);

// ── APP ROOT ───────────────────────────────────────────────
export default function App() {
  const [session,setSession]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [tab,setTab]=useState("dashboard");
  const [subTab,setSubTab]=useState(null);
  const [stats,setStats]=useState({newOrders:0,totalOrders:0,totalProducts:0,lowStock:0,byStatus:{}});
  const [isMobile,setIsMobile]=useState(window.innerWidth<768);
  const [theme,setTheme]=useState("light");
  const [searchQuery,setSearchQuery]=useState(null);

  // Определяем реальную тему
  const getEffectiveTheme=useCallback(()=>{
    if(theme==="auto") return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
    return theme;
  },[theme]);
  const C=THEMES[getEffectiveTheme()];

  useEffect(()=>{ const h=()=>setIsMobile(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h); },[]);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setSession(session);setAuthLoading(false);});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{setSession(session);setAuthLoading(false);});
    return()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!session) return;
    (async()=>{
      const [oR,pR,lR]=await Promise.all([apiFetch(`/orders?tenant_id=${TENANT_ID}`),apiFetch(`/products?tenant_id=${TENANT_ID}`),apiFetch("/inventory/low-stock")]);
      const orders=oR.data||[],products=pR.data||[],low=lR.data||[],byStatus={};
      orders.forEach(o=>{byStatus[o.status]=(byStatus[o.status]||0)+1;});
      setStats({newOrders:byStatus.new||0,totalOrders:orders.length,totalProducts:products.length,lowStock:low.length,byStatus});
    })();
  },[session]);

  const logout=async()=>{await supabase.auth.signOut();setSession(null);};

  if(authLoading) return (
    <div style={{ minHeight:"100vh",background:"#1a2e4a",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ width:44,height:44,border:"3px solid rgba(255,255,255,0.2)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if(!session) return <AuthScreen/>;

  const renderTab=(mobile=false)=>{
    if(tab==="dashboard")  return <DashboardTab stats={stats} C={C}/>;
    if(tab==="orders")     return <OrdersTab subTab={subTab||"orders-list"} isMobile={mobile} C={C}/>;
    if(tab==="products")   return <ProductsTab subTab={subTab||"products-list"} isMobile={mobile} C={C}/>;
    if(tab==="channels")   return <ChannelsTab isMobile={mobile} C={C}/>;
    if(tab==="couriers")   return <CouriersTab isMobile={mobile} C={C}/>;
    if(tab==="deliveries") return <DeliveriesTab C={C}/>;
    if(tab==="analytics")  return <AnalyticsTab stats={stats} user={session.user} isMobile={mobile} C={C}/>;
    return null;
  };

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",background:C.bg,minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:${C.alt};}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px;}
        button:active{opacity:0.85;}
        input:focus,select:focus{border-color:${C.accent}!important;box-shadow:0 0 0 3px ${C.accent}22;}
        tr:hover td{background:${C.accent}08!important;}
        textarea:focus{border-color:${C.accent}!important;box-shadow:0 0 0 3px ${C.accent}22;}
      `}</style>

      {isMobile ? (
        <div style={{ maxWidth:480,margin:"0 auto" }}>
          <MobileTopBar tab={tab} setTab={setTab} stats={stats} user={session.user} onLogout={logout} theme={theme} setTheme={setTheme} C={C}/>
          <div style={{ padding:"12px 0 0" }}>
            <div style={{ padding:"0 12px",marginBottom:12 }}><StatCards stats={stats} isMobile={true} C={C}/></div>
            {renderTab(true)}
          </div>
        </div>
      ) : (
        <>
          <Sidebar tab={tab} setTab={setTab} subTab={subTab} setSubTab={setSubTab} stats={stats} C={C}/>
          <TopBar user={session.user} onLogout={logout} theme={theme} setTheme={setTheme} C={C} onSearch={q=>q.trim()&&setSearchQuery(q.trim())}/>
          <main style={{ marginLeft:220,paddingTop:54 }}>
            <div style={{ padding:"28px 32px",minHeight:"calc(100vh - 54px)" }}>
              {renderTab(false)}
            </div>
          </main>
        </>
      )}
      {searchQuery&&<SearchResults query={searchQuery} C={C} onClose={()=>setSearchQuery(null)}/>}
    </div>
  );
}
