"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Radio, Eye, ArrowRight, LogOut, Sparkles, Check, X, Bell, Trophy } from "lucide-react";

/* =========================================================================
   SUPABASE CONFIG — set these in .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ========================================================================= */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "YOUR-ANON-PUBLIC-KEY";
const sbHeaders = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" };
const CONFIGURED = !SUPABASE_URL.includes("YOUR-PROJECT-REF") && !SUPABASE_ANON_KEY.includes("YOUR-ANON");

/* =========================================================================
   DESIGN TOKENS
   ========================================================================= */
const C = {
  ink: "#0d1019", panel: "#161a2c", panel2: "#1e2338",
  coral: "#e5574b", gold: "#d1a34f", teal: "#3fab97",
  cream: "#f3efe6", muted: "#8b8fa8", line: "rgba(243,239,230,0.12)",
};
const serif = "'Georgia','Iowan Old Style','Times New Roman',serif";
const sans = "'Inter',-apple-system,BlinkMacSystemFont,sans-serif";
const OPEN_WINDOW_SEC = 120; // final 2 minutes = open questioning

/* =========================================================================
   GAME DATA
   ========================================================================= */
const CATEGORIES = {
  movies: { label: "Movies", icon: "🎬", items: ["Titanic","Inception","Avatar","Parasite","The Godfather","Jurassic Park","Interstellar","The Dark Knight","Frozen","Avengers: Endgame","La La Land","Coco","Spirited Away","Whiplash","Joker","The Matrix","Forrest Gump","Gladiator","The Lion King","Toy Story","Jerry Maguire","Kalo Pothi","Loot","Chha Maya Chhaina","Prem Geet"] },
  tvshows: { label: "TV Shows", icon: "📺", items: ["Friends","Breaking Bad","Game of Thrones","The Office","Stranger Things","Money Heist","Sherlock","The Crown","Dark","Chernobyl","Better Call Saul","The Simpsons","Squid Game","The Mandalorian","Peaky Blinders","Rick and Morty","The Witcher","Loki","House of the Dragon","Wednesday","Prison Break","Narcos"] },
  celebrities: { label: "Celebrities", icon: "🌟", items: ["Shah Rukh Khan","Cristiano Ronaldo","Lionel Messi","Taylor Swift","Dwayne Johnson","Priyanka Chopra","Elon Musk","Beyoncé","Tom Cruise","Rihanna","Virat Kohli","Leonardo DiCaprio","Emma Watson","Jungkook","Zendaya","Robert Downey Jr.","Selena Gomez","Salman Khan","Deepika Padukone","Keanu Reeves","Billie Eilish","Chris Hemsworth","Scarlett Johansson","Ed Sheeran","Kim Kardashian"] },
  locations: { label: "Locations", icon: "📍", items: ["Airplane","Bank","Beach","Casino","Cathedral","Circus Tent","Corporate Party","Crusader Army","Embassy","Hospital","Hotel","Military Base","Movie Studio","Ocean Liner","Passenger Train","Polar Station","Police Station","Restaurant","School","Service Station","Space Station","Submarine","Supermarket","Theater"] },
  politicians: { label: "Nepal Politicians", icon: "🏛️", items: ["KP Sharma Oli","Pushpa Kamal Dahal","Sher Bahadur Deuba","Madhav Kumar Nepal","Baburam Bhattarai","Rabi Lamichhane","Bidya Devi Bhandari","Ram Chandra Poudel","Jhala Nath Khanal","Upendra Yadav","Bamdev Gautam","Gagan Thapa","Bishnu Prasad Paudel","Kamal Thapa","Mahantha Thakur","Rajendra Lingden","Narayan Kaji Shrestha","Hisila Yami","Renu Dahal","Balen Shah","Harka Sampang","Mahesh Basnet","Prakash Man Singh","Yubaraj Khatiwada"] },
  districts: { label: "Nepal Districts", icon: "🗺️", items: ["Kathmandu","Lalitpur","Bhaktapur","Kaski","Chitwan","Morang","Sunsari","Jhapa","Rupandehi","Kailali","Kanchanpur","Banke","Bardiya","Dang","Palpa","Gorkha","Lamjung","Tanahun","Syangja","Baglung","Myagdi","Mustang","Manang","Rasuwa","Nuwakot","Dhading","Makwanpur","Sindhuli","Ramechhap","Dolakha","Solukhumbu","Okhaldhunga","Khotang","Bhojpur","Dhankuta","Ilam","Panchthar","Taplejung","Terhathum","Udayapur"] },
  countries: { label: "Countries", icon: "🌍", items: ["Nepal","India","China","USA","UK","France","Germany","Japan","South Korea","Australia","Brazil","Canada","Russia","Italy","Spain","Mexico","Egypt","South Africa","Thailand","Vietnam","Indonesia","Turkey","Saudi Arabia","UAE","Bhutan","Bangladesh","Sri Lanka","Pakistan","Argentina","Switzerland"] },
  anime: { label: "Anime Characters", icon: "⚔️", items: ["Naruto Uzumaki","Monkey D. Luffy","Goku","Levi Ackerman","Light Yagami","Eren Yeager","Itachi Uchiha","Saitama","Edward Elric","Tanjiro Kamado","Nezuko Kamado","Sasuke Uchiha","L Lawliet","Vegeta","Ichigo Kurosaki","Gon Freecss","Killua Zoldyck","Mikasa Ackerman","Rem","Izuku Midoriya","All Might","Sailor Moon","Spike Spiegel","Kakashi Hatake","Zoro Roronoa"] },
};
const CAT_KEYS = Object.keys(CATEGORIES);

/* =========================================================================
   UTILITIES
   ========================================================================= */
const uid = (n = 10) => { const c = "abcdefghijklmnopqrstuvwxyz0123456789"; let s = ""; for (let i=0;i<n;i++) s += c[Math.floor(Math.random()*c.length)]; return s; };
const roomCode = () => { const c = "ABCDEFGHJKLMNPQRSTUVWXYZ"; let s = ""; for (let i=0;i<4;i++) s += c[Math.floor(Math.random()*c.length)]; return s; };
const hashColor = (str) => { let h=0; for (let i=0;i<str.length;i++) h = str.charCodeAt(i) + ((h<<5)-h); const hue = Math.abs(h)%360; return `hsl(${hue} 62% 56%)`; };
const initials = (name) => (name||"?").trim().split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();
const pick = (arr) => arr[Math.floor(Math.random()*arr.length)];

function pickNextPair(players, prevAsker, prevTarget) {
  const ids = players.map(p => p.id);
  if (ids.length < 2) return { asker: ids[0] || null, target: null };
  let askerPool = ids.filter(id => id !== prevAsker);
  if (askerPool.length === 0) askerPool = ids;
  const asker = pick(askerPool);
  let targetPool = ids.filter(id => id !== asker && id !== prevTarget);
  if (targetPool.length === 0) targetPool = ids.filter(id => id !== asker);
  const target = pick(targetPool);
  return { asker, target };
}

/* =========================================================================
   SUPABASE REST HELPERS
   ========================================================================= */
const roomToRow = (r) => ({
  code: r.code, host_id: r.hostId, players: r.players, categories: r.categories, status: r.status,
  item: r.item, spy_id: r.spyId, scores: r.scores, round: r.round,
  round_duration_sec: r.roundDurationSec, round_started_at: r.roundStartedAt ? new Date(r.roundStartedAt).toISOString() : null,
  current_asker: r.currentAsker, current_target: r.currentTarget,
  votes: r.votes, end_votes: r.endVotes, voting_resolved: r.votingResolved,
  spy_guess: r.spyGuess, spy_guess_correct: r.spyGuessCorrect,
});
const rowToRoom = (row) => ({
  code: row.code, hostId: row.host_id, players: row.players || [], categories: row.categories || [], status: row.status,
  item: row.item, spyId: row.spy_id, scores: row.scores || {}, round: row.round || 0,
  roundDurationSec: row.round_duration_sec || 480, roundStartedAt: row.round_started_at ? new Date(row.round_started_at).getTime() : null,
  currentAsker: row.current_asker, currentTarget: row.current_target,
  votes: row.votes || {}, endVotes: row.end_votes || {}, votingResolved: !!row.voting_resolved,
  spyGuess: row.spy_guess || null, spyGuessCorrect: row.spy_guess_correct,
});

async function loadRoom(code) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rooms?code=eq.${encodeURIComponent(code)}&select=*`, { headers: sbHeaders });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows.length ? rowToRoom(rows[0]) : null;
  } catch { return null; }
}
async function insertRoom(room) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rooms`, { method: "POST", headers: { ...sbHeaders, Prefer: "return=representation" }, body: JSON.stringify([roomToRow(room)]) });
    return res.ok;
  } catch { return false; }
}
async function saveRoom(room) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/rooms?code=eq.${encodeURIComponent(room.code)}`, { method: "PATCH", headers: { ...sbHeaders, Prefer: "return=representation" }, body: JSON.stringify(roomToRow(room)) });
  } catch { /* ignore */ }
}

/* =========================================================================
   SIGNATURE VISUAL
   ========================================================================= */
function ViewfinderFrame({ children, size = 260, tone = C.coral }) {
  const ticks = Array.from({ length: 14 });
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 20, border: `1.5px solid ${tone}`, boxShadow: `0 0 0 5px ${C.ink}, 0 0 30px rgba(229,87,75,0.15)`, overflow: "hidden", background: "linear-gradient(160deg,#232a45,#141827)" }}>
        {children}
      </div>
      {["-10px", `${size + 2}px`].map((top, ti) => (
        <div key={ti} style={{ position: "absolute", top, left: 6, right: 6, display: "flex", justifyContent: "space-between" }}>
          {ticks.map((_, i) => <div key={i} style={{ width: 3, height: 6, background: tone, opacity: 0.55, borderRadius: 1 }} />)}
        </div>
      ))}
    </div>
  );
}

function DetectiveArt() {
  return (
    <svg viewBox="0 0 260 260" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="glow" cx="50%" cy="18%" r="60%">
          <stop offset="0%" stopColor="#3a3f66" /><stop offset="100%" stopColor="#161a2c" />
        </radialGradient>
      </defs>
      <rect width="260" height="260" fill="url(#glow)" />
      <line x1="130" y1="0" x2="130" y2="46" stroke="#4a4f74" strokeWidth="2" />
      <ellipse cx="130" cy="54" rx="22" ry="8" fill="#e9c873" opacity="0.85" />
      <ellipse cx="130" cy="54" rx="22" ry="8" fill="none" stroke="#c79f4a" strokeWidth="1.5" />
      <rect x="192" y="70" width="46" height="70" rx="3" fill="#20263f" stroke="#3c4266" strokeWidth="2" />
      <line x1="215" y1="70" x2="215" y2="140" stroke="#3c4266" strokeWidth="2" />
      <rect x="196" y="76" width="18" height="28" fill="#d1794f" opacity="0.35" />
      <rect x="14" y="150" width="46" height="60" rx="10" fill="#7a3230" />
      <rect x="10" y="140" width="54" height="26" rx="10" fill="#8a3a37" />
      <g>
        <ellipse cx="132" cy="118" rx="17" ry="18" fill="#12141f" />
        <path d="M112 106 q20 -22 40 0 q-4 -18 -20 -18 q-16 0 -20 18 z" fill="#12141f" />
        <path d="M118 218 L118 150 q0 -22 14 -22 q14 0 14 22 l0 68 z" fill="#171a28" />
        <path d="M100 220 l10 -70 q4 -14 22 -14 q18 0 22 14 l10 70 z" fill="#0f111c" />
        <path d="M100 170 q-18 6 -22 26" stroke="#0f111c" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M164 170 q18 6 22 26" stroke="#0f111c" strokeWidth="10" fill="none" strokeLinecap="round" />
        <rect x="96" y="188" width="68" height="44" rx="2" fill="#e9dfc4" transform="rotate(-3 130 210)" />
        <line x1="106" y1="200" x2="150" y2="196" stroke="#b9a97c" strokeWidth="1.5" transform="rotate(-3 130 210)" />
        <line x1="106" y1="210" x2="150" y2="206" stroke="#b9a97c" strokeWidth="1.5" transform="rotate(-3 130 210)" />
        <line x1="106" y1="220" x2="140" y2="217" stroke="#b9a97c" strokeWidth="1.5" transform="rotate(-3 130 210)" />
      </g>
      <rect x="0" y="236" width="260" height="24" fill="#2a2440" opacity="0.6" />
    </svg>
  );
}

function Avatar({ name, size = 44, ring }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: hashColor(name || "?"), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.34, color: "#141426", border: ring ? `3px solid ${ring}` : "2px solid rgba(255,255,255,0.15)", boxShadow: ring ? `0 0 16px ${ring}` : "none", transition: "all .25s ease" }}>
      {initials(name)}
    </div>
  );
}

/* ---------------- Primitives ---------------- */
function Card({ children, style }) {
  return <div style={{ background: `linear-gradient(180deg,${C.panel},${C.panel2})`, border: `1px solid ${C.line}`, borderRadius: 18, padding: 22, marginBottom: 16, boxShadow: "0 14px 34px rgba(0,0,0,0.35)", ...style }}>{children}</div>;
}
function PrimaryButton({ children, onClick, disabled, style }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: "100%", fontFamily: sans, fontWeight: 700, fontSize: 15, letterSpacing: 0.2, background: disabled ? "#5a4038" : C.coral, color: "#1b0f0d", border: "none", borderRadius: 12, padding: "14px 18px", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: disabled ? "none" : "0 8px 20px rgba(229,87,75,0.35)", ...style }}>{children}</button>
  );
}
function GhostButton({ children, onClick, active, style }) {
  return (
    <button onClick={onClick} style={{ width: "100%", fontFamily: sans, fontWeight: 700, fontSize: 14, background: active ? "rgba(63,171,151,0.16)" : "transparent", color: active ? C.teal : C.cream, border: `1px solid ${active ? C.teal : C.line}`, borderRadius: 12, padding: "13px 18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, ...style }}>{children}</button>
  );
}
function Eyebrow({ children }) { return <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, fontWeight: 700, marginBottom: 6, fontFamily: sans }}>{children}</div>; }
function Title({ children }) { return <h1 style={{ fontFamily: serif, fontSize: 32, fontWeight: 700, color: C.cream, margin: "0 0 6px", letterSpacing: 0.2 }}>{children}</h1>; }
function Sub({ children }) { return <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, margin: "0 0 22px", fontFamily: sans }}>{children}</p>; }

const labelStyle = { display: "block", fontSize: 12, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: sans };
const inputStyle = { width: "100%", background: "rgba(0,0,0,0.25)", border: `1px solid ${C.line}`, color: C.cream, padding: "12px 14px", borderRadius: 10, fontSize: 16, outline: "none", marginBottom: 14, fontFamily: sans, boxSizing: "border-box" };

function fmtClock(sec) {
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* =========================================================================
   MAIN APP
   ========================================================================= */
export default function App() {
  const [me] = useState(() => ({ id: uid(), name: "" }));
  const [name, setName] = useState("");
  const [screen, setScreen] = useState("home");
  const [homeTab, setHomeTab] = useState("create");
  const [codeInput, setCodeInput] = useState("");
  const [joinError, setJoinError] = useState("");
  const [room, setRoom] = useState(null);
  const [selectedCats, setSelectedCats] = useState(new Set(CAT_KEYS));
  const [roundMinutes, setRoundMinutes] = useState(8);
  const pollRef = useRef(null);
  const roomRef = useRef(null);
  useEffect(() => { roomRef.current = room; }, [room]);
  useEffect(() => { me.name = name; }, [name]); // eslint-disable-line

  const startPolling = useCallback((code) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const fresh = await loadRoom(code);
      if (fresh) { setRoom(fresh); setScreen(fresh.status); }
    }, 1500);
  }, []);
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  async function createRoom() {
    if (!name.trim()) { setJoinError("Enter your name first."); return; }
    const code = roomCode();
    const r = {
      code, hostId: me.id, players: [{ id: me.id, name }], categories: CAT_KEYS, status: "lobby",
      item: null, spyId: null, scores: { [me.id]: 0 }, round: 0,
      roundDurationSec: 480, roundStartedAt: null, currentAsker: null, currentTarget: null,
      votes: {}, endVotes: {}, votingResolved: false, spyGuess: null, spyGuessCorrect: null,
    };
    const ok = await insertRoom(r);
    if (!ok) { setJoinError("Couldn't create a room — check the Supabase setup."); return; }
    setRoom(r); setScreen("lobby"); startPolling(code);
  }
  async function joinRoom() {
    if (!name.trim()) { setJoinError("Enter your name first."); return; }
    const code = codeInput.trim().toUpperCase();
    if (!code) { setJoinError("Enter a room code."); return; }
    const r = await loadRoom(code);
    if (!r) { setJoinError("No room found with that code."); return; }
    if (!r.players.find(p => p.id === me.id)) {
      r.players.push({ id: me.id, name });
      r.scores = { ...r.scores, [me.id]: r.scores[me.id] ?? 0 };
      await saveRoom(r);
    }
    setJoinError(""); setRoom(r); setScreen(r.status); startPolling(code);
  }
  function toggleCat(k) { const s = new Set(selectedCats); s.has(k) ? s.delete(k) : s.add(k); setSelectedCats(s); }

  async function startGame() {
    const r = roomRef.current;
    const cats = [...selectedCats];
    if (!cats.length || !r) return;
    const catKey = pick(cats);
    const itemName = pick(CATEGORIES[catKey].items);
    const spy = pick(r.players).id;
    const { asker, target } = pickNextPair(r.players, null, null);
    const scores = { ...r.scores };
    r.players.forEach(p => { if (scores[p.id] === undefined) scores[p.id] = 0; });
    const next = {
      ...r, categories: cats, status: "playing", item: { category: catKey, name: itemName }, spyId: spy,
      scores, round: (r.round || 0) + 1, roundDurationSec: Math.max(60, roundMinutes * 60), roundStartedAt: Date.now(),
      currentAsker: asker, currentTarget: target, votes: {}, endVotes: {}, votingResolved: false, spyGuess: null, spyGuessCorrect: null,
    };
    await saveRoom(next); setRoom(next); setScreen("playing");
  }
  async function imDone() {
    const r = roomRef.current;
    const { asker, target } = pickNextPair(r.players, r.currentAsker, r.currentTarget);
    const next = { ...r, currentAsker: asker, currentTarget: target };
    await saveRoom(next); setRoom(next);
  }
  async function toggleEndVote() {
    const fresh = (await loadRoom(roomRef.current.code)) || roomRef.current;
    const ev = { ...(fresh.endVotes || {}) };
    if (ev[me.id]) delete ev[me.id]; else ev[me.id] = true;
    let next = { ...fresh, endVotes: ev };
    const majority = Math.floor(fresh.players.length / 2) + 1;
    if (Object.keys(ev).length >= majority && fresh.status === "playing") {
      next = { ...next, status: "voting" };
    }
    await saveRoom(next); setRoom(next); if (next.status !== fresh.status) setScreen(next.status);
  }
  async function castVote(targetId) {
    const fresh = (await loadRoom(roomRef.current.code)) || roomRef.current;
    fresh.votes = { ...(fresh.votes || {}), [me.id]: targetId };
    await saveRoom(fresh); setRoom(fresh);
  }
  const resolvingRef = useRef(false);
  const resolveVoting = useCallback(async () => {
    if (resolvingRef.current) return;
    const r = roomRef.current;
    if (!r || r.status !== "voting" || r.votingResolved) return;
    if (Object.keys(r.votes || {}).length < r.players.length) return;
    resolvingRef.current = true;
    const crew = r.players.filter(p => p.id !== r.spyId);
    const correctVoters = crew.filter(p => r.votes[p.id] === r.spyId);
    const majorityCaught = correctVoters.length > crew.length / 2;
    const scores = { ...r.scores };
    correctVoters.forEach(p => { scores[p.id] = (scores[p.id] || 0) + 1; });
    let next;
    if (majorityCaught) {
      next = { ...r, scores, votingResolved: true, status: "spyGuess" };
    } else {
      scores[r.spyId] = (scores[r.spyId] || 0) + 2;
      next = { ...r, scores, votingResolved: true, status: "reveal" };
    }
    await saveRoom(next); setRoom(next); setScreen(next.status);
    resolvingRef.current = false;
  }, []);
  async function spySubmitGuess(guessName) {
    const r = roomRef.current;
    const correct = guessName === r.item.name;
    const scores = { ...r.scores };
    if (correct) scores[r.spyId] = (scores[r.spyId] || 0) + 1;
    const next = { ...r, scores, spyGuess: guessName, spyGuessCorrect: correct, status: "reveal" };
    await saveRoom(next); setRoom(next); setScreen("reveal");
  }
  async function playAgain() { await startGame(); }
  function leaveRoom() {
    if (pollRef.current) clearInterval(pollRef.current);
    setRoom(null); setScreen("home"); setJoinError("");
  }

  // auto-resolve voting once everyone has voted
  useEffect(() => {
    if (room && room.status === "voting") resolveVoting();
  }, [room, resolveVoting]);

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(circle at 20% -10%, #262c4c 0%, transparent 45%), radial-gradient(circle at 110% 10%, #201c38 0%, transparent 40%), ${C.ink}`, color: C.cream, fontFamily: sans, padding: "24px 16px 60px" }}>
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        {screen === "home" && <HomeScreen {...{ name, setName, homeTab, setHomeTab, codeInput, setCodeInput, joinError, createRoom, joinRoom }} />}
        {screen === "lobby" && room && <LobbyScreen {...{ room, me, selectedCats, toggleCat, roundMinutes, setRoundMinutes, startGame, leaveRoom }} />}
        {screen === "playing" && room && <GameScreen {...{ room, me, imDone, toggleEndVote, leaveRoom }} />}
        {screen === "voting" && room && <VotingScreen {...{ room, me, castVote, leaveRoom }} />}
        {screen === "spyGuess" && room && <SpyGuessScreen {...{ room, me, spySubmitGuess, leaveRoom }} />}
        {screen === "reveal" && room && <RevealScreen {...{ room, me, playAgain, leaveRoom }} />}
      </div>
    </div>
  );
}

/* ---------------- Home ---------------- */
function HomeScreen({ name, setName, homeTab, setHomeTab, codeInput, setCodeInput, joinError, createRoom, joinRoom }) {
  return (
    <>
      <ViewfinderFrame size={230}><DetectiveArt /></ViewfinderFrame>
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Eyebrow>Case File · Party Game</Eyebrow>
        <Title>Undercover</Title>
        <Sub>One of you doesn't know the secret. Everyone else does. Ask sly questions, read the room, and unmask the spy — or bluff your way through as one.</Sub>
      </div>
      {!CONFIGURED && (
        <Card style={{ borderColor: C.coral }}>
          <b style={{ color: C.coral }}>Supabase not connected yet</b>
          <p style={{ color: C.muted, fontSize: 13, margin: "8px 0 0" }}>Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your <code>.env.local</code>.</p>
        </Card>
      )}
      <Card>
        <div style={{ display: "flex", background: "rgba(0,0,0,0.25)", borderRadius: 12, padding: 4, marginBottom: 18 }}>
          {["create", "join"].map(t => (
            <button key={t} onClick={() => setHomeTab(t)} style={{ flex: 1, padding: "10px 0", border: "none", borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: "pointer", background: homeTab === t ? C.coral : "transparent", color: homeTab === t ? "#1b0f0d" : C.muted }}>{t === "create" ? "Create Room" : "Join Room"}</button>
          ))}
        </div>
        <label style={labelStyle}>Your name</label>
        <input style={inputStyle} placeholder="e.g. Sujata" value={name} maxLength={18} onChange={e => setName(e.target.value)} />
        {homeTab === "join" && (
          <>
            <label style={labelStyle}>Room code</label>
            <input style={{ ...inputStyle, textTransform: "uppercase" }} placeholder="e.g. QXTP" maxLength={6} value={codeInput} onChange={e => setCodeInput(e.target.value)} />
          </>
        )}
        {joinError && <div style={{ color: C.coral, fontSize: 13, margin: "-8px 0 12px" }}>{joinError}</div>}
        <PrimaryButton onClick={homeTab === "create" ? createRoom : joinRoom}>{homeTab === "create" ? <>Create New Room <ArrowRight size={16} /></> : <>Join Existing Room <ArrowRight size={16} /></>}</PrimaryButton>
      </Card>
      <p style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 26, lineHeight: 1.6, opacity: 0.8 }}>Photos of real people, posters and character art are kept out of this game for copyright reasons — every player and item gets a colour-coded badge instead.</p>
    </>
  );
}

/* ---------------- Lobby ---------------- */
function LobbyScreen({ room, me, selectedCats, toggleCat, roundMinutes, setRoundMinutes, startGame, leaveRoom }) {
  const isHost = room.hostId === me.id;
  const canStart = room.players.length >= 3;
  return (
    <>
      <Eyebrow>Lobby</Eyebrow>
      <Title>Waiting for players</Title>
      <Card>
        <div style={{ fontFamily: serif, fontSize: 42, fontWeight: 700, letterSpacing: "0.15em", color: C.gold, textAlign: "center", padding: "14px 0" }}>{room.code}</div>
        <div style={{ fontSize: 12, color: C.muted, textAlign: "center", marginBottom: 18 }}>Share this code — friends tap "Join Room" and enter it</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
          {room.players.map(p => (
            <div key={p.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 64 }}>
              <Avatar name={p.name} />
              <span style={{ fontSize: 11, color: C.muted, textAlign: "center", maxWidth: 64, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
              {p.id === room.hostId && <div style={{ color: C.gold, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>Host</div>}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: C.muted, textAlign: "center", marginTop: 14 }}>{room.players.length} player{room.players.length !== 1 ? "s" : ""} in room {canStart ? "" : "· need at least 3 to start"}</div>
      </Card>
      {isHost ? (
        <Card>
          <label style={labelStyle}>Categories in play</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
            {CAT_KEYS.map(k => (
              <div key={k} onClick={() => toggleCat(k)} style={{ border: `1px solid ${selectedCats.has(k) ? C.teal : C.line}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer", fontSize: 13, background: selectedCats.has(k) ? "rgba(63,171,151,0.14)" : "rgba(0,0,0,0.15)" }}>{CATEGORIES[k].icon} {CATEGORIES[k].label}</div>
            ))}
          </div>
          <label style={labelStyle}>Round length (minutes) — last 2 min are open questioning</label>
          <input type="number" min={3} max={30} value={roundMinutes} onChange={e => setRoundMinutes(Math.max(3, Math.min(30, Number(e.target.value) || 8)))} style={inputStyle} />
          <PrimaryButton onClick={startGame} disabled={!canStart || selectedCats.size === 0}>Start Game <ArrowRight size={16} /></PrimaryButton>
        </Card>
      ) : (
        <Card><Sub>Waiting for the host to start the game…</Sub></Card>
      )}
      <GhostButton onClick={leaveRoom}><LogOut size={15} /> Leave room</GhostButton>
    </>
  );
}

/* ---------------- Turn viewfinder ---------------- */
function TurnViewfinder({ room, openMode }) {
  const players = room.players;
  const n = players.length;
  const R = 96, cx = 130, cy = 130;
  const nameOf = id => (players.find(p => p.id === id) || {}).name || "?";
  return (
    <div style={{ position: "relative", width: 260, height: 260, margin: "8px auto 0" }}>
      {players.map((p, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const x = cx + R * Math.cos(angle), y = cy + R * Math.sin(angle);
        const ring = openMode ? undefined : (p.id === room.currentAsker ? C.gold : p.id === room.currentTarget ? C.teal : undefined);
        return (
          <div key={p.id} style={{ position: "absolute", left: x - 27, top: y - 27, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 54 }}>
            <Avatar name={p.name} size={50} ring={ring} />
            <span style={{ fontSize: 10, color: C.muted, whiteSpace: "nowrap" }}>{p.name}</span>
          </div>
        );
      })}
      <Radio size={22} color={C.line} style={{ position: "absolute", left: cx - 11, top: cy - 11, opacity: 0.35 }} />
    </div>
  );
}

/* ---------------- Game screen ---------------- */
function GameScreen({ room, me, imDone, toggleEndVote, leaveRoom }) {
  const iAmSpy = room.spyId === me.id;
  const cat = CATEGORIES[room.item.category];
  const nameOf = id => (room.players.find(p => p.id === id) || {}).name || "?";
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const elapsed = room.roundStartedAt ? (now - room.roundStartedAt) / 1000 : 0;
  const remaining = Math.max(0, room.roundDurationSec - elapsed);
  const openMode = remaining <= OPEN_WINDOW_SEC;

  const [marks, setMarks] = useState({});
  useEffect(() => { setMarks({}); }, [room.round]);
  function cycleMark(itemName) {
    setMarks(m => {
      const cur = m[itemName];
      const next = cur === "tick" ? "cross" : cur === "cross" ? undefined : "tick";
      return { ...m, [itemName]: next };
    });
  }

  const endCount = Object.keys(room.endVotes || {}).length;
  const endMajority = Math.floor(room.players.length / 2) + 1;
  const iVotedEnd = !!(room.endVotes || {})[me.id];

  return (
    <>
      <Eyebrow>Round {room.round} · In progress</Eyebrow>
      <Title>{openMode ? "Open questioning" : "Ask around the circle"}</Title>

      {openMode && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(229,87,75,0.16)", border: `1px solid ${C.coral}`, borderRadius: 12, padding: "12px 14px", marginBottom: 16, animation: "none" }}>
          <Bell size={18} color={C.coral} />
          <span style={{ fontSize: 13, color: C.cream }}><b style={{ color: C.coral }}>Final {fmtClock(remaining)}</b> — anyone can ask anyone now!</span>
        </div>
      )}

      <Card style={{ textAlign: "center", padding: "26px 20px", background: iAmSpy ? `linear-gradient(180deg, rgba(229,87,75,0.22), ${C.panel2})` : `linear-gradient(180deg, rgba(63,171,151,0.18), ${C.panel2})`, borderColor: iAmSpy ? "rgba(229,87,75,0.5)" : "rgba(63,171,151,0.5)" }}>
        {iAmSpy ? (
          <>
            <div style={{ width: 66, height: 66, borderRadius: 16, margin: "0 auto 12px", background: C.coral, display: "flex", alignItems: "center", justifyContent: "center" }}><Eye size={26} color="#1b0f0d" /></div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>You're the Spy</div>
            <div style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>Category: <b style={{ color: C.cream }}>{cat.label}</b>. Mark items off as you rule them in or out.</div>
            <div style={{ textAlign: "left", maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {cat.items.map(it => {
                const mark = marks[it];
                return (
                  <div key={it} onClick={() => cycleMark(it)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer", background: "rgba(0,0,0,0.2)", border: `1px solid ${mark === "tick" ? C.teal : mark === "cross" ? C.coral : C.line}` }}>
                    <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: mark === "tick" ? C.teal : mark === "cross" ? C.coral : "transparent", border: `1px solid ${C.line}` }}>
                      {mark === "tick" && <Check size={13} color="#0d1019" />}
                      {mark === "cross" && <X size={13} color="#0d1019" />}
                    </div>
                    <span style={{ fontSize: 13, color: mark === "cross" ? C.muted : C.cream, textDecoration: mark === "cross" ? "line-through" : "none" }}>{it}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 66, height: 66, borderRadius: 16, margin: "0 auto 12px", background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{cat.icon}</div>
            <Eyebrow>{cat.label}</Eyebrow>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{room.item.name}</div>
            <Sub>One player at the table doesn't know this. Ask questions that prove you know it — without saying it outright.</Sub>
          </>
        )}
      </Card>

      <Card>
        <TurnViewfinder room={room} openMode={openMode} />
        {!openMode ? (
          <>
            <div style={{ textAlign: "center", fontSize: 15, margin: "10px 0 18px" }}>
              <b style={{ color: C.gold }}>{nameOf(room.currentAsker)}</b> <span style={{ color: C.teal }}>→ asks →</span> <b style={{ color: C.teal }}>{nameOf(room.currentTarget)}</b>
            </div>
            <PrimaryButton onClick={imDone}>I'm done — next pair <ArrowRight size={16} /></PrimaryButton>
          </>
        ) : (
          <div style={{ textAlign: "center", fontSize: 13, color: C.muted, margin: "10px 0 4px" }}>Anyone can ask anyone until time runs out.</div>
        )}
        <div style={{ marginTop: 12 }}>
          <GhostButton onClick={toggleEndVote} active={iVotedEnd}>
            <Sparkles size={15} /> {iVotedEnd ? "Voted to end round" : "Vote to end round"} · {endCount}/{room.players.length} (need {endMajority})
          </GhostButton>
        </div>
      </Card>
      <GhostButton onClick={leaveRoom}><LogOut size={15} /> Leave room</GhostButton>
    </>
  );
}

/* ---------------- Voting ---------------- */
function VotingScreen({ room, me, castVote, leaveRoom }) {
  const votes = room.votes || {};
  const totalVoted = Object.keys(votes).length;
  const myVote = votes[me.id];
  return (
    <>
      <Eyebrow>Round {room.round} · Voting</Eyebrow>
      <Title>Who's the spy?</Title>
      <Sub>Guess whoever you like — you don't need to agree with the table. {totalVoted}/{room.players.length} have voted. The spy stays hidden until everyone's in.</Sub>
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {room.players.map(p => (
            <div key={p.id} onClick={() => castVote(p.id)} style={{ display: "flex", alignItems: "center", gap: 12, border: `1px solid ${myVote === p.id ? C.coral : C.line}`, borderRadius: 12, padding: "10px 12px", background: "rgba(0,0,0,0.15)", cursor: "pointer" }}>
              <Avatar name={p.name} size={38} />
              <span>{p.name}</span>
              {myVote === p.id && <span style={{ marginLeft: "auto", fontSize: 11, color: C.coral, fontWeight: 700 }}>YOUR GUESS</span>}
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 13, color: C.muted }}>{totalVoted < room.players.length ? `Waiting on ${room.players.length - totalVoted} more vote${room.players.length - totalVoted !== 1 ? "s" : ""}…` : "Everyone's voted — revealing…"}</div>
      </Card>
      <GhostButton onClick={leaveRoom}><LogOut size={15} /> Leave room</GhostButton>
    </>
  );
}

/* ---------------- Spy guess ---------------- */
function SpyGuessScreen({ room, me, spySubmitGuess, leaveRoom }) {
  const iAmSpy = room.spyId === me.id;
  const cat = CATEGORIES[room.item.category];
  if (!iAmSpy) {
    return (
      <>
        <Eyebrow>Round {room.round} · Majority caught the spy</Eyebrow>
        <Title>The spy gets one guess</Title>
        <Card><Sub>The table found the spy. They now get one shot at naming the secret {cat.label.toLowerCase()} item for a consolation point. Hang tight…</Sub></Card>
        <GhostButton onClick={leaveRoom}><LogOut size={15} /> Leave room</GhostButton>
      </>
    );
  }
  return (
    <>
      <Eyebrow>Round {room.round} · You were caught</Eyebrow>
      <Title>Last chance — name the item</Title>
      <Sub>The table caught you. Pick what you think the secret {cat.label.toLowerCase()} item was — get it right for 1 point.</Sub>
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflowY: "auto" }}>
          {cat.items.map(it => (
            <div key={it} onClick={() => spySubmitGuess(it)} style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, cursor: "pointer", background: "rgba(0,0,0,0.15)", fontSize: 14 }}>{it}</div>
          ))}
        </div>
      </Card>
      <GhostButton onClick={leaveRoom}><LogOut size={15} /> Leave room</GhostButton>
    </>
  );
}

/* ---------------- Reveal ---------------- */
function RevealScreen({ room, me, playAgain, leaveRoom }) {
  const votes = room.votes || {};
  const crew = room.players.filter(p => p.id !== room.spyId);
  const correctVoters = crew.filter(p => votes[p.id] === room.spyId);
  const majorityCaught = correctVoters.length > crew.length / 2;
  const spyName = (room.players.find(p => p.id === room.spyId) || {}).name || "?";
  const cat = CATEGORIES[room.item.category];
  const isHost = room.hostId === me.id;
  const standings = [...room.players].sort((a, b) => (room.scores[b.id] || 0) - (room.scores[a.id] || 0));

  return (
    <>
      <Eyebrow>Round {room.round} · Results</Eyebrow>
      <Title>Reveal</Title>
      <Card style={{ textAlign: "center", padding: "26px 20px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><Avatar name={spyName} size={60} /></div>
        <div style={{ fontSize: 21, fontWeight: 700, color: C.coral, margin: "4px 0" }}>{spyName} was the spy</div>
        <Eyebrow>{cat.label}</Eyebrow>
        <div style={{ fontSize: 21, fontWeight: 700, color: C.teal, margin: "4px 0" }}>{room.item.name}</div>
        <div style={{ fontSize: 14, margin: "14px 0 0", padding: 10, borderRadius: 10, background: majorityCaught ? "rgba(63,171,151,0.16)" : "rgba(229,87,75,0.16)", color: majorityCaught ? C.teal : C.coral }}>
          {majorityCaught
            ? `Majority caught the spy (${correctVoters.length}/${crew.length} crew guessed right)${room.spyGuessCorrect ? " — but the spy named the item correctly for +1." : room.spyGuessCorrect === false ? " — and the spy's guess was wrong." : "."}`
            : `The spy evaded a majority (${correctVoters.length}/${crew.length} crew guessed right) — spy earns +2.`}
        </div>
      </Card>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Trophy size={16} color={C.gold} /><b style={{ fontFamily: serif, fontSize: 17 }}>Standings</b></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {standings.map((p, i) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 9, background: i === 0 ? "rgba(209,163,79,0.14)" : "rgba(0,0,0,0.15)" }}>
              <span style={{ width: 18, textAlign: "center", color: C.muted, fontSize: 12 }}>{i + 1}</span>
              <Avatar name={p.name} size={32} />
              <span style={{ fontSize: 13 }}>{p.name}</span>
              <span style={{ marginLeft: "auto", fontWeight: 700, color: C.gold }}>{room.scores[p.id] || 0} pt{(room.scores[p.id] || 0) !== 1 ? "s" : ""}</span>
            </div>
          ))}
        </div>
      </Card>
      {isHost ? <PrimaryButton onClick={playAgain}>Play another round <ArrowRight size={16} /></PrimaryButton> : <Card><Sub>Waiting for the host to start the next round…</Sub></Card>}
      <div style={{ marginTop: 10 }}><GhostButton onClick={leaveRoom}><LogOut size={15} /> Leave room</GhostButton></div>
    </>
  );
}
