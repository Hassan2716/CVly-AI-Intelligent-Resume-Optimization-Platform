import React, { useState, useEffect } from 'react';
import { loadVersions, saveVersion } from '../utils/resumeUtils';

export default function Versions({ resumeId, currentData, updateData, showToast }) {
  const [versions, setVersions] = useState([]);
  const [comparing, setComparing] = useState(null);

  useEffect(() => {
    const v = loadVersions(resumeId);
    // always show current as v1
    const current = {
      id: 'current',
      label: 'Current Version',
      data: currentData,
      timestamp: new Date().toISOString(),
      score: currentData?._atsScore || 0,
      isCurrent: true
    };
    setVersions([current, ...v]);
  }, [resumeId, currentData]);

  function handleSaveNow() {
    const label = prompt('Name this version:', `Checkpoint — ${new Date().toLocaleString()}`);
    if (!label) return;
    saveVersion(resumeId, currentData, label);
    setVersions([
      { id: 'current', label: 'Current Version', data: currentData, timestamp: new Date().toISOString(), isCurrent: true },
      ...loadVersions(resumeId)
    ]);
    showToast('✅ Version saved!', 'success');
  }

  function handleRestore(v) {
    if (!confirm(`Restore "${v.label}"? Current unsaved changes will be overwritten.`)) return;
    updateData(v.data);
    showToast(`↩ Restored: ${v.label}`, 'success');
  }

  function diffSummary(v1, v2) {
    if (!v1 || !v2) return [];
    const changes = [];
    const p1 = v1.personalInfo || {}, p2 = v2.personalInfo || {};
    if (p1.summary !== p2.summary) changes.push('Summary was modified');
    if ((v1.skills || []).length !== (v2.skills || []).length)
      changes.push(`Skills: ${(v1.skills||[]).length} → ${(v2.skills||[]).length} items`);
    if ((v1.experience || []).length !== (v2.experience || []).length)
      changes.push(`Experience entries: ${(v1.experience||[]).length} → ${(v2.experience||[]).length}`);
    const bullets1 = (v1.experience||[]).reduce((a,e)=>a+(e.bullets?.length||0),0);
    const bullets2 = (v2.experience||[]).reduce((a,e)=>a+(e.bullets?.length||0),0);
    if (bullets1 !== bullets2) changes.push(`Bullet points: ${bullets1} → ${bullets2}`);
    return changes.length ? changes : ['Minor text edits'];
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: 'var(--text2)', flex: 1 }}>
          Save snapshots of your resume at any point and restore them anytime.
        </p>
        <button onClick={handleSaveNow} style={{
          padding: '8px 16px', borderRadius: 8, border: 'none',
          background: 'var(--accent)', color: 'white', fontSize: 13,
          fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
        }}>+ Save Snapshot</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: comparing ? '1fr 1fr' : '1fr', gap: 16 }}>
        {/* Version list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {versions.map((v, i) => {
            const prev = versions[i + 1];
            const changes = prev ? diffSummary(v.data, prev.data) : [];
            const score = v.data ? quickScore(v.data) : 0;
            const scoreColor = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--amber)' : 'var(--red)';

            return (
              <div key={v.id} style={{
                background: 'var(--bg2)', border: `1px solid ${v.isCurrent ? 'rgba(108,92,231,0.3)' : 'var(--border)'}`,
                borderRadius: 12, overflow: 'hidden',
                boxShadow: v.isCurrent ? '0 0 0 1px rgba(108,92,231,0.1)' : 'none'
              }}>
                <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  {/* Version number */}
                  <div style={{
                    fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800,
                    color: v.isCurrent ? 'var(--accent2)' : 'var(--text3)',
                    width: 42, flexShrink: 0, lineHeight: 1
                  }}>v{versions.length - i}</div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{v.label}</span>
                      {v.isCurrent && (
                        <span style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 20,
                          background: 'var(--glow)', color: 'var(--accent2)',
                          border: '1px solid rgba(108,92,231,0.2)', fontWeight: 600
                        }}>Current</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>
                      {new Date(v.timestamp).toLocaleString()}
                    </div>
                    {changes.length > 0 && !v.isCurrent && (
                      <div style={{ fontSize: 11.5, color: 'var(--text2)' }}>
                        {changes.slice(0, 2).join(' • ')}{changes.length > 2 ? ` +${changes.length - 2} more` : ''}
                      </div>
                    )}
                  </div>

                  {/* Score */}
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{score}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>ATS</div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {!v.isCurrent && (
                      <button onClick={() => handleRestore(v)} style={GhostBtn}>
                        ↩ Restore
                      </button>
                    )}
                    {prev && !v.isCurrent && (
                      <button onClick={() => setComparing(comparing?.id === v.id ? null : v)} style={{
                        ...GhostBtn,
                        color: comparing?.id === v.id ? 'var(--accent2)' : 'var(--text2)',
                        borderColor: comparing?.id === v.id ? 'rgba(108,92,231,0.3)' : 'var(--border2)'
                      }}>
                        {comparing?.id === v.id ? '✓ Comparing' : '⊟ Compare'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Change list expanded */}
                {comparing?.id === v.id && prev && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '10px 18px', background: 'var(--bg3)' }}>
                    {diffSummary(v.data, prev?.data).map((c, ci) => (
                      <div key={ci} style={{ fontSize: 12.5, color: 'var(--text2)', padding: '3px 0', display: 'flex', gap: 8 }}>
                        <span style={{ color: 'var(--accent)' }}>→</span> {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {versions.length <= 1 && (
            <div style={{
              textAlign: 'center', padding: '40px 20px',
              background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12
            }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>⊙</div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>No saved versions yet</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
                Click "Save Snapshot" to create a version checkpoint. We recommend saving before major AI rewrites.
              </div>
            </div>
          )}
        </div>

        {/* Diff view */}
        {comparing && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 13.5, fontWeight: 700 }}>
                Comparing: {comparing.label} vs Current
              </div>
            </div>
            <div style={{ padding: 16 }}>
              {/* Summary diff */}
              <DiffSection
                title="Summary"
                before={comparing.data?.personalInfo?.summary}
                after={currentData?.personalInfo?.summary}
              />
              <DiffSection
                title="Skills"
                before={(comparing.data?.skills || []).join(', ')}
                after={(currentData?.skills || []).join(', ')}
              />
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>
                  Experience Bullets
                </div>
                {(comparing.data?.experience || []).map((exp, i) => {
                  const curr = (currentData?.experience || [])[i];
                  return (
                    <div key={exp.id} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 5, color: 'var(--text2)' }}>{exp.role} @ {exp.company}</div>
                      {(exp.bullets || []).map((b, bi) => {
                        const currB = curr?.bullets?.[bi];
                        const changed = currB && currB !== b;
                        return (
                          <div key={bi} style={{ fontSize: 12, marginBottom: 6 }}>
                            <div style={{ padding: '4px 8px', borderRadius: 5, background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.15)', marginBottom: 3, color: 'var(--text2)', lineHeight: 1.6 }}>
                              <span style={{ color: 'var(--red)', marginRight: 5 }}>−</span>{b}
                            </div>
                            {changed && (
                              <div style={{ padding: '4px 8px', borderRadius: 5, background: 'rgba(0,208,132,0.08)', border: '1px solid rgba(0,208,132,0.15)', color: 'var(--text2)', lineHeight: 1.6 }}>
                                <span style={{ color: 'var(--green)', marginRight: 5 }}>+</span>{currB}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DiffSection({ title, before, after }) {
  if (before === after) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>{title}</div>
      {before && (
        <div style={{ padding: '8px 10px', borderRadius: 7, background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.15)', fontSize: 12.5, lineHeight: 1.7, color: 'var(--text2)', marginBottom: 5 }}>
          <span style={{ color: 'var(--red)', marginRight: 6 }}>−</span>{before}
        </div>
      )}
      {after && (
        <div style={{ padding: '8px 10px', borderRadius: 7, background: 'rgba(0,208,132,0.06)', border: '1px solid rgba(0,208,132,0.15)', fontSize: 12.5, lineHeight: 1.7, color: 'var(--text2)' }}>
          <span style={{ color: 'var(--green)', marginRight: 6 }}>+</span>{after}
        </div>
      )}
    </div>
  );
}

function quickScore(data) {
  let s = 0;
  const pi = data?.personalInfo || {};
  if (pi.name) s += 5; if (pi.email) s += 5; if (pi.phone) s += 5; if (pi.linkedin) s += 5;
  if (pi.summary?.length > 50) s += 15;
  if (data?.experience?.length > 0) s += 20; if (data?.experience?.length > 1) s += 10;
  const bullets = data?.experience?.reduce((a, e) => a + (e.bullets?.length || 0), 0) || 0;
  if (bullets >= 6) s += 15;
  const hasMetrics = data?.experience?.some(e => e.bullets?.some(b => /\d+%|\d+x|\$\d+/i.test(b)));
  if (hasMetrics) s += 10;
  if (data?.skills?.length >= 6) s += 5; if (data?.education?.length > 0) s += 5;
  return Math.min(s, 100);
}

const GhostBtn = {
  padding: '5px 11px', borderRadius: 7, fontSize: 12, fontWeight: 500,
  background: 'transparent', border: '1px solid var(--border2)',
  color: 'var(--text2)', cursor: 'pointer', fontFamily: 'var(--font-body)'
};
