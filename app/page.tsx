"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
const dashboardSections = [
  { id: "overview", label: "Overview", icon: "◫" },
  { id: "investigate", label: "Account screening", icon: "⌕" },
  { id: "events", label: "On-chain events", icon: "◷" },
];

type Signal = { id?: string; label: string; value?: string | number; severity?: string; points?: number; explanation?: string; source?: string; observed_at?: string; window?: string };
type RiskResult = {
  address: string;
  score: number;
  risk_level: string;
  threshold: number;
  threshold_exceeded: boolean;
  signals: Signal[];
  metrics: { operations_scanned: number; operations_in_window: number; transfers_in_window: number; transfer_volume_xlm: number; distinct_counterparties: number; account_sequence: number; native_xlm_balance: number; window_days: number };
  source: { horizon_url: string; network: string };
  as_of: string;
};
type SentinelEvent = { id: string; ledger: number; created_at: string; agent: string; subject: string; score: number; contract_id: string; transaction_hash?: string; tx_hash?: string };
type EventPage = { events: SentinelEvent[]; next_cursor: string | null; source?: { rpc_url: string; network: string } };
type EventRetry = { next?: string; append: boolean };
type NetworkStatus = { network: string; rpc_url: string; status: string; latest_ledger: number | null; oldest_ledger: number | null; observed_at: string };

class ApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try { const body = await response.json(); detail = body.detail || body.message || detail; } catch { /* response was not JSON */ }
    throw new ApiError(detail, response.status);
  }
  return response.json() as Promise<T>;
}

function Mark() {
  return <span className="mark" aria-hidden="true"><svg viewBox="0 0 36 36" fill="none"><path d="M18 2.8 21.8 14l11.4 4-11.4 4L18 33.2 14.2 22 2.8 18l11.4-4L18 2.8Z"/><circle cx="18" cy="18" r="3.2"/></svg></span>;
}

function shortAddress(address: string) { return address.length > 18 ? `${address.slice(0, 8)}…${address.slice(-6)}` : address; }
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}
function formatXlm(value: number) { return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value); }
function networkName(passphrase?: string) {
  if (!passphrase) return "Stellar network";
  if (passphrase.includes("Test SDF Network")) return "Testnet";
  if (passphrase.includes("Public Global Stellar Network")) return "Public network";
  return passphrase;
}

function downloadEventsCsv(events: SentinelEvent[]) {
  const rows = [
    ["event_id", "ledger", "created_at", "agent", "account", "score", "contract_id"],
    ...events.map((event) => [event.id, event.ledger, event.created_at, event.agent, event.subject, event.score, event.contract_id]),
  ];
  const csv = rows.map((row) => row.map((value) => {
    const text = String(value ?? "");
    const safeText = typeof value === "string" && /^[\t\r ]*[=+@-]/.test(text) ? `'${text}` : text;
    return `"${safeText.replaceAll('"', '""')}"`;
  }).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `stellar-sentinel-events-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function explorerUrl(network: string | undefined, type: "account" | "contract" | "tx", value: string) {
  const normalized = network?.toLowerCase() || "";
  const networkPath = normalized.includes("testnet") || normalized.includes("test sdf network")
    ? "testnet"
    : normalized.includes("public") ? "public" : null;
  return networkPath && value ? `https://stellar.expert/explorer/${networkPath}/${type}/${encodeURIComponent(value)}` : null;
}

function ExplorerLink({ network, type, value, label, accessibleLabel }: { network?: string; type: "account" | "contract" | "tx"; value: string; label: string; accessibleLabel: string }) {
  const href = explorerUrl(network, type, value);
  return href
    ? <a className="mono explorer-link" href={href} target="_blank" rel="noopener noreferrer" aria-label={accessibleLabel}>{label} ↗</a>
    : <span className="mono">{label}</span>;
}

export default function HomePage() {
  const [address, setAddress] = useState("");
  const [risk, setRisk] = useState<RiskResult | null>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<RiskResult[]>([]);
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState("");
  const [signalSeverity, setSignalSeverity] = useState("all");
  const [addressCopyStatus, setAddressCopyStatus] = useState("");
  const [events, setEvents] = useState<SentinelEvent[]>([]);
  const [eventSearch, setEventSearch] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const [eventsRetry, setEventsRetry] = useState<EventRetry | null>(null);
  const [eventsNetwork, setEventsNetwork] = useState("");
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [network, setNetwork] = useState<NetworkStatus | null>(null);
  const [networkLoading, setNetworkLoading] = useState(true);
  const [networkError, setNetworkError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const networkRequestActive = useRef(false);

  useEffect(() => {
    const sections = dashboardSections
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: "-90px 0px -65% 0px", threshold: [0, 0.15, 0.4] });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const loadNetworkStatus = useCallback(async () => {
    if (networkRequestActive.current) return;
    networkRequestActive.current = true;
    setNetworkLoading(true);
    setNetworkError("");
    try {
      const status = await api<NetworkStatus>("/network/status");
      setNetwork(status);
    } catch (error) {
      setNetworkError(error instanceof Error ? error.message : "Could not retrieve Stellar RPC status.");
    } finally {
      networkRequestActive.current = false;
      setNetworkLoading(false);
    }
  }, []);

  const loadEvents = useCallback(async (next?: string, append = false) => {
    setEventsLoading(true);
    setEventsError("");
    setEventsRetry(null);
    try {
      const query = new URLSearchParams({ limit: "20" });
      if (next) query.set("cursor", next);
      const page = await api<EventPage>(`/events?${query.toString()}`);
      setEvents((current) => append ? [...current, ...page.events] : page.events);
      setCursor(page.next_cursor);
      if (page.source?.network) setEventsNetwork(page.source.network);
      setApiOnline(true);
    } catch (error) {
      setEventsError(error instanceof Error ? error.message : "Could not load event feed.");
      setEventsRetry({ next, append });
      setApiOnline(error instanceof ApiError ? true : false);
    } finally { setEventsLoading(false); }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadEvents(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadEvents]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void loadNetworkStatus();
    };

    refreshWhenVisible();
    const timer = window.setInterval(refreshWhenVisible, 30_000);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [loadNetworkStatus]);

  function refreshDashboard() {
    void Promise.all([loadNetworkStatus(), loadEvents()]);
  }

  async function analyzeAccount(value: string) {
    const account = value.trim();
    if (!account) return;
    setRiskLoading(true); setRiskError("");
    try {
      const result = await api<RiskResult>("/risk/score", { method: "POST", body: JSON.stringify({ address: account }) });
      setRisk(result); setApiOnline(true);
      setAssessmentHistory((current) => [result, ...current.filter((item) => item.address !== result.address)].slice(0, 5));
    } catch (error) {
      setRiskError(error instanceof Error ? error.message : "Could not assess this account.");
      setApiOnline(error instanceof ApiError ? true : false);
    } finally { setRiskLoading(false); }
  }

  async function submitRisk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await analyzeAccount(address);
  }

  function investigateEvent(account: string) {
    setAddress(account);
    setActiveSection("investigate");
    document.getElementById("investigate")?.scrollIntoView({ behavior: "smooth", block: "start" });
    void analyzeAccount(account);
  }

  async function copyRiskAddress() {
    if (!risk) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(risk.address);
      } else {
        const input = document.createElement("textarea");
        input.value = risk.address;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.append(input);
        input.select();
        const copied = document.execCommand("copy");
        input.remove();
        if (!copied) throw new Error("Clipboard access is unavailable.");
      }
      setAddressCopyStatus("Address copied");
    } catch {
      setAddressCopyStatus("Could not copy address");
    }
    window.setTimeout(() => setAddressCopyStatus(""), 2000);
  }

  function restoreAssessment(result: RiskResult) {
    setAddress(result.address);
    setRisk(result);
    setRiskError("");
    setActiveSection("investigate");
    document.getElementById("investigate")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const scoreTone = risk?.threshold_exceeded ? "high" : risk?.risk_level === "elevated" ? "medium" : "low";
  const rpcHealthy = network?.status.toLowerCase() === "healthy";
  const rpcLabel = network?.status || "unknown";
  const currentNetwork = networkName(network?.network);
  const normalizedEventSearch = eventSearch.trim().toLowerCase();
  const visibleEvents = events.filter((item) =>
    `${item.subject} ${item.agent} ${item.contract_id} ${item.transaction_hash ?? item.tx_hash ?? ""}`.toLowerCase().includes(normalizedEventSearch),
  );
  const visibleSignals = (risk?.signals ?? []).filter((signal) =>
    signalSeverity === "all" || (signal.severity || "info").toLowerCase() === signalSeverity,
  );

  function sectionNavigation(className: string, label: string) {
    return <nav className={className} aria-label={label}>
      {dashboardSections.map((section) => <a
        key={section.id}
        className={activeSection === section.id ? "active" : ""}
        href={`#${section.id}`}
        aria-current={activeSection === section.id ? "location" : undefined}
        onClick={() => setActiveSection(section.id)}
      ><span className="nav-icon" aria-hidden="true">{section.icon}</span><span>{section.label}</span></a>)}
    </nav>;
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <a className="brand" href="#overview"><Mark/><span>Stellar <b>Sentinel</b></span></a>
        <div className="workspace-label">WORKSPACE</div>
        {sectionNavigation("side-nav", "Dashboard")}
        <div className="sidebar-bottom"><div className={`network-box ${networkError || (network && !rpcHealthy) ? "network-warning" : ""}`}><span className={`network-dot ${networkLoading ? "pending" : networkError || !rpcHealthy ? "offline" : ""}`}/><div><b>{networkLoading ? "Checking RPC…" : networkError ? "RPC status unavailable" : `${currentNetwork} · RPC ${rpcLabel}`}</b><small>{networkError ? networkError : network?.latest_ledger != null ? `Latest ledger ${network.latest_ledger.toLocaleString()}` : "Waiting for latest ledger"}</small>{networkError && <button className="network-retry" onClick={() => void loadNetworkStatus()}>Retry status check</button>}</div></div><div className="sidebar-note">Risk intelligence for open finance</div></div>
      </aside>

      <section className="main-area">
        <header className="topbar"><div className="mobile-brand"><Mark/> Stellar Sentinel</div><div className="breadcrumb">Monitoring <span>/</span> Overview</div><div className="header-statuses"><button className={`network-pill ${networkError || (network && !rpcHealthy) ? "unhealthy" : ""}`} onClick={() => void loadNetworkStatus()} disabled={networkLoading} title={networkError || `Last RPC health check ${network?.observed_at ? formatDate(network.observed_at) : "pending"}`}><i className={networkLoading ? "pending" : networkError || !rpcHealthy ? "offline" : ""}/>{networkLoading ? "Checking Stellar RPC…" : networkError ? "RPC status unavailable · Retry" : `${currentNetwork} · RPC ${rpcLabel}`}{network?.latest_ledger != null && <span className="header-ledger">Ledger {network.latest_ledger.toLocaleString()}</span>}</button><div className="top-status"><span className={`status-dot ${apiOnline === false ? "offline" : ""}`}/>{apiOnline === null ? "Connecting to API" : apiOnline ? "API connected" : "API unavailable"}</div><button className="icon-button dashboard-refresh" type="button" onClick={refreshDashboard} disabled={networkLoading || eventsLoading} aria-label="Refresh dashboard data" title="Refresh network and event data">↻</button></div></header>
        <div className="content">
          <div className="page-heading" id="overview"><div><div className="eyebrow">{currentNetwork.toUpperCase()} · ACCOUNT INTELLIGENCE</div><h1>Monitoring overview</h1><p>Screen Stellar accounts, review activity signals, and inspect contract flag events.</p></div><span className="network-pill static-pill"><i/> Horizon · {currentNetwork}</span></div>

          <section className="screening-card" id="investigate" aria-labelledby="screening-title">
            <div className="screening-copy"><div className="section-icon">⌕</div><div><h2 id="screening-title">Screen an account</h2><p>Assess recent Stellar account activity and understand the signals behind its risk score.</p></div></div>
            <form className="lookup-form" onSubmit={submitRisk}><label className="sr-only" htmlFor="stellar-address">Stellar account address</label><input id="stellar-address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Paste a Stellar account address (G…)" autoComplete="off" spellCheck={false}/><button type="submit" disabled={riskLoading || !address.trim()}>{riskLoading ? <><span className="spinner"/> Analyzing</> : <>Analyze account <span>→</span></>}</button></form>
            {assessmentHistory.length > 1 && <div className="assessment-history"><span>Recent screens</span>{assessmentHistory.map((item) => <button key={item.address} type="button" disabled={riskLoading} aria-label={`Show saved assessment for ${item.address}`} onClick={() => restoreAssessment(item)}>{shortAddress(item.address)}</button>)}</div>}
            <div className="form-hint"><span>◎</span> Account activity is retrieved from Stellar Horizon. Scores are signals for review, not financial or compliance advice.</div>
            {riskError && <div className="notice error" role="alert"><b>Could not analyze account</b><span>{riskError}</span><small>Check the address and confirm the backend is available at {API_BASE}.</small>{risk && <small>The last successful assessment remains visible below.</small>}</div>}
          </section>

          {risk && <section className="result-section" aria-live="polite">
            <div className="result-title"><div><div className="eyebrow">ACCOUNT ASSESSMENT</div><h2><ExplorerLink network={risk.source.network} type="account" value={risk.address} label={shortAddress(risk.address)} accessibleLabel={`View account ${risk.address} on Stellar Expert`}/></h2><button className="copy-address" type="button" onClick={() => void copyRiskAddress()}>Copy full address</button><span className="sr-only" role="status" aria-live="polite">{addressCopyStatus}</span></div><span className={`risk-badge ${scoreTone}`}>{risk.threshold_exceeded ? "Review threshold exceeded" : `${risk.risk_level} risk signal`}</span></div>
            <div className="result-grid">
<article className="score-card panel"><div className="card-label">RISK SCORE <span>OUT OF 100</span></div><div className={`score-value ${scoreTone}`}>{risk.score}<small>/100</small></div><div className="score-meter" role="meter" aria-label="Risk score compared with review threshold" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.max(0, Math.min(100, risk.score))} aria-valuetext={`Score ${risk.score} of 100; review threshold ${risk.threshold}`}><i className={scoreTone} style={{ width: `${Math.max(0, Math.min(100, risk.score))}%` }}/><b className="score-threshold-marker" aria-hidden="true" style={{ left: `${Math.max(0, Math.min(100, risk.threshold))}%` }} title={`Review threshold: ${risk.threshold}`}/></div><p>{risk.threshold_exceeded ? `Score meets or exceeds the review threshold of ${risk.threshold}.` : `Review threshold: ${risk.threshold}.`}</p><small className="muted">Evaluated {formatDate(risk.as_of)}</small></article>
              <article className="activity-card panel"><div className="card-label">OBSERVED ACCOUNT ACTIVITY <span>{risk.source.network}</span></div><div className="activity-stats"><div><strong>{risk.metrics.operations_scanned.toLocaleString()}</strong><small>Operations scanned</small></div><div><strong>{risk.metrics.operations_in_window.toLocaleString()}</strong><small>Operations in window</small></div><div><strong>{risk.metrics.transfers_in_window.toLocaleString()}</strong><small>Transfers in window</small></div><div><strong>{formatXlm(risk.metrics.transfer_volume_xlm)} <em>XLM</em></strong><small>Transfer volume</small></div><div><strong>{risk.metrics.distinct_counterparties.toLocaleString()}</strong><small>Counterparties</small></div><div><strong>{risk.metrics.account_sequence.toLocaleString()}</strong><small>Account sequence</small></div><div><strong>{formatXlm(risk.metrics.native_xlm_balance)} <em>XLM</em></strong><small>Current balance</small></div></div><div className="data-source"><span className="source-check">✓</span> Activity sourced from <a href={risk.source.horizon_url} target="_blank" rel="noreferrer">Stellar Horizon ↗</a> · last {risk.metrics.window_days} days</div></article>
            </div>
            <div className="signals-card panel"><div className="panel-heading"><div><h3>Signals behind this assessment</h3><p>Review the activity context used to produce this score.</p></div><div className="signal-filter"><label htmlFor="signal-severity">Severity</label><select id="signal-severity" value={signalSeverity} onChange={(event) => setSignalSeverity(event.target.value)}><option value="all">All</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option><option value="info">Info</option></select><span className="count-pill">{visibleSignals.length} / {risk.signals.length}</span></div></div>
              {visibleSignals.length ? <div className="table-scroll"><table><thead><tr><th>Signal</th><th>Observation</th><th>Severity</th><th>Points</th><th>Why it matters</th><th>Window</th></tr></thead><tbody>{visibleSignals.map((signal, index) => <tr key={signal.id ?? `${signal.label}-${index}`}><td className="signal-name"><span className={`severity-dot ${(signal.severity || "").toLowerCase()}`}/>{signal.label}</td><td>{signal.value ?? "—"}</td><td><span className={`severity-tag ${(signal.severity || "info").toLowerCase()}`}>{signal.severity || "Info"}</span></td><td>{signal.points ?? 0}</td><td className="signal-explanation">{signal.explanation || signal.source || "Observed account activity"}</td><td>{signal.window || "Recent activity"}</td></tr>)}</tbody></table></div> : <div className="empty-inline">{risk.signals.length ? "No signals match this severity." : "No notable signals were returned for this assessment."}</div>}
            </div>
          </section>}

          <section className="events-section" id="events">
            <div className="panel-heading events-heading"><div><div className="eyebrow">SOROBAN CONTRACT ACTIVITY</div><h2>Flag events</h2><p>Threshold alerts recorded by the Stellar Sentinel contract.</p></div><div className="event-actions"><button className="secondary-button" type="button" onClick={() => downloadEventsCsv(events)} disabled={events.length === 0}>Export CSV</button><button className="icon-button" onClick={() => void loadEvents()} disabled={eventsLoading} aria-label="Refresh events">↻</button></div></div>
            {eventsNetwork && <p className="events-network-label">Source network: {networkName(eventsNetwork)}</p>}
            <div className="events-panel panel">
              {eventsLoading && events.length === 0 ? <div className="state-message"><span className="spinner dark"/><b>Loading contract events</b><span>Checking the connected Soroban event source…</span></div> : eventsError && events.length === 0 ? <div className="state-message"><span className="state-icon warning">!</span><b>Event feed unavailable</b><span>{eventsError}</span><small>Configure the contract and Soroban RPC in the backend to enable this feed.</small><button className="secondary-button" onClick={() => void loadEvents(eventsRetry?.next, eventsRetry?.append ?? false)}>Try again</button></div> : events.length === 0 ? <div className="state-message"><span className="state-icon">◷</span><b>No flag events yet</b><span>The connected contract has not returned any events.</span></div> : <>
                <label className="event-search"><span className="sr-only">Search loaded events by account or agent</span><input value={eventSearch} onChange={(event) => setEventSearch(event.target.value)} placeholder="Filter loaded events by account or agent"/></label>
                {visibleEvents.length > 0 ? <div className="table-scroll"><table><thead><tr><th>ACCOUNT</th><th>SCORE</th><th>AGENT</th><th>CONTRACT</th><th>LEDGER</th><th>RECORDED</th>{events.some((item) => item.transaction_hash || item.tx_hash) && <th>TRANSACTION</th>}</tr></thead><tbody>{visibleEvents.map((item) => { const transactionHash = item.transaction_hash || item.tx_hash; return <tr key={item.id}><td className="signal-name"><span className="severity-dot high"/><ExplorerLink network={network?.network} type="account" value={item.subject} label={shortAddress(item.subject)} accessibleLabel={`View subject account ${item.subject} on Stellar Expert`}/><button className="event-investigate" type="button" disabled={riskLoading} aria-label={`Analyze account ${item.subject}`} onClick={() => investigateEvent(item.subject)}>Analyze</button></td><td><span className="event-score">{item.score}</span></td><td><ExplorerLink network={network?.network} type="account" value={item.agent} label={shortAddress(item.agent)} accessibleLabel={`View agent account ${item.agent} on Stellar Expert`}/></td><td><ExplorerLink network={network?.network} type="contract" value={item.contract_id} label={shortAddress(item.contract_id)} accessibleLabel={`View contract ${item.contract_id} on Stellar Expert`}/></td><td className="mono">{item.ledger.toLocaleString()}</td><td>{formatDate(item.created_at)}</td>{events.some((event) => event.transaction_hash || event.tx_hash) && <td>{transactionHash ? <ExplorerLink network={network?.network} type="tx" value={transactionHash} label={shortAddress(transactionHash)} accessibleLabel={`View transaction ${transactionHash} on Stellar Expert`}/> : <span className="mono">—</span>}</td>}</tr>; })}</tbody></table></div> : <div className="empty-inline event-search-empty">No loaded events match this account or agent.</div>}
                {eventsError ? <div className="load-more load-more-error" role="alert"><span>{eventsError}</span><button className="secondary-button" disabled={eventsLoading} onClick={() => void loadEvents(eventsRetry?.next, eventsRetry?.append ?? false)}>{eventsLoading ? "Retrying…" : eventsRetry?.append ? "Retry loading older events" : "Retry refresh"}</button></div> : cursor && <div className="load-more"><button className="secondary-button" disabled={eventsLoading} onClick={() => void loadEvents(cursor, true)}>{eventsLoading ? "Loading…" : "Load older events"}</button></div>}
              </>}
            </div>
          </section>
          <footer className="page-footer"><span>Stellar Sentinel</span><span>Risk signals support informed review; they are not definitive findings.</span><a href={`${API_BASE}/docs`} target="_blank" rel="noreferrer">API documentation ↗</a></footer>
        </div>
      </section>
      {sectionNavigation("mobile-nav", "Mobile dashboard")}
    </main>
  );
}
