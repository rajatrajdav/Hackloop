import { useState } from "react";

const initialEvents = [
  { id: 1, title: "City Marathon 2026", category: "Sports", date: "2026-04-20", time: "06:00", location: "Central Park", capacity: 200, registered: 188, status: "Active", image: "🏃", color: "#FF6B35", description: "Annual city marathon open to all age groups." },
  { id: 2, title: "Literary Festival 2026", category: "Literary", date: "2026-05-10", time: "10:00", location: "Convention Center", capacity: 500, registered: 312, status: "Active", image: "🎭", color: "#F59E0B", description: "A celebration of books, authors and ideas." },
  { id: 3, title: "Photography Meetup", category: "Hobby", date: "2026-05-02", time: "16:00", location: "Old Town Square", capacity: 40, registered: 20, status: "Draft", image: "📸", color: "#A78BFA", description: "Monthly photographer community meetup." },
];

const participants = [
  { id: 1, name: "Aryan Kumar", email: "aryan@student.edu", event: "City Marathon 2026", status: "Confirmed", joined: "Apr 5" },
  { id: 2, name: "Priya Singh", email: "priya@email.com", event: "City Marathon 2026", status: "Confirmed", joined: "Apr 6" },
  { id: 3, name: "Rahul Mehta", email: "rahul@email.com", event: "Literary Festival 2026", status: "Waitlisted", joined: "Apr 7" },
  { id: 4, name: "Sneha Das", email: "sneha@student.edu", event: "Literary Festival 2026", status: "Confirmed", joined: "Apr 8" },
  { id: 5, name: "Karan Joshi", email: "karan@email.com", event: "Photography Meetup", status: "Pending", joined: "Apr 9" },
];

const categories = ["Sports", "Literary", "Hobby", "Adventure", "Music", "Tech", "Food"];

const emptyForm = { title: "", category: "Sports", date: "", time: "", location: "", capacity: "", description: "", image: "🎉", color: "#6366F1" };

export default function OrganizerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [events, setEvents] = useState(initialEvents);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [msgText, setMsgText] = useState("");
  const [msgSent, setMsgSent] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const totalRegistered = events.reduce((s, e) => s + e.registered, 0);
  const totalCapacity = events.reduce((s, e) => s + e.capacity, 0);

  const handleFormChange = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleCreateOrEdit = () => {
    if (!form.title || !form.date || !form.location) return;
    if (editingId) {
      setEvents(ev => ev.map(e => e.id === editingId ? { ...e, ...form, capacity: Number(form.capacity) } : e));
    } else {
      const newEvent = { ...form, id: Date.now(), registered: 0, status: "Draft", capacity: Number(form.capacity) || 50 };
      setEvents(ev => [...ev, newEvent]);
    }
    setShowCreateModal(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (event) => {
    setForm({ title: event.title, category: event.category, date: event.date, time: event.time, location: event.location, capacity: event.capacity, description: event.description, image: event.image, color: event.color });
    setEditingId(event.id);
    setShowCreateModal(true);
  };

  const handleDelete = (id) => {
    setEvents(ev => ev.filter(e => e.id !== id));
    setConfirmDelete(null);
  };

  const toggleStatus = (id) => {
    setEvents(ev => ev.map(e => e.id === id ? { ...e, status: e.status === "Active" ? "Paused" : "Active" } : e));
  };

  const sendMessage = () => {
    setMsgSent(true);
    setTimeout(() => setMsgSent(false), 3000);
    setMsgText("");
  };

  const filtered = events.filter(e => {
    const matchStatus = filterStatus === "All" || e.status === filterStatus;
    const matchSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const emojiOptions = ["🎉", "🏃", "📚", "🎭", "📸", "🏔️", "♟️", "🎵", "🍕", "💻", "⚽", "🎨"];
  const colorOptions = ["#6366F1", "#FF6B35", "#4ECDC4", "#A78BFA", "#F59E0B", "#10B981", "#EF4444", "#EC4899"];

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🌐</div>
          <span style={styles.logoText}>CommuniHub</span>
        </div>
        <div style={styles.orgBadge}>Organizer Portal</div>
        <nav style={styles.nav}>
          {[
            { id: "overview", icon: "📊", label: "Overview" },
            { id: "events", icon: "🗓️", label: "My Events" },
            { id: "participants", icon: "👥", label: "Participants" },
            { id: "messages", icon: "💬", label: "Broadcast" },
            { id: "analytics", icon: "📈", label: "Analytics" },
            { id: "settings", icon: "⚙️", label: "Settings" },
          ].map(item => (
            <button
              key={item.id}
              style={{ ...styles.navItem, ...(activeTab === item.id ? styles.navItemActive : {}) }}
              onClick={() => setActiveTab(item.id)}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={styles.sidebarFooter}>
          <div style={styles.avatarRow}>
            <div style={styles.avatarSmall}>RS</div>
            <div>
              <div style={styles.avatarName}>Rohit Sharma</div>
              <div style={styles.avatarRole}>Event Organizer</div>
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
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "events" && "Manage Events"}
              {activeTab === "participants" && "Participants"}
              {activeTab === "messages" && "Broadcast Message"}
              {activeTab === "analytics" && "Analytics"}
              {activeTab === "settings" && "Settings"}
            </h1>
            <p style={styles.pageSubtitle}>Welcome back, Rohit · {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</p>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.searchWrap}>
              <span>🔍</span>
              <input style={styles.searchInput} placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button style={styles.createBtn} onClick={() => { setShowCreateModal(true); setEditingId(null); setForm(emptyForm); }}>
              + Create Event
            </button>
          </div>
        </header>

        <div style={styles.content}>

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div>
              <div style={styles.statsGrid}>
                {[
                  { label: "Total Events", value: events.length, icon: "🗓️", color: "#6366F1", sub: `${events.filter(e=>e.status==="Active").length} Active` },
                  { label: "Total Registered", value: totalRegistered, icon: "👥", color: "#10B981", sub: `of ${totalCapacity} capacity` },
                  { label: "Fill Rate", value: Math.round((totalRegistered/totalCapacity)*100)+"%", icon: "📊", color: "#F59E0B", sub: "Across all events" },
                  { label: "Draft Events", value: events.filter(e=>e.status==="Draft").length, icon: "📝", color: "#A78BFA", sub: "Ready to publish" },
                ].map((s, i) => (
                  <div key={i} style={{ ...styles.statCard, borderLeft: `4px solid ${s.color}` }}>
                    <div style={styles.statTop}>
                      <div>
                        <div style={styles.statLabel}>{s.label}</div>
                        <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
                        <div style={styles.statSub}>{s.sub}</div>
                      </div>
                      <div style={{ ...styles.statIcon, background: `${s.color}22` }}>{s.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Events Quick View */}
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Active Events</h2>
                <button style={styles.viewAllBtn} onClick={() => setActiveTab("events")}>View All →</button>
              </div>
              <div style={styles.eventsGrid}>
                {events.filter(e => e.status === "Active").map(event => (
                  <div key={event.id} style={styles.eventCard}>
                    <div style={{ ...styles.eventTop, background: `linear-gradient(135deg, ${event.color}33, ${event.color}55)` }}>
                      <span style={{ fontSize: 40 }}>{event.image}</span>
                      <div style={{ ...styles.statusPill, background: event.status === "Active" ? "#10B98122" : "#F59E0B22", color: event.status === "Active" ? "#10B981" : "#F59E0B" }}>
                        ● {event.status}
                      </div>
                    </div>
                    <div style={styles.eventBody}>
                      <h3 style={styles.eventTitle}>{event.title}</h3>
                      <div style={styles.eventMeta}>
                        <span>📅 {event.date}</span>
                        <span>📍 {event.location}</span>
                      </div>
                      <div style={styles.progressWrap}>
                        <div style={styles.progressHeader}>
                          <span style={{ fontSize: 12, color: "#94A3B8" }}>Registrations</span>
                          <span style={{ fontSize: 12, color: "#E2E8F0", fontWeight: 600 }}>{event.registered}/{event.capacity}</span>
                        </div>
                        <div style={styles.progressBar}>
                          <div style={{ ...styles.progressFill, width: `${Math.min((event.registered / event.capacity) * 100, 100)}%`, background: event.color }} />
                        </div>
                      </div>
                      <div style={styles.cardActions}>
                        <button style={styles.editBtn} onClick={() => handleEdit(event)}>✏️ Edit</button>
                        <button style={styles.viewBtn} onClick={() => { setSelectedEvent(event); setActiveTab("participants"); }}>👥 View</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Participants */}
              <div style={{ ...styles.sectionHeader, marginTop: 28 }}>
                <h2 style={styles.sectionTitle}>Recent Registrations</h2>
              </div>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["Name", "Email", "Event", "Status", "Joined"].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {participants.slice(0, 4).map(p => (
                      <tr key={p.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.participantRow}>
                            <div style={styles.pAvatar}>{p.name[0]}</div>
                            {p.name}
                          </div>
                        </td>
                        <td style={{ ...styles.td, color: "#64748B" }}>{p.email}</td>
                        <td style={styles.td}>{p.event}</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.statusPill, background: p.status === "Confirmed" ? "#10B98122" : p.status === "Waitlisted" ? "#F59E0B22" : "#6366F122", color: p.status === "Confirmed" ? "#10B981" : p.status === "Waitlisted" ? "#F59E0B" : "#6366F1" }}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ ...styles.td, color: "#64748B" }}>{p.joined}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === "events" && (
            <div>
              <div style={styles.eventsToolbar}>
                <div style={styles.filterBtns}>
                  {["All", "Active", "Draft", "Paused"].map(s => (
                    <button key={s} style={{ ...styles.filterBtn, ...(filterStatus === s ? styles.filterBtnActive : {}) }} onClick={() => setFilterStatus(s)}>{s}</button>
                  ))}
                </div>
                <button style={styles.createBtn} onClick={() => { setShowCreateModal(true); setEditingId(null); setForm(emptyForm); }}>+ New Event</button>
              </div>

              <div style={styles.eventsTable}>
                {filtered.map(event => (
                  <div key={event.id} style={styles.eventTableRow}>
                    <div style={{ ...styles.eventRowIcon, background: `${event.color}22` }}>{event.image}</div>
                    <div style={styles.eventRowInfo}>
                      <div style={styles.eventRowTitle}>{event.title}</div>
                      <div style={styles.eventRowMeta}>📅 {event.date} {event.time} · 📍 {event.location} · 🏷️ {event.category}</div>
                    </div>
                    <div style={styles.progressCompact}>
                      <div style={styles.progressBar}>
                        <div style={{ ...styles.progressFill, width: `${Math.min((event.registered / event.capacity) * 100, 100)}%`, background: event.color }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#64748B" }}>{event.registered}/{event.capacity}</span>
                    </div>
                    <span style={{ ...styles.statusPill, background: event.status === "Active" ? "#10B98122" : event.status === "Draft" ? "#6366F122" : "#F59E0B22", color: event.status === "Active" ? "#10B981" : event.status === "Draft" ? "#6366F1" : "#F59E0B" }}>
                      {event.status}
                    </span>
                    <div style={styles.rowActions}>
                      <button style={styles.rowActionBtn} onClick={() => handleEdit(event)} title="Edit">✏️</button>
                      <button style={styles.rowActionBtn} onClick={() => toggleStatus(event.id)} title="Toggle Status">{event.status === "Active" ? "⏸️" : "▶️"}</button>
                      <button style={{ ...styles.rowActionBtn, color: "#EF4444" }} onClick={() => setConfirmDelete(event.id)} title="Delete">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PARTICIPANTS TAB */}
          {activeTab === "participants" && (
            <div>
              <div style={styles.eventsToolbar}>
                <div style={styles.filterBtns}>
                  {events.map(e => (
                    <button key={e.id} style={{ ...styles.filterBtn, ...(selectedEvent?.id === e.id ? styles.filterBtnActive : {}) }} onClick={() => setSelectedEvent(e)}>{e.title.slice(0, 18)}...</button>
                  ))}
                  <button style={{ ...styles.filterBtn, ...(selectedEvent === null ? styles.filterBtnActive : {}) }} onClick={() => setSelectedEvent(null)}>All Events</button>
                </div>
              </div>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["#", "Participant", "Email", "Event", "Status", "Registered On", "Actions"].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {participants.filter(p => !selectedEvent || p.event === selectedEvent.title).map((p, i) => (
                      <tr key={p.id} style={styles.tr}>
                        <td style={{ ...styles.td, color: "#64748B" }}>{i + 1}</td>
                        <td style={styles.td}>
                          <div style={styles.participantRow}>
                            <div style={styles.pAvatar}>{p.name[0]}</div>
                            {p.name}
                          </div>
                        </td>
                        <td style={{ ...styles.td, color: "#64748B" }}>{p.email}</td>
                        <td style={styles.td}>{p.event}</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.statusPill, background: p.status === "Confirmed" ? "#10B98122" : p.status === "Waitlisted" ? "#F59E0B22" : "#6366F122", color: p.status === "Confirmed" ? "#10B981" : p.status === "Waitlisted" ? "#F59E0B" : "#6366F1" }}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ ...styles.td, color: "#64748B" }}>{p.joined}</td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button style={styles.rowActionBtn} title="Approve">✅</button>
                            <button style={{ ...styles.rowActionBtn, color: "#EF4444" }} title="Remove">❌</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === "messages" && (
            <div style={styles.msgWrap}>
              <div style={styles.msgCard}>
                <h2 style={styles.sectionTitle}>Broadcast to Participants</h2>
                <p style={{ color: "#64748B", fontSize: 14, marginBottom: 20 }}>Send announcements, updates, or reminders to all registered participants.</p>
                <label style={styles.formLabel}>Select Event</label>
                <select style={styles.formSelect}>
                  <option value="">All Events</option>
                  {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
                <label style={styles.formLabel}>Message Type</label>
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  {["Announcement", "Reminder", "Update", "Cancellation"].map(t => (
                    <button key={t} style={styles.msgTypeBtn}>{t}</button>
                  ))}
                </div>
                <label style={styles.formLabel}>Subject</label>
                <input style={styles.formInput} placeholder="Message subject..." />
                <label style={styles.formLabel}>Message</label>
                <textarea
                  style={{ ...styles.formInput, height: 120, resize: "vertical" }}
                  placeholder="Write your message to participants..."
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                />
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button style={styles.sendBtn} onClick={sendMessage}>
                    {msgSent ? "✓ Sent!" : "📤 Send Broadcast"}
                  </button>
                  <button style={styles.scheduleBtn}>🕒 Schedule</button>
                </div>
                {msgSent && <div style={styles.successMsg}>✅ Message sent to all participants!</div>}
              </div>
              <div style={styles.msgHistory}>
                <h3 style={styles.sectionTitle}>Message History</h3>
                {[
                  { title: "Marathon Route Update", event: "City Marathon 2026", sent: "Apr 8 · 2:30 PM", recipients: 188 },
                  { title: "Festival Schedule Released", event: "Literary Festival 2026", sent: "Apr 6 · 10:00 AM", recipients: 312 },
                ].map((m, i) => (
                  <div key={i} style={styles.msgHistoryRow}>
                    <div style={styles.msgHistIcon}>📨</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#F1F5F9" }}>{m.title}</div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>{m.event} · {m.sent}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "#94A3B8" }}>👥 {m.recipients}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <div>
              <div style={styles.statsGrid}>
                {[
                  { label: "Total Views", value: "2,847", icon: "👁️", color: "#6366F1" },
                  { label: "Conversion Rate", value: "34%", icon: "📈", color: "#10B981" },
                  { label: "Avg. Fill Rate", value: "78%", icon: "🎯", color: "#F59E0B" },
                  { label: "Repeat Attendees", value: "41%", icon: "🔁", color: "#EC4899" },
                ].map((s, i) => (
                  <div key={i} style={{ ...styles.statCard, borderLeft: `4px solid ${s.color}` }}>
                    <div style={styles.statTop}>
                      <div>
                        <div style={styles.statLabel}>{s.label}</div>
                        <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
                      </div>
                      <div style={{ ...styles.statIcon, background: `${s.color}22` }}>{s.icon}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <h2 style={styles.sectionTitle}>Event Performance</h2>
                <div style={styles.analyticsCards}>
                  {events.map(event => (
                    <div key={event.id} style={styles.analyticsCard}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <span style={{ fontSize: 28 }}>{event.image}</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>{event.title}</div>
                          <div style={{ fontSize: 12, color: "#64748B" }}>{event.category}</div>
                        </div>
                      </div>
                      <div style={styles.analyticsStats}>
                        {[["Registered", event.registered], ["Capacity", event.capacity], ["Fill %", Math.round((event.registered / event.capacity) * 100) + "%"]].map(([l, v]) => (
                          <div key={l} style={styles.analyticsStat}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: event.color, fontFamily: "'Syne', sans-serif" }}>{v}</div>
                            <div style={{ fontSize: 11, color: "#64748B" }}>{l}</div>
                          </div>
                        ))}
                      </div>
                      <div style={styles.progressBar}>
                        <div style={{ ...styles.progressFill, width: `${Math.min((event.registered / event.capacity) * 100, 100)}%`, background: event.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div style={styles.settingsWrap}>
              <div style={styles.settingsCard}>
                <h3 style={styles.sectionTitle}>Organizer Profile</h3>
                <div style={styles.profileAvatarBig}>RS</div>
                {[["Full Name", "Rohit Sharma"], ["Email", "rohit.sharma@organizer.com"], ["Phone", "+91 9876543210"], ["Organization", "CommuniHub Events"], ["City", "Dhanbad, Jharkhand"]].map(([l, v]) => (
                  <div key={l} style={{ marginBottom: 14 }}>
                    <label style={styles.formLabel}>{l}</label>
                    <input style={styles.formInput} defaultValue={v} />
                  </div>
                ))}
                <button style={styles.sendBtn}>Save Changes</button>
              </div>
              <div style={styles.settingsCard}>
                <h3 style={styles.sectionTitle}>Notification Preferences</h3>
                {[
                  "Email on new registration",
                  "SMS alerts for capacity warnings",
                  "Daily summary report",
                  "Participant message notifications",
                  "Event reminder alerts",
                ].map((pref, i) => (
                  <div key={i} style={styles.toggleRow}>
                    <span style={{ fontSize: 14, color: "#E2E8F0" }}>{pref}</span>
                    <div style={{ ...styles.toggleSwitch, background: i < 3 ? "#6366F1" : "#2D3148" }}>
                      <div style={{ ...styles.toggleThumb, left: i < 3 ? 22 : 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CREATE/EDIT MODAL */}
      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.sectionTitle}>{editingId ? "Edit Event" : "Create New Event"}</h2>
              <button style={styles.modalClose} onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formRow}>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Event Title *</label>
                  <input style={styles.formInput} placeholder="e.g. City Marathon 2026" value={form.title} onChange={e => handleFormChange("title", e.target.value)} />
                </div>
                <div>
                  <label style={styles.formLabel}>Category</label>
                  <select style={styles.formSelect} value={form.category} onChange={e => handleFormChange("category", e.target.value)}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={styles.formRow}>
                <div>
                  <label style={styles.formLabel}>Date *</label>
                  <input type="date" style={styles.formInput} value={form.date} onChange={e => handleFormChange("date", e.target.value)} />
                </div>
                <div>
                  <label style={styles.formLabel}>Time</label>
                  <input type="time" style={styles.formInput} value={form.time} onChange={e => handleFormChange("time", e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Capacity</label>
                  <input type="number" style={styles.formInput} placeholder="100" value={form.capacity} onChange={e => handleFormChange("capacity", e.target.value)} />
                </div>
              </div>
              <label style={styles.formLabel}>Location *</label>
              <input style={styles.formInput} placeholder="Venue / Address" value={form.location} onChange={e => handleFormChange("location", e.target.value)} />
              <label style={styles.formLabel}>Description</label>
              <textarea style={{ ...styles.formInput, height: 80, resize: "vertical" }} placeholder="Brief description..." value={form.description} onChange={e => handleFormChange("description", e.target.value)} />
              <div style={styles.formRow}>
                <div>
                  <label style={styles.formLabel}>Event Icon</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                    {emojiOptions.map(em => (
                      <button key={em} style={{ ...styles.emojiBtn, ...(form.image === em ? styles.emojiBtnActive : {}) }} onClick={() => handleFormChange("image", em)}>{em}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={styles.formLabel}>Color</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                    {colorOptions.map(c => (
                      <button key={c} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: form.color === c ? "3px solid #fff" : "3px solid transparent", cursor: "pointer" }} onClick={() => handleFormChange("color", c)} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelModalBtn} onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button style={styles.sendBtn} onClick={handleCreateOrEdit}>{editingId ? "Save Changes" : "Create Event"}</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {confirmDelete && (
        <div style={styles.modalOverlay} onClick={() => setConfirmDelete(null)}>
          <div style={{ ...styles.modal, maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.sectionTitle}>Delete Event?</h2>
              <button style={styles.modalClose} onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <p style={{ padding: "16px 24px", color: "#94A3B8", fontSize: 14 }}>This will permanently delete the event and all registrations. This cannot be undone.</p>
            <div style={{ ...styles.modalFooter }}>
              <button style={styles.cancelModalBtn} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button style={{ ...styles.sendBtn, background: "#EF4444" }} onClick={() => handleDelete(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #0F1117; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1A1D27; }
        ::-webkit-scrollbar-thumb { background: #2D3148; border-radius: 3px; }
        table { border-collapse: collapse; }
      `}</style>
    </div>
  );
}

const styles = {
  root: { display: "flex", minHeight: "100vh", background: "#0F1117", fontFamily: "'DM Sans', sans-serif", color: "#E2E8F0" },
  sidebar: { width: 240, background: "#13151F", borderRight: "1px solid #1E2235", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", padding: "24px 0" },
  logo: { display: "flex", alignItems: "center", gap: 10, padding: "0 24px 12px" },
  logoIcon: { width: 36, height: 36, background: "linear-gradient(135deg, #F59E0B, #FF6B35)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
  logoText: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, background: "linear-gradient(135deg, #F59E0B, #FF6B35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  orgBadge: { margin: "0 16px 20px", padding: "5px 12px", background: "#F59E0B22", color: "#F59E0B", borderRadius: 8, fontSize: 11, fontWeight: 700, textAlign: "center", borderBottom: "1px solid #1E2235" },
  nav: { flex: 1, padding: "4px 12px", display: "flex", flexDirection: "column", gap: 4 },
  navItem: { display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, border: "none", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, textAlign: "left", transition: "all 0.2s" },
  navItemActive: { background: "linear-gradient(135deg, #F59E0B22, #FF6B3522)", color: "#F59E0B", borderLeft: "3px solid #F59E0B" },
  navIcon: { fontSize: 18 },
  sidebarFooter: { padding: "20px 16px", borderTop: "1px solid #1E2235" },
  avatarRow: { display: "flex", alignItems: "center", gap: 10 },
  avatarSmall: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #F59E0B, #FF6B35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", flexShrink: 0 },
  avatarName: { fontSize: 13, fontWeight: 600, color: "#E2E8F0" },
  avatarRole: { fontSize: 11, color: "#64748B" },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: "1px solid #1E2235", background: "#13151F", position: "sticky", top: 0, zIndex: 10 },
  pageTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, color: "#F1F5F9" },
  pageSubtitle: { fontSize: 13, color: "#64748B", marginTop: 2 },
  topbarRight: { display: "flex", alignItems: "center", gap: 12 },
  searchWrap: { display: "flex", alignItems: "center", background: "#1A1D27", border: "1px solid #2D3148", borderRadius: 10, padding: "0 14px", gap: 8 },
  searchInput: { background: "transparent", border: "none", outline: "none", color: "#E2E8F0", fontSize: 14, padding: "10px 0", width: 180, fontFamily: "'DM Sans', sans-serif" },
  createBtn: { padding: "10px 20px", background: "linear-gradient(135deg, #F59E0B, #FF6B35)", border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans', sans-serif" },
  content: { flex: 1, padding: "28px 32px", overflowY: "auto" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  statCard: { background: "#13151F", border: "1px solid #1E2235", borderRadius: 14, padding: "20px" },
  statTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  statLabel: { fontSize: 12, color: "#64748B", marginBottom: 4 },
  statValue: { fontSize: 28, fontFamily: "'Syne', sans-serif", fontWeight: 800 },
  statSub: { fontSize: 11, color: "#64748B", marginTop: 4 },
  statIcon: { width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 },
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  sectionTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: "#F1F5F9" },
  viewAllBtn: { background: "transparent", border: "none", color: "#F59E0B", cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" },
  eventsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 },
  eventCard: { background: "#13151F", border: "1px solid #1E2235", borderRadius: 16, overflow: "hidden" },
  eventTop: { padding: "20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  statusPill: { padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600 },
  eventBody: { padding: "0 18px 18px" },
  eventTitle: { fontSize: 15, fontWeight: 700, color: "#F1F5F9", fontFamily: "'Syne', sans-serif", marginBottom: 8 },
  eventMeta: { display: "flex", flexDirection: "column", gap: 3, fontSize: 12, color: "#64748B", marginBottom: 12 },
  progressWrap: { marginBottom: 14 },
  progressHeader: { display: "flex", justifyContent: "space-between", marginBottom: 6 },
  progressBar: { width: "100%", height: 6, background: "#1E2235", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3, transition: "width 0.5s ease" },
  cardActions: { display: "flex", gap: 8 },
  editBtn: { flex: 1, padding: "8px", background: "#1E2235", border: "1px solid #2D3148", borderRadius: 8, color: "#E2E8F0", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif" },
  viewBtn: { flex: 1, padding: "8px", background: "#F59E0B22", border: "1px solid #F59E0B44", borderRadius: 8, color: "#F59E0B", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif" },
  tableWrap: { background: "#13151F", border: "1px solid #1E2235", borderRadius: 14, overflow: "hidden" },
  table: { width: "100%", fontSize: 14 },
  th: { textAlign: "left", padding: "14px 20px", color: "#64748B", fontSize: 12, fontWeight: 600, background: "#1A1D27", borderBottom: "1px solid #1E2235" },
  tr: { borderBottom: "1px solid #1E2235" },
  td: { padding: "14px 20px", color: "#E2E8F0", fontSize: 13 },
  participantRow: { display: "flex", alignItems: "center", gap: 10 },
  pAvatar: { width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #6366F1, #A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 },
  eventsToolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  filterBtns: { display: "flex", gap: 8, flexWrap: "wrap" },
  filterBtn: { padding: "7px 14px", borderRadius: 8, border: "1px solid #2D3148", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif" },
  filterBtnActive: { background: "linear-gradient(135deg, #F59E0B, #FF6B35)", color: "#fff", border: "1px solid transparent" },
  eventsTable: { display: "flex", flexDirection: "column", gap: 10 },
  eventTableRow: { display: "flex", alignItems: "center", gap: 14, background: "#13151F", border: "1px solid #1E2235", borderRadius: 12, padding: "14px 18px" },
  eventRowIcon: { width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 },
  eventRowInfo: { flex: 1 },
  eventRowTitle: { fontSize: 14, fontWeight: 600, color: "#F1F5F9" },
  eventRowMeta: { fontSize: 12, color: "#64748B", marginTop: 3 },
  progressCompact: { width: 120, display: "flex", flexDirection: "column", gap: 4 },
  rowActions: { display: "flex", gap: 6 },
  rowActionBtn: { background: "transparent", border: "1px solid #2D3148", borderRadius: 6, width: 32, height: 32, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" },
  msgWrap: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 },
  msgCard: { background: "#13151F", border: "1px solid #1E2235", borderRadius: 16, padding: 24 },
  msgTypeBtn: { padding: "7px 14px", borderRadius: 8, border: "1px solid #2D3148", background: "#1A1D27", color: "#94A3B8", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif" },
  formLabel: { display: "block", fontSize: 12, color: "#64748B", fontWeight: 600, marginBottom: 6, marginTop: 14 },
  formInput: { width: "100%", padding: "10px 14px", background: "#1A1D27", border: "1px solid #2D3148", borderRadius: 10, color: "#E2E8F0", fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif" },
  formSelect: { width: "100%", padding: "10px 14px", background: "#1A1D27", border: "1px solid #2D3148", borderRadius: 10, color: "#E2E8F0", fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif" },
  sendBtn: { padding: "11px 24px", background: "linear-gradient(135deg, #F59E0B, #FF6B35)", border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans', sans-serif" },
  scheduleBtn: { padding: "11px 20px", background: "transparent", border: "1px solid #2D3148", borderRadius: 10, color: "#94A3B8", cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" },
  successMsg: { marginTop: 12, padding: "10px 16px", background: "#10B98122", color: "#10B981", borderRadius: 10, fontSize: 13 },
  msgHistory: { background: "#13151F", border: "1px solid #1E2235", borderRadius: 16, padding: 24 },
  msgHistoryRow: { display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #1E2235" },
  msgHistIcon: { width: 36, height: 36, borderRadius: 10, background: "#1E2235", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 },
  analyticsCards: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginTop: 14 },
  analyticsCard: { background: "#13151F", border: "1px solid #1E2235", borderRadius: 14, padding: 20 },
  analyticsStats: { display: "flex", gap: 16, marginBottom: 14 },
  analyticsStat: { textAlign: "center" },
  settingsWrap: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  settingsCard: { background: "#13151F", border: "1px solid #1E2235", borderRadius: 16, padding: 24 },
  profileAvatarBig: { width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #F59E0B, #FF6B35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "#fff", margin: "16px auto 20px" },
  toggleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #1E2235" },
  toggleSwitch: { width: 46, height: 24, borderRadius: 12, position: "relative", cursor: "pointer", transition: "background 0.2s" },
  toggleThumb: { width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, transition: "left 0.2s" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" },
  modal: { background: "#13151F", border: "1px solid #2D3148", borderRadius: 20, width: "90%", maxWidth: 580, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #1E2235" },
  modalClose: { background: "transparent", border: "none", color: "#64748B", cursor: "pointer", fontSize: 18 },
  modalBody: { padding: "20px 24px", overflowY: "auto", flex: 1 },
  modalFooter: { display: "flex", gap: 10, padding: "16px 24px", borderTop: "1px solid #1E2235", justifyContent: "flex-end" },
  formRow: { display: "flex", gap: 12, marginBottom: 4 },
  cancelModalBtn: { padding: "10px 20px", background: "transparent", border: "1px solid #2D3148", borderRadius: 10, color: "#94A3B8", cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" },
  emojiBtn: { width: 36, height: 36, borderRadius: 8, border: "1px solid #2D3148", background: "#1A1D27", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" },
  emojiBtnActive: { border: "2px solid #F59E0B", background: "#F59E0B22" },
};