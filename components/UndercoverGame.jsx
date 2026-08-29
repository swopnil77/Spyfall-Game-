"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Radio, Eye, ArrowRight, LogOut, Sparkles, Check, X, Bell, Trophy, Loader2 } from "lucide-react";

/* =========================================================================
   SUPABASE CONFIG
   ========================================================================= */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "YOUR-ANON-PUBLIC-KEY";
const sbHeaders = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" };
const CONFIGURED = !SUPABASE_URL.includes("YOUR-PROJECT-REF") && !SUPABASE_ANON_KEY.includes("YOUR-ANON");

/* =========================================================================
   DESIGN TOKENS — cream & black, blue as the only accent
   ========================================================================= */
const C = {
  ink: "#121110", panel: "#1b1917", panel2: "#232019",
  cream: "#f3ead6", creamDim: "#c8bd9e",
  blue: "#5588c9", blueDeep: "#3a6699", blueSoft: "#93b7de",
  line: "rgba(243,234,214,0.14)",
};
const AVATAR_SWATCHES = ["#5588c9", "#93b7de", "#e3d4ad", "#c8bd9e", "#6f93b8", "#f3ead6"];
const serif = "'Georgia','Iowan Old Style','Times New Roman',serif";
const sans = "'Inter',-apple-system,BlinkMacSystemFont,sans-serif";
const OPEN_WINDOW_SEC = 120;

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
const hashColor = (str) => { let h=0; for (let i=0;i<str.length;i++) h = str.charCodeAt(i) + ((h<<5)-h); return AVATAR_SWATCHES[Math.abs(h) % AVATAR_SWATCHES.length]; };
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
   SIGNATURE VISUAL — viewfinder frame for the home illustration
   ========================================================================= */
function ViewfinderFrame({ children, size = 260, tone = C.blue }) {
  const ticks = Array.from({ length: 14 });
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 20, border: `1.5px solid ${tone}`, boxShadow: `0 0 0 5px ${C.ink}, 0 0 30px rgba(85,136,201,0.18)`, overflow: "hidden", background: "linear-gradient(160deg,#232019,#161513)" }}>
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
          <stop offset="0%" stopColor="#2c3a4d" /><stop offset="100%" stopColor="#161513" />
        </radialGradient>
      </defs>
      <rect width="260" height="260" fill="url(#glow)" />
      <line x1="130" y1="0" x2="130" y2="46" stroke="#4a5568" strokeWidth="2" />
      <ellipse cx="130" cy="54" rx="22" ry="8" fill="#e3d4ad" opacity="0.85" />
      <ellipse cx="130" cy="54" rx="22" ry="8" fill="none" stroke="#c8bd9e" strokeWidth="1.5" />
      <rect x="192" y="70" width="46" height="70" rx="3" fill="#1e2733" stroke="#3c4a5c" strokeWidth="2" />
      <line x1="215" y1="70" x2="215" y2="140" stroke="#3c4a5c" strokeWidth="2" />
      <rect x="196" y="76" width="18" height="28" fill="#5588c9" opacity="0.35" />
      <rect x="14" y="150" width="46" height="60" rx="10" fill="#2f3d4d" />
      <rect x="10" y="140" width="54" height="26" rx="10" fill="#374a5e" />
      <g>
        <ellipse cx="132" cy="118" rx="17" ry="18" fill="#0d0d0c" />
        <path d="M112 106 q20 -22 40 0 q-4 -18 -20 -18 q-16 0 -20 18 z" fill="#0d0d0c" />
        <path d="M118 218 L118 150 q0 -22 14 -22 q14 0 14 22 l0 68 z" fill="#141412" />
        <path d="M100 220 l10 -70 q4 -14 22 -14 q18 0 22 14 l10 70 z" fill="#0a0a09" />
        <path d="M100 170 q-18 6 -22 26" stroke="#0a0a09" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M164 170 q18 6 22 26" stroke="#0a0a09" strokeWidth="10" fill="none" strokeLinecap="round" />
        <rect x="96" y="188" width="68" height="44" rx="2" fill="#e9dfc4" transform="rotate(-3 130 210)" />
        <line x1="106" y1="200" x2="150" y2="196" stroke="#b9a97c" strokeWidth="1.5" transform="rotate(-3 130 210)" />
        <line x1="106" y1="210" x2="150" y2="206" stroke="#b9a97c" strokeWidth="1.5" transform="rotate(-3 130 210)" />
        <line x1="106" y1="220" x2="140" y2="217" stroke="#b9a97c" strokeWidth="1.5" transform="rotate(-3 130 210)" />
      </g>
      <rect x="0" y="236" width="260" height="24" fill="#1b1917" opacity="0.6" />
    </svg>
  );
}

function Avatar({ name, size = 44, ring }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: hashColor(name || "?"), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.34, color: "#141412", border: ring ? `3px solid ${ring}` : "2px solid rgba(243,234,214,0.15)", boxShadow: ring ? `0 0 14px ${ring}` : "none", transition: "all .25s ease" }}>
      {initials(name)}
    </div>
  );
}

/* ---------------- Primitives ---------------- */
function Card({ children, style }) {
  return <div style={{ background: `linear-gradient(180deg,${C.panel},${C.panel2})`, border: `1px solid ${C.line}`, borderRadius: 18, padding: 22, marginBottom: 16, boxShadow: "0 14px 34px rgba(0,0,0,0.4)", ...style }}>{children}</div>;
}

/* Buttons: press feedback (scale) is instant via CSS; async onClick shows a
   spinner + "Working…" label so the person always sees something happened. */
function PrimaryButton({ children, onClick, disabled, style }) {
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);
  async function handle(e) {
    if (disabled || busy || !onClick) return;
    setBusy(true);
    try { await onClick(e); } finally { if (mounted.current) setBusy(false); }
  }
  return (
    <button className="press-btn" onClick={handle} disabled={disabled || busy} style={{ width: "100%", fontFamily: sans, fontWeight: 700, fontSize: 15, letterSpacing: 0.2, background: disabled ? "#4a453a" : C.blue, color: "#0d0d0c", border: "none", borderRadius: 12, padding: "14px 18px", cursor: disabled || busy ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: disabled ? "none" : "0 8px 20px rgba(85,136,201,0.35)", ...style }}>
      {busy ? <><Loader2 size={16} className="spin-icon" /> Working…</> : children}
    </button>
  );
}
function GhostButton({ children, onClick, active, style }) {
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);
  async function handle(e) {
    if (busy || !onClick) return;
    setBusy(true);
    try { await onClick(e); } finally { if (mounted.current) setBusy(false); }
  }
  return (
    <button className="press-btn" onClick={handle} disabled={busy} style={{ width: "100%", fontFamily: sans, fontWeight: 700, fontSize: 14, background: active ? "rgba(85,136,201,0.16)" : "transparent", color: active ? C.blue : C.cream, border: `1px solid ${active ? C.blue : C.line}`, borderRadius: 12, padding: "13px 18px", cursor: busy ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, ...style }}>
      {busy ? <Loader2 size={15} className="spin-icon" /> : children}
    </button>
  );
}
function Eyebrow({ children }) { return <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: C.blue, fontWeight: 700, marginBottom: 6, fontFamily: sans }}>{children}</div>; }
function Title({ children }) { return <h1 style={{ fontFamily: serif, fontSize: 32, fontWeight: 700, color: C.cream, margin: "0 0 6px", letterSpacing: 0.2 }}>{children}</h1>; }
function Sub({ children }) { return <p style={{ color: C.creamDim, fontSize: 14, lineHeight: 1.6, margin: "0 0 22px", fontFamily: sans }}>{children}</p>; }

const labelStyle = { display: "block", fontSize: 12, color: C.creamDim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: sans };
const inputStyle = { width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${C.line}`, color: C.cream, padding: "12px 14px", borderRadius: 10, fontSize: 16, outline: "none", marginBottom: 14, fontFamily: sans, boxSizing: "border-box" };

function fmtClock(sec) { sec = Math.max(0, Math.round(sec)); const m = Math.floor(sec / 60), s = sec % 60; return `${m}:${s.toString().padStart(2, "0")}`; }
function computeRemaining(startedAt, durationSec) { if (!startedAt) return durationSec; return Math.max(0, durationSec - (Date.now() - startedAt) / 1000); }

const CountdownLabel = React.memo(function CountdownLabel({ startedAt, durationSec }) {
  const [remaining, setRemaining] = useState(() => computeRemaining(startedAt, durationSec));
  useEffect(() => {
    const id = setInterval(() => setRemaining(computeRemaining(startedAt, durationSec)), 1000);
    return () => clearInterval(id);
  }, [startedAt, durationSec]);
  return <>{fmtClock(remaining)}</>;
});

function useOpenMode(startedAt, durationSec) {
  const [openMode, setOpenMode] = useState(() => computeRemaining(startedAt, durationSec) <= OPEN_WINDOW_SEC);
  useEffect(() => {
    const id = setInterval(() => {
      const om = computeRemaining(startedAt, durationSec) <= OPEN_WINDOW_SEC;
      setOpenMode(prev => (prev === om ? prev : om));
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt, durationSec]);
  return openMode;
}

/* Rectangular player card — avatar, name, points, optional badge/right slot.
   `isMe` gives the current user's own row a distinct cream treatment so
   they can immediately spot themselves apart from everyone else. */
function PlayerRow({ player, points, badge, badgeColor, right, onClick, highlight, isMe }) {
  const meStyle = isMe
    ? { border: `1.5px solid ${C.cream}`, background: "rgba(243,234,214,0.10)" }
    : { border: `1px solid ${highlight ? C.blue : C.line}`, background: highlight ? "rgba(85,136,201,0.12)" : "rgba(0,0,0,0.2)" };
  return (
    <div className="prow" onClick={onClick} style={{ ...meStyle, cursor: onClick ? "pointer" : "default" }}>
      <Avatar name={player.name} size={38} ring={isMe ? C.cream : undefined} />
      <span style={{ fontSize: 13, color: C.cream, fontWeight: isMe ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{player.name}</span>
      {isMe && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.ink, background: C.cream, borderRadius: 999, padding: "2px 8px" }}>You</span>}
      {badge && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: badgeColor || C.blue, border: `1px solid ${badgeColor || C.blue}`, borderRadius: 999, padding: "2px 8px" }}>{badge}</span>}
      <span style={{ marginLeft: "auto", flexShrink: 0, fontSize: 12, fontWeight: 700, color: C.blueSoft }}>{points ?? 0} pt{(points ?? 0) !== 1 ? "s" : ""}</span>
      {right}
    </div>
  );
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
    }, 2200);
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
    if (Object.keys(ev).length >= majority && fresh.status === "playing") next = { ...next, status: "voting" };
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
    if (majorityCaught) next = { ...r, scores, votingResolved: true, status: "spyGuess" };
    else { scores[r.spyId] = (scores[r.spyId] || 0) + 2; next = { ...r, scores, votingResolved: true, status: "reveal" }; }
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

  useEffect(() => { if (room && room.status === "voting") resolveVoting(); }, [room, resolveVoting]);

  const wide = screen === "playing" || screen === "voting" || screen === "reveal" || screen === "spyGuess";

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(circle at 20% -10%, #1e2733 0%, transparent 45%), radial-gradient(circle at 110% 10%, #1b1917 0%, transparent 40%), ${C.ink}`, color: C.cream, fontFamily: sans, padding: "24px 16px 60px" }}>
      <div style={{ maxWidth: wide ? 860 : 440, margin: "0 auto" }}>
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
        <Sub>One of you doesn't know the secret. Everyone else does.</Sub>
      </div>
      {!CONFIGURED && (
        <Card style={{ borderColor: C.blue }}>
          <b style={{ color: C.blue }}>Supabase not connected yet</b>
          <p style={{ color: C.creamDim, fontSize: 13, margin: "8px 0 0" }}>Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your <code>.env.local</code>.</p>
        </Card>
      )}
      <Card>
        <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 4, marginBottom: 18 }}>
          {["create", "join"].map(t => (
            <button key={t} className="press-btn" onClick={() => setHomeTab(t)} style={{ flex: 1, padding: "10px 0", border: "none", borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: "pointer", background: homeTab === t ? C.blue : "transparent", color: homeTab === t ? "#0d0d0c" : C.creamDim }}>{t === "create" ? "Create Room" : "Join Room"}</button>
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
        {joinError && <div style={{ color: C.blue, fontSize: 13, margin: "-8px 0 12px" }}>{joinError}</div>}
        <PrimaryButton onClick={homeTab === "create" ? createRoom : joinRoom}>{homeTab === "create" ? <>Create New Room <ArrowRight size={16} /></> : <>Join Existing Room <ArrowRight size={16} /></>}</PrimaryButton>
      </Card>
      <p style={{ fontSize: 11, color: C.creamDim, textAlign: "center", marginTop: 26, lineHeight: 1.6, opacity: 0.8 }}>Built By MilkyMamba</p>
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
        <div style={{ fontFamily: serif, fontSize: 42, fontWeight: 700, letterSpacing: "0.15em", color: C.blue, textAlign: "center", padding: "14px 0" }}>{room.code}</div>
        <div style={{ fontSize: 12, color: C.creamDim, textAlign: "center", marginBottom: 18 }}>Share this code — friends tap "Join Room" and enter it</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {room.players.map(p => (
            <PlayerRow key={p.id} player={p} points={room.scores[p.id]} badge={p.id === room.hostId ? "Host" : null} isMe={p.id === me.id} />
          ))}
        </div>
        <div style={{ fontSize: 12, color: C.creamDim, textAlign: "center", marginTop: 14 }}>{room.players.length} player{room.players.length !== 1 ? "s" : ""} in room {canStart ? "" : "· need at least 3 to start"}</div>
      </Card>
      {isHost ? (
        <Card>
          <label style={labelStyle}>Categories in play</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
            {CAT_KEYS.map(k => (
              <div key={k} onClick={() => toggleCat(k)} style={{ border: `1px solid ${selectedCats.has(k) ? C.blue : C.line}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer", fontSize: 13, background: selectedCats.has(k) ? "rgba(85,136,201,0.14)" : "rgba(0,0,0,0.2)" }}>{CATEGORIES[k].icon} {CATEGORIES[k].label}</div>
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

/* ---------------- Turn panel (side) ---------------- */
function TurnPanel({ room, imDone, toggleEndVote, openMode }) {
  const asker = room.players.find(p => p.id === room.currentAsker);
  const target = room.players.find(p => p.id === room.currentTarget);
  const endCount = Object.keys(room.endVotes || {}).length;
  const endMajority = Math.floor(room.players.length / 2) + 1;
  const iVotedEnd = !!(room.endVotes || {})[room.__meId];
  const iAmAsker = room.__meId === room.currentAsker;
  return (
    <Card>
      <Eyebrow>Turn</Eyebrow>
      {openMode ? (
        <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
          <Radio size={22} color={C.blueSoft} />
          <div style={{ fontSize: 13, color: C.creamDim, marginTop: 8 }}>Open questioning — anyone can ask anyone.</div>
        </div>
      ) : (
        <>
          <div className="turn-card" style={{ marginBottom: 18 }}>
            <div className="turn-side">
              <Avatar name={asker?.name} size={54} ring={C.blue} />
              <span className="name" style={{ fontSize: 13, fontWeight: 700, color: C.cream }}>{asker?.name}{iAmAsker ? " (you)" : ""}</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.blue }}>Asking</span>
            </div>
            <ArrowRight size={22} color={C.blueSoft} style={{ flexShrink: 0 }} />
            <div className="turn-side">
              <Avatar name={target?.name} size={54} ring={C.blueSoft} />
              <span className="name" style={{ fontSize: 13, fontWeight: 700, color: C.cream }}>{target?.name}</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.blueSoft }}>Answering</span>
            </div>
          </div>
          {iAmAsker ? (
            <PrimaryButton onClick={imDone}>I'm done — next pair <ArrowRight size={16} /></PrimaryButton>
          ) : (
            <div style={{ textAlign: "center", fontSize: 13, color: C.creamDim, padding: "13px 0", border: `1px dashed ${C.line}`, borderRadius: 12 }}>
              Waiting for <b style={{ color: C.cream }}>{asker?.name}</b> to finish asking…
            </div>
          )}
        </>
      )}
      <div style={{ marginTop: 12 }}>
        <GhostButton onClick={toggleEndVote} active={iVotedEnd}>
          <Sparkles size={15} /> {iVotedEnd ? "Voted to end round" : "Vote to end round"} · {endCount}/{room.players.length} (need {endMajority})
        </GhostButton>
      </div>
    </Card>
  );
}

/* ---------------- Game screen ---------------- */
function GameScreen({ room, me, imDone, toggleEndVote, leaveRoom }) {
  const iAmSpy = room.spyId === me.id;
  const cat = CATEGORIES[room.item.category];
  const openMode = useOpenMode(room.roundStartedAt, room.roundDurationSec);

  const [marks, setMarks] = useState({});
  useEffect(() => { setMarks({}); }, [room.round]);
  function cycleMark(itemName) {
    setMarks(m => { const cur = m[itemName]; const next = cur === "tick" ? "cross" : cur === "cross" ? undefined : "tick"; return { ...m, [itemName]: next }; });
  }
  const roomWithMe = { ...room, __meId: me.id };

  return (
    <>
      <Eyebrow>Round {room.round} · In progress</Eyebrow>
      <Title>{openMode ? "Open questioning" : "Ask around the circle"}</Title>

      {openMode && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(85,136,201,0.14)", border: `1px solid ${C.blue}`, borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
          <Bell size={18} color={C.blue} />
          <span style={{ fontSize: 13, color: C.cream }}><b style={{ color: C.blue }}>Final <CountdownLabel startedAt={room.roundStartedAt} durationSec={room.roundDurationSec} /></b> — anyone can ask anyone now!</span>
        </div>
      )}

      <div className="game-grid">
        <div>
          <Card style={{ textAlign: "center", padding: "26px 20px", background: iAmSpy ? `linear-gradient(180deg, rgba(85,136,201,0.16), ${C.panel2})` : `linear-gradient(180deg, rgba(147,183,222,0.12), ${C.panel2})`, borderColor: iAmSpy ? "rgba(85,136,201,0.5)" : "rgba(147,183,222,0.4)" }}>
            {iAmSpy ? (
              <>
                <div style={{ width: 66, height: 66, borderRadius: 16, margin: "0 auto 12px", background: C.blue, display: "flex", alignItems: "center", justifyContent: "center" }}><Eye size={26} color="#0d0d0c" /></div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>You're the Spy</div>
                <div style={{ color: C.creamDim, fontSize: 13, marginBottom: 16 }}>Category: <b style={{ color: C.cream }}>{cat.label}</b>. Tap items to mark them in or out.</div>
                <div className="chip-grid" style={{ justifyContent: "center" }}>
                  {cat.items.map(it => {
                    const mark = marks[it];
                    return (
                      <div key={it} onClick={() => cycleMark(it)} className="press-btn" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 11px", borderRadius: 999, cursor: "pointer", background: mark === "tick" ? "rgba(85,136,201,0.22)" : mark === "cross" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.22)", border: `1px solid ${mark === "tick" ? C.blue : mark === "cross" ? C.creamDim : C.line}` }}>
                        {mark === "tick" && <Check size={13} color={C.blue} />}
                        {mark === "cross" && <X size={13} color={C.creamDim} />}
                        <span style={{ fontSize: 12.5, color: mark === "cross" ? C.creamDim : C.cream, textDecoration: mark === "cross" ? "line-through" : "none" }}>{it}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div style={{ width: 66, height: 66, borderRadius: 16, margin: "0 auto 12px", background: C.blueSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{cat.icon}</div>
                <Eyebrow>{cat.label}</Eyebrow>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{room.item.name}</div>
                <Sub>One player at the table doesn't know this. Ask questions that prove you know it — without saying it outright.</Sub>
              </>
            )}
          </Card>
        </div>

        <div>
          <TurnPanel room={roomWithMe} imDone={imDone} toggleEndVote={toggleEndVote} openMode={openMode} />
          <Card>
            <Eyebrow>Table</Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {room.players.map(p => (
                <PlayerRow key={p.id} player={p} points={room.scores[p.id]}
                  badge={!openMode && p.id === room.currentAsker ? "Asking" : !openMode && p.id === room.currentTarget ? "Answering" : null}
                  badgeColor={p.id === room.currentAsker ? C.blue : C.blueSoft}
                  highlight={!openMode && (p.id === room.currentAsker || p.id === room.currentTarget)}
                  isMe={p.id === me.id} />
              ))}
            </div>
          </Card>
        </div>
      </div>
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
            <PlayerRow key={p.id} player={p} points={room.scores[p.id]} onClick={() => castVote(p.id)} highlight={myVote === p.id}
              badge={myVote === p.id ? "Your guess" : null} badgeColor={C.blue} isMe={p.id === me.id} />
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 13, color: C.creamDim }}>{totalVoted < room.players.length ? `Waiting on ${room.players.length - totalVoted} more vote${room.players.length - totalVoted !== 1 ? "s" : ""}…` : "Everyone's voted — revealing…"}</div>
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
        <div className="chip-grid">
          {cat.items.map(it => (
            <div key={it} onClick={() => spySubmitGuess(it)} className="press-btn" style={{ padding: "9px 13px", borderRadius: 999, border: `1px solid ${C.line}`, cursor: "pointer", background: "rgba(0,0,0,0.22)", fontSize: 13 }}>{it}</div>
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
      <div className="game-grid">
        <div>
          <Card style={{ textAlign: "center", padding: "26px 20px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><Avatar name={spyName} size={60} /></div>
            <div style={{ fontSize: 21, fontWeight: 700, color: C.blue, margin: "4px 0" }}>{spyName} was the spy</div>
            <Eyebrow>{cat.label}</Eyebrow>
            <div style={{ fontSize: 21, fontWeight: 700, color: C.blueSoft, margin: "4px 0" }}>{room.item.name}</div>
            <div style={{ fontSize: 14, margin: "14px 0 0", padding: 10, borderRadius: 10, background: "rgba(85,136,201,0.14)", color: C.cream }}>
              {majorityCaught
                ? `Majority caught the spy (${correctVoters.length}/${crew.length} crew guessed right)${room.spyGuessCorrect ? " — but the spy named the item correctly for +1." : room.spyGuessCorrect === false ? " — and the spy's guess was wrong." : "."}`
                : `The spy evaded a majority (${correctVoters.length}/${crew.length} crew guessed right) — spy earns +2.`}
            </div>
          </Card>
          {isHost ? <PrimaryButton onClick={playAgain}>Play another round <ArrowRight size={16} /></PrimaryButton> : <Card><Sub>Waiting for the host to start the next round…</Sub></Card>}
          <div style={{ marginTop: 10 }}><GhostButton onClick={leaveRoom}><LogOut size={15} /> Leave room</GhostButton></div>
        </div>
        <div>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Trophy size={16} color={C.blue} /><b style={{ fontFamily: serif, fontSize: 17 }}>Standings</b></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {standings.map((p, i) => (
                <PlayerRow key={p.id} player={p} points={room.scores[p.id]} highlight={i === 0} badge={i === 0 ? "1st" : null} isMe={p.id === me.id} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
