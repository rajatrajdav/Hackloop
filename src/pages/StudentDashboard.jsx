import { useState, useEffect, useRef } from "react";
import logo from "../assets/logo.jpeg";
import { eventsAPI, registrationsAPI, savedAPI, interestsAPI, authAPI } from "../api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons for Leaflet + Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Geocode a location string using Nominatim — returns [lat, lng] or null
async function geocodeLocation(location, city) {
  const attempts = [
    `${location}, ${city}, India`,
    `${location}, India`,
    `${city}, India`,
  ].filter(q => q.trim() !== ", India");

  for (const q of attempts) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=in`,
        { headers: { "User-Agent": "SangamEventsApp/1.0" } }
      );
      const data = await res.json();
      if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    } catch {}
    await new Promise(r => setTimeout(r, 300));
  }
  return null;
}

const CITY_COORDS = {
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
  "bhopal":    [23.2599, 77.4126],
  "indore":    [22.7196, 75.8577],
  "nagpur":    [21.1458, 79.0882],
};

function getCityCoords(city) {
  if (!city) return [20.5937, 78.9629]; // center of India
  const key = city.toLowerCase().trim();
  for (const [k, v] of Object.entries(CITY_COORDS)) {
    if (key.includes(k)) return v;
  }
  return [20.5937, 78.9629];
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const GLOBAL_CSS = `
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
          <span>📅 {formatDate(event.date)}</span>
          <span>📍 {event.location}</span>
          <span style={{ color: (event.capacity - event.registered) < 10 ? "#c42050" : "#17885a", fontWeight: 600 }}>👥 {event.capacity - event.registered} spots left</span>
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
  const [nearbyEvents, setNearbyEvents] = useState([]);
  const [profile, setProfile] = useState(null);
  const [joinedEvents, setJoinedEvents] = useState(new Set());
  const [savedEvents, setSavedEvents] = useState(new Set());
  const [selectedInterests, setSelectedInterests] = useState(new Set());
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(true);
  const [eventCoords, setEventCoords] = useState({});

  useEffect(() => {
    if (!document.getElementById("sangam-student-css")) {
      const s = document.createElement("style"); s.id = "sangam-student-css"; s.textContent = GLOBAL_CSS; document.head.appendChild(s);
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [evs, myEvs, saved, ints, prof] = await Promise.all([
        eventsAPI.getAll(),
        registrationsAPI.myEvents(),
        savedAPI.getAll(),
        interestsAPI.getAll(),
        authAPI.me(),
      ]);
      setEvents(evs);
      setProfile(prof);
      setJoinedEvents(new Set(myEvs.map(e => e.id)));
      setSavedEvents(new Set(saved.map(e => e.id)));
      setSelectedInterests(new Set(ints));
      // Load nearby events based on profile city
      if (prof?.city) {
        const nearby = await eventsAPI.getNearby(prof.city);
        setNearbyEvents(nearby);
      } else {
        setNearbyEvents(evs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery && selectedCategory === "All") return;
    eventsAPI.getAll({ category: selectedCategory !== "All" ? selectedCategory : undefined, search: searchQuery || undefined })
      .then(setEvents).catch(console.error);
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

  // Geocode events missing lat/lng when map tab opens
  useEffect(() => {
    if (activeTab !== "map" || nearbyEvents.length === 0) return;
    const missing = nearbyEvents.filter(ev => !ev.lat || !ev.lng);
    if (missing.length === 0) return;

    (async () => {
      const coords = { ...eventCoords };
      for (const ev of missing) {
        if (coords[ev.id]) continue;
        const pos = await geocodeLocation(ev.location, ev.city || profile?.city);
        if (pos) coords[ev.id] = pos;
        await new Promise(r => setTimeout(r, 350)); // Nominatim rate limit
      }
      setEventCoords(coords);
    })();
  }, [activeTab, nearbyEvents]);

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
              {profile?.city || user?.city || "Your City"} · {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
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
                  { label: "Events Joined", value: joinedEvents.size, color: "var(--saffron)" },
                  { label: "Saved Events",  value: savedEvents.size,  color: "#c42050" },
                  { label: "Near You",      value: nearbyEvents.length, color: "var(--indigo)" },
                  { label: "Total Events",  value: events.length,     color: "var(--sage)" },
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
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 3 }}>📅 {formatDate(ev.date)} · 📍 {ev.location}</div>
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
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 3 }}>📅 {formatDate(ev.date)} · 📍 {ev.location} · {ev.capacity - ev.registered} spots left</div>
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
              {/* Location banner */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, background: "#fff", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 20px" }}>
                <span style={{ fontSize: "1.2rem" }}>📍</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Showing events near: <span style={{ color: "var(--saffron-g)" }}>{profile?.city || "your location"}</span></div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Upcoming &amp; ongoing events · Update your city in Profile to change location</div>
                </div>
                <div style={{ marginLeft: "auto", background: "rgba(23,136,90,.08)", color: "var(--sage)", borderRadius: 100, padding: "4px 14px", fontSize: "0.72rem", fontWeight: 700, border: "1px solid rgba(23,136,90,.2)" }}>{nearbyEvents.length} events found</div>
                {nearbyEvents.some(ev => !ev.lat && !ev.lng && !eventCoords[ev.id]) && (
                  <div style={{ marginLeft: 8, fontSize: "0.72rem", color: "var(--muted)" }}>📡 Locating events on map…</div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
                {/* Real Leaflet Map centered on user's city */}
                <div style={{ borderRadius: 20, overflow: "hidden", height: 500, border: "1px solid var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,.08)" }}>
                  <MapContainer
                    key={profile?.city || "default"}
                    center={getCityCoords(profile?.city)}
                    zoom={profile?.city ? 13 : 5}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {/* User location marker */}
                    {profile?.city && (
                      <Marker position={getCityCoords(profile.city)}>
                        <Popup>
                          <div style={{ fontFamily: "sans-serif" }}>
                            <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>📍 Your Location</div>
                            <div style={{ fontSize: "0.75rem", color: "#666" }}>{profile.city}</div>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    {/* Event markers — use DB coords, then live-geocoded coords, skip if neither available */}
                    {nearbyEvents.map(ev => {
                      // Priority: DB geocoded > live geocoded this session
                      const pos = (ev.lat && ev.lng)
                        ? [parseFloat(ev.lat), parseFloat(ev.lng)]
                        : eventCoords[ev.id] || getCityCoords(ev.city);


                      const isUpcoming = new Date(ev.date) > new Date();
                      const isToday = new Date(ev.date).toDateString() === new Date().toDateString();
                      return (
                        <Marker key={ev.id} position={pos}>
                          <Popup>
                            <div style={{ fontFamily: "sans-serif", minWidth: 180 }}>
                              <div style={{ fontSize: "1.3rem", marginBottom: 4 }}>{ev.image}</div>
                              <div style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 4 }}>{ev.title}</div>
                              <div style={{ display: "inline-block", background: isToday ? "#f4a023" : "#3d3bf5", color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: "0.68rem", fontWeight: 700, marginBottom: 6 }}>
                                {isToday ? "🔴 Today" : isUpcoming ? "🟢 Upcoming" : "🟡 Ongoing"}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "#555" }}>📅 {ev.date} · {ev.time?.slice(0,5)}</div>
                              <div style={{ fontSize: "0.75rem", color: "#555" }}>📍 {ev.location}{ev.city ? `, ${ev.city}` : ""}</div>
                              <div style={{ fontSize: "0.75rem", color: ev.capacity - ev.registered < 10 ? "#c42050" : "#17885a", fontWeight: 600, marginTop: 4 }}>
                                👥 {ev.capacity - ev.registered} spots left
                              </div>
                              <button
                                onClick={() => toggleJoin(ev.id)}
                                style={{ marginTop: 8, width: "100%", padding: "6px", borderRadius: 8, border: "none", background: joinedEvents.has(ev.id) ? "#e0e0e0" : ev.grad || "#f4a023", color: joinedEvents.has(ev.id) ? "#666" : "#fff", cursor: "pointer", fontWeight: 700, fontSize: "0.75rem" }}>
                                {joinedEvents.has(ev.id) ? "✓ Registered" : "Register →"}
                              </button>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>

                {/* Upcoming & Ongoing events list */}
                <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: 22, overflowY: "auto", height: 500 }}>
                  <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>Near {profile?.city || "You"}</h3>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: 16 }}>Upcoming &amp; ongoing events</p>
                  {nearbyEvents.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
                      <div style={{ fontSize: "2rem", marginBottom: 8 }}>🗺️</div>
                      <p style={{ fontSize: "0.82rem" }}>No events found near {profile?.city || "your city"}.</p>
                      <p style={{ fontSize: "0.75rem", marginTop: 4 }}>Update your city in Profile or check back later.</p>
                    </div>
                  ) : nearbyEvents.map(ev => {
                    const isToday = new Date(ev.date).toDateString() === new Date().toDateString();
                    const isUpcoming = new Date(ev.date) > new Date();
                    return (
                      <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: ev.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>{ev.image}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.82rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</div>
                          <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}>📅 {formatDate(ev.date)} · 📍 {ev.location}</div>
                        </div>
                        <div style={{ fontSize: "0.65rem", fontWeight: 700, color: isToday ? "#e85d04" : isUpcoming ? "#17885a" : "#3d3bf5", background: isToday ? "rgba(232,93,4,.1)" : isUpcoming ? "rgba(23,136,90,.08)" : "rgba(61,59,245,.06)", borderRadius: 100, padding: "2px 8px", whiteSpace: "nowrap" }}>
                          {isToday ? "Today" : isUpcoming ? "Upcoming" : "Ongoing"}
                        </div>
                      </div>
                    );
                  })}
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
          {activeTab === "calendar" && (() => {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            const monthName = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDay = new Date(year, month, 1).getDay();
            const today = now.getDate();
            const eventDays = new Set(events.filter(e => joinedEvents.has(e.id)).map(e => {
              const d = new Date(e.date);
              return d.getFullYear() === year && d.getMonth() === month ? d.getDate() : null;
            }).filter(Boolean));
            return (
            <div style={{ animation: "fadeUp .5s ease both" }}>
              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: 28, maxWidth: 420, marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                  <button style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 10, width: 34, height: 34, cursor: "pointer", fontSize: "1.1rem" }}>‹</button>
                  <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.1rem" }}>{monthName}</h3>
                  <button style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 10, width: 34, height: 34, cursor: "pointer", fontSize: "1.1rem" }}>›</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                  {["S","M","T","W","T","F","S"].map((d, i) => (
                    <div key={i} style={{ textAlign: "center", fontSize: "0.68rem", color: "var(--muted)", padding: "4px 0", fontWeight: 700 }}>{d}</div>
                  ))}
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                    const hasEvent = eventDays.has(d);
                    const isToday = d === today;
                    return (
                      <div key={d} style={{ textAlign: "center", padding: "8px 0", borderRadius: 8, fontSize: "0.82rem", color: isToday ? "#fff" : hasEvent ? "var(--indigo)" : "var(--ink)", background: isToday ? "var(--ink)" : "transparent", fontWeight: isToday || hasEvent ? 700 : 400, cursor: "pointer", position: "relative" }}>
                        {d}
                        {hasEvent && !isToday && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--saffron)", margin: "2px auto 0" }}/>}
                      </div>
                    );
                  })}
                </div>
              </div>
              <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "1.2rem", marginBottom: 16 }}>Upcoming Events</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {events.filter(e => joinedEvents.has(e.id)).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>📅</div>
                    <p style={{ fontSize: "0.82rem" }}>No registered events yet.</p>
                  </div>
                ) : events.filter(e => joinedEvents.has(e.id)).map(ev => (
                  <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 20px" }}>
                    <div style={{ width: 4, height: 44, borderRadius: 2, background: ev.grad, flexShrink: 0 }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "0.92rem" }}>{ev.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 3 }}>{formatDate(ev.date)} · {ev.location}</div>
                    </div>
                    <div style={{ background: "rgba(23,136,90,.08)", color: "var(--sage)", borderRadius: 100, padding: "4px 14px", fontSize: "0.72rem", fontWeight: 700, border: "1px solid rgba(23,136,90,.2)" }}>Confirmed</div>
                  </div>
                ))}
              </div>
            </div>
            );
          })()}

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
                {[["Full Name", profile?.name || user?.name || ""], ["Email", profile?.email || user?.email || ""], ["Phone", profile?.phone || ""], ["Institution", profile?.institution || ""], ["City", profile?.city || ""]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--border)", fontSize: "0.88rem" }}>
                    <span style={{ color: "var(--muted)", fontWeight: 500 }}>{l}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
                <button onClick={async () => {
                    const name = prompt("Full Name:", profile?.name || "");
                    const city = prompt("City:", profile?.city || "");
                    const phone = prompt("Phone:", profile?.phone || "");
                    const institution = prompt("Institution:", profile?.institution || "");
                    if (name) {
                      try {
                        await authAPI.updateProfile({ name, city, phone, institution });
                        const updated = await authAPI.me();
                        setProfile(updated);
                        alert("Profile updated!");
                      } catch (err) { alert(err.message); }
                    }
                  }} style={{ marginTop: 24, width: "100%", padding: "12px", background: "var(--ink)", border: "none", borderRadius: 100, color: "var(--cream)", cursor: "pointer", fontWeight: 700, fontSize: "0.88rem", fontFamily: "var(--ff-body)", letterSpacing: ".02em" }}>Edit Profile →</button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}