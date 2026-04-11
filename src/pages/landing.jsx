import { useState, useEffect, useRef } from "react";
import logo from "../assets/logo.jpeg";
import bgVideo from "../assets/background.mp4";
import sportsBg from "../assets/sports.jpg";
import wellnessBg from "../assets/Feel Better_ Live Better_.jpg";
import artistBg from "../assets/Artist Illustrates How Doing Anything Is Much Better When There Are Animals Around (29 Pics).jpg";
import litBg from "../assets/download.jpg";

/* ─── Keyframe styles injected once ─── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { overflow-x: hidden; }

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
    --ff-display: 'Playfair Display', Georgia, serif;
    --ff-body: 'DM Sans', system-ui, sans-serif;
  }

  @keyframes floatY {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-10px); }
  }
  @keyframes ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes pulse-dot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.5; transform:scale(1.5); }
  }
  @keyframes spin-slow {
    to { transform: rotate(360deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(32px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes slideIn {
    from { opacity:0; transform:translateX(-24px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes scaleIn {
    from { opacity:0; transform:scale(.92); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes heroImgFade {
    0%   { opacity:0; transform:scale(1.06); }
    12%  { opacity:1; transform:scale(1); }
    85%  { opacity:1; transform:scale(1); }
    100% { opacity:0; transform:scale(.97); }
  }
  @keyframes countUp {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes borderGlow {
    0%,100% { box-shadow: 0 0 0 2px transparent; }
    50%      { box-shadow: 0 0 0 3px rgba(244,160,35,.5); }
  }
  @keyframes ripple {
    to { transform: scale(3); opacity: 0; }
  }
  @keyframes toastIn {
    from { opacity:0; transform:translateX(-50%) translateY(16px); }
    to   { opacity:1; transform:translateX(-50%) translateY(0); }
  }
  @keyframes orb1 {
    0%,100% { transform: translate(0,0) scale(1); }
    33%     { transform: translate(40px,-30px) scale(1.1); }
    66%     { transform: translate(-20px,20px) scale(.95); }
  }
  @keyframes orb2 {
    0%,100% { transform: translate(0,0) scale(1); }
    33%     { transform: translate(-30px,40px) scale(1.08); }
    66%     { transform: translate(25px,-15px) scale(.93); }
  }
`;

/* ─── Data ─── */
const SLIDES = [
  { emoji: "🏃", label: "Sports", title: "Ganga Sunrise\nMarathon 2026", grad: "linear-gradient(135deg,#f4a023,#e85d04)", color: "#f4a023", bg: sportsBg },
  { emoji: "📖", label: "Literature", title: "Hindi Lit Fest\nSpoken Word Eve", grad: "linear-gradient(135deg,#3d3bf5,#8b2fcc)", color: "#8b2fcc", bg: litBg },
  { emoji: "🧘", label: "Wellness", title: "Open Yoga at\nRiver Bank", grad: "linear-gradient(135deg,#17885a,#0d5c3a)", color: "#17885a", bg: wellnessBg },
  { emoji: "🎨", label: "Creative", title: "Art Jam &\nOpen Studio Night", grad: "linear-gradient(135deg,#f03e6e,#8b0f3a)", color: "#f03e6e", bg: artistBg },
];

const CATEGORIES = [
  { emoji:"🏆", name:"Sports",    desc:"Marathons & leagues",    count:"142", bg:"#eeeeff", accent:"#3d3bf5" },
  { emoji:"📖", name:"Literature",desc:"Book clubs & festivals", count:"38",  bg:"#fff8e8", accent:"#b06a00" },
  { emoji:"🧘", name:"Wellness",  desc:"Yoga & meditation",      count:"67",  bg:"#e3f5ec", accent:"#17885a" },
  { emoji:"🎨", name:"Creative",  desc:"Art jams & workshops",   count:"54",  bg:"#fde8ee", accent:"#c42050" },
  { emoji:"🍜", name:"Food",      desc:"Tastings & food walks",  count:"29",  bg:"#fff0ee", accent:"#d4450c" },
  { emoji:"💻", name:"Tech",      desc:"Hackathons & talks",     count:"81",  bg:"#f0f0ff", accent:"#5c2bd4" },
  { emoji:"🎵", name:"Music",     desc:"Live sets & open mics",  count:"45",  bg:"#fff8e0", accent:"#9a7100" },
  { emoji:"🏕️", name:"Adventure", desc:"Treks & expeditions",    count:"22",  bg:"#e0f8f8", accent:"#007a80" },
];

const EVENTS = [
  { emoji:"🏃", title:"Ganga Sunrise Marathon 2026 — Patna's Biggest Run", date:"Sat Apr 13", time:"6:00 AM", place:"Gandhi Maidan", grad:"linear-gradient(135deg,#f4a023,#e85d04)", badge:"Free", attendees:312, featured:true, avatars:["R","A","S","P"], avColors:["#e85d04","#3d3bf5","#17885a","#c42050"] },
  { emoji:"📖", title:"Hindi Lit Fest — Spoken Word Evening",              date:"Sun Apr 14", time:"4:00 PM", place:"Patna",         grad:"linear-gradient(135deg,#3d3bf5,#8b2fcc)",  badge:"₹150", attendees:89,  avatars:["K","M"],     avColors:["#8b2fcc","#3d3bf5"] },
  { emoji:"🧘", title:"Open Yoga Session — River Bank",                    date:"Fri Apr 12", time:"7:00 AM", place:"Ganga Ghat",    grad:"linear-gradient(135deg,#17885a,#0d5c3a)",  badge:"Free", attendees:154, avatars:["N","T","L"],  avColors:["#17885a","#f4a023","#c42050"] },
  { emoji:"🎵", title:"Jazz Night — Live at Maurya Hotel",                 date:"Sat Apr 13", time:"8:00 PM", place:"Maurya Hotel",  grad:"linear-gradient(135deg,#c42050,#8b0f3a)",  badge:"₹500", attendees:68,  avatars:["D","V"],     avColors:["#c42050","#3d3bf5"] },
  { emoji:"💻", title:"AI in Bihar — Tech Talks Vol. 3",                   date:"Sun Apr 15", time:"2:00 PM", place:"Startup Hub",   grad:"linear-gradient(135deg,#f4a023,#c97b00)",  badge:"Free", attendees:203, avatars:["A","B","C"],  avColors:["#f4a023","#17885a","#8b2fcc"] },
];

const TICKER_ITEMS = [
  "🎉 Patna Design Jam — This Saturday",
  "🏃 Ganga Marathon — 300 spots left",
  "📖 Hindi Literature Fest — Free entry",
  "🧘 Sunday Yoga at Gandhi Maidan",
  "🎵 Jazz Night — Maurya Hotel, Friday",
  "💻 Tech Talks: AI in Bihar",
];

/* ─── Hooks ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─── Sub-components ─── */
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position:"fixed", bottom:32, left:"50%",
      transform:"translateX(-50%)",
      background:"#0c0c14", color:"#faf8f3",
      padding:"14px 28px", borderRadius:100,
      fontFamily:"var(--ff-body)", fontWeight:600, fontSize:"0.9rem",
      boxShadow:"0 12px 40px rgba(0,0,0,.28)",
      zIndex:9999, whiteSpace:"nowrap",
      animation:"toastIn .3s ease both",
    }}>{msg}</div>
  );
}

function Avatar({ letter, color }) {
  return (
    <div style={{
      width:28, height:28, borderRadius:"50%",
      border:"2px solid #0c0c14",
      background: color, color:"#fff",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:"0.6rem", fontWeight:700,
      marginLeft:-8,
    }}>{letter}</div>
  );
}

function CategoryCard({ cat, index, onToast }) {
  const [hov, setHov] = useState(false);
  const [ref, vis] = useReveal();
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onToast(`Showing ${cat.name} events near you →`)}
      style={{
        background: hov ? cat.bg : "#fff",
        border: `1.5px solid ${hov ? "transparent" : "var(--border)"}`,
        borderRadius: 20,
        padding: "32px 28px",
        cursor: "pointer",
        transition: "all .35s cubic-bezier(.34,1.56,.64,1)",
        transform: vis ? (hov ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)") : "translateY(28px) scale(.97)",
        opacity: vis ? 1 : 0,
        transitionDelay: `${index * 60}ms`,
        boxShadow: hov ? `0 24px 48px rgba(0,0,0,.1), 0 0 0 2px ${cat.accent}22` : "none",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{
        width:52, height:52, borderRadius:16,
        background: cat.bg,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:"1.5rem", marginBottom:20,
        transition:"transform .3s",
        transform: hov ? "scale(1.15) rotate(-5deg)" : "scale(1)",
      }}>{cat.emoji}</div>
      <div style={{ fontFamily:"var(--ff-body)", fontWeight:800, fontSize:"1.05rem", marginBottom:6 }}>{cat.name}</div>
      <div style={{ fontSize:"0.83rem", color:"var(--muted)", marginBottom:20, lineHeight:1.5 }}>{cat.desc}</div>
      <div style={{ fontSize:"0.75rem", fontWeight:700, color: cat.accent, marginBottom:16 }}>{cat.count} events nearby</div>
      <div style={{
        width:36, height:36, borderRadius:"50%",
        background: hov ? cat.accent : "var(--border)",
        display:"flex", alignItems:"center", justifyContent:"center",
        color: hov ? "#fff" : "var(--ink)",
        transition:"all .3s",
        fontSize:"0.9rem",
      }}>→</div>
    </div>
  );
}

function EventCard({ ev, featured, delay = 0, onToast }) {
  const [hov, setHov] = useState(false);
  const [ref, vis] = useReveal();
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onToast(`Opening: ${ev.title}`)}
      style={{
        background: hov ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.05)",
        border: `1px solid ${hov ? "rgba(255,255,255,.15)" : "rgba(255,255,255,.07)"}`,
        borderRadius: 20,
        overflow:"hidden",
        cursor:"pointer",
        transition:"all .3s ease",
        transform: vis ? (hov ? "translateY(-5px)" : "translateY(0)") : "translateY(28px)",
        opacity: vis ? 1 : 0,
        transitionDelay: `${delay}ms`,
        boxShadow: hov ? "0 20px 48px rgba(0,0,0,.3)" : "none",
      }}
    >
      <div style={{
        height: featured ? 280 : 160,
        background: ev.grad,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize: featured ? "5rem" : "3.5rem",
        transition:"transform .4s",
        transform: hov ? "scale(1.04)" : "scale(1)",
        overflow:"hidden",
      }}>{ev.emoji}</div>
      <div style={{ padding:"22px 24px" }}>
        <div style={{ display:"flex", gap:8, alignItems:"center", fontSize:"0.72rem", fontWeight:600, color:"rgba(250,248,243,.4)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:8 }}>
          <span>{ev.date}</span><span style={{ width:3, height:3, background:"rgba(250,248,243,.3)", borderRadius:"50%" }}></span>
          <span>{ev.time}</span><span style={{ width:3, height:3, background:"rgba(250,248,243,.3)", borderRadius:"50%" }}></span>
          <span>{ev.place}</span>
        </div>
        <div style={{ fontFamily:"var(--ff-display)", fontSize: featured ? "1.35rem" : "1.05rem", fontWeight:700, color:"var(--cream)", lineHeight:1.3, marginBottom:16 }}>{ev.title}</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ display:"flex", marginLeft:8 }}>
              {ev.avatars.map((l, i) => <Avatar key={i} letter={l} color={ev.avColors[i]} />)}
            </div>
            <span style={{ fontSize:"0.78rem", color:"rgba(250,248,243,.45)", fontWeight:500 }}>+{ev.attendees} attending</span>
          </div>
          <div style={{
            padding:"5px 14px", borderRadius:100,
            fontSize:"0.72rem", fontWeight:700,
            background:"rgba(244,160,35,.15)", color:"var(--saffron)",
            border:"1px solid rgba(244,160,35,.3)",
          }}>{ev.badge}</div>
        </div>
      </div>
    </div>
  );
}

function StepCard({ num, title, desc, index }) {
  const [ref, vis] = useReveal();
  const [hov, setHov] = useState(false);
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(32px)",
        transition: `all .7s ease ${index * 150}ms`,
        paddingTop:20, position:"relative",
      }}
    >
      <div style={{
        fontFamily:"var(--ff-display)", fontSize:"5.5rem", fontWeight:900, lineHeight:1,
        color: hov ? "rgba(244,160,35,.25)" : "rgba(236,233,240,.8)",
        marginBottom:16, transition:"color .4s",
      }}>{num}</div>
      <h3 style={{ fontFamily:"var(--ff-body)", fontWeight:800, fontSize:"1.15rem", marginBottom:10 }}>{title}</h3>
      <p style={{ color:"var(--muted)", lineHeight:1.7, fontSize:"0.9rem" }}>{desc}</p>
      {index < 2 && (
        <div style={{
          position:"absolute", top:60, right:-20,
          width:40, height:2,
          background:"repeating-linear-gradient(90deg,var(--border) 0,var(--border) 6px,transparent 6px,transparent 12px)",
        }}/>
      )}
    </div>
  );
}

function SectionHeader({ children }) {
  const [ref, vis] = useReveal();
  return <div ref={ref} style={{ opacity: vis?1:0, transform: vis?"none":"translateY(24px)", transition:"all .7s ease" }}>{children}</div>;
}

function SectionHeaderDark({ children }) {
  const [ref, vis] = useReveal();
  return <div ref={ref} style={{ opacity: vis?1:0, transform: vis?"none":"translateY(24px)", transition:"all .7s" }}>{children}</div>;
}

function RevealSection({ children, style }) {
  const [ref, vis] = useReveal();
  return <section ref={ref} style={{ ...style, opacity: vis?1:0, transform: vis?"none":"translateY(28px)", transition:"all .9s ease" }}>{children}</section>;
}

function RevealDiv({ children, style }) {
  const [ref, vis] = useReveal();
  return <div ref={ref} style={{ ...style, opacity: vis?1:0, transform: vis?"none":"translateY(28px)", transition:"all .8s ease" }}>{children}</div>;
}

function HowHeader() {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{ textAlign:"center", opacity: vis?1:0, transform: vis?"none":"translateY(24px)", transition:"all .7s", marginBottom:60 }}>
      <div style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"var(--muted)", marginBottom:12 }}>Simple as it gets</div>
      <h2 style={{ fontFamily:"var(--ff-display)", fontSize:"clamp(2rem,4vw,3rem)", fontWeight:900, marginBottom:10 }}>Three Steps to Your People</h2>
      <p style={{ color:"var(--muted)", maxWidth:420, margin:"0 auto" }}>No complicated setup. Find, join, show up.</p>
    </div>
  );
}

/* ─── Main Component ─── */
export default function Landing({ onLoginClick }) {
  const [slide, setSlide] = useState(0);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [heroMounted, setHeroMounted] = useState(false);

  const showToast = (msg) => setToast(msg);

  // inject CSS
  useEffect(() => {
    if (!document.getElementById("sangam-global")) {
      const s = document.createElement("style");
      s.id = "sangam-global";
      s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }
    setTimeout(() => setHeroMounted(true), 80);
  }, []);

  // Auto-slide
  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Nav shadow on scroll
  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const cur = SLIDES[slide];

  return (
    <div style={{ fontFamily:"var(--ff-body)", background:"var(--cream)", color:"var(--ink)", overflowX:"hidden" }}>

      {/* ── TOAST ── */}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {/* ── NAV ── */}
      <nav style={{
        position:"sticky", top:0, zIndex:100,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 48px",
        background: navScrolled ? "rgba(250,248,243,.92)" : "rgba(250,248,243,.7)",
        backdropFilter:"blur(24px)",
        borderBottom:"1px solid rgba(236,233,240,.8)",
        boxShadow: navScrolled ? "0 4px 24px rgba(0,0,0,.06)" : "none",
        transition:"all .3s ease",
      }}>
        <a href="#" style={{ textDecoration:"none", display:"flex", alignItems:"center" }}>
          <div style={{ width:160, height:56, borderRadius:10, overflow:"hidden", flexShrink:0 }}>
            <img src={logo} alt="Sangam" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }} />
          </div>
        </a>

        <div style={{ display:"flex", gap:32, listStyle:"none" }}>
          {["Find Events","How it Works","Communities","Create"].map(l => (
            <a key={l} href="#" style={{ textDecoration:"none", color:"#3d3bf5", fontWeight:600, fontSize:"0.88rem", transition:"color .2s" }}
              onMouseEnter={e => e.target.style.color="#f4a023"}
              onMouseLeave={e => e.target.style.color="#3d3bf5"}
            >{l}</a>
          ))}
        </div>

        <div style={{ display:"flex", gap:12 }}>
          <button onClick={onLoginClick} style={{
            padding:"10px 20px", border:"1.5px solid var(--border)", background:"transparent",
            borderRadius:100, fontFamily:"var(--ff-body)", fontWeight:600, fontSize:"0.85rem",
            cursor:"pointer", color:"var(--ink)", transition:"all .2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="var(--ink)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; }}
          >Log In</button>
          <button onClick={onLoginClick} style={{
            padding:"10px 22px", background:"var(--ink)", color:"var(--cream)",
            border:"none", borderRadius:100, fontFamily:"var(--ff-body)", fontWeight:700,
            fontSize:"0.85rem", cursor:"pointer", transition:"all .25s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background="var(--indigo)"; e.currentTarget.style.transform="translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="var(--ink)"; e.currentTarget.style.transform="none"; }}
          >Join Free →</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ display:"grid", gridTemplateColumns:"1.4fr 0.6fr", minHeight:"92vh", overflow:"hidden", position:"relative" }}>

        {/* Background Video */}
        <video autoPlay muted loop playsInline style={{
          position:"absolute", inset:0, width:"100%", height:"100%",
          objectFit:"cover", zIndex:0, opacity:0.62,
          filter:"brightness(1.15) contrast(0.95) saturate(0.75) hue-rotate(15deg)",
        }}>
          <source src={bgVideo} type="video/mp4" />
        </video>

        {/* Video overlay for text readability */}
        <div style={{ position:"absolute", inset:0, zIndex:0, background:"linear-gradient(105deg,rgba(10,10,20,0.55) 0%,rgba(10,10,20,0.18) 60%,transparent 100%)" }}/>

        {/* Left */}
        <div style={{ padding:"80px 64px", display:"flex", flexDirection:"column", justifyContent:"center", position:"relative", zIndex:1 }}>

          {/* Floating badge */}
          <div style={{
            position:"absolute", top:60, left:40,
            background:"#fff", borderRadius:16, padding:"12px 18px",
            boxShadow:"0 12px 40px rgba(0,0,0,.12)",
            display:"flex", alignItems:"center", gap:10,
            animation:"floatY 4s ease-in-out infinite",
            opacity: heroMounted ? 1 : 0,
            transition:"opacity .6s ease .8s",
          }}>
            <div style={{ width:32, height:32, borderRadius:10, background:"#fde8ee", display:"flex", alignItems:"center", justifyContent:"center" }}>📍</div>
            <div>
              <div style={{ fontSize:"0.78rem", fontWeight:700 }}>Near You</div>
              <div style={{ fontSize:"0.7rem", color:"var(--muted)" }}>Patna, Bihar</div>
            </div>
          </div>

          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(244,160,35,.12)", color:"#b06a00",
            borderRadius:100, padding:"6px 16px",
            fontSize:"0.72rem", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase",
            marginBottom:28, width:"fit-content",
            opacity: heroMounted ? 1 : 0,
            animation: heroMounted ? "slideIn .7s ease .1s both" : "none",
          }}>
            <span style={{ width:7, height:7, background:"var(--saffron)", borderRadius:"50%", animation:"pulse-dot 2s infinite" }}></span>
            Live in your city
          </div>

          <h1 style={{
            fontFamily:"var(--ff-display)",
            fontSize:"clamp(3rem,5.5vw,5rem)",
            fontWeight:900, lineHeight:1.06,
            marginBottom:24,
            opacity: heroMounted ? 1 : 0,
            animation: heroMounted ? "fadeUp .8s ease .2s both" : "none",
            background:"linear-gradient(135deg,#1a1a2e 0%,#f4a023 50%,#f03e6e 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>
            Where Interests<br />
            Root &amp;{" "}
            <em style={{
              fontStyle:"italic",
              background:"linear-gradient(90deg,#3d3bf5,#f03e6e,#f4a023,#3d3bf5)",
              backgroundSize:"300% auto",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              animation:"shimmer 4s linear infinite",
            }}>Communities</em><br />
            Bloom.
          </h1>

          <p style={{
            fontSize:"1.05rem", color:"#4a4a6a", lineHeight:1.75,
            maxWidth:440, marginBottom:36,
            opacity: heroMounted ? 1 : 0,
            animation: heroMounted ? "fadeUp .8s ease .35s both" : "none",
            fontWeight: 500,
          }}>
            Stop scrolling, start meeting. From sunrise marathons to late-night book clubs — find your people, right around the corner.
          </p>

          {/* Search */}
          <div style={{
            display:"flex", background:"#fff",
            border:"1.5px solid var(--border)", borderRadius:100,
            overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,.07)",
            maxWidth:500, marginBottom:36,
            opacity: heroMounted ? 1 : 0,
            animation: heroMounted ? "fadeUp .8s ease .5s both" : "none",
          }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && search.trim()) showToast(`🔍 Searching "${search}" near Patna…`); }}
              placeholder="Search events, workshops…"
              style={{
                flex:1, padding:"15px 22px", border:"none", outline:"none",
                fontFamily:"var(--ff-body)", fontSize:"0.92rem", background:"transparent",
              }}
            />
            <div style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"0 16px", borderLeft:"1.5px solid var(--border)",
              fontSize:"0.82rem", color:"var(--muted)", fontWeight:500, whiteSpace:"nowrap",
            }}>📍 Patna, IN</div>
            <button
              onClick={() => search.trim() ? showToast(`🔍 Searching "${search}" near Patna…`) : showToast("Type something to search!")}
              style={{
                padding:"10px 22px", background:"var(--ink)", color:"#fff",
                border:"none", cursor:"pointer",
                fontFamily:"var(--ff-body)", fontWeight:700, fontSize:"0.87rem",
                margin:6, borderRadius:100, transition:"background .2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background="var(--indigo)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="var(--ink)"; }}
            >Search</button>
          </div>

          {/* Stats */}
          <div style={{
            display:"flex", gap:28, alignItems:"center",
            opacity: heroMounted ? 1 : 0,
            animation: heroMounted ? "fadeUp .8s ease .65s both" : "none",
          }}>
            {[["12K+","Events this month","#f4a023"],["840+","Communities","#3d3bf5"],["2.4L","Members joined","#f03e6e"]].map(([n,l,c], i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:i > 0 ? 28 : 0 }}>
                {i > 0 && <div style={{ width:1, height:36, background:"var(--border)" }}/>}
                <div>
                  <div style={{ fontFamily:"var(--ff-display)", fontSize:"1.7rem", fontWeight:700, color:c }}>{n}</div>
                  <div style={{ fontSize:"0.75rem", color:"#6b6b8a", fontWeight:600 }}>{l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right – Slideshow */}
        <div style={{ position:"relative", overflow:"hidden", zIndex:1, margin:"24px 24px 24px 0", borderRadius:24 }}>
          {/* Animated bg orbs */}
          <div style={{
            position:"absolute", top:"20%", left:"30%",
            width:300, height:300, borderRadius:"50%",
            background: cur.color + "33",
            filter:"blur(80px)",
            animation:"orb1 8s ease-in-out infinite",
            transition:"background 1s ease",
            zIndex:0,
          }}/>
          <div style={{
            position:"absolute", bottom:"20%", right:"20%",
            width:200, height:200, borderRadius:"50%",
            background: cur.color + "22",
            filter:"blur(60px)",
            animation:"orb2 10s ease-in-out infinite",
            transition:"background 1s ease",
            zIndex:0,
          }}/>

          {SLIDES.map((s, i) => (
            <div key={i} style={{
              position:"absolute", inset:0,
              opacity: i === slide ? 1 : 0,
              transition:"opacity 1.2s cubic-bezier(.4,0,.2,1)",
              zIndex:1,
            }}>
              {s.bg
                ? <img src={s.bg} alt={s.label} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center", display:"block" }} />
                : <div style={{ width:"100%", height:"100%", background: s.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10rem" }}>{s.emoji}</div>
              }
            </div>
          ))}

          {/* Overlay */}
          <div style={{
            position:"absolute", inset:0, zIndex:2,
            background:"linear-gradient(135deg,rgba(12,12,20,.5) 0%,transparent 55%)",
          }}/>

          {/* Slide info */}
          <div style={{ position:"absolute", bottom:44, left:40, zIndex:3 }}>
            <div style={{
              background:"rgba(255,255,255,.15)", backdropFilter:"blur(12px)",
              border:"1px solid rgba(255,255,255,.25)",
              borderRadius:100, padding:"4px 14px",
              fontSize:"0.72rem", fontWeight:700, letterSpacing:".06em",
              textTransform:"uppercase", color:"#fff",
              marginBottom:10, display:"inline-block",
            }}>{cur.label}</div>
            <div style={{
              fontFamily:"var(--ff-display)", fontSize:"1.9rem", fontWeight:700,
              color:"#fff", lineHeight:1.25,
              whiteSpace:"pre-line",
            }}>{cur.title}</div>
          </div>

          {/* Indicators */}
          <div style={{ position:"absolute", bottom:48, right:40, display:"flex", gap:8, zIndex:3 }}>
            {SLIDES.map((_,i) => (
              <div key={i} onClick={() => setSlide(i)} style={{
                height:4, borderRadius:4, cursor:"pointer",
                transition:"all .4s ease",
                width: i === slide ? 40 : 20,
                background: i === slide ? "var(--saffron)" : "rgba(255,255,255,.35)",
              }}/>
            ))}
          </div>

          {/* Decorative spinning ring */}
          <div style={{
            position:"absolute", top:40, right:40,
            width:80, height:80, borderRadius:"50%",
            border:"2px dashed rgba(255,255,255,.2)",
            animation:"spin-slow 12s linear infinite",
            zIndex:3,
          }}/>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ background:"var(--ink)", color:"var(--cream)", padding:"13px 0", overflow:"hidden", whiteSpace:"nowrap" }}>
        <div style={{ display:"inline-block", animation:"ticker 26s linear infinite" }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:12, padding:"0 32px", fontSize:"0.83rem", fontWeight:500 }}>
              {item}
              <span style={{ color:"var(--saffron)", fontSize:"1.1rem" }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <section id="discover" style={{ padding:"96px 64px", maxWidth:1280, margin:"0 auto" }}>
        <RevealDiv style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:52 }}>
            <div>
              <div style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"#f4a023", marginBottom:12 }}>Browse by interest</div>
              <h2 style={{ fontFamily:"var(--ff-display)", fontSize:"clamp(2rem,4vw,3rem)", fontWeight:900, lineHeight:1.1, marginBottom:10, background:"linear-gradient(135deg,#0c0c14,#3d3bf5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Discover Your Vibe</h2>
              <p style={{ color:"#6b6b8a", fontSize:"1rem", fontWeight:500 }}>Pick a category and see what's happening today.</p>
            </div>
            <a onClick={() => showToast("Loading all categories…")} style={{ display:"flex", alignItems:"center", gap:6, fontWeight:700, fontSize:"0.88rem", color:"var(--indigo)", cursor:"pointer", whiteSpace:"nowrap" }}>
              See all →
            </a>
        </RevealDiv>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20 }}>
          {CATEGORIES.map((cat, i) => <CategoryCard key={cat.name} cat={cat} index={i} onToast={showToast} />)}
        </div>
      </section>

      {/* ── EVENTS ── */}
      <section style={{ background:"var(--ink)", padding:"96px 0" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 64px" }}>
          <RevealDiv style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:48 }}>
              <div>
                <div style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"#f4a023", marginBottom:12 }}>Don't miss out</div>
                <h2 style={{ fontFamily:"var(--ff-display)", fontSize:"clamp(2rem,4vw,3rem)", fontWeight:900, background:"linear-gradient(90deg,#fff,#f4a023)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:10 }}>Trending This Week</h2>
                <p style={{ color:"rgba(250,248,243,.65)", fontSize:"1rem", fontWeight:500 }}>Hot events happening in and around Patna.</p>
              </div>
              <a onClick={() => showToast("Showing all events…")} style={{ display:"flex", gap:6, fontWeight:700, fontSize:"0.88rem", color:"var(--saffron)", cursor:"pointer", whiteSpace:"nowrap" }}>See all →</a>
          </RevealDiv>

          <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr 1fr", gap:20 }}>
            <EventCard ev={EVENTS[0]} featured delay={0}   onToast={showToast} />
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <EventCard ev={EVENTS[1]} delay={100} onToast={showToast} />
              <EventCard ev={EVENTS[2]} delay={200} onToast={showToast} />
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <EventCard ev={EVENTS[3]} delay={150} onToast={showToast} />
              <EventCard ev={EVENTS[4]} delay={250} onToast={showToast} />
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding:"96px 64px", maxWidth:1280, margin:"0 auto" }}>
        <RevealDiv style={{ textAlign:"center", marginBottom:60 }}>
            <div style={{ fontSize:"0.7rem", fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"#f03e6e", marginBottom:12 }}>Simple as it gets</div>
            <h2 style={{ fontFamily:"var(--ff-display)", fontSize:"clamp(2rem,4vw,3rem)", fontWeight:900, marginBottom:10, background:"linear-gradient(135deg,#0c0c14,#3d3bf5,#f03e6e)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Three Steps to Your People</h2>
            <p style={{ color:"#6b6b8a", maxWidth:420, margin:"0 auto", fontWeight:500 }}>No complicated setup. Find, join, show up.</p>
        </RevealDiv>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:48 }}>
          <StepCard index={0} num="01" title="Tell us what you love" desc="Pick your interests — from cricket to calligraphy. We'll surface the most relevant events in your city, instantly." />
          <StepCard index={1} num="02" title="Discover & RSVP"      desc="Browse events on a map or by category. One tap to reserve your spot — no forms, no fuss, no fees for most events." />
          <StepCard index={2} num="03" title="Show up & connect"    desc="Meet people who share your passions. Build friendships that last beyond the event. Repeat every weekend." />
        </div>
      </section>

      {/* ── QUOTE ── */}
      <RevealSection style={{
          background:"linear-gradient(135deg,var(--indigo),#5f4df4,#8b2fcc)",
          padding:"100px 64px", textAlign:"center", position:"relative", overflow:"hidden",
        }}>
          <div style={{
            position:"absolute", top:-40, left:"50%", transform:"translateX(-50%)",
            fontFamily:"var(--ff-display)", fontSize:"20rem", color:"rgba(255,255,255,.04)",
            lineHeight:1, pointerEvents:"none", userSelect:"none",
          }}>"</div>
          <blockquote style={{
            fontFamily:"var(--ff-display)",
            fontSize:"clamp(1.5rem,3.5vw,3rem)",
            fontWeight:700, color:"#fff",
            maxWidth:800, margin:"0 auto 28px",
            lineHeight:1.3, position:"relative",
          }}>
            "In a digital world, true belonging is found in the physical spaces we share."
          </blockquote>
          <p style={{
            color:"rgba(255,255,255,.55)", fontWeight:600, fontSize:"0.85rem",
            letterSpacing:".1em", textTransform:"uppercase", position:"relative",
          }}>— The Sangam Philosophy</p>
      </RevealSection>

      {/* ── CTA ── */}
      <section style={{ padding:"96px 64px", maxWidth:1280, margin:"0 auto" }}>
          <RevealDiv style={{
            background:"var(--ink)", borderRadius:32, padding:"80px",
            display:"grid", gridTemplateColumns:"1fr auto", gap:48, alignItems:"center",
            position:"relative", overflow:"hidden",
          }}>
            <div style={{ position:"absolute", top:-80, right:-80, width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(61,59,245,.4),transparent 70%)", pointerEvents:"none" }}/>
            <div style={{ position:"absolute", bottom:-60, left:60, width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(244,160,35,.2),transparent 70%)", pointerEvents:"none" }}/>
            <div style={{ position:"relative" }}>
              <h2 style={{ fontFamily:"var(--ff-display)", fontSize:"clamp(1.8rem,3.5vw,3rem)", fontWeight:900, color:"var(--cream)", lineHeight:1.15, marginBottom:14 }}>
                Ready to find<br/>your community?
              </h2>
              <p style={{ color:"rgba(250,248,243,.45)", fontSize:"1rem" }}>Join 2.4 lakh people already making real connections across India.</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14, position:"relative" }}>
              <button onClick={onLoginClick} style={{
                padding:"16px 32px", background:"var(--saffron)", color:"var(--ink)",
                border:"none", borderRadius:100,
                fontFamily:"var(--ff-body)", fontWeight:800, fontSize:"0.97rem",
                cursor:"pointer", transition:"all .25s", whiteSpace:"nowrap",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(244,160,35,.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
              >Join Free — It's On Us</button>
              <button onClick={() => document.getElementById("discover")?.scrollIntoView({ behavior:"smooth" })} style={{
                padding:"14px 28px", background:"transparent", color:"rgba(250,248,243,.6)",
                border:"1.5px solid rgba(250,248,243,.2)", borderRadius:100,
                fontFamily:"var(--ff-body)", fontWeight:600, fontSize:"0.88rem",
                cursor:"pointer", transition:"all .2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(250,248,243,.5)"; e.currentTarget.style.color="#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(250,248,243,.2)"; e.currentTarget.style.color="rgba(250,248,243,.6)"; }}
              >Explore Events</button>
            </div>
          </RevealDiv>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:"#07070d", color:"rgba(250,248,243,.45)", padding:"64px 64px 32px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:48, paddingBottom:48, borderBottom:"1px solid rgba(255,255,255,.06)", marginBottom:32 }}>
          <div>
            <div style={{ marginBottom:14 }}>
              <img src={logo} alt="Sangam" style={{ height:36, width:"auto", objectFit:"contain", filter:"brightness(0) invert(1)" }} />
            </div>
            <p style={{ fontSize:"0.87rem", lineHeight:1.7, maxWidth:260 }}>Building the infrastructure for real-world human connection. One city at a time.</p>
          </div>
          {[
            ["Platform",  ["Browse Map","Categories","Create Event","Pro Organizer"]],
            ["Community", ["Groups","Trending","Success Stories","Ambassadors"]],
            ["Company",   ["Our Story","Careers","Blog","Contact"]],
          ].map(([heading, links]) => (
            <div key={heading}>
              <h4 style={{ color:"var(--cream)", fontWeight:700, fontSize:"0.88rem", marginBottom:20 }}>{heading}</h4>
              <ul style={{ listStyle:"none" }}>
                {links.map(l => (
                  <li key={l} style={{ marginBottom:12 }}>
                    <a href="#" style={{ color:"rgba(250,248,243,.4)", textDecoration:"none", fontSize:"0.85rem", transition:"color .2s" }}
                      onMouseEnter={e => e.target.style.color="var(--cream)"}
                      onMouseLeave={e => e.target.style.color="rgba(250,248,243,.4)"}
                    >{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:"0.78rem" }}>
          <span>© 2026 Sangam Inc. All rights reserved.</span>
          <div style={{ display:"flex", gap:24 }}>
            {["Privacy","Terms","Cookies"].map(l => (
              <a key={l} href="#" style={{ color:"rgba(250,248,243,.3)", textDecoration:"none", transition:"color .2s" }}
                onMouseEnter={e => e.target.style.color="var(--cream)"}
                onMouseLeave={e => e.target.style.color="rgba(250,248,243,.3)"}
              >{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
