import { useState, useEffect, useCallback } from "react";

const API       = "https://yqnfzmsotnkjmwxfonfl.supabase.co/functions/v1";
const KEY       = "sb_publishable_uzB1UMsOAvO76GX84c581w_nChp0Lp1";
const TENANT_ID = "a0cc5f9d-9326-42cf-a7a4-9b555ca5babc";

const hdrs = { "Authorization": `Bearer ${KEY}`, "Content-Type": "application/json" };

const apiFetch = async (path, opts = {}) => {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(`${API}${path}`, { ...opts, signal: ctrl.signal, headers: { ...hdrs, ...opts.headers } });
    clearTimeout(t);
    const text = await res.text();
    return text ? JSON.parse(text) : { success: false, error: "Pusty odpowiedź" };
  } catch (e) {
    return { success: false, error: e.name === "AbortError" ? "Timeout (15s)" : e.message };
  }
};

const C = {
  navy:"#1a2e4a", accent:"#2563aa", bg:"#eef0f3", surface:"#ffffff",
  alt:"#f4f5f7", border:"#d8dce3", text:"#1a1f2e", mid:"#4a5568", soft:"#8492a6",
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

const Pill = ({ label, color, bg, textColor, dot }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:bg, color:textColor, fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:100, whiteSpace:"nowrap" }}>
    {dot && <span style={{ width:5, height:5, borderRadius:"50%", background:color, display:"block" }} />}
    {label}
  </span>
);

const Spinner = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:48 }}>
    <div style={{ width:32, height:32, border:`3px solid ${C.border}`, borderTopColor:C.accent, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const Empty = ({ text }) => (
  <div style={{ textAlign:"center", padding:"48px 20px", color:C.soft, fontSize:14 }}>{text}</div>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, boxShadow:"0 1px 3px rgba(0,0,0,0.05)", ...style }}>
    {children}
  </div>
);

const TopBar = ({ tab, setTab, stats }) => {
  const tabs = [
    { id:"orders",    icon:"📦", label:"Zamówienia",  badge:stats.newOrders },
    { id:"products",  icon:"🌿", label:"Produkty",    badge:stats.lowStock > 0 ? stats.lowStock : null },
    { id:"channels",  icon:"🔗", label:"Kanały",      badge:null },
    { id:"analytics", icon:"📊", label:"Analityka",   badge:null },
  ];
  return (
    <div style={{ background:C.navy, position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px 10px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:"rgba(255,255,255,0.13)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🍇</div>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:"#fff", lineHeight:1 }}>Fruttino CRM</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", letterSpacing:1, marginTop:2 }}>PANEL GŁÓWNY</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {[{dot:"#f97316",label:"Allegro"},{dot:"#4ade80",label:"WooCommerce"}].map(c => (
            <div key={c.label} style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.08)", borderRadius:100, padding:"4px 10px", fontSize:11, color:"rgba(255,255,255,0.6)" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:c.dot, display:"block" }} />
              {c.label}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex:1, padding:"10px 4px", background:"transparent", border:"none",
            borderBottom: tab===t.id ? "2px solid #60a5fa" : "2px solid transparent",
            color: tab===t.id ? "#fff" : "rgba(255,255,255,0.45)",
            fontSize:12, fontWeight: tab===t.id ? 600 : 400,
            cursor:"pointer", fontFamily:"inherit",
            display:"flex", alignItems:"center", justifyContent:"center", gap:4,
          }}>
            <span style={{ fontSize:14 }}>{t.icon}</span>
            <span>{t.label}</span>
            {t.badge > 0 && (
              <span style={{ background:"#ef4444", color:"#fff", borderRadius:100, fontSize:9, fontWeight:700, padding:"1px 5px" }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const StatRow = ({ stats }) => {
  const items = [
    { label:"Nowe",      value:stats.newOrders,     color:C.amber  },
    { label:"Produkty",  value:stats.totalProducts, color:C.blue   },
    { label:"Kanały",    value:6,                   color:C.green  },
    { label:"Niski stan",value:stats.lowStock,       color:C.red    },
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, padding:"12px 12px 0" }}>
      {items.map(s => (
        <div key={s.label} style={{ background:C.surface, borderRadius:10, border:`1px solid ${C.border}`, padding:"11px 10px", borderTop:`3px solid ${s.color}`, textAlign:"center" }}>
          <div style={{ fontSize:22, fontWeight:800, color:s.color, fontFamily:"monospace" }}>{s.value}</div>
          <div style={{ fontSize:10, color:C.soft, marginTop:3, fontWeight:500 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
};

const OrdersTab = () => {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [fStatus, setFStatus]   = useState("all");
  const [fSource, setFSource]   = useState("all");
  const [updating, setUpdating] = useState(null);
  const [error, setError]       = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const params = new URLSearchParams({ tenant_id: TENANT_ID });
    if (fStatus !== "all") params.set("status", fStatus);
    const res = await apiFetch(`/orders?${params}`);
    if (res.success) setOrders(res.data || []);
    else setError(res.error);
    setLoading(false);
  }, [fStatus]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    await apiFetch(`/orders/${id}`, { method:"PUT", body: JSON.stringify({ status }) });
    await load();
    setUpdating(null);
    setSelected(null);
  };

  const filtered = orders.filter(o => fSource === "all" || o.channels?.type === fSource);
  const sel = { style:{ background:C.surface, color:C.text, border:`1px solid ${C.border}`, borderRadius:8, padding:"7px 10px", fontSize:12, fontFamily:"inherit", cursor:"pointer", outline:"none" } };

  return (
    <div style={{ padding:"12px 12px 20px" }}>
      <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
        <select {...sel} value={fSource} onChange={e => setFSource(e.target.value)}>
          <option value="all">Wszystkie źródła</option>
          <option value="allegro">Allegro</option>
          <option value="woocommerce">WooCommerce</option>
        </select>
        <select {...sel} value={fStatus} onChange={e => setFStatus(e.target.value)}>
          <option value="all">Każdy status</option>
          {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button onClick={load} style={{ padding:"7px 14px", borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, fontSize:12, cursor:"pointer", color:C.mid, fontFamily:"inherit" }}>↻ Odśwież</button>
      </div>
      {error && <div style={{ fontSize:12, color:C.red, marginBottom:10, padding:"8px 12px", background:C.redBg, borderRadius:8 }}>⚠ {error}</div>}
      {loading ? <Spinner /> : filtered.length === 0 ? <Empty text="Brak zamówień. Gdy klient złoży zamówienie — pojawi się tutaj." /> : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {filtered.map(o => {
            const st  = STATUS[o.status] || STATUS.new;
            const src = SOURCE[o.channels?.type] || SOURCE.allegro;
            const isOpen = selected === o.id;
            return (
              <Card key={o.id} style={{ overflow:"hidden", border: isOpen ? `1px solid ${C.accent}` : `1px solid ${C.border}`, boxShadow: isOpen ? `0 0 0 2px ${C.accent}22` : "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div onClick={() => setSelected(isOpen ? null : o.id)} style={{ padding:"13px 14px", cursor:"pointer" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <Pill label={o.channels?.name || o.channels?.type || "Kanał"} color={src.color} bg={src.bg} textColor={src.color} />
                      <span style={{ fontSize:11, color:C.soft }}>{o.external_id || o.id?.slice(0,8)}</span>
                    </div>
                    <span style={{ fontSize:11, color:C.soft }}>{o.created_at ? new Date(o.created_at).toLocaleDateString("pl-PL") : ""}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:3 }}>{o.customer_name || "Klient"}</div>
                      <div style={{ fontSize:12, color:C.mid }}>{o.customer_country} · {o.customer_email || "—"}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0, marginLeft:12 }}>
                      <div style={{ fontSize:19, fontWeight:800, color:C.navy }}>{parseFloat(o.total_amount||0).toFixed(2)}</div>
                      <div style={{ fontSize:10, color:C.soft, fontWeight:600 }}>{o.currency||"PLN"}</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
                    <Pill label={st.label} color={st.dot} bg={st.bg} textColor={st.text} dot={true} />
                    {o.receipt_number && <span style={{ fontSize:11, color:C.soft }}>🧾 {o.receipt_number}</span>}
                    <span style={{ fontSize:12, color:C.soft }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>
                {isOpen && (
                  <div style={{ borderTop:`1px solid ${C.border}`, background:C.alt, padding:"12px 14px" }}>
                    <div style={{ fontSize:12, color:C.soft, marginBottom:8 }}>Zmień status:</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {Object.entries(STATUS).map(([k,v]) => (
                        <button key={k} onClick={() => updateStatus(o.id, k)}
                          disabled={o.status===k || updating===o.id}
                          style={{ padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:500, cursor:o.status===k?"default":"pointer", border:`1px solid ${o.status===k?v.dot:C.border}`, background:o.status===k?v.bg:C.surface, color:o.status===k?v.text:C.mid, fontFamily:"inherit", opacity:updating===o.id?0.6:1 }}>
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
};

const ProductsTab = () => {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState("");
  const [error, setError]         = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ sku:"", name:"", price:"", vat_rate:"5", initial_quantity:"0", brand:"", weight_kg:"", tenant_id:TENANT_ID });

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const params = new URLSearchParams({ tenant_id: TENANT_ID });
    if (search) params.set("search", search);
    const res = await apiFetch(`/products?${params}`);
    if (res.success) setProducts(res.data || []);
    else setError(res.error);
    setLoading(false);
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.sku || !form.name || !form.price) { setFormError("Wypełnij: SKU, Nazwa, Cena"); return; }
    setSaving(true); setFormError("");
    try {
      const res = await apiFetch("/products", { method:"POST", body: JSON.stringify({ ...form, price: parseFloat(form.price), initial_quantity: parseInt(form.initial_quantity)||0, weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null }) });
      if (res.success) {
        setShowForm(false);
        setForm({ sku:"", name:"", price:"", vat_rate:"5", initial_quantity:"0", brand:"", weight_kg:"", tenant_id:TENANT_ID });
        await load();
      } else {
        setFormError(res.error || "Błąd zapisu");
      }
    } catch(e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inp = { style:{ width:"100%", padding:"9px 11px", borderRadius:8, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"inherit", background:C.surface, color:C.text, outline:"none", boxSizing:"border-box" } };

  return (
    <div style={{ padding:"12px 12px 20px" }}>
      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        <input {...inp} style={{ ...inp.style, flex:1 }} placeholder="🔍 Szukaj produktu..." value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={() => { setShowForm(!showForm); setFormError(""); }} style={{ padding:"9px 16px", borderRadius:8, border:"none", background:C.navy, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
          {showForm ? "✕ Anuluj" : "+ Dodaj"}
        </button>
      </div>

      {showForm && (
        <Card style={{ padding:"16px", marginBottom:12, borderLeft:`4px solid ${C.accent}` }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.navy, marginBottom:12 }}>Nowy produkt</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
            <div>
              <div style={{ fontSize:11, color:C.soft, marginBottom:4 }}>SKU *</div>
              <input {...inp} placeholder="MOR-500" value={form.sku} onChange={e => setForm({...form, sku:e.target.value})} />
            </div>
            <div>
              <div style={{ fontSize:11, color:C.soft, marginBottom:4 }}>Cena PLN *</div>
              <input {...inp} type="number" step="0.01" placeholder="18.50" value={form.price} onChange={e => setForm({...form, price:e.target.value})} />
            </div>
          </div>
          <div style={{ marginBottom:8 }}>
            <div style={{ fontSize:11, color:C.soft, marginBottom:4 }}>Nazwa *</div>
            <input {...inp} placeholder="Morele suszone 500g" value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:8 }}>
            <div>
              <div style={{ fontSize:11, color:C.soft, marginBottom:4 }}>VAT %</div>
              <select {...inp} value={form.vat_rate} onChange={e => setForm({...form, vat_rate:e.target.value})}>
                <option value="23">23%</option>
                <option value="8">8%</option>
                <option value="5">5%</option>
                <option value="0">0%</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize:11, color:C.soft, marginBottom:4 }}>Stan mag.</div>
              <input {...inp} type="number" placeholder="0" value={form.initial_quantity} onChange={e => setForm({...form, initial_quantity:e.target.value})} />
            </div>
            <div>
              <div style={{ fontSize:11, color:C.soft, marginBottom:4 }}>Waga (kg)</div>
              <input {...inp} type="number" step="0.01" placeholder="0.5" value={form.weight_kg} onChange={e => setForm({...form, weight_kg:e.target.value})} />
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:C.soft, marginBottom:4 }}>Marka</div>
            <input {...inp} placeholder="Kaukaz" value={form.brand} onChange={e => setForm({...form, brand:e.target.value})} />
          </div>
          {formError && <div style={{ fontSize:12, color:C.red, marginBottom:10, padding:"7px 10px", background:C.redBg, borderRadius:7 }}>⚠ {formError}</div>}
          <button onClick={save} disabled={saving} style={{ width:"100%", padding:"12px", borderRadius:9, border:"none", background: saving ? C.soft : C.navy, color:"#fff", fontSize:14, fontWeight:600, cursor: saving ? "not-allowed" : "pointer", fontFamily:"inherit", transition:"background 0.2s" }}>
            {saving ? "Zapisywanie..." : "💾 Zapisz produkt"}
          </button>
        </Card>
      )}

      {error && <div style={{ fontSize:12, color:C.red, marginBottom:10, padding:"8px 12px", background:C.redBg, borderRadius:8 }}>⚠ {error}</div>}
      {loading ? <Spinner /> : products.length === 0 ? <Empty text="Brak produktów. Dodaj pierwszy!" /> : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {products.map(p => {
            const inv   = p.inventory?.[0] || {};
            const stock = (inv.quantity||0) - (inv.reserved||0);
            const isLow = inv.min_threshold !== null && stock <= (inv.min_threshold||5);
            return (
              <Card key={p.id} style={{ padding:"13px 14px", borderLeft:`4px solid ${isLow ? C.red : C.accent}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5, flexWrap:"wrap" }}>
                      <span style={{ fontSize:14, fontWeight:700, color:C.text }}>{p.name}</span>
                      {isLow && <span style={{ fontSize:10, background:C.redBg, color:"#991b1b", padding:"2px 7px", borderRadius:100, fontWeight:700 }}>NISKI STAN</span>}
                      {p.status === "draft" && <span style={{ fontSize:10, background:C.amberBg, color:"#92400e", padding:"2px 7px", borderRadius:100, fontWeight:600 }}>SZKIC</span>}
                    </div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      <span style={{ fontSize:11, background:C.alt, color:C.mid, padding:"2px 8px", borderRadius:6, border:`1px solid ${C.border}` }}>{p.sku}</span>
                      {p.brand && <span style={{ fontSize:11, color:C.soft }}>{p.brand}</span>}
                      {p.vat_rate && <span style={{ fontSize:11, color:C.soft }}>VAT {p.vat_rate}%</span>}
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0, marginLeft:10 }}>
                    <div style={{ fontSize:17, fontWeight:800, color:C.navy }}>{parseFloat(p.price||0).toFixed(2)} zł</div>
                    <div style={{ fontSize:13, fontWeight:700, marginTop:3, color: isLow ? C.red : C.green }}>{stock} szt.</div>
                  </div>
                </div>
                <div style={{ marginTop:10, height:4, background:C.border, borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${Math.min(((inv.quantity||0)/100)*100,100)}%`, background: isLow ? `linear-gradient(90deg,${C.red},${C.amber})` : `linear-gradient(90deg,${C.accent},#60a5fa)`, borderRadius:3 }} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ChannelsTab = () => {
  const [channels, setChannels]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [testing, setTesting]     = useState(null);
  const [testResult, setTestResult] = useState({});
  const [error, setError]         = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await apiFetch("/channels");
      if (res.success) setChannels(res.data || []);
      else setError(res.error);
      setLoading(false);
    })();
  }, []);

  const testConn = async (id) => {
    setTesting(id);
    const res = await apiFetch(`/channels/${id}/test`, { method:"POST", body:"{}" });
    setTestResult(prev => ({ ...prev, [id]: res.data || res }));
    setTesting(null);
  };

  const src = t => t === "allegro" ? SOURCE.allegro : SOURCE.woocommerce;

  return (
    <div style={{ padding:"12px 12px 20px" }}>
      {error && <div style={{ fontSize:12, color:C.red, marginBottom:10, padding:"8px 12px", background:C.redBg, borderRadius:8 }}>⚠ {error}</div>}
      {loading ? <Spinner /> : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {channels.map(ch => {
            const s  = src(ch.type);
            const tr = testResult[ch.id];
            return (
              <Card key={ch.id} style={{ padding:"14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6, flexWrap:"wrap" }}>
                      <Pill label={ch.type === "allegro" ? "Allegro" : "WooCommerce"} color={s.color} bg={s.bg} textColor={s.color} />
                      <span style={{ fontSize:11, background:C.alt, color:C.mid, padding:"2px 8px", borderRadius:6, border:`1px solid ${C.border}` }}>{ch.country}</span>
                      <span style={{ width:8, height:8, borderRadius:"50%", background:ch.is_active?C.green:C.soft, display:"block" }} />
                    </div>
                    <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:3 }}>{ch.name}</div>
                    {ch.shop_url && <div style={{ fontSize:12, color:C.soft }}>{ch.shop_url}</div>}
                    {tr && (
                      <div style={{ marginTop:8, fontSize:12, padding:"6px 10px", borderRadius:8, background:tr.has_keys?C.greenBg:C.amberBg, color:tr.has_keys?"#065f46":"#92400e" }}>
                        {tr.has_keys ? "✅" : "⚠️"} {tr.message}
                      </div>
                    )}
                  </div>
                  <button onClick={() => testConn(ch.id)} disabled={testing===ch.id} style={{ padding:"7px 14px", borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, fontSize:12, cursor:"pointer", color:C.mid, fontFamily:"inherit", flexShrink:0, opacity:testing===ch.id?0.6:1 }}>
                    {testing===ch.id ? "..." : "🔍 Test"}
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

const AnalyticsTab = ({ stats }) => (
  <div style={{ padding:"12px 12px 20px", display:"flex", flexDirection:"column", gap:10 }}>
    <Card style={{ padding:"16px" }}>
      <div style={{ fontSize:11, fontWeight:700, color:C.soft, letterSpacing:1, marginBottom:14 }}>PODSUMOWANIE</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {[
          { label:"Wszystkich zamówień", value:stats.totalOrders,   color:C.accent },
          { label:"Nowych zamówień",     value:stats.newOrders,     color:C.amber  },
          { label:"Produktów",           value:stats.totalProducts, color:C.green  },
          { label:"Niski stan",          value:stats.lowStock,      color:C.red    },
        ].map(s => (
          <div key={s.label} style={{ background:C.alt, borderRadius:10, padding:"14px", borderTop:`3px solid ${s.color}` }}>
            <div style={{ fontSize:26, fontWeight:800, color:s.color, fontFamily:"monospace" }}>{s.value}</div>
            <div style={{ fontSize:11, color:C.soft, marginTop:4, fontWeight:500 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </Card>
    <Card style={{ padding:"16px" }}>
      <div style={{ fontSize:11, fontWeight:700, color:C.soft, letterSpacing:1, marginBottom:14 }}>STATUSY ZAMÓWIEŃ</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {Object.entries(STATUS).map(([key,cfg]) => (
          <div key={key} style={{ background:cfg.bg, borderRadius:10, padding:"14px", border:`1px solid ${cfg.dot}33` }}>
            <div style={{ fontSize:26, fontWeight:800, color:cfg.dot }}>{stats.byStatus?.[key]||0}</div>
            <div style={{ fontSize:11, color:cfg.text, fontWeight:600, marginTop:3 }}>{cfg.label}</div>
          </div>
        ))}
      </div>
    </Card>
    <Card style={{ padding:"16px" }}>
      <div style={{ fontSize:11, fontWeight:700, color:C.soft, letterSpacing:1, marginBottom:14 }}>POŁĄCZENIE Z API</div>
      <div style={{ fontSize:12, color:C.mid, wordBreak:"break-all", fontFamily:"monospace", background:C.alt, padding:"10px 12px", borderRadius:8 }}>
        {API}
      </div>
      <div style={{ fontSize:11, color:C.soft, marginTop:8 }}>Tenant: Bazár Kaukazu</div>
      <div style={{ fontSize:11, color:C.soft }}>ID: {TENANT_ID}</div>
    </Card>
  </div>
);

export default function App() {
  const [tab, setTab]     = useState("orders");
  const [stats, setStats] = useState({ newOrders:0, totalOrders:0, totalProducts:0, lowStock:0, byStatus:{} });

  useEffect(() => {
    (async () => {
      const [ordersRes, productsRes, lowRes] = await Promise.all([
        apiFetch(`/orders?tenant_id=${TENANT_ID}`),
        apiFetch(`/products?tenant_id=${TENANT_ID}`),
        apiFetch("/inventory/low-stock"),
      ]);
      const orders   = ordersRes.data   || [];
      const products = productsRes.data || [];
      const low      = lowRes.data      || [];
      const byStatus = {};
      orders.forEach(o => { byStatus[o.status] = (byStatus[o.status]||0)+1; });
      setStats({ newOrders:byStatus.new||0, totalOrders:orders.length, totalProducts:products.length, lowStock:low.length, byStatus });
    })();
  }, []);

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", background:C.bg, minHeight:"100vh", maxWidth:480, margin:"0 auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:0; height:0; }
        button:active { opacity:0.85; transform:scale(0.98); }
        input:focus, select:focus { border-color: ${C.accent} !important; box-shadow: 0 0 0 3px ${C.accent}22; }
      `}</style>
      <TopBar tab={tab} setTab={setTab} stats={stats} />
      <StatRow stats={stats} />
      {tab === "orders"    && <OrdersTab />}
      {tab === "products"  && <ProductsTab />}
      {tab === "channels"  && <ChannelsTab />}
      {tab === "analytics" && <AnalyticsTab stats={stats} />}
    </div>
  );
}
