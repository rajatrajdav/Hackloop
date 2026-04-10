import { useState, useEffect, useRef } from "react";
import logo from "../assets/logo.jpeg";
import { eventsAPI, registrationsAPI, savedAPI, interestsAPI } from "../api";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #0c0c14;
    --cream: #faf8f3;
    --saffron: #f4a023;
    --saffron-g: #e8850d;
    --indigo: #3d3bf5;
    --rose: #f03e6e;
    --sage: #17885a;
    --muted: #7a7890;
    --border: #ece9f0;
    --surface: #f5f3ee;
    --ff-display: 'Playfair Display', Georgia, serif;
    --ff-body: 'DM Sans', system-ui, sans-serif;
  }
  body { font-family: var(--ff-body); background: var(--cream); color: var(--ink); overflow-x: hidden; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideIn { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
  @keyframes pulse-dot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.5; transform:scale(1.5); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--surface); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 8px; }
`;



const categories = ["All", "Sports", "Literary", "Hobby", "Adventure"];
const interests = ["Running", "Photography", "Books", "Hiking", "Chess", "Music", "Art", "Tech"];

const NAV = [
  { id: "discover", icon: "✦", label: "Discover" },
  { id: "myevents", icon: "◈", label: "My Events" },
  { id: "map", icon: "◉", label: "Nearby" },
  { id: "interests", icon: "◇", label: "Interests" },
  { id: "calendar", icon: "▦", label: "Schedule" },
  { id: "profile", icon: "◎", label: "Profile" },
];

function useReveal() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function EventCard({ event, joined, saved, onJoin, onSave, delay = 0 }) {
  const [hov, setHov] = useState(false);
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff", border: `1px solid ${hov ? "rgba(0,0,0,0.12)" : "var(--border)"}`,
        borderRadius: 20, overflow: "hidden", cursor: "pointer",
        transition: "all .35s cubic-bezier(.34,1.56,.64,1)",
        transform: vis ? (hov ? "translateY(-6px)" : "translateY(0)") : "translateY(24px)",
        opacity: vis ? 1 : 0, transitionDelay: `${delay}ms`,
        boxShadow: hov ? "0 20px 48px rgba(0,0,0,.1)" : "none",
      }}>
      <div style={{ height: 140, background: event.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem", position: "relative", transition: "transform .4s", transform: hov ? "scale(1.04)" : "scale(1)", overflow: "hidden" }}>
        {event.image}
        <button onClick={(e) => { e.stopPropagation(); onSave(event.id); }}
          style={{ position: "absolute", top: 12, right: 14, background: "rgba(255,255,255,.9)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
          {saved ? "♥" : "♡"}
        </button>
        <div style={{ position: "absolute", top: 12, left: 14, background: "rgba(255,255,255,.2)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.3)", borderRadius: 100, padding: "3px 11px", fontSize: "0.68rem", fontWeight: 700, color: "#fff", letterSpacing: ".06em", textTransform: "uppercase" }}>{event.category}</div>
      </div>
      <div style={{ padding: "18px 20px" }}>
        <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1rem", marginBottom: 10, lineHeight: 1.3 }}>{event.title}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.78rem", color: "var(--muted)", marginBottom: 14 }}>
          <span>📅 {event.date}</span>
          <span>📍 {event.location} · 🚶 {event.distance}</span>
          <span style={{ color: event.spots < 10 ? "#c42050" : "#17885a", fontWeight: 600 }}>👥 {event.spots} spots left</span>
        </div>
        <button onClick={() => onJoin(event.id)}
          style={{ width: "100%", padding: "10px", borderRadius: 100, border: joined ? "1.5px solid var(--border)" : "none", background: joined ? "transparent" : event.grad, color: joined ? "var(--muted)" : "#fff", cursor: "pointer", fontFamily: "var(--ff-body)", fontWeight: 700, fontSize: "0.82rem", transition: "all .2s", letterSpacing: ".02em" }}>
          {joined ? "✓ Registered" : "Register Now →"}
        </button>
      </div>
    </div>
  );
}

export default function StudentDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("discover");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState(new Set());
  const [savedEvents, setSavedEvents] = useState(new Set());
  const [selectedInterests, setSelectedInterests] = useState(new Set());
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!document.getElementById("sangam-student-css")) {
      const s = document.createElement("style"); s.id = "sangam-student-css"; s.textContent = GLOBAL_CSS; document.head.appendChild(s);
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [evs, myEvs, saved, ints] = await Promise.all([
        eventsAPI.getAll(),
        registrationsAPI.myEvents(),
        savedAPI.getAll(),
        interestsAPI.getAll(),
      ]);
      setEvents(evs);
      setJoinedEvents(new Set(myEvs.map(e => e.id)));
      setSavedEvents(new Set(saved.map(e => e.id)));
      setSelectedInterests(new Set(ints));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery !== undefined) {
      eventsAPI.getAll({ category: selectedCategory !== "All" ? selectedCategory : undefined, search: searchQuery })
        .then(setEvents).catch(console.error);
    }
  }, [selectedCategory, searchQuery]);

  const filtered = events;

  const toggleJoin = async (id) => {
    try {
      if (joinedEvents.has(id)) {
        await registrationsAPI.cancel(id);
        setJoinedEvents(prev => { const s = new Set(prev); s.delete(id); return s; });
      } else {
        await registrationsAPI.register(id);
        setJoinedEvents(prev => new Set([...prev, id]));
      }
    } catch (err) { console.error(err); }
  };

  const toggleSave = async (id) => {
    try {
      if (savedEvents.has(id)) {
        await savedAPI.unsave(id);
        setSavedEvents(prev => { const s = new Set(prev); s.delete(id); return s; });
      } else {
        await savedAPI.save(id);
        setSavedEvents(prev => new Set([...prev, id]));
      }
    } catch (err) { console.error(err); }
  };

  const toggleInterest = async (interest) => {
    try {
      if (selectedInterests.has(interest)) {
        await interestsAPI.remove(interest);
        setSelectedInterests(prev => { const s = new Set(prev); s.delete(interest); return s; });
      } else {
        await interestsAPI.add(interest);
        setSelectedInterests(prev => new Set([...prev, interest]));
      }
    } catch (err) { console.error(err); }
  };

  const pageTitle = { discover: "Discover Events", myevents: "My Events", map: "Events Nearby", interests: "My Interests", calendar: "My Schedule", profile: "My Profile" }[activeTab];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--cream)", fontFamily: "var(--ff-body)", color: "var(--ink)" }}>

      {/* Sidebar */}
      <aside style={{ width: 230, background: "#fff", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "28px 24px 22px", borderBottom: "1px solid var(--border)" }}>
          <img src={logo} alt="Sangam" style={{ height:36, width:"auto", objectFit:"contain", marginBottom:4 }} />
          <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginTop: 4 }}>Student Portal</div>
        </div>

        <nav style={{ flex: 1, padding: "20px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12, border: "none", background: activeTab === item.id ? "linear-gradient(135deg,rgba(244,160,35,.12),rgba(232,133,13,.08))" : "transparent", color: activeTab === item.id ? "var(--saffron-g)" : "var(--muted)", cursor: "pointer", fontSize: "0.88rem", fontFamily: "var(--ff-body)", fontWeight: activeTab === item.id ? 700 : 500, textAlign: "left", transition: "all .2s", position: "relative", borderLeft: activeTab === item.id ? "2.5px solid var(--saffron)" : "2.5px solid transparent" }}>
              <span style={{ fontSize: "0.85rem", opacity: activeTab === item.id ? 1 : 0.6 }}>{item.icon}</span>
              {item.label}
              {item.id === "myevents" && joinedEvents.size > 0 && (
                <span style={{ marginLeft: "auto", background: "var(--saffron)", color: "#fff", borderRadius: 100, padding: "1px 8px", fontSize: "0.68rem", fontWeight: 800 }}>{joinedEvents.size}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: "18px 16px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,var(--saffron),var(--saffron-g))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>{user?.name?.[0] || "A"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>{user?.name || "Student"}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Student</div>
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
            <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 900, fontSize: "1.5rem", color: "var(--ink)" }}>{pageTitle}</h1>
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--sage)", marginRight: 5, animation: "pulse-dot 2s infinite", verticalAlign: "middle" }}/>
              Patna, Bihar · {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 100, padding: "0 16px", gap: 8 }}>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>🔍</span>
              <input style={{ background: "transparent", border: "none", outline: "none", color: "var(--ink)", fontSize: "0.85rem", padding: "9px 0", width: 180, fontFamily: "var(--ff-body)" }} placeholder="Search events…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid var(--border)", background: "#fff", cursor: "pointer", fontSize: "0.9rem", position: "relative" }}>
              🔔
              <span style={{ position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: "50%", background: "#c42050", border: "2px solid #fff" }}/>
            </button>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,var(--saffron),var(--saffron-g))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 800, color: "#fff", cursor: "pointer" }}>{user?.name?.[0] || "A"}</div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>

          {/* DISCOVER */}
          {activeTab === "discover" && (
            <div style={{ animation: "fadeUp .5s ease both" }}>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 32 }}>
                {[
                  { label: "Events Joined", value: joinedEvents.size, color: "var(--saffron)", bg: "rgba(244,160,35,.08)", icon: "◈" },
                  { label: "Saved Events", value: savedEvents.size, color: "#c42050", bg: "rgba(196,32,80,.06)", icon: "♥" },
                  { label: "Near You", value: "8", color: "var(--indigo)", bg: "rgba(61,59,245,.06)", icon: "◉" },
                  { label: "This Month", value: "24", color: "var(--sage)", bg: "rgba(23,136,90,.06)", icon: "▦" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 22px", borderTop: `3px solid ${s.color}` }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>{s.label}</div>
                    <div style={{ fontFamily: "var(--ff-display)", fontSize: "2rem", fontWeight: 900, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  {categories.map(c => (
                    <button key={c} onClick={() => setSelectedCategory(c)}
                      style={{ padding: "7px 18px", borderRadius: 100, border: selectedCategory === c ? "none" : "1px solid var(--border)", background: selectedCategory === c ? "var(--ink)" : "#fff", color: selectedCategory === c ? "var(--cream)" : "var(--muted)", cursor: "pointer", fontSize: "0.8rem", fontFamily: "var(--ff-body)", fontWeight: 600, transition: "all .2s" }}>
                      {c}
                    </button>
                  ))}
                </div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  style={{ background: "#fff", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 100, padding: "7px 16px", fontSize: "0.8rem", outline: "none", fontFamily: "var(--ff-body)", cursor: "pointer" }}>
                  <option value="date">Sort: Date</option>
                  <option value="distance">Sort: Distance</option>
                  <option value="spots">Sort: Spots Left</option>
                </select>
              </div>

              {/* Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                {filtered.map((ev, i) => (
                  <EventCard key={ev.id} event={ev} joined={joinedEvents.has(ev.id)} saved={savedEvents.has(ev.id)} onJoin={toggleJoin} onSave={toggleSave} delay={i * 60} />
                ))}
              </div>
            </div>
          )}

          {/* MY EVENTS */}
          {activeTab === "myevents" && (
            <div style={{ animation: "fadeUp .5s ease both" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
                <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "1.3rem", fontWeight: 700 }}>Registered Events</h2>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 100, padding: "3px 12px" }}>{joinedEvents.size} events</span>
              </div>

              {events.filter(e => joinedEvents.has(e.id)).length === 0 ? (
                <div style={{ textAlign: "center", padding: "72px 0" }}>
                  <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎟</div>
                  <p style={{ color: "var(--muted)", marginBottom: 20 }}>No events yet. Go discover and join some!</p>
                  <button onClick={() => setActiveTab("discover")} style={{ padding: "11px 28px", background: "var(--ink)", color: "var(--cream)", border: "none", borderRadius: 100, fontFamily: "var(--ff-body)", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>Explore Events →</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
                  {events.filter(e => joinedEvents.has(e.id)).map(ev => (
                    <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 20px" }}>
                      <div style={{ width: 50, height: 50, borderRadius: 14, background: ev.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>{ev.image}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem", fontFamily: "var(--ff-display)" }}>{ev.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 3 }}>📅 {ev.date} · 📍 {ev.location}</div>
                      </div>
                      <div style={{ background: "rgba(23,136,90,.08)", color: "var(--sage)", borderRadius: 100, padding: "4px 14px", fontSize: "0.72rem", fontWeight: 700, border: "1px solid rgba(23,136,90,.2)" }}>Confirmed</div>
                      <button onClick={() => toggleJoin(ev.id)} style={{ padding: "7px 16px", border: "1px solid var(--border)", borderRadius: 100, background: "transparent", color: "var(--muted)", cursor: "pointer", fontSize: "0.78rem", fontFamily: "var(--ff-body)" }}>Cancel</button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
                <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "1.3rem", fontWeight: 700 }}>Saved Events</h2>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 100, padding: "3px 12px" }}>{savedEvents.size} saved</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {events.filter(e => savedEvents.has(e.id)).map(ev => (
                  <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 20px" }}>
                    <div style={{ width: 50, height: 50, borderRadius: 14, background: ev.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>{ev.image}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", fontFamily: "var(--ff-display)" }}>{ev.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 3 }}>📅 {ev.date} · 📍 {ev.location} · {ev.spots} spots left</div>
                    </div>
                    <button onClick={() => toggleJoin(ev.id)} style={{ padding: "8px 20px", background: joinedEvents.has(ev.id) ? "transparent" : "var(--ink)", color: joinedEvents.has(ev.id) ? "var(--muted)" : "var(--cream)", border: joinedEvents.has(ev.id) ? "1px solid var(--border)" : "none", borderRadius: 100, cursor: "pointer", fontSize: "0.78rem", fontFamily: "var(--ff-body)", fontWeight: 700 }}>
                      {joinedEvents.has(ev.id) ? "Registered ✓" : "Register →"}
                    </button>
                    <button onClick={() => toggleSave(ev.id)} style={{ padding: "7px 14px", border: "1px solid var(--border)", borderRadius: 100, background: "transparent", color: "var(--muted)", cursor: "pointer", fontSize: "0.78rem", fontFamily: "var(--ff-body)" }}>Remove</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MAP / NEARBY */}
          {activeTab === "map" && (
            <div style={{ animation: "fadeUp .5s ease both" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, height: 520 }}>
                <div style={{ background: "var(--ink)", borderRadius: 20, overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 40% 40%,rgba(61,59,245,.3),transparent 60%), radial-gradient(ellipse at 70% 70%,rgba(244,160,35,.2),transparent 50%)" }}/>
                  <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: "3rem", marginBottom: 12 }}>🗺️</div>
                    <p style={{ color: "rgba(250,248,243,.5)", fontSize: "0.85rem", fontFamily: "var(--ff-body)" }}>Interactive Map · Patna Region</p>
                  </div>
                  {events.map((e, i) => (
                    <div key={e.id} style={{ position: "absolute", left: `${15 + i * 12}%`, top: `${20 + (i % 3) * 22}%`, width: 38, height: 38, borderRadius: "50%", background: e.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", boxShadow: "0 4px 16px rgba(0,0,0,.4)", border: "2px solid rgba(255,255,255,.3)", cursor: "pointer", zIndex: 2 }}>
                      {e.image}
                    </div>
                  ))}
                </div>
                <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: 22, overflowY: "auto" }}>
                  <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1rem", marginBottom: 16 }}>Events Near You</h3>
                  {[...events].sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)).map(e => (
                    <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: e.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>{e.image}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>{e.title}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>{e.date}</div>
                      </div>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--saffron-g)", background: "rgba(244,160,35,.1)", border: "1px solid rgba(244,160,35,.25)", borderRadius: 100, padding: "2px 10px" }}>{e.distance}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* INTERESTS */}
          {activeTab === "interests" && (
            <div style={{ animation: "fadeUp .5s ease both" }}>
              <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginBottom: 22 }}>Select your interests to get personalized event recommendations.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 40 }}>
                {interests.map(i => (
                  <button key={i} onClick={() => toggleInterest(i)}
                    style={{ padding: "10px 22px", borderRadius: 100, border: selectedInterests.has(i) ? "none" : "1px solid var(--border)", background: selectedInterests.has(i) ? "var(--ink)" : "#fff", color: selectedInterests.has(i) ? "var(--cream)" : "var(--muted)", cursor: "pointer", fontSize: "0.85rem", fontFamily: "var(--ff-body)", fontWeight: selectedInterests.has(i) ? 700 : 500, transition: "all .25s cubic-bezier(.34,1.56,.64,1)", transform: selectedInterests.has(i) ? "scale(1.04)" : "scale(1)" }}>
                    {selectedInterests.has(i) ? "✓ " : ""}{i}
                  </button>
                ))}
              </div>
              <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.2rem", marginBottom: 20 }}>Recommended For You</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                {events.slice(0, 3).map((ev, i) => (
                  <EventCard key={ev.id} event={ev} joined={joinedEvents.has(ev.id)} saved={savedEvents.has(ev.id)} onJoin={toggleJoin} onSave={toggleSave} delay={i * 60} />
                ))}
              </div>
            </div>
          )}

          {/* CALENDAR */}
          {activeTab === "calendar" && (
            <div style={{ animation: "fadeUp .5s ease both" }}>
              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: 28, maxWidth: 420, marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                  <button style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 10, width: 34, height: 34, cursor: "pointer", fontSize: "1.1rem" }}>‹</button>
                  <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.1rem" }}>April 2026</h3>
                  <button style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 10, width: 34, height: 34, cursor: "pointer", fontSize: "1.1rem" }}>›</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                  {["S","M","T","W","T","F","S"].map((d, i) => (
                    <div key={i} style={{ textAlign: "center", fontSize: "0.68rem", color: "var(--muted)", padding: "4px 0", fontWeight: 700 }}>{d}</div>
                  ))}
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(d => {
                    const hasEvent = [20, 25].includes(d);
                    const isToday = d === 10;
                    return (
                      <div key={d} style={{ textAlign: "center", padding: "8px 0", borderRadius: 8, fontSize: "0.82rem", color: isToday ? "#fff" : hasEvent ? "var(--indigo)" : "var(--ink)", background: isToday ? "var(--ink)" : "transparent", fontWeight: isToday || hasEvent ? 700 : 400, cursor: "pointer", position: "relative" }}>
                        {d}
                        {hasEvent && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--saffron)", margin: "2px auto 0" }}/>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.2rem", marginBottom: 16 }}>Upcoming Events</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {events.filter(e => joinedEvents.has(e.id)).map(ev => (
                  <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 20px" }}>
                    <div style={{ width: 4, height: 44, borderRadius: 2, background: ev.grad, flexShrink: 0 }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "0.92rem" }}>{ev.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 3 }}>{ev.date} · {ev.location}</div>
                    </div>
                    <div style={{ background: "rgba(23,136,90,.08)", color: "var(--sage)", borderRadius: 100, padding: "4px 14px", fontSize: "0.72rem", fontWeight: 700, border: "1px solid rgba(23,136,90,.2)" }}>Confirmed</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE */}
          {activeTab === "profile" && (
            <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, animation: "fadeUp .5s ease both" }}>
              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
                <div style={{ height: 90, background: "linear-gradient(135deg,var(--saffron),var(--saffron-g))" }}/>
                <div style={{ textAlign: "center", padding: "0 24px 28px" }}>
                  <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg,var(--saffron),var(--saffron-g))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 900, color: "#fff", margin: "-38px auto 0", border: "4px solid #fff" }}>{user?.name?.[0] || "A"}</div>
                  <h2 style={{ fontFamily: "var(--ff-display)", fontWeight: 900, fontSize: "1.2rem", marginTop: 14 }}>{user?.name || "Student"}</h2>
                  <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: 22 }}>{user?.email || ""}</p>
                  <div style={{ display: "flex", borderTop: "1px solid var(--border)" }}>
                    {[["Joined", joinedEvents.size], ["Saved", savedEvents.size], ["Interests", selectedInterests.size]].map(([l, v]) => (
                      <div key={l} style={{ flex: 1, padding: "16px 0", textAlign: "center", borderRight: "1px solid var(--border)" }}>
                        <div style={{ fontFamily: "var(--ff-display)", fontSize: "1.4rem", fontWeight: 700, color: "var(--saffron-g)" }}>{v}</div>
                        <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 2 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: 28 }}>
                <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.1rem", marginBottom: 20 }}>Account Details</h3>
                {[["Full Name", "Aryan Kumar"], ["Email", "aryan.kumar@student.edu"], ["Phone", "+91 9876543210"], ["Institution", "IIT (ISM) Dhanbad"], ["City", "Dhanbad, Jharkhand"]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--border)", fontSize: "0.88rem" }}>
                    <span style={{ color: "var(--muted)", fontWeight: 500 }}>{l}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
                <button style={{ marginTop: 24, width: "100%", padding: "12px", background: "var(--ink)", border: "none", borderRadius: 100, color: "var(--cream)", cursor: "pointer", fontWeight: 700, fontSize: "0.88rem", fontFamily: "var(--ff-body)", letterSpacing: ".02em" }}>Edit Profile →</button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}