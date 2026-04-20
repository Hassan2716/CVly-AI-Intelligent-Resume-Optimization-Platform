import React, { useState } from 'react';
import { analyzeATS } from '../utils/aiService';

const SAMPLE_JD = `Senior Software Engineer

We're looking for an experienced engineer with expertise in React, TypeScript, Node.js, and cloud infrastructure (AWS). The ideal candidate has experience with microservices, CI/CD pipelines, and Kubernetes. Strong background in Agile methodologies required. Must have proven ability to lead teams and mentor junior developers. Experience with PostgreSQL, Redis, and GraphQL preferred.`;

export default function ATSOptimizer({ resume, showToast }) {
  const [jd, setJD] = useState(SAMPLE_JD);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (!jd.trim()) { showToast('Please paste a job description first', 'error'); return; }
    setLoading(true);
    showToast('🤖 AI analyzing your resume vs. job description...');
    try {
      const analysis = await analyzeATS(resume?.data, jd);
      setResult(analysis);
      showToast('✅ Analysis complete!', 'success');
    } catch (err) {
      showToast(`❌ Analysis failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  const score = result?.overall_score ?? (resume?.score || 0);
  const circ = Math.PI * 2 * 60;
  const offset = circ - (score / 100) * circ;
  const scoreColor = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--amber)' : 'var(--red)';

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* JD Input */}
          <Card title="📋 Paste Job Description">
            <textarea
              value={jd} onChange={e => setJD(e.target.value)}
              style={{
                width: '100%', minHeight: 140, background: 'var(--bg3)',
                border: '1px solid var(--border2)', borderRadius: 8,
                padding: '10px 12px', color: 'var(--text)', fontSize: 13,
                resize: 'vertical', outline: 'none', fontFamily: 'var(--font-body)',
                marginBottom: 10
              }}
              placeholder="Paste the full job description here..."
            />
            <button onClick={analyze} disabled={loading} style={{
              padding: '9px 20px', borderRadius: 8, border: 'none',
              background: loading ? 'var(--bg4)' : 'var(--accent)',
              color: loading ? 'var(--text2)' : 'white',
              fontSize: 13, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8
            }}>
              {loading ? <><Spin /> Analyzing...</> : '⚡ Analyze & Score'}
            </button>
          </Card>

          {/* Issues */}
          {result && (
            <Card title={`🔍 Section Feedback (${result.issues?.length || 0} items)`}>
              {(result.issues || []).map((issue, i) => (
                <IssueItem key={i} issue={issue} />
              ))}
              {!result.issues?.length && (
                <div style={{ color: 'var(--green)', fontSize: 13 }}>✓ No major issues found! Your resume looks great.</div>
              )}
            </Card>
          )}

          {!result && (
            <Card title="📖 ATS Tips">
              {[
                'Use standard section headings: Experience, Education, Skills',
                'Mirror keywords exactly as they appear in the job description',
                'Quantify achievements: "increased revenue by 30%" beats "improved revenue"',
                'Avoid tables, graphics, and complex formatting — ATS can\'t parse them',
                'Include your LinkedIn URL — many ATS systems score this positively',
                'Use a clean, single-column layout for maximum ATS compatibility',
              ].map((tip, i) => (
                <div key={i} style={{
                  padding: '8px 12px', borderRadius: 7, marginBottom: 6, fontSize: 13,
                  background: 'rgba(108,92,231,0.05)', border: '1px solid rgba(108,92,231,0.12)',
                  lineHeight: 1.6
                }}>💡 {tip}</div>
              ))}
            </Card>
          )}
        </div>

        {/* Right: Score */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0 6px' }}>
              {/* Ring */}
              <div style={{ position: 'relative', width: 140, height: 140, marginBottom: 16 }}>
                <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="70" cy="70" r="60" fill="none" stroke="var(--bg4)" strokeWidth="10" />
                  <circle cx="70" cy="70" r="60" fill="none" stroke={scoreColor} strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circ.toFixed(1)}
                    strokeDashoffset={offset.toFixed(1)}
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 38, fontWeight: 800, color: scoreColor, letterSpacing: '-2px', lineHeight: 1 }}>{score}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>/ 100 ATS</div>
                </div>
              </div>

              {result?.summary && (
                <div style={{ fontSize: 12.5, color: 'var(--text2)', textAlign: 'center', lineHeight: 1.6, marginBottom: 14 }}>
                  {result.summary}
                </div>
              )}

              {/* Breakdown */}
              {[
                { label: 'Keywords', val: result?.keyword_score ?? 70, color: 'var(--accent)' },
                { label: 'Formatting', val: result?.format_score ?? 95, color: 'var(--green)' },
                { label: 'Readability', val: result?.readability_score ?? 85, color: 'var(--cyan)' },
                { label: 'Completeness', val: result?.completeness_score ?? 75, color: 'var(--amber)' },
                { label: 'Impact', val: result?.impact_score ?? 80, color: 'var(--pink)' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '5px 0', fontSize: 12.5 }}>
                  <span style={{ flex: 1, color: 'var(--text2)' }}>{row.label}</span>
                  <div style={{ width: 90, height: 4, background: 'var(--bg4)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ width: `${row.val}%`, height: '100%', background: row.color, borderRadius: 10 }} />
                  </div>
                  <span style={{ width: 32, textAlign: 'right', fontWeight: 600, color: row.color }}>{row.val}%</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Keywords */}
          <Card title="🏷️ Keywords">
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, letterSpacing: .5, textTransform: 'uppercase', marginBottom: 7 }}>Matched</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
              {(result?.matched_keywords || ['React', 'TypeScript', 'Node.js', 'AWS', 'PostgreSQL']).map(k => (
                <span key={k} style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11.5, background: 'rgba(0,208,132,0.1)', color: 'var(--green)', border: '1px solid rgba(0,208,132,0.2)' }}>{k}</span>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, letterSpacing: .5, textTransform: 'uppercase', marginBottom: 7 }}>Missing</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {(result?.missing_keywords || ['Kubernetes', 'CI/CD', 'Agile', 'Docker']).map(k => (
                <span key={k} style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11.5, background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(255,107,107,0.2)' }}>{k}</span>
              ))}
            </div>

            {result?.match_percentage !== undefined && (
              <div style={{
                marginTop: 14, padding: '10px 12px', borderRadius: 8,
                background: 'var(--bg3)', border: '1px solid var(--border2)',
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>{result.match_percentage}%</div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>Job Match</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Resume vs. JD</div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function IssueItem({ issue }) {
  const colors = { error: ['var(--red)', 'var(--red-bg)', 'rgba(255,107,107,0.15)', '✗'], warning: ['var(--amber)', 'var(--amber-bg)', 'rgba(249,185,59,0.15)', '⚠'], ok: ['var(--green)', 'var(--green-bg)', 'rgba(0,208,132,0.15)', '✓'] };
  const [c, bg, border, icon] = colors[issue.type] || colors.warning;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
      borderRadius: 8, marginBottom: 8, fontSize: 13, background: bg, border: `1px solid ${border}`
    }}>
      <span style={{ color: c, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div style={{ flex: 1, lineHeight: 1.6 }}>
        {issue.section && <strong>{issue.section}: </strong>}
        {issue.message}
        {issue.fix && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>💡 {issue.fix}</div>}
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      {title && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-head)', fontSize: 13.5, fontWeight: 700 }}>{title}</span>
        </div>
      )}
      <div style={{ padding: '14px 16px' }}>{children}</div>
    </div>
  );
}

function Spin() {
  return <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />;
}
