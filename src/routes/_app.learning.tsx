import { createFileRoute } from "@tanstack/react-router";
import { useGlobal } from "@/context/GlobalContext";
import { useState } from "react";
import { FAN_HEADERS } from "@/utils/fanText";
import { Trash2, Brain, CheckCircle, XCircle, FileText, Download, Trophy, Target, Zap } from "lucide-react";

export const Route = createFileRoute("/_app/learning")({
  head: () => ({ meta: [{ title: "Post-Race Learning – RaceIQ" }] }),
  component: LearningPage,
});

const CATS = ["TIRE", "WEATHER", "RIVAL", "FUEL", "SAFETY_CAR"] as const;
const CAT_COLOR: Record<string, string> = {
  TIRE: "#F5A623", WEATHER: "#0071E3", RIVAL: "#E3001E",
  FUEL: "#F5A623", SAFETY_CAR: "#8F8F8F"
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ||
  "https://xff7vmjz3h.execute-api.eu-north-1.amazonaws.com";

// ── Convert markdown → beautiful styled HTML for PDF ─────────────────────────
function markdownToHTML(md: string, race: string): string {
  const body = md
    .replace(/^#### (.*)/gm, "<h4>$1</h4>")
    .replace(/^### (.*)/gm, "<h3>$1</h3>")
    .replace(/^## (.*)/gm, '<h2>$1</h2>')
    .replace(/^# (.*)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/^---$/gm, "<hr>")
    .replace(/^\| (.+) \|$/gm, (row) => {
      const cells = row.split("|").filter((c) => c.trim() && !c.match(/^[-\s:]+$/));
      if (!cells.length) return "";
      return `<tr>${cells.map((c) => `<td>${c.trim()}</td>`).join("")}</tr>`;
    })
    .replace(/(<tr>.*?<\/tr>\n?)+/gs, (rows) => `<table>${rows}</table>`)
    .replace(/^\d+\. (.*)/gm, "<li>$1</li>")
    .replace(/(<li>.*?<\/li>\n?)+/gs, (items) => `<ol>${items}</ol>`)
    .replace(/^- (.*)/gm, "<li>$1</li>")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RaceIQ Report — ${race}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      max-width: 860px; margin: 0 auto; padding: 0 0 48px;
      color: #0F1012; line-height: 1.65; font-size: 14px;
      background: #fff;
    }
    /* Header */
    .report-header {
      background: linear-gradient(135deg, #0F1012 0%, #1a1d21 100%);
      color: #FDFDFD; padding: 28px 36px 24px;
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 0;
    }
    .report-header .logo {
      font-size: 26px; font-weight: 700; letter-spacing: -0.03em;
    }
    .report-header .logo span { color: #E3001E; }
    .report-header .subtitle { font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 3px; }
    .report-header .badge {
      background: #0071E3; color: #fff;
      padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;
      letter-spacing: 0.02em;
    }
    /* Red accent bar */
    .accent-bar { height: 4px; background: linear-gradient(90deg, #E3001E, #0071E3); }
    /* Content padding */
    .content { padding: 32px 36px; }
    /* Typography */
    h1 {
      font-size: 24px; font-weight: 300; letter-spacing: -0.02em;
      color: #E3001E; border-bottom: 2px solid #E3001E;
      padding-bottom: 10px; margin: 28px 0 14px;
    }
    h2 {
      font-size: 16px; font-weight: 700; color: #0071E3;
      margin: 24px 0 10px; padding: 8px 14px;
      background: rgba(0,113,227,0.05);
      border-left: 3px solid #0071E3; border-radius: 0 6px 6px 0;
    }
    h3 { font-size: 14px; font-weight: 600; margin: 18px 0 8px; color: #0F1012; }
    h4 { font-size: 12px; font-weight: 600; margin: 14px 0 6px; color: #8F8F8F; text-transform: uppercase; letter-spacing: 0.05em; }
    p { margin: 10px 0; color: #3a3d42; }
    /* Tables */
    table {
      border-collapse: collapse; width: 100%; margin: 16px 0;
      font-size: 13px; border-radius: 8px; overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    th {
      background: #0F1012; color: #FDFDFD;
      padding: 10px 16px; text-align: left; font-weight: 600; font-size: 12px;
      letter-spacing: 0.04em; text-transform: uppercase;
    }
    td { padding: 9px 16px; border-bottom: 1px solid #F0F0F2; }
    tr:nth-child(even) td { background: #FAFAFA; }
    tr:last-child td { border-bottom: none; }
    /* Code */
    code {
      background: #F5F5F7; padding: 2px 7px; border-radius: 4px;
      font-family: "SF Mono", "Cascadia Code", Monaco, monospace;
      font-size: 12px; color: #E3001E;
    }
    /* Lists */
    ol, ul { padding-left: 22px; margin: 10px 0; }
    li { margin: 5px 0; color: #3a3d42; }
    /* HR */
    hr { border: none; border-top: 1px solid #E5E5E7; margin: 24px 0; }
    /* Emphasis */
    strong { font-weight: 700; color: #0F1012; }
    em { font-style: italic; color: #6E6E73; }
    /* Stats bar */
    .stats-bar {
      display: flex; gap: 0; margin: 0 0 24px;
      border: 1px solid #E5E5E7; border-radius: 10px; overflow: hidden;
    }
    .stat {
      flex: 1; padding: 14px 16px; text-align: center;
      border-right: 1px solid #E5E5E7;
    }
    .stat:last-child { border-right: none; }
    .stat-val { font-size: 22px; font-weight: 300; color: #0F1012; letter-spacing: -0.02em; }
    .stat-label { font-size: 10px; color: #8F8F8F; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 3px; }
    /* Footer */
    .report-footer {
      margin: 0 36px; padding: 16px 0 0;
      border-top: 1px solid #E5E5E7;
      display: flex; justify-content: space-between; align-items: center;
      font-size: 11px; color: #8F8F8F;
    }
    .ibm-badge {
      background: linear-gradient(135deg, #0071E3, #0051a3);
      color: #fff; padding: 4px 12px; border-radius: 20px;
      font-size: 11px; font-weight: 600;
    }
    @media print {
      body { max-width: 100%; }
      .report-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .accent-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      h2 { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { margin: 0; size: A4; }
    }
  </style>
</head>
<body>
  <div class="report-header">
    <div>
      <div class="logo">RACE<span>IQ</span></div>
      <div class="subtitle">AI Race Strategy Intelligence Platform</div>
    </div>
    <div class="badge">🔵 IBM Docling + IBM Granite</div>
  </div>
  <div class="accent-bar"></div>
  <div class="content">
    <p>${body}</p>
  </div>
  <div class="report-footer">
    <span>RaceIQ · OpenF1 Live Data · Groq AI · AWS Lambda · Supabase</span>
    <span class="ibm-badge">IBM SkillsBuild AI Builders Challenge</span>
  </div>
</body>
</html>`;
}

function LearningPage() {
  const {
    decisionHistory, updateDecisionOutcome,
    learnedRules, addRule, toggleRule, deleteRule, fanMode
  } = useGlobal();

  const [text, setText] = useState("");
  const [cat, setCat] = useState<string>("TIRE");
  const [race, setRace] = useState("Monaco GP 2024");
  const [circuit, setCircuit] = useState("Monaco");
  const [aiDecision, setAiDecision] = useState("PIT_NOW");
  const [outcome, setOutcome] = useState("");
  const [position, setPosition] = useState("1");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState<any>(null);
  const [error, setError] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportFormat, setReportFormat] = useState<"pdf" | "md">("pdf");

  const validated = decisionHistory.filter(
    (d) => d.outcome === "CORRECT" || d.outcome === "INCORRECT"
  );
  const correct = validated.filter((d) => d.outcome === "CORRECT").length;
  const accuracy = validated.length ? (correct / validated.length) * 100 : 0;

  const exportRules = () => {
    const blob = new Blob([JSON.stringify(learnedRules, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "raceiq-rules.json"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Export as PDF (print dialog) or .md ──────────────────────────────────
  const exportWithDocling = async () => {
    setReportLoading(true);
    setReportSuccess(false);
    try {
      const res = await fetch(`${API_BASE}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          race,
          circuit,
          lap: decisionHistory[0]?.lap || 0,
          decision: decisionHistory[0]?.decision || "N/A",
          lesson,
          rules: learnedRules,
          accuracy: accuracy.toFixed(0),
        }),
      });
      const data = await res.json();
      const reportContent = data.enhanced_report || data.markdown;

      if (reportFormat === "pdf") {
        // Open styled HTML in new tab → print dialog → Save as PDF
        const html = markdownToHTML(reportContent, data.race || race);
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => printWindow.print(), 700);
        }
      } else {
        // Download as .md
        const blob = new Blob([reportContent], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `raceiq-report-${(data.race || race).replace(/ /g, "-")}.md`;
        a.click();
        URL.revokeObjectURL(url);
      }

      setReportSuccess(true);
      setTimeout(() => setReportSuccess(false), 3000);
    } catch (e: any) {
      console.error("Report error:", e.message);
    } finally {
      setReportLoading(false);
    }
  };

  const handleSubmitLesson = async () => {
    if (!outcome.trim()) { setError("Please describe what actually happened."); return; }
    setLoading(true); setError(""); setLesson(null);
    try {
      const res = await fetch(`${API_BASE}/learn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          race, circuit,
          ai_decision: aiDecision,
          actual_outcome: outcome,
          final_position: parseInt(position),
          notes,
        }),
      });
      const data = await res.json();
      setLesson(data);
      if (data.rule_for_future) {
        addRule({
          id: `r-${Date.now()}`,
          text: data.rule_for_future,
          category: "TIRE",
          source: "AI LEARNED",
          active: true,
        });
      }
      const unknown = decisionHistory.find((d) => !d.outcome || d.outcome === "UNKNOWN");
      if (unknown && data.verdict) updateDecisionOutcome(unknown.id, data.verdict);
    } catch (e: any) {
      setError("Failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "32px 32px 80px" }}>
      <div className="eyebrow">{fanMode ? FAN_HEADERS.learning : "POST-RACE LEARNING"}</div>
      <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.025em", marginTop: 4 }}>
        Rules library & accuracy
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginTop: 24 }} className="learn-grid">

        {/* ── LEFT ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Rules Library */}
          <div className="glass" style={{ padding: 24 }}>
            <div className="eyebrow">STRATEGY RULES LIBRARY</div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <input
                className="input-base"
                placeholder="Add a custom rule..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ flex: 1, minWidth: 200 }}
              />
              <select className="input-base" value={cat} onChange={(e) => setCat(e.target.value)} style={{ maxWidth: 160 }}>
                {CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
              <button className="btn-primary" onClick={() => {
                if (!text.trim()) return;
                addRule({ id: `r-${Date.now()}`, text, category: cat, source: "CUSTOM", active: true });
                setText("");
              }}>Add Rule</button>
            </div>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {learnedRules.length === 0 && (
                <div style={{ color: "#8F8F8F", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
                  No rules yet — submit a lesson to auto-generate rules.
                </div>
              )}
              {learnedRules.map((r) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, background: "var(--bg-surface)", borderRadius: 12 }}>
                  <span className="pill" style={{ background: CAT_COLOR[r.category] ?? "#8F8F8F", color: "#FDFDFD", borderColor: "transparent", flexShrink: 0 }}>{r.category}</span>
                  <span style={{ flex: 1, fontSize: 14, opacity: r.active ? 1 : 0.45, lineHeight: 1.4 }}>{r.text}</span>
                  <span style={{ fontSize: 10, color: "#8F8F8F", flexShrink: 0 }}>{r.source}</span>
                  <button onClick={() => toggleRule(r.id)} className="pill" style={{ background: r.active ? "#00A651" : "var(--bg-surface)", color: r.active ? "#FDFDFD" : "#0F1012", borderColor: "transparent", cursor: "pointer", flexShrink: 0 }}>
                    {r.active ? "ON" : "OFF"}
                  </button>
                  <button onClick={() => deleteRule(r.id)} className="btn-ghost" style={{ padding: 8, flexShrink: 0 }}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Post-Race Lesson Form */}
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Brain size={16} color="#0071E3" />
              <div className="eyebrow">SUBMIT POST-RACE LESSON</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: "#8F8F8F", display: "block", marginBottom: 4 }}>RACE</label>
                <input className="input-base" value={race} onChange={(e) => setRace(e.target.value)} style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#8F8F8F", display: "block", marginBottom: 4 }}>CIRCUIT</label>
                <input className="input-base" value={circuit} onChange={(e) => setCircuit(e.target.value)} style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#8F8F8F", display: "block", marginBottom: 4 }}>AI DECISION</label>
                <select className="input-base" value={aiDecision} onChange={(e) => setAiDecision(e.target.value)} style={{ width: "100%" }}>
                  <option>PIT_NOW</option>
                  <option>STAY_OUT</option>
                  <option>PREPARE_TO_PIT</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#8F8F8F", display: "block", marginBottom: 4 }}>FINAL POSITION</label>
                <input className="input-base" type="number" min="1" max="20" value={position} onChange={(e) => setPosition(e.target.value)} style={{ width: "100%" }} />
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <label style={{ fontSize: 11, color: "#8F8F8F", display: "block", marginBottom: 4 }}>WHAT ACTUALLY HAPPENED</label>
              <input className="input-base" placeholder="e.g. Pitted lap 28, came out P2, undercut worked" value={outcome} onChange={(e) => setOutcome(e.target.value)} style={{ width: "100%" }} />
            </div>
            <div style={{ marginTop: 10 }}>
              <label style={{ fontSize: 11, color: "#8F8F8F", display: "block", marginBottom: 4 }}>NOTES (optional)</label>
              <input className="input-base" placeholder="Any extra context for the AI..." value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: "100%" }} />
            </div>
            {error && (
              <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(227,0,30,0.06)", border: "1px solid rgba(227,0,30,0.2)", borderRadius: 10, fontSize: 13, color: "#E3001E" }}>
                {error}
              </div>
            )}
            <button className="btn-primary" onClick={handleSubmitLesson} disabled={loading} style={{ marginTop: 14, width: "100%", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Analyzing with IBM Granite AI..." : "Submit & Learn"}
            </button>

            {lesson && (
              <div style={{ marginTop: 16, padding: 16, background: "rgba(0,113,227,0.04)", border: "1px solid rgba(0,113,227,0.15)", borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <Brain size={14} color="#0071E3" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#0071E3" }}>AI LESSON LEARNED</span>
                  {lesson.verdict === "CORRECT" && <CheckCircle size={14} color="#00A651" />}
                  {lesson.verdict === "INCORRECT" && <XCircle size={14} color="#E3001E" />}
                </div>
                {lesson.verdict && (
                  <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: lesson.verdict === "CORRECT" ? "rgba(0,166,81,0.1)" : "rgba(227,0,30,0.1)", color: lesson.verdict === "CORRECT" ? "#00A651" : "#E3001E", fontWeight: 600 }}>
                    {lesson.verdict} — {lesson.decision_quality}% quality
                  </span>
                )}
                {lesson.lesson && <p style={{ fontSize: 14, margin: "10px 0 6px", lineHeight: 1.5 }}>{lesson.lesson}</p>}
                {lesson.what_worked && <div style={{ fontSize: 13, color: "#00A651", marginBottom: 4 }}>✅ <strong>What worked:</strong> {lesson.what_worked}</div>}
                {lesson.what_failed && <div style={{ fontSize: 13, color: "#E3001E", marginBottom: 4 }}>❌ <strong>What failed:</strong> {lesson.what_failed}</div>}
                {lesson.rule_for_future && (
                  <div style={{ fontSize: 13, padding: "8px 12px", background: "rgba(0,113,227,0.06)", borderRadius: 8, marginTop: 8, fontStyle: "italic" }}>
                    📌 <strong>Rule for future:</strong> {lesson.rule_for_future}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Accuracy */}
          <div className="glass" style={{ padding: 24, textAlign: "center" }}>
            <div className="eyebrow">AI ACCURACY THIS SESSION</div>
            <div className="font-display" style={{ fontSize: validated.length === 0 ? 48 : 72, fontWeight: 400, marginTop: 16, color: accuracy > 70 ? "#00A651" : accuracy >= 50 ? "#F5A623" : "#8F8F8F" }}>
              {validated.length === 0 ? "--" : `${accuracy.toFixed(0)}%`}
            </div>
            <div style={{ fontSize: 13, color: "#8F8F8F", marginTop: 8 }}>
              {validated.length} validated decision{validated.length === 1 ? "" : "s"}
            </div>
            {validated.length > 0 && (
              <div style={{ fontSize: 13, color: accuracy > 70 ? "#00A651" : "#F5A623", marginTop: 4, fontWeight: 500 }}>
                {correct}/{validated.length} correct
              </div>
            )}
            <div style={{ marginTop: 12, height: 6, background: "#F2F2F4", borderRadius: 3 }}>
              <div style={{ width: `${accuracy}%`, height: "100%", borderRadius: 3, background: accuracy > 70 ? "#00A651" : accuracy >= 50 ? "#F5A623" : "#E3001E", transition: "width 0.6s ease" }} />
            </div>

            {/* Quick stats */}
            {decisionHistory.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 16 }}>
                {[
                  { icon: <Trophy size={14} />, label: "Correct", val: correct, color: "#00A651" },
                  { icon: <Target size={14} />, label: "Total", val: validated.length, color: "#0071E3" },
                  { icon: <Zap size={14} />, label: "Rules", val: learnedRules.length, color: "#F5A623" },
                ].map((s) => (
                  <div key={s.label} style={{ padding: "10px 6px", background: "var(--bg-surface)", borderRadius: 10, textAlign: "center" }}>
                    <div style={{ color: s.color, display: "flex", justifyContent: "center", marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: "#8F8F8F", textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Export panel */}
          <div className="glass" style={{ padding: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>EXPORT REPORT</div>

            {/* Format toggle */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {(["pdf", "md"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setReportFormat(fmt)}
                  style={{
                    flex: 1, padding: "7px 0", borderRadius: 8, cursor: "pointer",
                    border: reportFormat === fmt ? "1px solid #0071E3" : "1px solid var(--border)",
                    background: reportFormat === fmt ? "rgba(0,113,227,0.1)" : "transparent",
                    color: reportFormat === fmt ? "#0071E3" : "#8F8F8F",
                    fontSize: 12, fontWeight: 600,
                  }}
                >
                  {fmt === "pdf" ? "📄 PDF" : "📝 Markdown"}
                </button>
              ))}
            </div>

            <button
              onClick={exportWithDocling}
              disabled={reportLoading}
              style={{
                width: "100%", padding: "11px 16px", borderRadius: 10,
                border: "1px solid #0071E3",
                background: reportSuccess
                  ? "rgba(0,166,81,0.1)"
                  : "linear-gradient(135deg, rgba(0,113,227,0.08), rgba(0,113,227,0.04))",
                color: reportSuccess ? "#00A651" : "#0071E3",
                cursor: reportLoading ? "not-allowed" : "pointer",
                fontSize: 13, fontWeight: 600,
                opacity: reportLoading ? 0.6 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s",
              }}
            >
              {reportLoading
                ? <><span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⏳</span> Generating with AI...</>
                : reportSuccess
                  ? "✅ Report Ready!"
                  : <><FileText size={14} /> Generate {reportFormat.toUpperCase()} Report</>
              }
            </button>

            {reportFormat === "pdf" && !reportLoading && (
              <div style={{ fontSize: 11, color: "#8F8F8F", marginTop: 8, textAlign: "center" }}>
                Opens print dialog → select "Save as PDF"
              </div>
            )}

            <button className="btn-ghost" onClick={exportRules} style={{ width: "100%", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Download size={13} /> Export Rules JSON
            </button>

            {/* IBM badge */}
            <div style={{
              marginTop: 14, padding: "8px 12px", borderRadius: 10,
              background: "linear-gradient(135deg, rgba(0,113,227,0.06), rgba(0,113,227,0.02))",
              border: "1px solid rgba(0,113,227,0.15)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 12, color: "#0071E3", fontWeight: 600 }}>🔵 IBM Docling</div>
              <div style={{ fontSize: 11, color: "#8F8F8F", marginTop: 2 }}>Document intelligence by IBM</div>
            </div>
          </div>

          {/* Decision Timeline */}
          <div className="glass" style={{ padding: 24 }}>
            <div className="eyebrow">DECISION TIMELINE</div>
            <div style={{ fontSize: 11, color: "#8F8F8F", marginBottom: 10 }}>
              Click ✓ or ✗ to validate each AI decision
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflowY: "auto" }}>
              {decisionHistory.length === 0 && (
                <div style={{ color: "#8F8F8F", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
                  No decisions yet — use AI Strategy to generate decisions.
                </div>
              )}
              {decisionHistory.map((d) => {
                const isCorrect  = d.outcome === "CORRECT";
                const isIncorrect = d.outcome === "INCORRECT";
                const isUnknown  = !d.outcome || d.outcome === "UNKNOWN";
                return (
                  <div key={d.id} style={{
                    display: "flex", alignItems: "center", gap: 8, fontSize: 13,
                    padding: "8px 10px",
                    background: isCorrect ? "rgba(0,166,81,0.06)" : isIncorrect ? "rgba(227,0,30,0.06)" : "transparent",
                    borderRadius: 8,
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: isCorrect ? "#00A651" : isIncorrect ? "#E3001E" : "#E5E5E7" }} />
                    <span className="font-display" style={{ fontSize: 11, color: "#0071E3", flexShrink: 0 }}>L{d.lap}</span>
                    <span style={{ flex: 1, fontWeight: 500, fontSize: 12 }}>{d.decision}</span>
                    {isUnknown && (
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button onClick={() => updateDecisionOutcome(d.id, "CORRECT")} style={{ padding: "2px 7px", borderRadius: 6, border: "1px solid #00A651", background: "transparent", color: "#00A651", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>✓</button>
                        <button onClick={() => updateDecisionOutcome(d.id, "INCORRECT")} style={{ padding: "2px 7px", borderRadius: 6, border: "1px solid #E3001E", background: "transparent", color: "#E3001E", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>✗</button>
                      </div>
                    )}
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, flexShrink: 0, background: isCorrect ? "rgba(0,166,81,0.12)" : isIncorrect ? "rgba(227,0,30,0.12)" : "rgba(15,16,18,0.06)", color: isCorrect ? "#00A651" : isIncorrect ? "#E3001E" : "#8F8F8F", fontWeight: 600 }}>
                      {d.outcome ?? "PENDING"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:768px){.learn-grid{grid-template-columns:1fr !important;}}
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
