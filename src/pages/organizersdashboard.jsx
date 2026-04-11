import { useState, useEffect } from "react";
import logo from "../assets/logo.jpeg";
import { eventsAPI, registrationsAPI, broadcastsAPI, analyticsAPI, authAPI } from "../api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

async function geocodeLocation(location, city) {
  const attempts = [`${location}, ${city}, India`, `${location}, India`, `${city}, India`].filter(q => q.trim() !== ", India");
  for (const q of attempts) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=in`, { headers: { "User-Agent": "SangamEventsApp/1.0" } });
      const data = await res.json();
      if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    } catch {}
    await new Promise(r => setTimeout(r, 300));
  }
  return null;
}

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CITY_COORDS = {
  "patna":     [25.5941, 85.1376],
  "dhanbad":   [23.7957, 86.4304],
  "ranchi":    [23.3441, 85.3096],
  "delhi":     [28.6139, 77.2090],
  "mumbai":    [19.0760, 72.8777],
  "bangalore": [12.9716, 77.5946],
  "kolkata":   [22.5726, 88.3639],
  "hyderabad": [17.3850, 78.4867],
  "chennai":   [13.0827, 80.2707],
  "pune":      [18.5204, 73.8567],
  "jaipur":    [26.9124, 75.7873],
  "lucknow":   [26.8467, 80.9462],
};

function getCityCoords(city) {
  if (!city) return [20.5937, 78.9629];
  const key = city.toLowerCase().trim();
  for (const [k, v] of Object.entries(CITY_COORDS)) {
    if (key.includes(k)) return v;
  }
  return [20.5937, 78.9629];
}

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #0c0c14;
    --cream: #f8f7f4;
    --saffron: #f4a023;
    --saffron-g: #e8850d;
    --indigo: #3d3bf5;
    --rose: #c42050;
    --sage: #17885a;
    --muted: #8a8aa0;
    --border: #edeaf4;
    --surface: #f3f1ec;
    --ff-display: 'Playfair Display', Georgia, serif;
    --ff-body: 'DM Sans', system-ui, sans-serif;
    --shadow-sm: 0 1px 3px rgba(0,0,0,.05);
    --shadow-md: 0 4px 16px rgba(0,0,0,.07);
    --shadow-lg: 0 12px 40px rgba(0,0,0,.1);
    --radius: 14px;
  }
  body { font-family: var(--ff-body); background: var(--cream); color: var(--ink); }
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse-dot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.4; transform:scale(1.6); } }
  .org-nav-btn:hover { background: rgba(244,160,35,.07) !important; color: var(--ink) !important; }
  .org-card { transition: box-shadow .2s, transform .2s; }
  .org-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
  .org-row:hover { background: #fdfcfa !important; }
  .org-action-btn { transition: opacity .15s, transform .15s; }
  .org-action-btn:hover { opacity: .75; transform: scale(1.08); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 8px; }
  table { border-collapse: collapse; }
`;

const categories = ["Sports", "Literary", "Hobby", "Adventure", "Music", "Tech", "Food"];
const emptyForm = { title: "", category: "Sports", date: "", time: "", location: "", city: "", capacity: "", description: "", image: "🎉", color: "#f4a023", grad: "linear-gradient(135deg,#f4a023,#e85d04)", status: "Active" };

const NAV = [
  { id: "overview", icon: "▦", label: "Overview" },
  { id: "events", icon: "◈", label: "My Events" },
  { id: "participants", icon: "◉", label: "Participants" },
  { id: "messages", icon: "◇", label: "Broadcast" },
  { id: "map", icon: "◉", label: "Event Map" },
  { id: "analytics", icon: "✦", label: "Analytics" },
  { id: "settings", icon: "◎", label: "Settings" },
];

const colorOptions = [
  { hex: "#f4a023", grad: "linear-gradient(135deg,#f4a023,#e85d04)" },
  { hex: "#3d3bf5", grad: "linear-gradient(135deg,#3d3bf5,#8b2fcc)" },
  { hex: "#17885a", grad: "linear-gradient(135deg,#17885a,#0d5c3a)" },
  { hex: "#c42050", grad: "linear-gradient(135deg,#c42050,#8b0f3a)" },
  { hex: "#8b2fcc", grad: "linear-gradient(135deg,#8b2fcc,#5c1d8c)" },
  { hex: "#0d9488", grad: "linear-gradient(135deg,#0d9488,#0a7060)" },
];
const emojiOptions = ["🎉","🏃","📚","🎭","📸","🏔️","♟️","🎵","🍕","💻","⚽","🎨"];

function statusStyle(status) {
  if (status === "Active" || status === "Confirmed") return { bg: "rgba(23,136,90,.08)", color: "#17885a", border: "rgba(23,136,90,.2)" };
  if (status === "Draft" || status === "Pending") return { bg: "rgba(61,59,245,.06)", color: "#3d3bf5", border: "rgba(61,59,245,.2)" };
  if (status === "Waitlisted" || status === "Paused") return { bg: "rgba(244,160,35,.1)", color: "#b06a00", border: "rgba(244,160,35,.3)" };
  return { bg: "var(--surface)", color: "var(--muted)", border: "var(--border)" };
}

function StatusPill({ label }) {
  const s = statusStyle(label);
  return <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 100, padding: "3px 12px", fontSize: "0.72rem", fontWeight: 700 }}>{label}</span>;
}

export default function OrganizerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [msgText, setMsgText] = useState("");
  const [msgSubject, setMsgSubject] = useState("");
  const [msgType, setMsgType] = useState("Announcement");
  const [msgEventId, setMsgEventId] = useState("");
  const [msgSent, setMsgSent] = useState(false);
  const [msgError, setMsgError] = useState("");
  const [msgLoading, setMsgLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [eventCoords, setEventCoords] = useState({});

  useEffect(() => {
    if (!document.getElementById("sangam-org-css")) {
      const s = document.createElement("style"); s.id = "sangam-org-css"; s.textContent = GLOBAL_CSS; document.head.appendChild(s);
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [evs, anal, broads] = await Promise.all([
        eventsAPI.getMine(),
        analyticsAPI.get(),
        broadcastsAPI.getAll(),
      ]);
      setEvents(evs);
      setAnalytics(anal);
      setBroadcasts(broads);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (selectedEvent) {
      registrationsAPI.getParticipants(selectedEvent.id)
        .then(data => setParticipants(data.map(p => ({ ...p, event_id: selectedEvent.id }))))
        .catch(console.error);
    } else {
      Promise.all(events.map(e =>
        registrationsAPI.getParticipants(e.id).then(data => data.map(p => ({ ...p, event_id: e.id })))
      ))
        .then(results => setParticipants(results.flat()))
        .catch(console.error);
    }
  }, [selectedEvent, events]);

  const totalRegistered = events.reduce((s, e) => s + e.registered, 0);
  const totalCapacity = events.reduce((s, e) => s + e.capacity, 0);

  const handleFormChange = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleCreateOrEdit = async () => {
    if (!form.title.trim()) { setFormError("Event title is required."); return; }
    if (!form.date) { setFormError("Date is required."); return; }
    if (!form.time) { setFormError("Time is required."); return; }
    if (!form.location.trim()) { setFormError("Location is required."); return; }
    setFormError("");
    setFormLoading(true);
    try {
      if (editingId) {
        await eventsAPI.update(editingId, { ...form, capacity: Number(form.capacity) || 50 });
      } else {
        await eventsAPI.create({ ...form, capacity: Number(form.capacity) || 50, status: form.status || "Active" });
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditingId(null);
      setFormError("");
      loadData();
    } catch (err) {
      setFormError(err.message || "Failed to save event. Check backend is running.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (event) => {
    setForm({ title: event.title, category: event.category, date: event.date, time: event.time, location: event.location, city: event.city || "", capacity: event.capacity, description: event.description || "", image: event.image, color: event.color, grad: event.grad, status: event.status || "Active" });
    setEditingId(event.id); setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await eventsAPI.delete(id);
      setConfirmDelete(null);
      loadData();
    } catch (err) { console.error(err); }
  };

  const toggleStatus = async (id) => {
    const ev = events.find(e => e.id === id);
    try {
      await eventsAPI.update(id, { ...ev, status: ev.status === "Active" ? "Paused" : "Active" });
      loadData();
    } catch (err) { console.error(err); }
  };

  const sendMessage = async () => {
    if (!msgSubject.trim()) { setMsgError("Subject is required."); return; }
    if (!msgText.trim()) { setMsgError("Message body is required."); return; }
    setMsgError("");
    setMsgLoading(true);
    try {
      await broadcastsAPI.send({
        event_id: msgEventId || null,
        subject: msgSubject.trim(),
        message: msgText.trim(),
        type: msgType,
      });
      setMsgSent(true);
      setMsgText("");
      setMsgSubject("");
      setMsgEventId("");
      setTimeout(() => setMsgSent(false), 4000);
      const updated = await broadcastsAPI.getAll();
      setBroadcasts(updated);
    } catch (err) {
      setMsgError(err.message || "Failed to send broadcast.");
    } finally {
      setMsgLoading(false);
    }
  };

  const filtered = events.filter(e => {
    const matchStatus = filterStatus === "All" || e.status === filterStatus;
    const matchSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Geocode events when map tab opens
  useEffect(() => {
    if (activeTab !== "map" || events.length === 0) return;
    const missing = events.filter(ev => !ev.lat || !ev.lng);
    if (missing.length === 0) return;
    (async () => {
      const coords = { ...eventCoords };
      for (const ev of missing) {
        if (coords[ev.id]) continue;
        const pos = await geocodeLocation(ev.location, ev.city);
        if (pos) coords[ev.id] = pos;
        await new Promise(r => setTimeout(r, 350));
      }
      setEventCoords(coords);
    })();
  }, [activeTab, events]);

  const pageTitle = { overview: "Dashboard Overview", events: "Manage Events", participants: "Participants", messages: "Broadcast Message", map: "Event Map", analytics: "Analytics", settings: "Settings" }[activeTab];

  const inputStyle = { width: "100%", padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--ink)", fontSize: "0.88rem", outline: "none", fontFamily: "var(--ff-body)" };
  const labelStyle = { display: "block", fontSize: "0.72rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6, marginTop: 16 };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--cream)", fontFamily: "var(--ff-body)", color: "var(--ink)" }}>

      {/* Sidebar */}
      <aside style={{ width: 224, background: "#fff", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "24px 20px 18px" }}>
          <img src={logo} alt="Sangam" style={{ height: 32, width: "auto", objectFit: "contain" }} />
          <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(244,160,35,.1)", color: "#b06a00", border: "1px solid rgba(244,160,35,.2)", borderRadius: 6, padding: "3px 10px", fontSize: "0.65rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>Organizer Portal</div>
        </div>

        <div style={{ height: 1, background: "var(--border)", margin: "0 20px" }} />

        <nav style={{ flex: 1, padding: "14px 10px", display: "flex", flexDirection: "column", gap: 1 }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className="org-nav-btn"
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", background: activeTab === item.id ? "rgba(244,160,35,.1)" : "transparent", color: activeTab === item.id ? "#b06a00" : "var(--muted)", cursor: "pointer", fontSize: "0.85rem", fontFamily: "var(--ff-body)", fontWeight: activeTab === item.id ? 700 : 500, textAlign: "left", transition: "all .18s", borderLeft: activeTab === item.id ? "2px solid var(--saffron)" : "2px solid transparent" }}>
              <span style={{ fontSize: "0.78rem", opacity: activeTab === item.id ? 1 : 0.5, width: 16, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ height: 1, background: "var(--border)", margin: "0 20px" }} />
        <div style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#f4a023,#e85d04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>{user?.name?.[0] || "R"}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Organizer"}</div>
              <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>Event Organizer</div>
            </div>
            <button onClick={onLogout} title="Logout" style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 8, color: "var(--muted)", cursor: "pointer", fontSize: "0.7rem", fontWeight: 600, padding: "4px 8px" }}>↩</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Topbar */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 900, fontSize: "1.4rem", letterSpacing: "-.01em" }}>{pageTitle}</h1>
            <p style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 3, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--sage)", display: "inline-block", animation: "pulse-dot 2s infinite" }}/>
              Welcome back, {user?.name || "Organizer"} · {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "0 14px", gap: 7 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>🔍</span>
              <input style={{ background: "transparent", border: "none", outline: "none", color: "var(--ink)", fontSize: "0.83rem", padding: "8px 0", width: 150, fontFamily: "var(--ff-body)" }} placeholder="Search…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button onClick={() => { setShowModal(true); setEditingId(null); setForm(emptyForm); setFormError(""); }}
              style={{ padding: "9px 20px", background: "var(--ink)", color: "var(--cream)", border: "none", borderRadius: 10, fontFamily: "var(--ff-body)", fontWeight: 700, fontSize: "0.83rem", cursor: "pointer", letterSpacing: ".01em", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span> Create Event
            </button>
          </div>
        </header>

        <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div style={{ animation: "fadeUp .4s ease both" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
                {[
                  { label: "Total Events",     value: events.length,                                          sub: `${events.filter(e=>e.status==="Active").length} active`,  color: "var(--saffron)",  icon: "◈" },
                  { label: "Total Registered", value: totalRegistered,                                        sub: `of ${totalCapacity} capacity`,                            color: "#17885a",         icon: "◉" },
                  { label: "Fill Rate",        value: totalCapacity > 0 ? Math.round((totalRegistered/totalCapacity)*100)+"%" : "0%", sub: "Across all events",           color: "var(--indigo)",   icon: "✦" },
                  { label: "Draft Events",     value: events.filter(e=>e.status==="Draft").length,            sub: "Ready to publish",                                        color: "#8b2fcc",         icon: "▦" },
                ].map((s, i) => (
                  <div key={i} className="org-card" style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", borderTop: `3px solid ${s.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>{s.label}</div>
                      <span style={{ fontSize: "0.9rem", color: s.color, opacity: .5 }}>{s.icon}</span>
                    </div>
                    <div style={{ fontFamily: "var(--ff-display)", fontSize: "1.9rem", fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.1rem" }}>Active Events</h2>
                <button onClick={() => setActiveTab("events")} style={{ background: "transparent", border: "none", color: "var(--saffron-g)", cursor: "pointer", fontSize: "0.82rem", fontFamily: "var(--ff-body)", fontWeight: 700 }}>View All →</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }}>
                {events.filter(e => e.status === "Active").map(ev => (
                  <div key={ev.id} className="org-card" style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ height: 100, background: ev.grad, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px" }}>
                      <span style={{ fontSize: "2.2rem" }}>{ev.image}</span>
                      <StatusPill label={ev.status} />
                    </div>
                    <div style={{ padding: "14px 16px" }}>
                      <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "0.92rem", marginBottom: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</h3>
                      <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: 12 }}>📅 {ev.date} · 📍 {ev.location}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--muted)", marginBottom: 6 }}>
                        <span>Registrations</span>
                        <span style={{ fontWeight: 700, color: "var(--ink)" }}>{ev.registered}/{ev.capacity}</span>
                      </div>
                      <div style={{ height: 5, background: "var(--surface)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
                        <div style={{ width: `${Math.min((ev.registered / ev.capacity) * 100, 100)}%`, height: "100%", background: ev.grad, borderRadius: 3, transition: "width .5s ease" }}/>
                      </div>
                      <div style={{ display: "flex", gap: 7 }}>
                        <button onClick={() => handleEdit(ev)} style={{ flex: 1, padding: "7px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontSize: "0.75rem", fontFamily: "var(--ff-body)", color: "var(--ink)" }}>✏️ Edit</button>
                        <button onClick={() => { setSelectedEvent(ev); setActiveTab("participants"); }} style={{ flex: 1, padding: "7px", background: "rgba(244,160,35,.08)", border: "1px solid rgba(244,160,35,.25)", borderRadius: 8, cursor: "pointer", fontSize: "0.75rem", fontFamily: "var(--ff-body)", color: "var(--saffron-g)", fontWeight: 600 }}>👥 View</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.1rem", marginBottom: 14 }}>Recent Registrations</h2>
              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
                <table style={{ width: "100%", fontSize: "0.83rem" }}>
                  <thead>
                    <tr style={{ background: "var(--surface)" }}>
                      {["Name","Email","Status","Registered On"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "11px 18px", color: "var(--muted)", fontSize: "0.67rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {participants.slice(0, 4).map(p => (
                      <tr key={p.id} className="org-row" style={{ borderBottom: "1px solid var(--border)", transition: "background .15s" }}>
                        <td style={{ padding: "12px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,var(--saffron),var(--saffron-g))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>{p.name?.[0] || "?"}</div>
                            <span style={{ fontWeight: 600 }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 18px", color: "var(--muted)" }}>{p.email}</td>
                        <td style={{ padding: "12px 18px" }}><StatusPill label={p.status} /></td>
                        <td style={{ padding: "12px 18px", color: "var(--muted)" }}>{p.registered_at ? new Date(p.registered_at).toLocaleDateString("en-IN") : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EVENTS */}
          {activeTab === "events" && (
            <div style={{ animation: "fadeUp .4s ease both" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div style={{ display: "flex", gap: 6, background: "var(--surface)", borderRadius: 10, padding: 4 }}>
                  {["All","Active","Draft","Paused"].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: filterStatus === s ? "#fff" : "transparent", color: filterStatus === s ? "var(--ink)" : "var(--muted)", cursor: "pointer", fontSize: "0.78rem", fontFamily: "var(--ff-body)", fontWeight: filterStatus === s ? 700 : 500, transition: "all .18s", boxShadow: filterStatus === s ? "var(--shadow-sm)" : "none" }}>
                      {s}
                    </button>
                  ))}
                </div>
                <button onClick={() => { setShowModal(true); setEditingId(null); setForm(emptyForm); setFormError(""); }}
                  style={{ padding: "8px 18px", background: "var(--ink)", color: "var(--cream)", border: "none", borderRadius: 10, fontFamily: "var(--ff-body)", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>+ New Event</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filtered.map(ev => (
                  <div key={ev.id} className="org-row" style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 18px", transition: "background .15s" }}>
                    <div style={{ width: 46, height: 46, borderRadius: 12, background: ev.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{ev.image}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", fontFamily: "var(--ff-display)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 3 }}>📅 {ev.date} {ev.time} · 📍 {ev.location} · 🏷️ {ev.category}</div>
                    </div>
                    <div style={{ width: 120 }}>
                      <div style={{ height: 4, background: "var(--surface)", borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
                        <div style={{ width: `${Math.min((ev.registered / ev.capacity) * 100, 100)}%`, height: "100%", background: ev.grad, borderRadius: 3 }}/>
                      </div>
                      <span style={{ fontSize: "0.68rem", color: "var(--muted)" }}>{ev.registered}/{ev.capacity} registered</span>
                    </div>
                    <StatusPill label={ev.status} />
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={() => handleEdit(ev)} className="org-action-btn" style={{ width: 30, height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✏️</button>
                      <button onClick={() => toggleStatus(ev.id)} className="org-action-btn" style={{ width: 30, height: 30, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center" }}>{ev.status === "Active" ? "⏸️" : "▶️"}</button>
                      <button onClick={() => setConfirmDelete(ev.id)} className="org-action-btn" style={{ width: 30, height: 30, background: "rgba(196,32,80,.05)", border: "1px solid rgba(196,32,80,.12)", borderRadius: 8, cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center" }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PARTICIPANTS */}
          {activeTab === "participants" && (
            <div style={{ animation: "fadeUp .4s ease both" }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
                <button onClick={() => setSelectedEvent(null)}
                  style={{ padding: "6px 14px", borderRadius: 8, border: selectedEvent === null ? "none" : "1px solid var(--border)", background: selectedEvent === null ? "var(--ink)" : "#fff", color: selectedEvent === null ? "var(--cream)" : "var(--muted)", cursor: "pointer", fontSize: "0.75rem", fontFamily: "var(--ff-body)", fontWeight: 600, transition: "all .18s" }}>
                  All Events
                </button>
                {events.map(e => (
                  <button key={e.id} onClick={() => setSelectedEvent(e)}
                    style={{ padding: "6px 14px", borderRadius: 8, border: selectedEvent?.id === e.id ? "none" : "1px solid var(--border)", background: selectedEvent?.id === e.id ? "var(--ink)" : "#fff", color: selectedEvent?.id === e.id ? "var(--cream)" : "var(--muted)", cursor: "pointer", fontSize: "0.75rem", fontFamily: "var(--ff-body)", fontWeight: 600, transition: "all .18s" }}>
                    {e.title.slice(0, 22)}{e.title.length > 22 ? "…" : ""}
                  </button>
                ))}
              </div>

              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
                <table style={{ width: "100%", fontSize: "0.83rem" }}>
                  <thead>
                    <tr style={{ background: "var(--surface)" }}>
                      {["#","Participant","Email","Status","Registered On","Actions"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "11px 18px", color: "var(--muted)", fontSize: "0.67rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p, i) => (
                      <tr key={p.id} className="org-row" style={{ borderBottom: "1px solid var(--border)", transition: "background .15s" }}>
                        <td style={{ padding: "12px 18px", color: "var(--muted)", fontSize: "0.75rem" }}>{i+1}</td>
                        <td style={{ padding: "12px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,var(--saffron),var(--saffron-g))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>{p.name?.[0] || "?"}</div>
                            <span style={{ fontWeight: 600 }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 18px", color: "var(--muted)" }}>{p.email}</td>
                        <td style={{ padding: "12px 18px" }}><StatusPill label={p.status} /></td>
                        <td style={{ padding: "12px 18px", color: "var(--muted)" }}>{p.registered_at ? new Date(p.registered_at).toLocaleDateString("en-IN") : "-"}</td>
                        <td style={{ padding: "12px 18px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={async () => {
                              await registrationsAPI.updateStatus(p.event_id, p.id, "Confirmed");
                              const updated = selectedEvent
                                ? (await registrationsAPI.getParticipants(selectedEvent.id)).map(x => ({ ...x, event_id: selectedEvent.id }))
                                : (await Promise.all(events.map(e => registrationsAPI.getParticipants(e.id).then(d => d.map(x => ({ ...x, event_id: e.id })))))).flat();
                              setParticipants(updated);
                            }} className="org-action-btn" style={{ width: 28, height: 28, background: "rgba(23,136,90,.08)", border: "1px solid rgba(23,136,90,.18)", borderRadius: 7, cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✅</button>
                            <button onClick={async () => {
                              await registrationsAPI.updateStatus(p.event_id, p.id, "Cancelled");
                              const updated = selectedEvent
                                ? (await registrationsAPI.getParticipants(selectedEvent.id)).map(x => ({ ...x, event_id: selectedEvent.id }))
                                : (await Promise.all(events.map(e => registrationsAPI.getParticipants(e.id).then(d => d.map(x => ({ ...x, event_id: e.id })))))).flat();
                              setParticipants(updated);
                            }} className="org-action-btn" style={{ width: 28, height: 28, background: "rgba(196,32,80,.05)", border: "1px solid rgba(196,32,80,.12)", borderRadius: 7, cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center" }}>❌</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {activeTab === "messages" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, animation: "fadeUp .5s ease both" }}>
              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: 28 }}>
                <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.2rem", marginBottom: 6 }}>Broadcast to Participants</h2>
                <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginBottom: 22 }}>Send announcements, updates, or reminders to registered participants.</p>

                <label style={labelStyle}>Select Event</label>
                <select
                  style={inputStyle}
                  value={msgEventId}
                  onChange={e => setMsgEventId(e.target.value)}
                >
                  <option value="">All Events</option>
                  {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>

                <label style={labelStyle}>Message Type</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                  {["Announcement", "Reminder", "Update", "Cancellation"].map(t => (
                    <button
                      key={t}
                      onClick={() => setMsgType(t)}
                      style={{
                        padding: "7px 16px", borderRadius: 100,
                        border: msgType === t ? "none" : "1px solid var(--border)",
                        background: msgType === t ? "var(--ink)" : "#fff",
                        color: msgType === t ? "var(--cream)" : "var(--muted)",
                        cursor: "pointer", fontSize: "0.78rem",
                        fontFamily: "var(--ff-body)", fontWeight: 600, transition: "all .2s",
                      }}
                    >{t}</button>
                  ))}
                </div>

                <label style={labelStyle}>Subject *</label>
                <input
                  style={{ ...inputStyle, border: msgError && !msgSubject.trim() ? "1.5px solid #c42050" : inputStyle.border }}
                  placeholder="e.g. Important update about the event"
                  value={msgSubject}
                  onChange={e => { setMsgSubject(e.target.value); setMsgError(""); }}
                />

                <label style={labelStyle}>Message *</label>
                <textarea
                  style={{
                    ...inputStyle, height: 130, resize: "vertical",
                    border: msgError && !msgText.trim() ? "1.5px solid #c42050" : inputStyle.border,
                  }}
                  placeholder="Write your message to participants…"
                  value={msgText}
                  onChange={e => { setMsgText(e.target.value); setMsgError(""); }}
                />

                {msgError && (
                  <div style={{ marginTop: 10, padding: "10px 16px", background: "rgba(196,32,80,.06)", border: "1px solid rgba(196,32,80,.2)", borderRadius: 10, color: "#c42050", fontSize: "0.82rem" }}>
                    ⚠️ {msgError}
                  </div>
                )}

                {msgSent && (
                  <div style={{ marginTop: 10, padding: "10px 16px", background: "rgba(23,136,90,.08)", border: "1px solid rgba(23,136,90,.2)", borderRadius: 10, color: "var(--sage)", fontSize: "0.82rem" }}>
                    ✅ Broadcast sent successfully!
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                  <button
                    onClick={sendMessage}
                    disabled={msgLoading}
                    style={{
                      padding: "11px 26px", background: msgLoading ? "var(--muted)" : "var(--ink)",
                      color: "var(--cream)", border: "none", borderRadius: 100,
                      fontFamily: "var(--ff-body)", fontWeight: 700, fontSize: "0.85rem",
                      cursor: msgLoading ? "not-allowed" : "pointer", transition: "background .2s",
                    }}
                  >
                    {msgLoading ? "Sending…" : "📤 Send Broadcast"}
                  </button>
                  <button
                    onClick={() => { setMsgSubject(""); setMsgText(""); setMsgEventId(""); setMsgType("Announcement"); setMsgError(""); setMsgSent(false); }}
                    style={{
                      padding: "11px 20px", background: "transparent",
                      border: "1px solid var(--border)", borderRadius: 100,
                      color: "var(--muted)", cursor: "pointer", fontSize: "0.85rem",
                      fontFamily: "var(--ff-body)",
                    }}
                  >🗑 Clear</button>
                </div>
              </div>

              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: 24, overflowY: "auto", maxHeight: 600 }}>
                <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1rem", marginBottom: 18 }}>Message History</h3>
                {broadcasts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>📭</div>
                    <p style={{ fontSize: "0.82rem" }}>No broadcasts sent yet.</p>
                  </div>
                ) : broadcasts.map((m, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 0", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>📨</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 2 }}>{m.subject}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: 4 }}>
                        {m.event_title || "All Events"} · {new Date(m.sent_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      <div style={{ display: "inline-block", background: "rgba(61,59,245,.06)", color: "var(--indigo)", borderRadius: 100, padding: "2px 10px", fontSize: "0.68rem", fontWeight: 700 }}>{m.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MAP */}
          {activeTab === "map" && (
            <div style={{ animation: "fadeUp .5s ease both" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
                <div style={{ borderRadius: 20, overflow: "hidden", height: 500, border: "1px solid var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,.08)" }}>
                  <MapContainer
                    center={getCityCoords(user?.city)}
                    zoom={user?.city ? 13 : 5}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {events.map(ev => {
                      const pos = (ev.lat && ev.lng)
                        ? [parseFloat(ev.lat), parseFloat(ev.lng)]
                        : eventCoords[ev.id] || null;
                      if (!pos) return null;
                      return (
                        <Marker key={ev.id} position={pos}>
                          <Popup>
                            <div style={{ fontFamily: "sans-serif", minWidth: 180 }}>
                              <div style={{ fontSize: "1.3rem", marginBottom: 4 }}>{ev.image}</div>
                              <div style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 4 }}>{ev.title}</div>
                              <div style={{ fontSize: "0.75rem", color: "#555" }}>📅 {ev.date} · {ev.time?.slice(0,5)}</div>
                              <div style={{ fontSize: "0.75rem", color: "#555" }}>📍 {ev.location}{ev.city ? `, ${ev.city}` : ""}</div>
                              <div style={{ fontSize: "0.75rem", fontWeight: 600, marginTop: 4, color: "#17885a" }}>
                                👥 {ev.registered}/{ev.capacity} registered
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>

                <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: 22, overflowY: "auto", height: 500 }}>
                  <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>Your Events</h3>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: events.some(ev => !ev.lat && !ev.lng && !eventCoords[ev.id]) ? 6 : 16 }}>Pinned on the map by exact location</p>
                  {events.some(ev => !ev.lat && !ev.lng && !eventCoords[ev.id]) && (
                    <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: 12, padding: "6px 10px", background: "var(--surface)", borderRadius: 8 }}>📡 Locating events on map…</div>
                  )}
                  {events.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
                      <div style={{ fontSize: "2rem", marginBottom: 8 }}>🗺️</div>
                      <p style={{ fontSize: "0.82rem" }}>No events yet. Create one to see it on the map.</p>
                    </div>
                  ) : events.map(ev => (
                    <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: ev.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>{ev.image}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}>📍 {ev.location}{ev.city ? `, ${ev.city}` : ""}</div>
                      </div>
                      <StatusPill label={ev.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {activeTab === "analytics" && (
            <div style={{ animation: "fadeUp .4s ease both" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
                {[
                  { label: "Total Events",     value: analytics?.totalEvents ?? events.length,     color: "var(--saffron)", icon: "◈" },
                  { label: "Total Registered", value: analytics?.totalRegistered ?? totalRegistered, color: "var(--sage)",    icon: "◉" },
                  { label: "Avg. Fill Rate",   value: analytics?.fillRate ?? (totalCapacity > 0 ? Math.round((totalRegistered/totalCapacity)*100)+'%' : '0%'), color: "var(--indigo)", icon: "✦" },
                  { label: "Active Events",    value: analytics?.activeEvents ?? events.filter(e=>e.status==="Active").length, color: "#8b2fcc", icon: "▦" },
                ].map((s, i) => (
                  <div key={i} className="org-card" style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", borderTop: `3px solid ${s.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>{s.label}</div>
                      <span style={{ fontSize: "0.9rem", color: s.color, opacity: .5 }}>{s.icon}</span>
                    </div>
                    <div style={{ fontFamily: "var(--ff-display)", fontSize: "1.9rem", fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.1rem", marginBottom: 16 }}>Event Performance</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                {events.map(ev => (
                  <div key={ev.id} className="org-card" style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: ev.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>{ev.image}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "0.88rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}>{ev.category}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                      {[["Registered", ev.registered], ["Capacity", ev.capacity], ["Fill %", Math.round((ev.registered / ev.capacity) * 100) + "%"]].map(([l, v]) => (
                        <div key={l}>
                          <div style={{ fontFamily: "var(--ff-display)", fontSize: "1.2rem", fontWeight: 700, color: ev.color }}>{v}</div>
                          <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: 2, textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600 }}>{l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ height: 5, background: "var(--surface)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${Math.min((ev.registered / ev.capacity) * 100, 100)}%`, height: "100%", background: ev.grad, borderRadius: 3 }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, animation: "fadeUp .4s ease both" }}>
              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 18, padding: 26 }}>
                <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.05rem", marginBottom: 18 }}>Organizer Profile</h3>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#f4a023,#e85d04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", fontWeight: 900, color: "#fff", margin: "0 auto 22px" }}>{user?.name?.[0] || "O"}</div>
                {[["Full Name", "name", user?.name || ""],["Email", "email", user?.email || ""],["Phone", "phone", ""],["Organization", "institution", ""],["City", "city", ""]].map(([l, field, defaultVal]) => (
                  <div key={l} style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>{l}</label>
                    <input id={`settings-${field}`} style={inputStyle} defaultValue={defaultVal} readOnly={field === "email"} />
                  </div>
                ))}
                <button onClick={async () => {
                  try {
                    await authAPI.updateProfile({
                      name: document.getElementById("settings-name")?.value,
                      phone: document.getElementById("settings-phone")?.value,
                      institution: document.getElementById("settings-institution")?.value,
                      city: document.getElementById("settings-city")?.value,
                    });
                    alert("Profile saved!");
                  } catch (err) { alert(err.message); }
                }} style={{ marginTop: 8, width: "100%", padding: "11px", background: "var(--ink)", border: "none", borderRadius: 10, color: "var(--cream)", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", fontFamily: "var(--ff-body)" }}>Save Changes →</button>
              </div>

              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 18, padding: 26 }}>
                <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.05rem", marginBottom: 18 }}>Notification Preferences</h3>
                {["Email on new registration","SMS alerts for capacity warnings","Daily summary report","Participant message notifications","Event reminder alerts"].map((pref, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "0.85rem" }}>{pref}</span>
                    <div style={{ width: 42, height: 22, borderRadius: 11, background: i < 3 ? "var(--ink)" : "var(--border)", position: "relative", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: i < 3 ? 23 : 3, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.15)" }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* CREATE/EDIT MODAL */}
      {showModal && (
        <div onClick={() => setShowModal(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(12,12,20,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(6px)" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, width: "90%", maxWidth: 560, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,.18)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 26px", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.15rem" }}>{editingId ? "Edit Event" : "Create New Event"}</h2>
              <button onClick={() => { setShowModal(false); setFormError(""); }} style={{ background: "var(--surface)", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.9rem", width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            <div style={{ padding: "6px 28px 20px", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Event Title *</label>
                  <input style={inputStyle} placeholder="e.g. City Marathon 2026" value={form.title} onChange={e => handleFormChange("title", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select style={inputStyle} value={form.category} onChange={e => handleFormChange("category", e.target.value)}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Date *</label>
                  <input type="date" style={inputStyle} value={form.date} onChange={e => handleFormChange("date", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Time</label>
                  <input type="time" style={inputStyle} value={form.time} onChange={e => handleFormChange("time", e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Capacity</label>
                  <input type="number" style={inputStyle} placeholder="100" value={form.capacity} onChange={e => handleFormChange("capacity", e.target.value)} />
                </div>
              </div>
              <label style={labelStyle}>Location *</label>
              <input style={inputStyle} placeholder="Venue / Address e.g. Gandhi Maidan" value={form.location} onChange={e => handleFormChange("location", e.target.value)} />
              <label style={labelStyle}>City *</label>
              <input style={inputStyle} placeholder="e.g. Patna" value={form.city || ""} onChange={e => handleFormChange("city", e.target.value)} />
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, height: 72, resize: "vertical" }} placeholder="Brief description…" value={form.description} onChange={e => handleFormChange("description", e.target.value)} />

              {/* Publish toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, padding: "14px 16px", background: form.status === "Active" ? "rgba(23,136,90,.06)" : "rgba(61,59,245,.04)", borderRadius: 12, border: `1px solid ${form.status === "Active" ? "rgba(23,136,90,.2)" : "var(--border)"}` }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>
                    {form.status === "Active" ? "🟢 Publish to Student Feed" : "⚪ Save as Draft"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>
                    {form.status === "Active" ? "Students can see and register for this event" : "Only visible to you, not shown to students"}
                  </div>
                </div>
                <div
                  onClick={() => handleFormChange("status", form.status === "Active" ? "Draft" : "Active")}
                  style={{ width: 48, height: 26, borderRadius: 13, background: form.status === "Active" ? "#17885a" : "var(--border)", position: "relative", cursor: "pointer", transition: "background .25s", flexShrink: 0 }}
                >
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: form.status === "Active" ? 25 : 3, transition: "left .25s", boxShadow: "0 1px 4px rgba(0,0,0,.2)" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 24 }}>
                <div>
                  <label style={labelStyle}>Event Icon</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                    {emojiOptions.map(em => (
                      <button key={em} onClick={() => handleFormChange("image", em)}
                        style={{ width: 36, height: 36, borderRadius: 10, border: form.image === em ? "2px solid var(--saffron)" : "1px solid var(--border)", background: form.image === em ? "rgba(244,160,35,.1)" : "var(--surface)", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Color</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                    {colorOptions.map(c => (
                      <button key={c.hex} onClick={() => { handleFormChange("color", c.hex); handleFormChange("grad", c.grad); }}
                        style={{ width: 30, height: 30, borderRadius: "50%", background: c.grad, border: form.color === c.hex ? "3px solid var(--ink)" : "3px solid transparent", cursor: "pointer", transition: "border .2s" }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "18px 28px", borderTop: "1px solid var(--border)" }}>
              {formError && (
                <div style={{ padding: "10px 14px", background: "rgba(196,32,80,.06)", border: "1px solid rgba(196,32,80,.2)", borderRadius: 10, color: "#c42050", fontSize: "0.82rem" }}>
                  ⚠️ {formError}
                </div>
              )}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => { setShowModal(false); setFormError(""); }} style={{ padding: "10px 22px", background: "transparent", border: "1px solid var(--border)", borderRadius: 100, color: "var(--muted)", cursor: "pointer", fontSize: "0.85rem", fontFamily: "var(--ff-body)" }}>Cancel</button>
                <button onClick={handleCreateOrEdit} disabled={formLoading} style={{ padding: "10px 26px", background: formLoading ? "var(--muted)" : "var(--ink)", border: "none", borderRadius: 100, color: "var(--cream)", cursor: formLoading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "0.85rem", fontFamily: "var(--ff-body)", transition: "background .2s" }}>
                  {formLoading ? "Saving…" : editingId ? "Save Changes" : "Create Event →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {confirmDelete && (
        <div onClick={() => setConfirmDelete(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(12,12,20,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(6px)" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 18, width: "90%", maxWidth: 360, boxShadow: "0 20px 50px rgba(0,0,0,.15)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.05rem" }}>Delete Event?</h2>
              <button onClick={() => setConfirmDelete(null)} style={{ background: "var(--surface)", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.9rem", width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            <p style={{ padding: "16px 22px", color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>This will permanently delete the event and all registrations. This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 8, padding: "14px 22px", borderTop: "1px solid var(--border)", justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: "9px 18px", background: "transparent", border: "1px solid var(--border)", borderRadius: 10, color: "var(--muted)", cursor: "pointer", fontSize: "0.83rem", fontFamily: "var(--ff-body)" }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{ padding: "9px 20px", background: "#c42050", border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "0.83rem", fontFamily: "var(--ff-body)" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}