import { useState } from "react";

const events = [
  { id: 1, title: "City Marathon 2026", category: "Sports", date: "Apr 20, 2026", location: "Central Park", distance: "2.1 km", spots: 12, image: "🏃", color: "#FF6B35", joined: false },
  { id: 2, title: "Book Club: Sci-Fi Classics", category: "Literary", date: "Apr 25, 2026", location: "City Library", distance: "0.8 km", spots: 5, image: "📚", color: "#4ECDC4", joined: true },
  { id: 3, title: "Photography Meetup", category: "Hobby", date: "May 2, 2026", location: "Old Town Square", distance: "3.2 km", spots: 20, image: "📸", color: "#A78BFA", joined: false },
  { id: 4, title: "Literary Festival 2026", category: "Literary", date: "May 10, 2026", location: "Convention Center", distance: "5.0 km", spots: 200, image: "🎭", color: "#F59E0B", joined: false },
  { id: 5, title: "Mountain Group Trek", category: "Adventure", date: "May 15, 2026", location: "North Hills", distance: "12 km", spots: 15, image: "🏔️", color: "#10B981", joined: true },
  { id: 6, title: "Chess Tournament", category: "Sports", date: "May 18, 2026", location: "Community Hall", distance: "1.5 km", spots: 32, image: "♟️", color: "#EF4444", joined: false },
];

const myEvents = [
  { id: 2, title: "Book Club: Sci-Fi Classics", date: "Apr 25, 2026", status: "Confirmed", image: "📚", color: "#4ECDC4" },
  { id: 5, title: "Mountain Group Trek", date: "May 15, 2026", status: "Waitlisted", image: "🏔️", color: "#10B981" },
];

const categories = ["All", "Sports", "Literary", "Hobby", "Adventure"];

const interests = ["Running", "Photography", "Books", "Hiking", "Chess", "Music", "Art", "Tech"];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("discover");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [joinedEvents, setJoinedEvents] = useState(new Set([2, 5]));
  const [savedEvents, setSavedEvents] = useState(new Set([1, 4]));
  const [selectedInterests, setSelectedInterests] = useState(new Set(["Books", "Hiking"]));
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sortBy, setSortBy] = useState("date");

  const filtered = events.filter(e => {
    const matchCat = selectedCategory === "All" || e.category === selectedCategory;
    const matchSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleJoin = (id) => {
    setJoinedEvents(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleSave = (id) => {
    setSavedEvents(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleInterest = (i) => {
    setSelectedInterests(prev => {
      const s = new Set(prev);
      s.has(i) ? s.delete(i) : s.add(i);
      return s;
    });
  };

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>⚡</div>
          <span style={styles.logoText}>CommuniHub</span>
        </div>
        <nav style={styles.nav}>
          {[
            { id: "discover", icon: "🔭", label: "Discover" },
            { id: "myevents", icon: "🎟️", label: "My Events" },
            { id: "map", icon: "🗺️", label: "Nearby" },
            { id: "interests", icon: "✨", label: "Interests" },
            { id: "calendar", icon: "📅", label: "Schedule" },
            { id: "profile", icon: "👤", label: "Profile" },
          ].map(item => (
            <button
              key={item.id}
              style={{ ...styles.navItem, ...(activeTab === item.id ? styles.navItemActive : {}) }}
              onClick={() => setActiveTab(item.id)}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
              {item.id === "myevents" && <span style={styles.badge}>{joinedEvents.size}</span>}
            </button>
          ))}
        </nav>
        <div style={styles.sidebarFooter}>
          <div style={styles.avatarRow}>
            <div style={styles.avatarSmall}>AK</div>
            <div>
              <div style={styles.avatarName}>Aryan Kumar</div>
              <div style={styles.avatarRole}>Student</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        {/* Topbar */}
        <header style={styles.topbar}>
          <div>
            <h1 style={styles.pageTitle}>
              {activeTab === "discover" && "Discover Events"}
              {activeTab === "myevents" && "My Events"}
              {activeTab === "map" && "Events Nearby"}
              {activeTab === "interests" && "My Interests"}
              {activeTab === "calendar" && "My Schedule"}
              {activeTab === "profile" && "My Profile"}
            </h1>
            <p style={styles.pageSubtitle}>Dhanbad, Jharkhand · {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</p>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.searchWrap}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                style={styles.searchInput}
                placeholder="Search events..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button style={styles.iconBtn} onClick={() => setNotifOpen(!notifOpen)}>
              🔔
              <span style={styles.notifDot} />
            </button>
            <div style={styles.avatarSmall} onClick={() => setProfileOpen(!profileOpen)}>AK</div>
          </div>
        </header>

        {/* Content */}
        <div style={styles.content}>

          {/* DISCOVER TAB */}
          {activeTab === "discover" && (
            <div>
              {/* Stats Row */}
              <div style={styles.statsRow}>
                {[
                  { label: "Events Joined", value: joinedEvents.size, icon: "🎟️", color: "#6366F1" },
                  { label: "Saved Events", value: savedEvents.size, icon: "❤️", color: "#EC4899" },
                  { label: "Near You", value: "8", icon: "📍", color: "#F59E0B" },
                  { label: "This Month", value: "24", icon: "📅", color: "#10B981" },
                ].map((s, i) => (
                  <div key={i} style={{ ...styles.statCard, borderTop: `3px solid ${s.color}` }}>
                    <span style={{ fontSize: 24 }}>{s.icon}</span>
                    <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
                    <div style={styles.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div style={styles.filtersRow}>
                <div style={styles.categoryTabs}>
                  {categories.map(c => (
                    <button
                      key={c}
                      style={{ ...styles.catBtn, ...(selectedCategory === c ? styles.catBtnActive : {}) }}
                      onClick={() => setSelectedCategory(c)}
                    >{c}</button>
                  ))}
                </div>
                <select style={styles.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="date">Sort: Date</option>
                  <option value="distance">Sort: Distance</option>
                  <option value="spots">Sort: Spots Left</option>
                </select>
              </div>

              {/* Event Cards */}
              <div style={styles.eventsGrid}>
                {filtered.map(event => (
                  <div key={event.id} style={styles.eventCard}>
                    <div style={{ ...styles.eventCardTop, background: `linear-gradient(135deg, ${event.color}22, ${event.color}44)` }}>
                      <span style={styles.eventEmoji}>{event.image}</span>
                      <div style={{ ...styles.eventCategory, color: event.color, border: `1px solid ${event.color}44`, background: `${event.color}11` }}>
                        {event.category}
                      </div>
                      <button style={styles.saveBtn} onClick={() => toggleSave(event.id)}>
                        {savedEvents.has(event.id) ? "❤️" : "🤍"}
                      </button>
                    </div>
                    <div style={styles.eventCardBody}>
                      <h3 style={styles.eventTitle}>{event.title}</h3>
                      <div style={styles.eventMeta}>
                        <span>📅 {event.date}</span>
                        <span>📍 {event.location}</span>
                        <span>🚶 {event.distance}</span>
                        <span style={{ color: event.spots < 10 ? "#EF4444" : "#10B981" }}>
                          👥 {event.spots} spots left
                        </span>
                      </div>
                      <button
                        style={{ ...styles.joinBtn, ...(joinedEvents.has(event.id) ? styles.joinBtnJoined : { background: event.color }) }}
                        onClick={() => toggleJoin(event.id)}
                      >
                        {joinedEvents.has(event.id) ? "✓ Registered" : "Register Now"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MY EVENTS TAB */}
          {activeTab === "myevents" && (
            <div>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Registered Events</h2>
                <span style={styles.sectionCount}>{joinedEvents.size} events</span>
              </div>
              {events.filter(e => joinedEvents.has(e.id)).length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>🎟️</div>
                  <p>No events yet. Go discover and join some!</p>
                  <button style={styles.emptyBtn} onClick={() => setActiveTab("discover")}>Explore Events</button>
                </div>
              ) : (
                <div style={styles.myEventsList}>
                  {events.filter(e => joinedEvents.has(e.id)).map(event => (
                    <div key={event.id} style={styles.myEventRow}>
                      <div style={{ ...styles.myEventIcon, background: `${event.color}22` }}>{event.image}</div>
                      <div style={styles.myEventInfo}>
                        <div style={styles.myEventTitle}>{event.title}</div>
                        <div style={styles.myEventMeta}>📅 {event.date} · 📍 {event.location}</div>
                      </div>
                      <div style={{ ...styles.statusBadge, background: "#10B98122", color: "#10B981" }}>Confirmed</div>
                      <button style={styles.cancelBtn} onClick={() => toggleJoin(event.id)}>Cancel</button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ ...styles.sectionHeader, marginTop: 32 }}>
                <h2 style={styles.sectionTitle}>Saved Events</h2>
                <span style={styles.sectionCount}>{savedEvents.size} saved</span>
              </div>
              <div style={styles.myEventsList}>
                {events.filter(e => savedEvents.has(e.id)).map(event => (
                  <div key={event.id} style={styles.myEventRow}>
                    <div style={{ ...styles.myEventIcon, background: `${event.color}22` }}>{event.image}</div>
                    <div style={styles.myEventInfo}>
                      <div style={styles.myEventTitle}>{event.title}</div>
                      <div style={styles.myEventMeta}>📅 {event.date} · 📍 {event.location} · {event.spots} spots left</div>
                    </div>
                    <button style={{ ...styles.joinBtn, background: event.color, padding: "8px 18px", fontSize: 13 }} onClick={() => toggleJoin(event.id)}>
                      {joinedEvents.has(event.id) ? "Registered ✓" : "Register"}
                    </button>
                    <button style={styles.cancelBtn} onClick={() => toggleSave(event.id)}>Remove</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NEARBY TAB */}
          {activeTab === "map" && (
            <div>
              <div style={styles.mapContainer}>
                <div style={styles.mapPlaceholder}>
                  <div style={styles.mapOverlay}>
                    <div style={{ fontSize: 48 }}>🗺️</div>
                    <p style={{ color: "#CBD5E1", marginTop: 12 }}>Interactive Map · Dhanbad Region</p>
                    <div style={styles.mapPins}>
                      {events.map((e, i) => (
                        <div key={e.id} style={{ ...styles.mapPin, left: `${15 + i * 13}%`, top: `${20 + (i % 3) * 20}%`, background: e.color }}>
                          {e.image}
                          <div style={styles.mapPinTooltip}>{e.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={styles.nearbyList}>
                  <h3 style={styles.nearbyTitle}>Events Near You</h3>
                  {[...events].sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)).map(e => (
                    <div key={e.id} style={styles.nearbyRow}>
                      <span style={styles.nearbyEmoji}>{e.image}</span>
                      <div style={styles.nearbyInfo}>
                        <div style={styles.nearbyName}>{e.title}</div>
                        <div style={styles.nearbyDist}>📍 {e.distance} away · {e.date}</div>
                      </div>
                      <div style={{ ...styles.distTag, background: `${e.color}22`, color: e.color }}>{e.distance}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* INTERESTS TAB */}
          {activeTab === "interests" && (
            <div>
              <p style={styles.interestDesc}>Select your interests to get personalized event recommendations.</p>
              <div style={styles.interestGrid}>
                {interests.map(i => (
                  <button
                    key={i}
                    style={{ ...styles.interestChip, ...(selectedInterests.has(i) ? styles.interestChipActive : {}) }}
                    onClick={() => toggleInterest(i)}
                  >
                    {selectedInterests.has(i) ? "✓ " : ""}{i}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 32 }}>
                <h3 style={styles.sectionTitle}>Recommended For You</h3>
                <div style={styles.eventsGrid}>
                  {events.slice(0, 3).map(event => (
                    <div key={event.id} style={styles.eventCard}>
                      <div style={{ ...styles.eventCardTop, background: `linear-gradient(135deg, ${event.color}22, ${event.color}44)` }}>
                        <span style={styles.eventEmoji}>{event.image}</span>
                        <div style={{ ...styles.eventCategory, color: event.color, border: `1px solid ${event.color}44`, background: `${event.color}11` }}>{event.category}</div>
                      </div>
                      <div style={styles.eventCardBody}>
                        <h3 style={styles.eventTitle}>{event.title}</h3>
                        <div style={styles.eventMeta}>
                          <span>📅 {event.date}</span>
                          <span>📍 {event.location}</span>
                        </div>
                        <button style={{ ...styles.joinBtn, background: event.color }} onClick={() => toggleJoin(event.id)}>
                          {joinedEvents.has(event.id) ? "✓ Registered" : "Register Now"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CALENDAR TAB */}
          {activeTab === "calendar" && (
            <div>
              <div style={styles.calendarCard}>
                <div style={styles.calendarHeader}>
                  <button style={styles.calNavBtn}>‹</button>
                  <h3 style={styles.calMonth}>April 2026</h3>
                  <button style={styles.calNavBtn}>›</button>
                </div>
                <div style={styles.calGrid}>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                    <div key={d} style={styles.calDayLabel}>{d}</div>
                  ))}
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(d => {
                    const hasEvent = [20, 25].includes(d);
                    const isToday = d === 10;
                    return (
                      <div key={d} style={{ ...styles.calDay, ...(isToday ? styles.calDayToday : {}), ...(hasEvent ? styles.calDayEvent : {}) }}>
                        {d}
                        {hasEvent && <div style={styles.calDot} />}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ marginTop: 24 }}>
                <h3 style={styles.sectionTitle}>Upcoming Events</h3>
                {events.filter(e => joinedEvents.has(e.id)).map(event => (
                  <div key={event.id} style={styles.scheduleRow}>
                    <div style={{ ...styles.scheduleLine, background: event.color }} />
                    <div style={styles.scheduleInfo}>
                      <div style={styles.scheduleTitle}>{event.title}</div>
                      <div style={styles.scheduleMeta}>{event.date} · {event.location}</div>
                    </div>
                    <div style={{ ...styles.statusBadge, background: "#10B98122", color: "#10B981" }}>Confirmed</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div style={styles.profileWrap}>
              <div style={styles.profileCard}>
                <div style={styles.profileBanner} />
                <div style={styles.profileAvatar}>AK</div>
                <h2 style={styles.profileName}>Aryan Kumar</h2>
                <p style={styles.profileEmail}>aryan.kumar@student.edu</p>
                <div style={styles.profileStats}>
                  {[["Events Joined", joinedEvents.size], ["Saved", savedEvents.size], ["Interests", selectedInterests.size]].map(([l, v]) => (
                    <div key={l} style={styles.profileStat}>
                      <div style={styles.profileStatVal}>{v}</div>
                      <div style={styles.profileStatLabel}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={styles.profileDetails}>
                <h3 style={styles.sectionTitle}>Account Details</h3>
                {[["Full Name", "Aryan Kumar"], ["Email", "aryan.kumar@student.edu"], ["Phone", "+91 9876543210"], ["Institution", "IIT (ISM) Dhanbad"], ["City", "Dhanbad, Jharkhand"]].map(([l, v]) => (
                  <div key={l} style={styles.detailRow}>
                    <span style={styles.detailLabel}>{l}</span>
                    <span style={styles.detailValue}>{v}</span>
                  </div>
                ))}
                <button style={styles.editProfileBtn}>Edit Profile</button>
              </div>
            </div>
          )}

        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #0F1117; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1A1D27; }
        ::-webkit-scrollbar-thumb { background: #2D3148; border-radius: 3px; }
      `}</style>
    </div>
  );
}

const styles = {
  root: { display: "flex", minHeight: "100vh", background: "#0F1117", fontFamily: "'DM Sans', sans-serif", color: "#E2E8F0" },
  sidebar: { width: 240, background: "#13151F", borderRight: "1px solid #1E2235", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", padding: "24px 0" },
  logo: { display: "flex", alignItems: "center", gap: 10, padding: "0 24px 28px", borderBottom: "1px solid #1E2235" },
  logoIcon: { width: 36, height: 36, background: "linear-gradient(135deg, #6366F1, #A78BFA)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
  logoText: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, background: "linear-gradient(135deg, #6366F1, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  nav: { flex: 1, padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4 },
  navItem: { display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, border: "none", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, textAlign: "left", transition: "all 0.2s", position: "relative" },
  navItemActive: { background: "linear-gradient(135deg, #6366F122, #A78BFA22)", color: "#A78BFA", borderLeft: "3px solid #6366F1" },
  navIcon: { fontSize: 18 },
  badge: { marginLeft: "auto", background: "#6366F1", color: "#fff", borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 700 },
  sidebarFooter: { padding: "20px 16px", borderTop: "1px solid #1E2235" },
  avatarRow: { display: "flex", alignItems: "center", gap: 10 },
  avatarSmall: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #6366F1, #A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", flexShrink: 0 },
  avatarName: { fontSize: 13, fontWeight: 600, color: "#E2E8F0" },
  avatarRole: { fontSize: 11, color: "#64748B" },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: "1px solid #1E2235", background: "#13151F", position: "sticky", top: 0, zIndex: 10 },
  pageTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, color: "#F1F5F9" },
  pageSubtitle: { fontSize: 13, color: "#64748B", marginTop: 2 },
  topbarRight: { display: "flex", alignItems: "center", gap: 12 },
  searchWrap: { display: "flex", alignItems: "center", background: "#1A1D27", border: "1px solid #2D3148", borderRadius: 10, padding: "0 14px", gap: 8 },
  searchIcon: { fontSize: 14 },
  searchInput: { background: "transparent", border: "none", outline: "none", color: "#E2E8F0", fontSize: 14, padding: "10px 0", width: 200, fontFamily: "'DM Sans', sans-serif" },
  iconBtn: { width: 40, height: 40, borderRadius: 10, border: "1px solid #2D3148", background: "#1A1D27", cursor: "pointer", fontSize: 18, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" },
  notifDot: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: "#EF4444", border: "2px solid #13151F" },
  content: { flex: 1, padding: "28px 32px", overflowY: "auto" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  statCard: { background: "#13151F", border: "1px solid #1E2235", borderRadius: 14, padding: "20px", display: "flex", flexDirection: "column", gap: 4 },
  statValue: { fontSize: 28, fontFamily: "'Syne', sans-serif", fontWeight: 800 },
  statLabel: { fontSize: 12, color: "#64748B" },
  filtersRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  categoryTabs: { display: "flex", gap: 8 },
  catBtn: { padding: "8px 16px", borderRadius: 8, border: "1px solid #2D3148", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" },
  catBtnActive: { background: "linear-gradient(135deg, #6366F1, #A78BFA)", color: "#fff", border: "1px solid transparent" },
  sortSelect: { background: "#1A1D27", border: "1px solid #2D3148", color: "#94A3B8", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif" },
  eventsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 },
  eventCard: { background: "#13151F", border: "1px solid #1E2235", borderRadius: 16, overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s" },
  eventCardTop: { padding: "24px 20px", position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  eventEmoji: { fontSize: 40 },
  eventCategory: { fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, letterSpacing: 0.5 },
  saveBtn: { position: "absolute", top: 14, right: 14, background: "transparent", border: "none", fontSize: 20, cursor: "pointer" },
  eventCardBody: { padding: "0 20px 20px" },
  eventTitle: { fontSize: 15, fontWeight: 700, color: "#F1F5F9", fontFamily: "'Syne', sans-serif", marginBottom: 10 },
  eventMeta: { display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#64748B", marginBottom: 14 },
  joinBtn: { width: "100%", padding: "10px", borderRadius: 10, border: "none", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans', sans-serif", transition: "opacity 0.2s" },
  joinBtnJoined: { background: "#1E2235", color: "#10B981", border: "1px solid #10B98144" },
  sectionHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 },
  sectionTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: "#F1F5F9" },
  sectionCount: { background: "#1E2235", color: "#94A3B8", borderRadius: 20, padding: "2px 10px", fontSize: 12 },
  myEventsList: { display: "flex", flexDirection: "column", gap: 10 },
  myEventRow: { display: "flex", alignItems: "center", gap: 14, background: "#13151F", border: "1px solid #1E2235", borderRadius: 12, padding: "14px 18px" },
  myEventIcon: { width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 },
  myEventInfo: { flex: 1 },
  myEventTitle: { fontSize: 14, fontWeight: 600, color: "#F1F5F9" },
  myEventMeta: { fontSize: 12, color: "#64748B", marginTop: 3 },
  statusBadge: { padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  cancelBtn: { padding: "7px 14px", borderRadius: 8, border: "1px solid #2D3148", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif" },
  emptyState: { textAlign: "center", padding: "60px 0", color: "#64748B" },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyBtn: { marginTop: 16, padding: "10px 24px", background: "linear-gradient(135deg, #6366F1, #A78BFA)", border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" },
  mapContainer: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, height: 520 },
  mapPlaceholder: { background: "#13151F", border: "1px solid #1E2235", borderRadius: 16, overflow: "hidden", position: "relative" },
  mapOverlay: { width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at center, #1A1D2F 0%, #0F1117 100%)", position: "relative" },
  mapPins: { position: "absolute", inset: 0 },
  mapPin: { position: "absolute", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.4)", transition: "transform 0.2s" },
  mapPinTooltip: { position: "absolute", bottom: "110%", left: "50%", transform: "translateX(-50%)", background: "#1A1D27", color: "#E2E8F0", padding: "4px 10px", borderRadius: 8, fontSize: 11, whiteSpace: "nowrap", opacity: 0, pointerEvents: "none" },
  nearbyList: { background: "#13151F", border: "1px solid #1E2235", borderRadius: 16, padding: 20, overflowY: "auto" },
  nearbyTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: "#F1F5F9", marginBottom: 14 },
  nearbyRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1E2235" },
  nearbyEmoji: { fontSize: 24 },
  nearbyInfo: { flex: 1 },
  nearbyName: { fontSize: 13, fontWeight: 600, color: "#F1F5F9" },
  nearbyDist: { fontSize: 11, color: "#64748B", marginTop: 2 },
  distTag: { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 },
  interestDesc: { fontSize: 14, color: "#94A3B8", marginBottom: 20 },
  interestGrid: { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  interestChip: { padding: "10px 20px", borderRadius: 30, border: "1px solid #2D3148", background: "#13151F", color: "#94A3B8", cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" },
  interestChipActive: { background: "linear-gradient(135deg, #6366F1, #A78BFA)", color: "#fff", border: "1px solid transparent" },
  calendarCard: { background: "#13151F", border: "1px solid #1E2235", borderRadius: 16, padding: 24, maxWidth: 400 },
  calendarHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  calMonth: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: "#F1F5F9" },
  calNavBtn: { background: "transparent", border: "1px solid #2D3148", color: "#94A3B8", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 18 },
  calGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 },
  calDayLabel: { textAlign: "center", fontSize: 11, color: "#64748B", padding: "4px 0", fontWeight: 600 },
  calDay: { textAlign: "center", padding: "8px 0", borderRadius: 8, fontSize: 13, color: "#94A3B8", cursor: "pointer", position: "relative" },
  calDayToday: { background: "linear-gradient(135deg, #6366F1, #A78BFA)", color: "#fff", fontWeight: 700 },
  calDayEvent: { color: "#A78BFA", fontWeight: 600 },
  calDot: { width: 4, height: 4, borderRadius: "50%", background: "#A78BFA", margin: "2px auto 0" },
  scheduleRow: { display: "flex", alignItems: "center", gap: 14, background: "#13151F", border: "1px solid #1E2235", borderRadius: 12, padding: "14px 18px", marginBottom: 10 },
  scheduleLine: { width: 4, height: 40, borderRadius: 2, flexShrink: 0 },
  scheduleInfo: { flex: 1 },
  scheduleTitle: { fontSize: 14, fontWeight: 600, color: "#F1F5F9" },
  scheduleMeta: { fontSize: 12, color: "#64748B", marginTop: 3 },
  profileWrap: { display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 },
  profileCard: { background: "#13151F", border: "1px solid #1E2235", borderRadius: 16, overflow: "hidden", textAlign: "center" },
  profileBanner: { height: 80, background: "linear-gradient(135deg, #6366F1, #A78BFA)" },
  profileAvatar: { width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #6366F1, #A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff", margin: "-36px auto 0", border: "4px solid #13151F" },
  profileName: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#F1F5F9", marginTop: 12 },
  profileEmail: { fontSize: 13, color: "#64748B", marginBottom: 20 },
  profileStats: { display: "flex", borderTop: "1px solid #1E2235" },
  profileStat: { flex: 1, padding: "16px 0", textAlign: "center", borderRight: "1px solid #1E2235" },
  profileStatVal: { fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#A78BFA" },
  profileStatLabel: { fontSize: 11, color: "#64748B", marginTop: 2 },
  profileDetails: { background: "#13151F", border: "1px solid #1E2235", borderRadius: 16, padding: 24 },
  detailRow: { display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #1E2235", fontSize: 14 },
  detailLabel: { color: "#64748B" },
  detailValue: { color: "#F1F5F9", fontWeight: 500 },
  editProfileBtn: { marginTop: 20, width: "100%", padding: "12px", background: "linear-gradient(135deg, #6366F1, #A78BFA)", border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "'DM Sans', sans-serif" },
};