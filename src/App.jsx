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

// ── DESIGN TOKENS ──────────────────────────────────────────
const C = {
  navy:"#1a2e4a", navyLight:"#233a5c", accent:"#2563aa", accentHover:"#1d4e8f",
  bg:"#eef0f3", surface:"#ffffff", alt:"#f4f5f7", border:"#d8dce3", borderLight:"#e8eaed",
  text:"#1a1f2e", mid:"#4a5568", soft:"#8492a6",
  green:"#16a34a", greenBg:"#dcfce7", amber:"#d97706", amberBg:"#fef3c7",
  blue:"#2563eb", blueBg:"#dbeafe", purple:"#7c3aed", purpleBg:"#ede9fe",
  red:"#dc2626", redBg:"#fee2e2", orange:"#ea580c", orangeBg:"#fff7ed",
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

// ── SHARED ─────────────────────────────────────────────────
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

// ── AUTH ───────────────────────────────────────────────────
const AuthScreen = () => {
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const login = async () => {
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider:"google", options:{ redirectTo: window.location.origin }
    });
    if (error) { setError(error.message); setLoading(false); }
  };
  return (
    <div style={{ minHeight:"100vh",background:`linear-gradient(135deg,${C.navy} 0%,#2d4e7e 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
      <div style={{ background:C.surface,borderRadius:20,padding:"48px 40px",width:"100%",maxWidth:420,boxShadow:"0 24px 80px rgba(0,0,0,0.3)",textAlign:"center" }}>
        <div style={{ fontSize:64,marginBottom:20 }}>🍇</div>
        <h1 style={{ fontSize:28,fontWeight:800,color:C.navy,marginBottom:8 }}>Fruttino CRM</h1>
        <p style={{ fontSize:15,color:C.soft,marginBottom:36 }}>Panel zarządzania sprzedażą wielokanałową</p>
        <button onClick={login} disabled={loading} style={{ width:"100%",padding:"15px 20px",borderRadius:12,border:`1px solid ${C.border}`,background:C.surface,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:12,fontSize:15,fontWeight:600,color:C.text,fontFamily:"inherit",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",opacity:loading?0.7:1,transition:"all 0.2s" }}>
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

// ── SIDEBAR (Desktop) ──────────────────────────────────────
const Sidebar = ({ tab, setTab, stats, user, onLogout }) => {
  const nav = [
    { id:"dashboard", icon:"⊞",  label:"Dashboard"   },
    { id:"orders",    icon:"📦",  label:"Zamówienia",  badge:stats.newOrders },
    { id:"products",  icon:"🌿",  label:"Produkty",    badge:stats.lowStock>0?stats.lowStock:null },
    { id:"channels",  icon:"🔗",  label:"Kanały"       },
    { id:"analytics", icon:"📊",  label:"Analityka"    },
  ];
  return (
    <aside style={{ width:220,background:C.navy,minHeight:"100vh",display:"flex",flexDirection:"column",position:"fixed",left:0,top:0,bottom:0,zIndex:50 }}>
      {/* Logo */}
      <div style={{ padding:"24px 20px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>🍇</div>
          <div>
            <div style={{ fontSize:15,fontWeight:700,color:"#fff",lineHeight:1 }}>Fruttino</div>
            <div style={{ fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:1.5,marginTop:2 }}>CRM PANEL</div>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav style={{ padding:"12px 8px",flex:1 }}>
        {nav.map(item => (
          <button key={item.id} onClick={()=>setTab(item.id)} style={{
            width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
            borderRadius:10,border:"none",
            background: tab===item.id ? "rgba(255,255,255,0.12)" : "transparent",
            borderLeft: tab===item.id ? `3px solid #60a5fa` : "3px solid transparent",
            color: tab===item.id ? "#fff" : "rgba(255,255,255,0.5)",
            fontSize:13,fontWeight: tab===item.id ? 600 : 400,
            cursor:"pointer",fontFamily:"inherit",marginBottom:2,
            transition:"all 0.15s",textAlign:"left",
          }}>
            <span style={{ fontSize:16,width:20,textAlign:"center" }}>{item.icon}</span>
            <span style={{ flex:1 }}>{item.label}</span>
            {item.badge>0 && <span style={{ background:"#ef4444",color:"#fff",borderRadius:100,fontSize:10,fontWeight:700,padding:"1px 6px",minWidth:18,textAlign:"center" }}>{item.badge}</span>}
          </button>
        ))}
      </nav>
      {/* Connections */}
      <div style={{ padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:1,marginBottom:8 }}>POŁĄCZENIA</div>
        {[{dot:C.orange,label:"Allegro"},{dot:"#4ade80",label:"WooCommerce"}].map(c=>(
          <div key={c.label} style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:4 }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:c.dot,display:"block" }}/>
            {c.label}
          </div>
        ))}
      </div>
      {/* User */}
      <div style={{ padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
          <div style={{ width:32,height:32,borderRadius:"50%",overflow:"hidden",background:"rgba(255,255,255,0.15)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
            {user?.user_metadata?.avatar_url
              ? <img src={user.user_metadata.avatar_url} style={{ width:32,height:32,objectFit:"cover" }}/>
              : <span style={{ fontSize:12,fontWeight:700,color:"#fff" }}>{user?.email?.slice(0,2).toUpperCase()}</span>
            }
          </div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:12,fontWeight:600,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.user_metadata?.full_name||"Użytkownik"}</div>
            <div style={{ fontSize:10,color:"rgba(255,255,255,0.4)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ width:"100%",padding:"7px",borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(255,255,255,0.6)",fontSize:12,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s" }}>
          Wyloguj się
        </button>
      </div>
    </aside>
  );
};

// ── MOBILE TOP BAR ─────────────────────────────────────────
const MobileTopBar = ({ tab, setTab, stats, user, onLogout }) => {
  const tabs = [
    { id:"dashboard",icon:"⊞",label:"Home",   badge:null },
    { id:"orders",   icon:"📦",label:"Zamów.", badge:stats.newOrders },
    { id:"products", icon:"🌿",label:"Prod.",  badge:stats.lowStock>0?stats.lowStock:null },
    { id:"channels", icon:"🔗",label:"Kanały", badge:null },
    { id:"analytics",icon:"📊",label:"Stats",  badge:null },
  ];
  return (
    <>
      <div style={{ background:C.navy,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px 8px" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <span style={{ fontSize:22 }}>🍇</span>
            <span style={{ fontSize:15,fontWeight:700,color:"#fff" }}>Fruttino CRM</span>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ width:28,height:28,borderRadius:"50%",overflow:"hidden",background:"rgba(255,255,255,0.15)" }}>
              {user?.user_metadata?.avatar_url
                ? <img src={user.user_metadata.avatar_url} style={{ width:28,height:28,objectFit:"cover" }}/>
                : <div style={{ width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff" }}>{user?.email?.slice(0,2).toUpperCase()}</div>
              }
            </div>
            <button onClick={onLogout} style={{ background:"rgba(255,255,255,0.1)",border:"none",borderRadius:6,padding:"4px 8px",fontSize:11,color:"rgba(255,255,255,0.7)",cursor:"pointer",fontFamily:"inherit" }}>↩</button>
          </div>
        </div>
        <div style={{ display:"flex",borderTop:"1px solid rgba(255,255,255,0.08)" }}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1,padding:"8px 2px",background:"transparent",border:"none",
              borderBottom:tab===t.id?"2px solid #60a5fa":"2px solid transparent",
              color:tab===t.id?"#fff":"rgba(255,255,255,0.45)",
              fontSize:10,fontWeight:tab===t.id?600:400,
              cursor:"pointer",fontFamily:"inherit",
              display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:2,
            }}>
              <span style={{ fontSize:14 }}>{t.icon}</span>
              <span>{t.label}</span>
              {t.badge>0 && <span style={{ background:"#ef4444",color:"#fff",borderRadius:100,fontSize:8,fontWeight:700,padding:"0 4px" }}>{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

// ── STAT CARDS ─────────────────────────────────────────────
const StatCards = ({ stats, isMobile }) => {
  const items = [
    { label:"Nowe zamówienia",  value:stats.newOrders,     color:C.amber,  icon:"🔔", sub:"oczekujące" },
    { label:"Wszystkie zamów.", value:stats.totalOrders,   color:C.accent, icon:"📦", sub:"łącznie"    },
    { label:"Produkty",         value:stats.totalProducts, color:C.green,  icon:"🌿", sub:"w katalogu"  },
    { label:"Niski stan",       value:stats.lowStock,      color:C.red,    icon:"⚠️", sub:"wymaga uwagi"},
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(4,1fr)" : "repeat(4,1fr)", gap: isMobile ? 8 : 16, marginBottom: isMobile ? 0 : 24 }}>
      {items.map(s=>(
        <div key={s.label} style={{ background:C.surface,borderRadius: isMobile ? 10 : 12,border:`1px solid ${C.border}`,padding: isMobile ? "11px 8px" : "20px 20px",borderTop:`3px solid ${s.color}`,boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
          {!isMobile && <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
            <span style={{ fontSize:22 }}>{s.icon}</span>
            <span style={{ fontSize:11,color:C.soft,fontWeight:600,letterSpacing:0.5 }}>{s.sub.toUpperCase()}</span>
          </div>}
          <div style={{ fontSize: isMobile ? 22 : 32,fontWeight:800,color:s.color,fontFamily:"monospace",lineHeight:1 }}>{s.value}</div>
          <div style={{ fontSize: isMobile ? 10 : 13,color:C.soft,marginTop: isMobile ? 3 : 6,fontWeight:500 }}>{isMobile ? s.label.split(" ")[0] : s.label}</div>
        </div>
      ))}
    </div>
  );
};

// ── DASHBOARD ──────────────────────────────────────────────
const DashboardTab = ({ stats, isMobile }) => {
  const recentActivity = [
    { icon:"📦", text:"Nowe zamówienie z Allegro PL #1", time:"2 min temu", color:C.orange },
    { icon:"🌿", text:"Dodano produkt: Morele suszone 500g", time:"15 min temu", color:C.green },
    { icon:"🔗", text:"Allegro CZ — synchronizacja zakończona", time:"1 godz. temu", color:C.blue },
    { icon:"⚠️", text:"Mix owoców 1kg — niski stan magazynowy", time:"3 godz. temu", color:C.red },
  ];
  return (
    <div>
      {!isMobile && <StatCards stats={stats} isMobile={false}/>}
      <div style={{ display:"grid",gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",gap: isMobile ? 12 : 20 }}>
        <Card style={{ padding: isMobile ? 14 : 20 }}>
          <div style={{ fontSize:13,fontWeight:700,color:C.soft,letterSpacing:1,marginBottom:16 }}>OSTATNIA AKTYWNOŚĆ</div>
          {recentActivity.map((a,i)=>(
            <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:12,paddingBottom:i<3?14:0,marginBottom:i<3?14:0,borderBottom:i<3?`1px solid ${C.borderLight}`:"none" }}>
              <div style={{ width:36,height:36,borderRadius:10,background:`${a.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{a.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13,fontWeight:500,color:C.text,marginBottom:2 }}>{a.text}</div>
                <div style={{ fontSize:11,color:C.soft }}>{a.time}</div>
              </div>
            </div>
          ))}
        </Card>
        <Card style={{ padding: isMobile ? 14 : 20 }}>
          <div style={{ fontSize:13,fontWeight:700,color:C.soft,letterSpacing:1,marginBottom:16 }}>STATUSY ZAMÓWIEŃ</div>
          {Object.entries(STATUS).map(([key,cfg])=>(
            <div key={key} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
              <span style={{ width:8,height:8,borderRadius:"50%",background:cfg.dot,display:"block",flexShrink:0 }}/>
              <span style={{ flex:1,fontSize:13,color:C.text }}>{cfg.label}</span>
              <span style={{ fontSize:14,fontWeight:700,color:cfg.dot,fontFamily:"monospace" }}>{stats.byStatus?.[key]||0}</span>
            </div>
          ))}
          <div style={{ marginTop:16,paddingTop:16,borderTop:`1px solid ${C.borderLight}` }}>
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:13 }}>
              <span style={{ color:C.soft }}>Razem</span>
              <span style={{ fontWeight:700,color:C.text }}>{stats.totalOrders}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── ORDERS TAB ─────────────────────────────────────────────
const OrdersTab = ({ isMobile }) => {
  const [orders,setOrders]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selected,setSelected]=useState(null);
  const [fStatus,setFStatus]=useState("all");
  const [fSource,setFSource]=useState("all");
  const [updating,setUpdating]=useState(null);
  const [error,setError]=useState("");

  const load = useCallback(async()=>{
    setLoading(true);setError("");
    const p=new URLSearchParams({tenant_id:TENANT_ID});
    if(fStatus!=="all") p.set("status",fStatus);
    const res=await apiFetch(`/orders?${p}`);
    if(res.success) setOrders(res.data||[]); else setError(res.error);
    setLoading(false);
  },[fStatus]);

  useEffect(()=>{load();},[load]);

  const updateStatus=async(id,status)=>{
    setUpdating(id);
    await apiFetch(`/orders/${id}`,{method:"PUT",body:JSON.stringify({status})});
    await load(); setUpdating(null); setSelected(null);
  };

  const filtered=orders.filter(o=>fSource==="all"||o.channels?.type===fSource);

  const sel={style:{background:C.surface,color:C.text,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"inherit",cursor:"pointer",outline:"none"}};

  if (isMobile) {
    return (
      <div style={{ padding:"12px 12px 20px" }}>
        <div style={{ display:"flex",gap:8,marginBottom:12,flexWrap:"wrap" }}>
          <select {...sel} value={fSource} onChange={e=>setFSource(e.target.value)}>
            <option value="all">Wszystkie źródła</option>
            <option value="allegro">Allegro</option>
            <option value="woocommerce">WooCommerce</option>
          </select>
          <select {...sel} value={fStatus} onChange={e=>setFStatus(e.target.value)}>
            <option value="all">Każdy status</option>
            {Object.entries(STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
          <button onClick={load} style={{ padding:"8px 14px",borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,fontSize:13,cursor:"pointer",color:C.mid,fontFamily:"inherit" }}>↻</button>
        </div>
        {error&&<div style={{ fontSize:12,color:C.red,marginBottom:10,padding:"8px 12px",background:C.redBg,borderRadius:8 }}>⚠ {error}</div>}
        {loading?<Spinner/>:filtered.length===0?<Empty text="Brak zamówień"/>:(
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {filtered.map(o=>{
              const st=STATUS[o.status]||STATUS.new;
              const src=SOURCE[o.channels?.type]||SOURCE.allegro;
              const isOpen=selected===o.id;
              return (
                <Card key={o.id} style={{ overflow:"hidden",border:isOpen?`1px solid ${C.accent}`:`1px solid ${C.border}` }}>
                  <div onClick={()=>setSelected(isOpen?null:o.id)} style={{ padding:"13px 14px",cursor:"pointer" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                      <div style={{ display:"flex",gap:6,alignItems:"center" }}>
                        <Pill label={o.channels?.name||"Kanał"} color={src.color} bg={src.bg} textColor={src.color}/>
                        <span style={{ fontSize:11,color:C.soft }}>{o.external_id||o.id?.slice(0,8)}</span>
                      </div>
                      <span style={{ fontSize:11,color:C.soft }}>{o.created_at?new Date(o.created_at).toLocaleDateString("pl-PL"):""}</span>
                    </div>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:15,fontWeight:700,color:C.text,marginBottom:3 }}>{o.customer_name||"Klient"}</div>
                        <div style={{ fontSize:12,color:C.mid }}>{o.customer_country} · {o.customer_email||"—"}</div>
                      </div>
                      <div style={{ textAlign:"right",flexShrink:0,marginLeft:12 }}>
                        <div style={{ fontSize:19,fontWeight:800,color:C.navy }}>{parseFloat(o.total_amount||0).toFixed(2)}</div>
                        <div style={{ fontSize:10,color:C.soft }}>{o.currency||"PLN"}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10 }}>
                      <Pill label={st.label} color={st.dot} bg={st.bg} textColor={st.text} dot={true}/>
                      <span style={{ fontSize:12,color:C.soft }}>{isOpen?"▲":"▼"}</span>
                    </div>
                  </div>
                  {isOpen&&(
                    <div style={{ borderTop:`1px solid ${C.border}`,background:C.alt,padding:"12px 14px" }}>
                      <div style={{ fontSize:12,color:C.soft,marginBottom:8 }}>Zmień status:</div>
                      <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                        {Object.entries(STATUS).map(([k,v])=>(
                          <button key={k} onClick={()=>updateStatus(o.id,k)} disabled={o.status===k||updating===o.id}
                            style={{ padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:500,cursor:o.status===k?"default":"pointer",border:`1px solid ${o.status===k?v.dot:C.border}`,background:o.status===k?v.bg:C.surface,color:o.status===k?v.text:C.mid,fontFamily:"inherit",opacity:updating===o.id?0.6:1 }}>
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // DESKTOP TABLE VIEW
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h2 style={{ fontSize:20,fontWeight:700,color:C.text }}>Zamówienia</h2>
        <div style={{ display:"flex",gap:10 }}>
          <select {...sel} value={fSource} onChange={e=>setFSource(e.target.value)}>
            <option value="all">Wszystkie źródła</option>
            <option value="allegro">Allegro</option>
            <option value="woocommerce">WooCommerce</option>
          </select>
          <select {...sel} value={fStatus} onChange={e=>setFStatus(e.target.value)}>
            <option value="all">Każdy status</option>
            {Object.entries(STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
          <button onClick={load} style={{ padding:"8px 16px",borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,fontSize:13,cursor:"pointer",color:C.mid,fontFamily:"inherit" }}>↻ Odśwież</button>
        </div>
      </div>
      {error&&<div style={{ fontSize:13,color:C.red,marginBottom:16,padding:"10px 16px",background:C.redBg,borderRadius:8 }}>⚠ {error}</div>}
      <Card style={{ overflow:"hidden" }}>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.alt,borderBottom:`1px solid ${C.border}` }}>
              {["ID/Źródło","Klient","Produkty","Kwota","Status","Data","Akcje"].map(h=>(
                <th key={h} style={{ padding:"12px 16px",textAlign:"left",fontSize:11,color:C.soft,fontWeight:600,letterSpacing:0.8 }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}><Spinner/></td></tr>
            ) : filtered.length===0 ? (
              <tr><td colSpan={7}><Empty text="Brak zamówień. Gdy klient złoży zamówienie — pojawi się tutaj."/></td></tr>
            ) : filtered.map((o,i)=>{
              const st=STATUS[o.status]||STATUS.new;
              const src=SOURCE[o.channels?.type]||SOURCE.allegro;
              const isOpen=selected===o.id;
              return (
                <>
                  <tr key={o.id} style={{ borderBottom:`1px solid ${C.borderLight}`,background:isOpen?`${C.accent}08`:i%2===0?C.surface:"#fafafa",transition:"background 0.1s" }}>
                    <td style={{ padding:"14px 16px" }}>
                      <div style={{ marginBottom:4 }}><Pill label={o.channels?.name||"Kanał"} color={src.color} bg={src.bg} textColor={src.color}/></div>
                      <div style={{ fontSize:11,color:C.soft,fontFamily:"monospace" }}>{o.external_id||o.id?.slice(0,12)}</div>
                    </td>
                    <td style={{ padding:"14px 16px" }}>
                      <div style={{ fontSize:14,fontWeight:600,color:C.text,marginBottom:2 }}>{o.customer_name||"Klient"}</div>
                      <div style={{ fontSize:12,color:C.soft }}>{o.customer_email||"—"}</div>
                    </td>
                    <td style={{ padding:"14px 16px",fontSize:13,color:C.mid,maxWidth:200 }}>
                      {Array.isArray(o.items)&&o.items.length>0 ? `${o.items.length} pozycji` : "—"}
                    </td>
                    <td style={{ padding:"14px 16px" }}>
                      <div style={{ fontSize:15,fontWeight:700,color:C.navy,fontFamily:"monospace" }}>{parseFloat(o.total_amount||0).toFixed(2)}</div>
                      <div style={{ fontSize:11,color:C.soft }}>{o.currency||"PLN"}</div>
                    </td>
                    <td style={{ padding:"14px 16px" }}>
                      <Pill label={st.label} color={st.dot} bg={st.bg} textColor={st.text} dot={true}/>
                    </td>
                    <td style={{ padding:"14px 16px",fontSize:13,color:C.soft }}>
                      {o.created_at?new Date(o.created_at).toLocaleDateString("pl-PL"):"—"}
                    </td>
                    <td style={{ padding:"14px 16px" }}>
                      <button onClick={()=>setSelected(isOpen?null:o.id)} style={{ padding:"6px 14px",borderRadius:7,border:`1px solid ${C.border}`,background:isOpen?C.accent:C.surface,color:isOpen?"#fff":C.mid,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:isOpen?600:400 }}>
                        {isOpen?"Zamknij":"Szczegóły"}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr key={`${o.id}-detail`}>
                      <td colSpan={7} style={{ padding:"0 16px 16px",background:`${C.accent}06`,borderBottom:`1px solid ${C.border}` }}>
                        <div style={{ padding:"16px",background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,marginTop:8 }}>
                          <div style={{ fontSize:13,color:C.soft,marginBottom:12 }}>Zmień status zamówienia:</div>
                          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                            {Object.entries(STATUS).map(([k,v])=>(
                              <button key={k} onClick={()=>updateStatus(o.id,k)} disabled={o.status===k||updating===o.id}
                                style={{ padding:"8px 16px",borderRadius:8,fontSize:13,fontWeight:500,cursor:o.status===k?"default":"pointer",border:`1px solid ${o.status===k?v.dot:C.border}`,background:o.status===k?v.bg:C.surface,color:o.status===k?v.text:C.mid,fontFamily:"inherit",opacity:updating===o.id?0.6:1,transition:"all 0.15s" }}>
                                {v.label}
                              </button>
                            ))}
                          </div>
                          {o.receipt_number&&<div style={{ marginTop:12,fontSize:13,color:C.mid }}>🧾 Paragon: <strong>{o.receipt_number}</strong></div>}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ── PRODUCTS TAB ───────────────────────────────────────────
const ProductsTab = ({ isMobile }) => {
  const [products,setProducts]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [saving,setSaving]=useState(false);
  const [search,setSearch]=useState("");
  const [error,setError]=useState("");
  const [formError,setFormError]=useState("");
  const [form,setForm]=useState({sku:"",name:"",price:"",vat_rate:"5",initial_quantity:"0",brand:"",weight_kg:"",tenant_id:TENANT_ID});

  const load=useCallback(async()=>{
    setLoading(true);setError("");
    const p=new URLSearchParams({tenant_id:TENANT_ID});
    if(search) p.set("search",search);
    const res=await apiFetch(`/products?${p}`);
    if(res.success) setProducts(res.data||[]); else setError(res.error);
    setLoading(false);
  },[search]);

  useEffect(()=>{load();},[load]);

  const save=async()=>{
    if(!form.sku||!form.name||!form.price){setFormError("Wypełnij: SKU, Nazwa, Cena");return;}
    setSaving(true);setFormError("");
    try{
      const res=await apiFetch("/products",{method:"POST",body:JSON.stringify({...form,price:parseFloat(form.price),initial_quantity:parseInt(form.initial_quantity)||0,weight_kg:form.weight_kg?parseFloat(form.weight_kg):null})});
      if(res.success){setShowForm(false);setForm({sku:"",name:"",price:"",vat_rate:"5",initial_quantity:"0",brand:"",weight_kg:"",tenant_id:TENANT_ID});await load();}
      else setFormError(res.error||"Błąd zapisu");
    }catch(e){setFormError(e.message);}
    finally{setSaving(false);}
  };

  const inp={style:{width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:C.surface,color:C.text,outline:"none",boxSizing:"border-box"}};

  const FormPanel = () => (
    <Card style={{ padding: isMobile ? 16 : 24,marginBottom: isMobile ? 12 : 20,borderLeft:`4px solid ${C.accent}` }}>
      <div style={{ fontSize:15,fontWeight:700,color:C.navy,marginBottom:16 }}>Nowy produkt</div>
      <div style={{ display:"grid",gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr",gap:12,marginBottom:12 }}>
        <div><div style={{ fontSize:11,color:C.soft,marginBottom:4,fontWeight:600 }}>SKU *</div><input {...inp} placeholder="MOR-500" value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})}/></div>
        <div><div style={{ fontSize:11,color:C.soft,marginBottom:4,fontWeight:600 }}>Cena PLN *</div><input {...inp} type="number" step="0.01" placeholder="18.50" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></div>
        <div style={{ gridColumn: isMobile ? "1/-1" : "auto" }}><div style={{ fontSize:11,color:C.soft,marginBottom:4,fontWeight:600 }}>Nazwa *</div><input {...inp} placeholder="Morele suszone 500g" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns: isMobile ? "1fr 1fr 1fr" : "1fr 1fr 1fr 1fr",gap:12,marginBottom:12 }}>
        <div><div style={{ fontSize:11,color:C.soft,marginBottom:4,fontWeight:600 }}>VAT %</div>
          <select {...inp} value={form.vat_rate} onChange={e=>setForm({...form,vat_rate:e.target.value})}>
            <option value="23">23%</option><option value="8">8%</option><option value="5">5%</option><option value="0">0%</option>
          </select>
        </div>
        <div><div style={{ fontSize:11,color:C.soft,marginBottom:4,fontWeight:600 }}>Stan mag.</div><input {...inp} type="number" placeholder="0" value={form.initial_quantity} onChange={e=>setForm({...form,initial_quantity:e.target.value})}/></div>
        <div><div style={{ fontSize:11,color:C.soft,marginBottom:4,fontWeight:600 }}>Waga (kg)</div><input {...inp} type="number" step="0.01" placeholder="0.5" value={form.weight_kg} onChange={e=>setForm({...form,weight_kg:e.target.value})}/></div>
        {!isMobile && <div><div style={{ fontSize:11,color:C.soft,marginBottom:4,fontWeight:600 }}>Marka</div><input {...inp} placeholder="Kaukaz" value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})}/></div>}
      </div>
      {formError&&<div style={{ fontSize:12,color:C.red,marginBottom:12,padding:"8px 12px",background:C.redBg,borderRadius:8 }}>⚠ {formError}</div>}
      <button onClick={save} disabled={saving} style={{ padding: isMobile ? "12px" : "11px 24px",borderRadius:9,border:"none",background:saving?C.soft:C.navy,color:"#fff",fontSize:14,fontWeight:600,cursor:saving?"not-allowed":"pointer",fontFamily:"inherit",width: isMobile ? "100%" : "auto" }}>
        {saving?"Zapisywanie...":"💾 Zapisz produkt"}
      </button>
    </Card>
  );

  if (isMobile) {
    return (
      <div style={{ padding:"12px 12px 20px" }}>
        <div style={{ display:"flex",gap:8,marginBottom:12 }}>
          <input {...inp} style={{...inp.style,flex:1}} placeholder="🔍 Szukaj..." value={search} onChange={e=>setSearch(e.target.value)}/>
          <button onClick={()=>{setShowForm(!showForm);setFormError("");}} style={{ padding:"9px 14px",borderRadius:8,border:"none",background:C.navy,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap" }}>
            {showForm?"✕":"+Dodaj"}
          </button>
        </div>
        {showForm&&<FormPanel/>}
        {error&&<div style={{ fontSize:12,color:C.red,marginBottom:10,padding:"8px 12px",background:C.redBg,borderRadius:8 }}>⚠ {error}</div>}
        {loading?<Spinner/>:products.length===0?<Empty text="Brak produktów. Dodaj pierwszy!"/>:(
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {products.map(p=>{
              const inv=p.inventory?.[0]||{};
              const stock=(inv.quantity||0)-(inv.reserved||0);
              const isLow=inv.min_threshold!==null&&stock<=(inv.min_threshold||5);
              return (
                <Card key={p.id} style={{ padding:"13px 14px",borderLeft:`4px solid ${isLow?C.red:C.accent}` }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:5,flexWrap:"wrap" }}>
                        <span style={{ fontSize:14,fontWeight:700,color:C.text }}>{p.name}</span>
                        {isLow&&<span style={{ fontSize:10,background:C.redBg,color:"#991b1b",padding:"2px 7px",borderRadius:100,fontWeight:700 }}>NISKI STAN</span>}
                        {p.status==="draft"&&<span style={{ fontSize:10,background:C.amberBg,color:"#92400e",padding:"2px 7px",borderRadius:100,fontWeight:600 }}>SZKIC</span>}
                      </div>
                      <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                        <span style={{ fontSize:11,background:C.alt,color:C.mid,padding:"2px 8px",borderRadius:6,border:`1px solid ${C.border}` }}>{p.sku}</span>
                        {p.brand&&<span style={{ fontSize:11,color:C.soft }}>{p.brand}</span>}
                        {p.vat_rate&&<span style={{ fontSize:11,color:C.soft }}>VAT {p.vat_rate}%</span>}
                      </div>
                    </div>
                    <div style={{ textAlign:"right",flexShrink:0,marginLeft:10 }}>
                      <div style={{ fontSize:17,fontWeight:800,color:C.navy }}>{parseFloat(p.price||0).toFixed(2)} zł</div>
                      <div style={{ fontSize:13,fontWeight:700,marginTop:3,color:isLow?C.red:C.green }}>{stock} szt.</div>
                    </div>
                  </div>
                  <div style={{ marginTop:10,height:4,background:C.border,borderRadius:3,overflow:"hidden" }}>
                    <div style={{ height:"100%",width:`${Math.min(((inv.quantity||0)/100)*100,100)}%`,background:isLow?`linear-gradient(90deg,${C.red},${C.amber})`:`linear-gradient(90deg,${C.accent},#60a5fa)`,borderRadius:3 }}/>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // DESKTOP
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h2 style={{ fontSize:20,fontWeight:700,color:C.text }}>Katalog produktów</h2>
        <div style={{ display:"flex",gap:10 }}>
          <input {...inp} style={{...inp.style,width:260}} placeholder="🔍 Szukaj produktu..." value={search} onChange={e=>setSearch(e.target.value)}/>
          <button onClick={()=>{setShowForm(!showForm);setFormError("");}} style={{ padding:"8px 20px",borderRadius:8,border:"none",background:showForm?C.soft:C.navy,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap" }}>
            {showForm?"✕ Anuluj":"+ Dodaj produkt"}
          </button>
        </div>
      </div>
      {showForm&&<FormPanel/>}
      {error&&<div style={{ fontSize:13,color:C.red,marginBottom:16,padding:"10px 16px",background:C.redBg,borderRadius:8 }}>⚠ {error}</div>}
      <Card style={{ overflow:"hidden" }}>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.alt,borderBottom:`1px solid ${C.border}` }}>
              {["SKU","Produkt","VAT","Cena","Stan magazynowy","Status",""].map(h=>(
                <th key={h} style={{ padding:"12px 16px",textAlign:"left",fontSize:11,color:C.soft,fontWeight:600,letterSpacing:0.8 }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading?<tr><td colSpan={7}><Spinner/></td></tr>
            :products.length===0?<tr><td colSpan={7}><Empty text="Brak produktów. Dodaj pierwszy!"/></td></tr>
            :products.map((p,i)=>{
              const inv=p.inventory?.[0]||{};
              const stock=(inv.quantity||0)-(inv.reserved||0);
              const isLow=inv.min_threshold!==null&&stock<=(inv.min_threshold||5);
              return (
                <tr key={p.id} style={{ borderBottom:`1px solid ${C.borderLight}`,background:i%2===0?C.surface:"#fafafa" }}>
                  <td style={{ padding:"14px 16px",fontFamily:"monospace",fontSize:12,color:C.soft }}>{p.sku}</td>
                  <td style={{ padding:"14px 16px" }}>
                    <div style={{ fontSize:14,fontWeight:600,color:C.text,marginBottom:2 }}>{p.name}</div>
                    {p.brand&&<div style={{ fontSize:12,color:C.soft }}>{p.brand}</div>}
                  </td>
                  <td style={{ padding:"14px 16px",fontSize:13,color:C.mid }}>{p.vat_rate}%</td>
                  <td style={{ padding:"14px 16px",fontFamily:"monospace",fontSize:14,fontWeight:700,color:C.navy }}>{parseFloat(p.price||0).toFixed(2)} zł</td>
                  <td style={{ padding:"14px 16px" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{ flex:1,maxWidth:120,height:6,background:C.border,borderRadius:3,overflow:"hidden" }}>
                        <div style={{ height:"100%",width:`${Math.min(((inv.quantity||0)/100)*100,100)}%`,background:isLow?C.red:C.accent,borderRadius:3 }}/>
                      </div>
                      <span style={{ fontSize:13,fontWeight:700,color:isLow?C.red:C.green,minWidth:50 }}>{stock} szt.</span>
                      {isLow&&<span style={{ fontSize:10,background:C.redBg,color:"#991b1b",padding:"2px 6px",borderRadius:100,fontWeight:700 }}>!</span>}
                    </div>
                  </td>
                  <td style={{ padding:"14px 16px" }}>
                    {p.status==="draft"
                      ? <Pill label="Szkic" color={C.amber} bg={C.amberBg} textColor="#92400e"/>
                      : <Pill label="Aktywny" color={C.green} bg={C.greenBg} textColor="#065f46"/>
                    }
                  </td>
                  <td style={{ padding:"14px 16px" }}>
                    <button style={{ padding:"6px 14px",borderRadius:7,border:`1px solid ${C.border}`,background:C.surface,fontSize:12,cursor:"pointer",color:C.mid,fontFamily:"inherit" }}>Edytuj</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ── CHANNELS TAB ───────────────────────────────────────────
const ChannelsTab = ({ isMobile }) => {
  const [channels,setChannels]=useState([]);
  const [loading,setLoading]=useState(true);
  const [testing,setTesting]=useState(null);
  const [testResult,setTestResult]=useState({});

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      const res=await apiFetch("/channels");
      if(res.success) setChannels(res.data||[]);
      setLoading(false);
    })();
  },[]);

  const testConn=async(id)=>{
    setTesting(id);
    const res=await apiFetch(`/channels/${id}/test`,{method:"POST",body:"{}"});
    setTestResult(prev=>({...prev,[id]:res.data||res}));
    setTesting(null);
  };

  if (isMobile) {
    return (
      <div style={{ padding:"12px 12px 20px" }}>
        {loading?<Spinner/>:(
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {channels.map(ch=>{
              const src=ch.type==="allegro"?SOURCE.allegro:SOURCE.woocommerce;
              const tr=testResult[ch.id];
              return (
                <Card key={ch.id} style={{ padding:"14px" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:6,flexWrap:"wrap" }}>
                        <Pill label={ch.type==="allegro"?"Allegro":"WooCommerce"} color={src.color} bg={src.bg} textColor={src.color}/>
                        <span style={{ fontSize:11,background:C.alt,color:C.mid,padding:"2px 8px",borderRadius:6,border:`1px solid ${C.border}` }}>{ch.country}</span>
                        <span style={{ width:8,height:8,borderRadius:"50%",background:ch.is_active?C.green:C.soft,display:"block" }}/>
                      </div>
                      <div style={{ fontSize:15,fontWeight:700,color:C.text }}>{ch.name}</div>
                      {tr&&<div style={{ marginTop:8,fontSize:12,padding:"6px 10px",borderRadius:8,background:tr.has_keys?C.greenBg:C.amberBg,color:tr.has_keys?"#065f46":"#92400e" }}>{tr.has_keys?"✅":"⚠️"} {tr.message}</div>}
                    </div>
                    <button onClick={()=>testConn(ch.id)} disabled={testing===ch.id} style={{ padding:"7px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,fontSize:12,cursor:"pointer",color:C.mid,fontFamily:"inherit",flexShrink:0,opacity:testing===ch.id?0.6:1 }}>
                      {testing===ch.id?"...":"🔍"}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h2 style={{ fontSize:20,fontWeight:700,color:C.text }}>Kanały sprzedaży</h2>
        <div style={{ fontSize:13,color:C.soft }}>{channels.length} kanałów aktywnych</div>
      </div>
      {loading?<Spinner/>:(
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:16 }}>
          {channels.map(ch=>{
            const src=ch.type==="allegro"?SOURCE.allegro:SOURCE.woocommerce;
            const tr=testResult[ch.id];
            return (
              <Card key={ch.id} style={{ padding:20 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
                  <div>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}>
                      <Pill label={ch.type==="allegro"?"Allegro":"WooCommerce"} color={src.color} bg={src.bg} textColor={src.color}/>
                      <span style={{ fontSize:12,background:C.alt,color:C.mid,padding:"2px 8px",borderRadius:6,border:`1px solid ${C.border}` }}>{ch.country}</span>
                    </div>
                    <div style={{ fontSize:16,fontWeight:700,color:C.text }}>{ch.name}</div>
                    {ch.shop_url&&<div style={{ fontSize:12,color:C.soft,marginTop:2 }}>{ch.shop_url}</div>}
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                    <span style={{ width:8,height:8,borderRadius:"50%",background:ch.is_active?C.green:C.soft,display:"block" }}/>
                    <span style={{ fontSize:12,color:ch.is_active?C.green:C.soft }}>{ch.is_active?"Aktywny":"Nieaktywny"}</span>
                  </div>
                </div>
                {tr&&<div style={{ marginBottom:12,fontSize:13,padding:"8px 12px",borderRadius:8,background:tr.has_keys?C.greenBg:C.amberBg,color:tr.has_keys?"#065f46":"#92400e" }}>{tr.has_keys?"✅":"⚠️"} {tr.message}</div>}
                <div style={{ display:"flex",gap:8 }}>
                  <button onClick={()=>testConn(ch.id)} disabled={testing===ch.id} style={{ flex:1,padding:"8px",borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,fontSize:13,cursor:"pointer",color:C.mid,fontFamily:"inherit",opacity:testing===ch.id?0.6:1 }}>
                    {testing===ch.id?"Testowanie...":"🔍 Testuj połączenie"}
                  </button>
                  <button style={{ padding:"8px 14px",borderRadius:8,border:"none",background:C.accent,color:"#fff",fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:600 }}>
                    Konfiguruj
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── ANALYTICS TAB ──────────────────────────────────────────
const AnalyticsTab = ({ stats, user, isMobile }) => (
  <div style={{ display:"flex",flexDirection:"column",gap: isMobile ? 12 : 20 }}>
    {!isMobile && <h2 style={{ fontSize:20,fontWeight:700,color:C.text }}>Analityka sprzedaży</h2>}
    <div style={{ display:"grid",gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",gap: isMobile ? 12 : 20 }}>
      <Card style={{ padding: isMobile ? 14 : 20 }}>
        <div style={{ fontSize:13,fontWeight:700,color:C.soft,letterSpacing:1,marginBottom:16 }}>STATUSY ZAMÓWIEŃ</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          {Object.entries(STATUS).map(([key,cfg])=>(
            <div key={key} style={{ background:cfg.bg,borderRadius:10,padding:"14px",border:`1px solid ${cfg.dot}33` }}>
              <div style={{ fontSize:28,fontWeight:800,color:cfg.dot,fontFamily:"monospace" }}>{stats.byStatus?.[key]||0}</div>
              <div style={{ fontSize:12,color:cfg.text,fontWeight:600,marginTop:4 }}>{cfg.label}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card style={{ padding: isMobile ? 14 : 20 }}>
        <div style={{ fontSize:13,fontWeight:700,color:C.soft,letterSpacing:1,marginBottom:16 }}>PODSUMOWANIE</div>
        {[
          { label:"Wszystkich zamówień", value:stats.totalOrders,   color:C.accent },
          { label:"Produktów w katalogu",value:stats.totalProducts, color:C.green  },
          { label:"Aktywnych kanałów",   value:6,                   color:C.blue   },
          { label:"Niski stan magazyn.", value:stats.lowStock,      color:C.red    },
        ].map(s=>(
          <div key={s.label} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.borderLight}` }}>
            <span style={{ fontSize:14,color:C.text }}>{s.label}</span>
            <span style={{ fontSize:18,fontWeight:800,color:s.color,fontFamily:"monospace" }}>{s.value}</span>
          </div>
        ))}
      </Card>
    </div>
    <Card style={{ padding: isMobile ? 14 : 20 }}>
      <div style={{ fontSize:13,fontWeight:700,color:C.soft,letterSpacing:1,marginBottom:16 }}>ZALOGOWANY UŻYTKOWNIK</div>
      <div style={{ display:"flex",alignItems:"center",gap:14 }}>
        {user?.user_metadata?.avatar_url&&<img src={user.user_metadata.avatar_url} style={{ width:48,height:48,borderRadius:"50%",border:`2px solid ${C.border}` }}/>}
        <div>
          <div style={{ fontSize:16,fontWeight:700,color:C.text }}>{user?.user_metadata?.full_name||"Użytkownik"}</div>
          <div style={{ fontSize:13,color:C.soft }}>{user?.email}</div>
          <div style={{ fontSize:11,color:C.soft,marginTop:2 }}>Tenant: Bazár Kaukazu · ID: {TENANT_ID.slice(0,8)}...</div>
        </div>
      </div>
    </Card>
  </div>
);

// ── APP ROOT ───────────────────────────────────────────────
export default function App() {
  const [session,setSession]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [tab,setTab]=useState("dashboard");
  const [stats,setStats]=useState({newOrders:0,totalOrders:0,totalProducts:0,lowStock:0,byStatus:{}});
  const [isMobile,setIsMobile]=useState(window.innerWidth<768);

  useEffect(()=>{
    const handleResize=()=>setIsMobile(window.innerWidth<768);
    window.addEventListener("resize",handleResize);
    return ()=>window.removeEventListener("resize",handleResize);
  },[]);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setSession(session);setAuthLoading(false);});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{setSession(session);setAuthLoading(false);});
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!session) return;
    (async()=>{
      const [oR,pR,lR]=await Promise.all([
        apiFetch(`/orders?tenant_id=${TENANT_ID}`),
        apiFetch(`/products?tenant_id=${TENANT_ID}`),
        apiFetch("/inventory/low-stock"),
      ]);
      const orders=oR.data||[],products=pR.data||[],low=lR.data||[];
      const byStatus={};
      orders.forEach(o=>{byStatus[o.status]=(byStatus[o.status]||0)+1;});
      setStats({newOrders:byStatus.new||0,totalOrders:orders.length,totalProducts:products.length,lowStock:low.length,byStatus});
    })();
  },[session]);

  const logout=async()=>{await supabase.auth.signOut();setSession(null);};

  if(authLoading) return (
    <div style={{ minHeight:"100vh",background:C.navy,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ width:44,height:44,border:"3px solid rgba(255,255,255,0.2)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if(!session) return <AuthScreen/>;

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",background:C.bg,minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:6px;height:6px;}
        ::-webkit-scrollbar-track{background:${C.alt};}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px;}
        button:active{opacity:0.85;}
        input:focus,select:focus{border-color:${C.accent}!important;box-shadow:0 0 0 3px ${C.accent}22;}
        tr:hover td{background:${C.accent}06!important;}
      `}</style>

      {isMobile ? (
        // ── MOBILE LAYOUT ──────────────────────────────────
        <div style={{ maxWidth:480,margin:"0 auto" }}>
          <MobileTopBar tab={tab} setTab={setTab} stats={stats} user={session.user} onLogout={logout}/>
          <div style={{ padding:"12px 0 0" }}>
            <div style={{ padding:"0 12px",marginBottom:12 }}>
              <StatCards stats={stats} isMobile={true}/>
            </div>
            {tab==="dashboard"  && <DashboardTab  stats={stats} isMobile={true}/>}
            {tab==="orders"     && <OrdersTab     isMobile={true}/>}
            {tab==="products"   && <ProductsTab   isMobile={true}/>}
            {tab==="channels"   && <ChannelsTab   isMobile={true}/>}
            {tab==="analytics"  && <AnalyticsTab  stats={stats} user={session.user} isMobile={true}/>}
          </div>
        </div>
      ) : (
        // ── DESKTOP LAYOUT ─────────────────────────────────
        <>
          <Sidebar tab={tab} setTab={setTab} stats={stats} user={session.user} onLogout={logout}/>
          <main style={{ marginLeft:220,minHeight:"100vh",padding:"32px 36px" }}>
            <StatCards stats={stats} isMobile={false}/>
            {tab==="dashboard"  && <DashboardTab  stats={stats} isMobile={false}/>}
            {tab==="orders"     && <OrdersTab     isMobile={false}/>}
            {tab==="products"   && <ProductsTab   isMobile={false}/>}
            {tab==="channels"   && <ChannelsTab   isMobile={false}/>}
            {tab==="analytics"  && <AnalyticsTab  stats={stats} user={session.user} isMobile={false}/>}
          </main>
        </>
      )}
    </div>
  );
}
