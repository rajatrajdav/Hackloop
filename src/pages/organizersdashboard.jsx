import { useState, useEffect } from "react";
import logo from "../assets/logo.jpeg";
import { eventsAPI, registrationsAPI, broadcastsAPI, analyticsAPI } from "../api";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #0c0c14;
    --cream: #faf8f3;
    --saffron: #f4a023;
    --saffron-g: #e8850d;
    --indigo: #3d3bf5;
    --rose: #c42050;
    --sage: #17885a;
    --muted: #7a7890;
    --border: #ece9f0;
    --surface: #f5f3ee;
    --ff-display: 'Playfair Display', Georgia, serif;
    --ff-body: 'DM Sans', system-ui, sans-serif;
  }
  body { font-family: var(--ff-body); background: var(--cream); color: var(--ink); }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse-dot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.5; transform:scale(1.5); } }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--surface); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 8px; }
  table { border-collapse: collapse; }
`;

const initialEvents = [
  { id: 1, title: "City Marathon 2026", category: "Sports", date: "2026-04-20", time: "06:00", location: "Central Park", capacity: 200, registered: 188, status: "Active", image: "🏃", grad: "linear-gradient(135deg,#f4a023,#e85d04)", color: "#f4a023", description: "Annual city marathon open to all age groups." },
  { id: 2, title: "Literary Festival 2026", category: "Literary", date: "2026-05-10", time: "10:00", location: "Convention Center", capacity: 500, registered: 312, status: "Active", image: "🎭", grad: "linear-gradient(135deg,#f4a023,#c97b00)", color: "#f4a023", description: "A celebration of books, authors and ideas." },
  { id: 3, title: "Photography Meetup", category: "Hobby", date: "2026-05-02", time: "16:00", location: "Old Town Square", capacity: 40, registered: 20, status: "Draft", image: "📸", grad: "linear-gradient(135deg,#8b2fcc,#c42050)", color: "#8b2fcc", description: "Monthly photographer community meetup." },
];

const participants = [
  { id: 1, name: "Aryan Kumar", email: "aryan@student.edu", event: "City Marathon 2026", status: "Confirmed", joined: "Apr 5" },
  { id: 2, name: "Priya Singh", email: "priya@email.com", event: "City Marathon 2026", status: "Confirmed", joined: "Apr 6" },
  { id: 3, name: "Rahul Mehta", email: "rahul@email.com", event: "Literary Festival 2026", status: "Waitlisted", joined: "Apr 7" },
  { id: 4, name: "Sneha Das", email: "sneha@student.edu", event: "Literary Festival 2026", status: "Confirmed", joined: "Apr 8" },
  { id: 5, name: "Karan Joshi", email: "karan@email.com", event: "Photography Meetup", status: "Pending", joined: "Apr 9" },
];

const categories = ["Sports", "Literary", "Hobby", "Adventure", "Music", "Tech", "Food"];
const emptyForm = { title: "", category: "Sports", date: "", time: "", location: "", capacity: "", description: "", image: "🎉", color: "#f4a023", grad: "linear-gradient(135deg,#f4a023,#e85d04)" };

const NAV = [
  { id: "overview", icon: "▦", label: "Overview" },
  { id: "events", icon: "◈", label: "My Events" },
  { id: "participants", icon: "◉", label: "Participants" },
  { id: "messages", icon: "◇", label: "Broadcast" },
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
  const [msgSent, setMsgSent] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

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
      registrationsAPI.getParticipants(selectedEvent.id).then(setParticipants).catch(console.error);
    } else {
      // load all participants across all events
      Promise.all(events.map(e => registrationsAPI.getParticipants(e.id)))
        .then(results => setParticipants(results.flat()))
        .catch(console.error);
    }
  }, [selectedEvent, events]);

  const totalRegistered = events.reduce((s, e) => s + e.registered, 0);
  const totalCapacity = events.reduce((s, e) => s + e.capacity, 0);

  const handleFormChange = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleCreateOrEdit = async () => {
    if (!form.title || !form.date || !form.location) return;
    try {
      if (editingId) {
        await eventsAPI.update(editingId, { ...form, capacity: Number(form.capacity) });
      } else {
        await eventsAPI.create({ ...form, capacity: Number(form.capacity) || 50 });
      }
      setShowModal(false); setForm(emptyForm); setEditingId(null);
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (event) => {
    setForm({ title: event.title, category: event.category, date: event.date, time: event.time, location: event.location, capacity: event.capacity, description: event.description, image: event.image, color: event.color, grad: event.grad });
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
    if (!msgSubject || !msgText) return;
    try {
      await broadcastsAPI.send({ event_id: selectedEvent?.id || null, subject: msgSubject, message: msgText, type: msgType });
      setMsgSent(true); setTimeout(() => setMsgSent(false), 3000);
      setMsgText(""); setMsgSubject("");
      broadcastsAPI.getAll().then(setBroadcasts);
    } catch (err) { console.error(err); }
  };

  const filtered = events.filter(e => {
    const matchStatus = filterStatus === "All" || e.status === filterStatus;
    const matchSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pageTitle = { overview: "Dashboard Overview", events: "Manage Events", participants: "Participants", messages: "Broadcast Message", analytics: "Analytics", settings: "Settings" }[activeTab];

  const inputStyle = { width: "100%", padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--ink)", fontSize: "0.88rem", outline: "none", fontFamily: "var(--ff-body)" };
  const labelStyle = { display: "block", fontSize: "0.72rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6, marginTop: 16 };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--cream)", fontFamily: "var(--ff-body)", color: "var(--ink)" }}>

      {/* Sidebar */}
      <aside style={{ width: 232, background: "#fff", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "26px 24px 18px", borderBottom: "1px solid var(--border)" }}>
          <img src={logo} alt="Sangam" style={{ height:36, width:"auto", objectFit:"contain", marginBottom:6 }} />
          <div style={{ marginTop: 6, display: "inline-block", background: "rgba(244,160,35,.12)", color: "#b06a00", border: "1px solid rgba(244,160,35,.3)", borderRadius: 100, padding: "2px 12px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>Organizer Portal</div>
        </div>

        <nav style={{ flex: 1, padding: "20px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12, border: "none", background: activeTab === item.id ? "rgba(244,160,35,.1)" : "transparent", color: activeTab === item.id ? "var(--saffron-g)" : "var(--muted)", cursor: "pointer", fontSize: "0.88rem", fontFamily: "var(--ff-body)", fontWeight: activeTab === item.id ? 700 : 500, textAlign: "left", transition: "all .2s", borderLeft: activeTab === item.id ? "2.5px solid var(--saffron)" : "2.5px solid transparent" }}>
              <span style={{ fontSize: "0.82rem", opacity: activeTab === item.id ? 1 : 0.6 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "18px 16px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f4a023,#e85d04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>{user?.name?.[0] || "R"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>{user?.name || "Organizer"}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Event Organizer</div>
            </div>
            <button onClick={onLogout} style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>Logout</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 36px", borderBottom: "1px solid var(--border)", background: "#fff", position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 900, fontSize: "1.5rem" }}>{pageTitle}</h1>
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--sage)", marginRight: 5, animation: "pulse-dot 2s infinite", verticalAlign: "middle" }}/>
              Welcome back, {user?.name || "Organizer"} · {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 100, padding: "0 16px", gap: 8 }}>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>🔍</span>
              <input style={{ background: "transparent", border: "none", outline: "none", color: "var(--ink)", fontSize: "0.85rem", padding: "9px 0", width: 160, fontFamily: "var(--ff-body)" }} placeholder="Search…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button onClick={() => { setShowModal(true); setEditingId(null); setForm(emptyForm); }}
              style={{ padding: "9px 22px", background: "var(--ink)", color: "var(--cream)", border: "none", borderRadius: 100, fontFamily: "var(--ff-body)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", letterSpacing: ".02em" }}>
              + Create Event
            </button>
          </div>
        </header>

        <div style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div style={{ animation: "fadeUp .5s ease both" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 32 }}>
                {[
                  { label: "Total Events", value: events.length, sub: `${events.filter(e=>e.status==="Active").length} active`, color: "var(--saffron)" },
                  { label: "Total Registered", value: totalRegistered, sub: `of ${totalCapacity} capacity`, color: "#17885a" },
                  { label: "Fill Rate", value: Math.round((totalRegistered / totalCapacity) * 100) + "%", sub: "Across all events", color: "var(--indigo)" },
                  { label: "Draft Events", value: events.filter(e=>e.status==="Draft").length, sub: "Ready to publish", color: "#8b2fcc" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 22px", borderTop: `3px solid ${s.color}` }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>{s.label}</div>
                    <div style={{ fontFamily: "var(--ff-display)", fontSize: "2rem", fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
                <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.2rem" }}>Active Events</h2>
                <button onClick={() => setActiveTab("events")} style={{ background: "transparent", border: "none", color: "var(--saffron-g)", cursor: "pointer", fontSize: "0.85rem", fontFamily: "var(--ff-body)", fontWeight: 700 }}>View All →</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginBottom: 36 }}>
                {events.filter(e => e.status === "Active").map(ev => (
                  <div key={ev.id} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden" }}>
                    <div style={{ height: 110, background: ev.grad, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
                      <span style={{ fontSize: "2.5rem" }}>{ev.image}</span>
                      <StatusPill label={ev.status} />
                    </div>
                    <div style={{ padding: "16px 18px" }}>
                      <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "0.95rem", marginBottom: 6 }}>{ev.title}</h3>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 14 }}>📅 {ev.date} · 📍 {ev.location}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--muted)", marginBottom: 8 }}>
                        <span>Registrations</span>
                        <span style={{ fontWeight: 700, color: "var(--ink)" }}>{ev.registered}/{ev.capacity}</span>
                      </div>
                      <div style={{ height: 6, background: "var(--surface)", borderRadius: 3, overflow: "hidden", marginBottom: 14 }}>
                        <div style={{ width: `${Math.min((ev.registered / ev.capacity) * 100, 100)}%`, height: "100%", background: ev.grad, borderRadius: 3, transition: "width .5s ease" }}/>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => handleEdit(ev)} style={{ flex: 1, padding: "8px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, cursor: "pointer", fontSize: "0.78rem", fontFamily: "var(--ff-body)", color: "var(--ink)" }}>✏️ Edit</button>
                        <button onClick={() => { setSelectedEvent(ev); setActiveTab("participants"); }} style={{ flex: 1, padding: "8px", background: "rgba(244,160,35,.1)", border: "1px solid rgba(244,160,35,.3)", borderRadius: 10, cursor: "pointer", fontSize: "0.78rem", fontFamily: "var(--ff-body)", color: "var(--saffron-g)", fontWeight: 600 }}>👥 View</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.2rem", marginBottom: 16 }}>Recent Registrations</h2>
              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
                <table style={{ width: "100%", fontSize: "0.85rem" }}>
                  <thead>
                    <tr>
                      {["Name","Email","Event","Status","Joined"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "13px 20px", color: "var(--muted)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {participants.slice(0, 4).map(p => (
                      <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "13px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,var(--saffron),var(--saffron-g))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>{p.name[0]}</div>
                            <span style={{ fontWeight: 600 }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "13px 20px", color: "var(--muted)" }}>{p.email}</td>
                        <td style={{ padding: "13px 20px" }}>{p.event}</td>
                        <td style={{ padding: "13px 20px" }}><StatusPill label={p.status} /></td>
                        <td style={{ padding: "13px 20px", color: "var(--muted)" }}>{p.joined}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EVENTS */}
          {activeTab === "events" && (
            <div style={{ animation: "fadeUp .5s ease both" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  {["All","Active","Draft","Paused"].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      style={{ padding: "7px 18px", borderRadius: 100, border: filterStatus === s ? "none" : "1px solid var(--border)", background: filterStatus === s ? "var(--ink)" : "#fff", color: filterStatus === s ? "var(--cream)" : "var(--muted)", cursor: "pointer", fontSize: "0.8rem", fontFamily: "var(--ff-body)", fontWeight: 600, transition: "all .2s" }}>
                      {s}
                    </button>
                  ))}
                </div>
                <button onClick={() => { setShowModal(true); setEditingId(null); setForm(emptyForm); }}
                  style={{ padding: "9px 20px", background: "var(--ink)", color: "var(--cream)", border: "none", borderRadius: 100, fontFamily: "var(--ff-body)", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>+ New Event</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map(ev => (
                  <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 20px" }}>
                    <div style={{ width: 50, height: 50, borderRadius: 14, background: ev.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>{ev.image}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", fontFamily: "var(--ff-display)" }}>{ev.title}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 3 }}>📅 {ev.date} {ev.time} · 📍 {ev.location} · 🏷️ {ev.category}</div>
                    </div>
                    <div style={{ width: 130 }}>
                      <div style={{ height: 5, background: "var(--surface)", borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
                        <div style={{ width: `${Math.min((ev.registered / ev.capacity) * 100, 100)}%`, height: "100%", background: ev.grad, borderRadius: 3 }}/>
                      </div>
                      <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{ev.registered}/{ev.capacity}</span>
                    </div>
                    <StatusPill label={ev.status} />
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleEdit(ev)} style={{ width: 32, height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✏️</button>
                      <button onClick={() => toggleStatus(ev.id)} style={{ width: 32, height: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center" }}>{ev.status === "Active" ? "⏸️" : "▶️"}</button>
                      <button onClick={() => setConfirmDelete(ev.id)} style={{ width: 32, height: 32, background: "rgba(196,32,80,.06)", border: "1px solid rgba(196,32,80,.15)", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center" }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PARTICIPANTS */}
          {activeTab === "participants" && (
            <div style={{ animation: "fadeUp .5s ease both" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {events.map(e => (
                  <button key={e.id} onClick={() => setSelectedEvent(e)}
                    style={{ padding: "7px 16px", borderRadius: 100, border: selectedEvent?.id === e.id ? "none" : "1px solid var(--border)", background: selectedEvent?.id === e.id ? "var(--ink)" : "#fff", color: selectedEvent?.id === e.id ? "var(--cream)" : "var(--muted)", cursor: "pointer", fontSize: "0.78rem", fontFamily: "var(--ff-body)", fontWeight: 600, transition: "all .2s" }}>
                    {e.title.slice(0, 20)}…
                  </button>
                ))}
                <button onClick={() => setSelectedEvent(null)}
                  style={{ padding: "7px 16px", borderRadius: 100, border: selectedEvent === null ? "none" : "1px solid var(--border)", background: selectedEvent === null ? "var(--ink)" : "#fff", color: selectedEvent === null ? "var(--cream)" : "var(--muted)", cursor: "pointer", fontSize: "0.78rem", fontFamily: "var(--ff-body)", fontWeight: 600, transition: "all .2s" }}>
                  All Events
                </button>
              </div>

              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
                <table style={{ width: "100%", fontSize: "0.85rem" }}>
                  <thead>
                    <tr>
                      {["#","Participant","Email","Event","Status","Registered On","Actions"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "13px 20px", color: "var(--muted)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "13px 20px", color: "var(--muted)" }}>{i+1}</td>
                        <td style={{ padding: "13px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,var(--saffron),var(--saffron-g))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>{p.name[0]}</div>
                            <span style={{ fontWeight: 600 }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "13px 20px", color: "var(--muted)" }}>{p.email}</td>
                        <td style={{ padding: "13px 20px" }}>{p.event}</td>
                        <td style={{ padding: "13px 20px" }}><StatusPill label={p.status} /></td>
                        <td style={{ padding: "13px 20px", color: "var(--muted)" }}>{p.joined}</td>
                        <td style={{ padding: "13px 20px" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button style={{ width: 32, height: 32, background: "rgba(23,136,90,.08)", border: "1px solid rgba(23,136,90,.2)", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✅</button>
                            <button style={{ width: 32, height: 32, background: "rgba(196,32,80,.06)", border: "1px solid rgba(196,32,80,.15)", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center" }}>❌</button>
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
                <select style={inputStyle}>
                  <option value="">All Events</option>
                  {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>

                <label style={labelStyle}>Message Type</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                  {["Announcement","Reminder","Update","Cancellation"].map(t => (
                    <button key={t} onClick={() => setMsgType(t)} style={{ padding: "7px 16px", borderRadius: 100, border: "1px solid var(--border)", background: msgType === t ? "var(--ink)" : "#fff", color: msgType === t ? "var(--cream)" : "var(--muted)", cursor: "pointer", fontSize: "0.78rem", fontFamily: "var(--ff-body)", fontWeight: 600, transition: "all .2s" }}>{t}</button>
                  ))}
                </div>

                <label style={labelStyle}>Subject</label>
                <input style={inputStyle} placeholder="Message subject…" value={msgSubject} onChange={e => setMsgSubject(e.target.value)} />

                <label style={labelStyle}>Message</label>
                <textarea style={{ ...inputStyle, height: 120, resize: "vertical" }} placeholder="Write your message to participants…" value={msgText} onChange={e => setMsgText(e.target.value)} />

                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button onClick={sendMessage} style={{ padding: "11px 26px", background: "var(--ink)", color: "var(--cream)", border: "none", borderRadius: 100, fontFamily: "var(--ff-body)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                    {msgSent ? "✓ Sent!" : "📤 Send Broadcast"}
                  </button>
                  <button style={{ padding: "11px 20px", background: "transparent", border: "1px solid var(--border)", borderRadius: 100, color: "var(--muted)", cursor: "pointer", fontSize: "0.85rem", fontFamily: "var(--ff-body)" }}>🕒 Schedule</button>
                </div>
                {msgSent && <div style={{ marginTop: 14, padding: "10px 18px", background: "rgba(23,136,90,.08)", color: "var(--sage)", borderRadius: 12, fontSize: "0.82rem", border: "1px solid rgba(23,136,90,.2)" }}>✅ Message sent to all participants!</div>}
              </div>

              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: 24 }}>
                <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1rem", marginBottom: 18 }}>Message History</h3>
                {broadcasts.map((m, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>📨</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{m.subject}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{m.event_title || "All Events"} · {new Date(m.sent_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{m.type}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {activeTab === "analytics" && (
            <div style={{ animation: "fadeUp .5s ease both" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 32 }}>
                {[
                  { label: "Total Views", value: "2,847", color: "var(--indigo)" },
                  { label: "Conversion Rate", value: "34%", color: "var(--sage)" },
                  { label: "Avg. Fill Rate", value: "78%", color: "var(--saffron)" },
                  { label: "Repeat Attendees", value: "41%", color: "#8b2fcc" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 22px", borderTop: `3px solid ${s.color}` }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>{s.label}</div>
                    <div style={{ fontFamily: "var(--ff-display)", fontSize: "2rem", fontWeight: 900, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.2rem", marginBottom: 18 }}>Event Performance</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
                {events.map(ev => (
                  <div key={ev.id} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 18, padding: 22 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: ev.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>{ev.image}</div>
                      <div>
                        <div style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "0.9rem" }}>{ev.title}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{ev.category}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 18, marginBottom: 14 }}>
                      {[["Registered", ev.registered], ["Capacity", ev.capacity], ["Fill %", Math.round((ev.registered / ev.capacity) * 100) + "%"]].map(([l, v]) => (
                        <div key={l}>
                          <div style={{ fontFamily: "var(--ff-display)", fontSize: "1.3rem", fontWeight: 700, color: ev.color }}>{v}</div>
                          <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 2 }}>{l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ height: 6, background: "var(--surface)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${Math.min((ev.registered / ev.capacity) * 100, 100)}%`, height: "100%", background: ev.grad, borderRadius: 3 }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, animation: "fadeUp .5s ease both" }}>
              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: 28 }}>
                <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.1rem", marginBottom: 20 }}>Organizer Profile</h3>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#f4a023,#e85d04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 900, color: "#fff", margin: "0 auto 24px" }}>RS</div>
                {[["Full Name","Rohit Sharma"],["Email","rohit.sharma@organizer.com"],["Phone","+91 9876543210"],["Organization","CommuniHub Events"],["City","Dhanbad, Jharkhand"]].map(([l, v]) => (
                  <div key={l} style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>{l}</label>
                    <input style={inputStyle} defaultValue={v} />
                  </div>
                ))}
                <button style={{ marginTop: 6, width: "100%", padding: "11px", background: "var(--ink)", border: "none", borderRadius: 100, color: "var(--cream)", cursor: "pointer", fontWeight: 700, fontSize: "0.88rem", fontFamily: "var(--ff-body)" }}>Save Changes →</button>
              </div>

              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: 28 }}>
                <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.1rem", marginBottom: 20 }}>Notification Preferences</h3>
                {["Email on new registration","SMS alerts for capacity warnings","Daily summary report","Participant message notifications","Event reminder alerts"].map((pref, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "0.88rem" }}>{pref}</span>
                    <div style={{ width: 46, height: 24, borderRadius: 12, background: i < 3 ? "var(--ink)" : "var(--border)", position: "relative", cursor: "pointer", transition: "background .2s" }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: i < 3 ? 25 : 3, transition: "left .2s" }}/>
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
          style={{ position: "fixed", inset: 0, background: "rgba(12,12,20,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 24, width: "90%", maxWidth: 580, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 28px", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.2rem" }}>{editingId ? "Edit Event" : "Create New Event"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.1rem", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
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
              <input style={inputStyle} placeholder="Venue / Address" value={form.location} onChange={e => handleFormChange("location", e.target.value)} />
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, height: 72, resize: "vertical" }} placeholder="Brief description…" value={form.description} onChange={e => handleFormChange("description", e.target.value)} />
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
            <div style={{ display: "flex", gap: 10, padding: "18px 28px", borderTop: "1px solid var(--border)", justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "10px 22px", background: "transparent", border: "1px solid var(--border)", borderRadius: 100, color: "var(--muted)", cursor: "pointer", fontSize: "0.85rem", fontFamily: "var(--ff-body)" }}>Cancel</button>
              <button onClick={handleCreateOrEdit} style={{ padding: "10px 26px", background: "var(--ink)", border: "none", borderRadius: 100, color: "var(--cream)", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", fontFamily: "var(--ff-body)" }}>{editingId ? "Save Changes" : "Create Event →"}</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {confirmDelete && (
        <div onClick={() => setConfirmDelete(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(12,12,20,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, width: "90%", maxWidth: 380, boxShadow: "0 24px 60px rgba(0,0,0,.18)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.1rem" }}>Delete Event?</h2>
              <button onClick={() => setConfirmDelete(null)} style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
            </div>
            <p style={{ padding: "18px 24px", color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>This will permanently delete the event and all registrations. This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10, padding: "16px 24px", borderTop: "1px solid var(--border)", justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: "10px 20px", background: "transparent", border: "1px solid var(--border)", borderRadius: 100, color: "var(--muted)", cursor: "pointer", fontSize: "0.85rem", fontFamily: "var(--ff-body)" }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{ padding: "10px 22px", background: "#c42050", border: "none", borderRadius: 100, color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", fontFamily: "var(--ff-body)" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}