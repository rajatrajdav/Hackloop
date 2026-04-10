import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Eye, EyeOff, ArrowLeft, Trophy, BookOpen, Users, Plane } from "lucide-react";

const DEMO_ACCOUNTS = {
  student: { email: "student@sangam.com", password: "student123" },
  organizer: { email: "organizer@sangam.com", password: "organizer123" },
};

const Login = ({ onLogin, onBack }) => {
  const [mode, setMode] = useState("select");
  const [role, setRole] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (r) => { setRole(r); setMode("login"); setError(""); };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      const demo = DEMO_ACCOUNTS[role];
      if (form.email === demo.email && form.password === demo.password) {
        onLogin(role, role === "student" ? "Aryan Kumar" : "Rohit Sharma");
      } else {
        setError("Invalid credentials. Use the demo autofill below.");
      }
      setLoading(false);
    }, 900);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError("Please fill all fields."); return; }
    setLoading(true);
    setTimeout(() => { onLogin(role, form.name); setLoading(false); }, 900);
  };

  const fillDemo = () => {
    const d = DEMO_ACCOUNTS[role];
    setForm(f => ({ ...f, email: d.email, password: d.password }));
  };

  const accent = role === "organizer" ? "#F59E0B" : "#6366F1";
  const accentGrad = role === "organizer"
    ? "linear-gradient(135deg, #F59E0B, #FF6B35)"
    : "linear-gradient(135deg, #6366F1, #A78BFA)";
  const leftBg = role === "organizer" && mode !== "select"
    ? "linear-gradient(160deg, #1a1000 0%, #2a1c00 55%, #0F1117 100%)"
    : "linear-gradient(160deg, #080b1a 0%, #0f1235 55%, #0F1117 100%)";

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#0F1117" }}>

      {/* ── LEFT PANEL ── */}
      <div style={{ width: "44%", background: leftBg, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", padding: "52px 48px" }}>
        {/* ambient glow */}
        <div style={{ position: "absolute", inset: 0, background: role === "organizer" && mode !== "select" ? "radial-gradient(ellipse at 30% 45%, #F59E0B2a, transparent 65%)" : "radial-gradient(ellipse at 30% 45%, #6366F12a, transparent 65%)", pointerEvents: "none" }} />
        {/* decorative grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#ffffff06 1px,transparent 1px),linear-gradient(90deg,#ffffff06 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 40, maxWidth: 400 }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: accentGrad, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, background: accentGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Sangam.
            </span>
          </div>

          {/* Hero */}
          <AnimatePresence mode="wait">
            <motion.div key={`${mode}-${role}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 42, lineHeight: 1.15, color: "#F1F5F9", marginBottom: 16 }}>
                {mode === "select" ? <>Where communities<br /><em>come alive.</em></> : role === "student" ? <>Discover events<br /><em>near you.</em></> : <>Organize moments<br /><em>people remember.</em></>}
              </h2>
              <p style={{ fontSize: 15, color: "#94A3B8", lineHeight: 1.75 }}>
                {mode === "select"
                  ? "Marathons, book clubs, group treks, hobby meetups — your next adventure starts here."
                  : role === "student"
                  ? "Join marathons, literary festivals, photography meetups and more happening in your city."
                  : "Create events, manage participants, broadcast updates and track performance."}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Pill tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[{ icon: <Trophy size={12} />, label: "Sports" }, { icon: <BookOpen size={12} />, label: "Literary" }, { icon: <Users size={12} />, label: "Meetups" }, { icon: <Plane size={12} />, label: "Adventure" }].map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 20, border: `1px solid ${accent}44`, color: accent, background: accent + "11", fontSize: 12, fontWeight: 600 }}>
                {p.icon} {p.label}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 28 }}>
            {[["12k+", "Active Users"], ["340+", "Events Monthly"], ["80+", "Cities"]].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: "#F1F5F9" }}>{v}</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 18 }}>
            <p style={{ color: "#CBD5E1", fontSize: 14, fontStyle: "italic", lineHeight: 1.7 }}>"Found my running crew through Sangam. Now we train every morning together."</p>
            <p style={{ color: accent, fontSize: 12, fontWeight: 700, marginTop: 8 }}>— Priya S., Pune</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px", background: "#0F1117" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Back to landing */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            {mode !== "select" ? (
              <button onClick={() => { setMode("select"); setRole(null); setError(""); }} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "#64748B", fontSize: 13, fontWeight: 600, padding: 0 }}>
                <ArrowLeft size={15} /> Back
              </button>
            ) : (
              <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "#64748B", fontSize: 13, fontWeight: 600, padding: 0 }}>
                <ArrowLeft size={15} /> Back to Home
              </button>
            )}
            {mode === "select" && (
              <div style={{ fontSize: 12, color: "#64748B" }}>New here?{" "}
                <button onClick={() => { setRole("student"); setMode("register"); }} style={{ background: "none", border: "none", color: "#6366F1", fontWeight: 700, fontSize: 12, padding: 0 }}>Sign up free</button>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">

            {/* ROLE SELECTION */}
            {mode === "select" && (
              <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: "#F1F5F9", marginBottom: 6 }}>Welcome back</h1>
                <p style={{ color: "#64748B", fontSize: 15, marginBottom: 36 }}>Choose your role to continue</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { r: "student", emoji: "🎓", label: "Continue as Student", desc: "Discover & join events near you", color: "#6366F1", grad: "linear-gradient(135deg, #6366F1, #A78BFA)" },
                    { r: "organizer", emoji: "🌐", label: "Continue as Organizer", desc: "Create & manage community events", color: "#F59E0B", grad: "linear-gradient(135deg, #F59E0B, #FF6B35)" },
                  ].map(({ r, emoji, label, desc, color, grad }) => (
                    <motion.button key={r} whileHover={{ y: -3, scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => handleRoleSelect(r)}
                      style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", background: "#13151F", border: `1.5px solid ${color}33`, borderRadius: 16, textAlign: "left", transition: "border-color 0.2s" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: "#F1F5F9" }}>{label}</div>
                        <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{desc}</div>
                      </div>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, flexShrink: 0 }}>→</div>
                    </motion.button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "28px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "#1E2235" }} />
                  <span style={{ color: "#475569", fontSize: 13 }}>or register new account</span>
                  <div style={{ flex: 1, height: 1, background: "#1E2235" }} />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  {[{ r: "student", label: "Student Register", color: "#6366F1" }, { r: "organizer", label: "Organizer Register", color: "#F59E0B" }].map(({ r, label, color }) => (
                    <button key={r} onClick={() => { setRole(r); setMode("register"); }}
                      style={{ flex: 1, padding: "11px", border: `1.5px solid ${color}44`, borderRadius: 12, background: "transparent", color: color, fontWeight: 600, fontSize: 13 }}>
                      {label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* LOGIN FORM */}
            {mode === "login" && (
              <motion.div key="login" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 20, background: accent + "18", color: accent, border: `1px solid ${accent}44`, fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
                  {role === "student" ? "🎓 Student" : "🌐 Organizer"} Login
                </div>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 30, color: "#F1F5F9", marginBottom: 6 }}>Sign in</h1>
                <p style={{ color: "#64748B", fontSize: 14, marginBottom: 28 }}>
                  Demo account?{" "}
                  <button onClick={fillDemo} style={{ background: "none", border: "none", color: accent, fontWeight: 700, fontSize: 14, padding: 0 }}>Autofill credentials →</button>
                </p>

                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748B", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder={DEMO_ACCOUNTS[role].email} required
                      style={{ width: "100%", padding: "13px 16px", background: "#13151F", border: "1.5px solid #1E2235", borderRadius: 12, color: "#E2E8F0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border-color 0.2s" }}
                      onFocus={e => e.target.style.borderColor = accent}
                      onBlur={e => e.target.style.borderColor = "#1E2235"}
                    />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase" }}>Password</label>
                      <button type="button" style={{ background: "none", border: "none", color: accent, fontSize: 12, fontWeight: 600, padding: 0 }}>Forgot?</button>
                    </div>
                    <div style={{ position: "relative" }}>
                      <input type={showPass ? "text" : "password"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="••••••••" required
                        style={{ width: "100%", padding: "13px 44px 13px 16px", background: "#13151F", border: "1.5px solid #1E2235", borderRadius: 12, color: "#E2E8F0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
                        onFocus={e => e.target.style.borderColor = accent}
                        onBlur={e => e.target.style.borderColor = "#1E2235"}
                      />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748B", display: "flex", alignItems: "center" }}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div style={{ background: "#EF444418", border: "1px solid #EF444433", borderRadius: 10, padding: "10px 14px", color: "#EF4444", fontSize: 13 }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    style={{ width: "100%", padding: "14px", background: accentGrad, border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 16, fontFamily: "'Syne', sans-serif", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
                    {loading ? "Signing in..." : "Sign In →"}
                  </button>
                </form>

                <p style={{ textAlign: "center", marginTop: 24, color: "#64748B", fontSize: 14 }}>
                  No account?{" "}
                  <button onClick={() => { setMode("register"); setError(""); }} style={{ background: "none", border: "none", color: accent, fontWeight: 700, fontSize: 14, padding: 0 }}>
                    Create one →
                  </button>
                </p>
              </motion.div>
            )}

            {/* REGISTER FORM */}
            {mode === "register" && (
              <motion.div key="register" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                {/* Role toggle */}
                <div style={{ display: "flex", background: "#13151F", borderRadius: 12, padding: 4, marginBottom: 24, border: "1px solid #1E2235" }}>
                  {["student", "organizer"].map(r => (
                    <button key={r} onClick={() => setRole(r)}
                      style={{ flex: 1, padding: "9px", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", background: role === r ? (r === "organizer" ? "linear-gradient(135deg,#F59E0B,#FF6B35)" : "linear-gradient(135deg,#6366F1,#A78BFA)") : "transparent", color: role === r ? "#fff" : "#64748B", transition: "all 0.2s" }}>
                      {r === "student" ? "🎓 Student" : "🌐 Organizer"}
                    </button>
                  ))}
                </div>

                <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 30, color: "#F1F5F9", marginBottom: 6 }}>Create account</h1>
                <p style={{ color: "#64748B", fontSize: 14, marginBottom: 28 }}>Join thousands of communities across India</p>

                <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { field: "name", label: "Full Name", type: "text", ph: "Your full name" },
                    { field: "email", label: "Email", type: "email", ph: "you@example.com" },
                  ].map(({ field, label, type, ph }) => (
                    <div key={field}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748B", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</label>
                      <input type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={ph} required
                        style={{ width: "100%", padding: "13px 16px", background: "#13151F", border: "1.5px solid #1E2235", borderRadius: 12, color: "#E2E8F0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
                        onFocus={e => e.target.style.borderColor = accent}
                        onBlur={e => e.target.style.borderColor = "#1E2235"}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748B", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>Password</label>
                    <div style={{ position: "relative" }}>
                      <input type={showPass ? "text" : "password"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 8 characters" required
                        style={{ width: "100%", padding: "13px 44px 13px 16px", background: "#13151F", border: "1.5px solid #1E2235", borderRadius: 12, color: "#E2E8F0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
                        onFocus={e => e.target.style.borderColor = accent}
                        onBlur={e => e.target.style.borderColor = "#1E2235"}
                      />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748B", display: "flex", alignItems: "center" }}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div style={{ background: "#EF444418", border: "1px solid #EF444433", borderRadius: 10, padding: "10px 14px", color: "#EF4444", fontSize: 13 }}>{error}</div>
                  )}

                  <button type="submit" disabled={loading}
                    style={{ width: "100%", padding: "14px", background: accentGrad, border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 16, fontFamily: "'Syne', sans-serif", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
                    {loading ? "Creating..." : "Create Account →"}
                  </button>

                  <p style={{ textAlign: "center", color: "#475569", fontSize: 12, lineHeight: 1.6 }}>
                    By registering you agree to our <span style={{ color: accent }}>Terms of Service</span> and <span style={{ color: accent }}>Privacy Policy</span>.
                  </p>
                </form>

                <p style={{ textAlign: "center", marginTop: 20, color: "#64748B", fontSize: 14 }}>
                  Have an account?{" "}
                  <button onClick={() => { setMode("login"); setError(""); }} style={{ background: "none", border: "none", color: accent, fontWeight: 700, fontSize: 14, padding: 0 }}>
                    Sign in →
                  </button>
                </p>
              </motion.div>
            )}

          </AnimatePresence>

          <p style={{ textAlign: "center", marginTop: 40, color: "#334155", fontSize: 12 }}>
            © 2026 Sangam Inc. · Building real-world connections.
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
};

export default Login;