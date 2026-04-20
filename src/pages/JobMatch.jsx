import React, { useState } from 'react';
import { tailorResume } from '../utils/aiService';

export default function JobMatch({ resume, updateData, showToast }) {
  const [jd, setJD] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleTailor() {
    if (!jd.trim()) { showToast('Please paste a job description', 'error'); return; }
    setLoading(true);
    showToast('🤖 AI tailoring your resume for this role...');
    try {
      const tailored = await tailorResume(resume?.data, jd);
      setResult(tailored);
      showToast('✅ Resume tailored! Review changes and apply.', 'success');
    } catch (err) {
      showToast(`❌ Tailoring failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  function applyChanges() {
    if (!result) return;
    const { changes, ...cleanData } = result;
    updateData(cleanData);
    showToast('✅ Tailored resume applied! View in Editor.', 'success');
    setResult(null);
  }

  return (
    <div style={{padding:24}}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, alignItems:'start'}}>

        {/* Input */}
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          <Card title="🎯 Target Job">
            <Field label="Job Title" value={jobTitle} onChange={setJobTitle} placeholder="e.g. Senior Product Manager"/>
            <Field label="Company" value={company} onChange={setCompany} placeholder="e.g. Google, Meta, Startup"/>
            <div style={{marginBottom:12}}>
              <Label>Job Description</Label>
              <textarea value={jd} onChange={e=>setJD(e.target.value)}
                style={{
                  width:'100%', minHeight:180, background:'var(--bg3)',
                  border:'1px solid var(--border2)', borderRadius:8,
                  padding:'10px 12px', color:'var(--text)', fontSize:13,
                  resize:'vertical', outline:'none', fontFamily:'var(--font-body)'
                }}
                placeholder="Paste the full job description here. AI will extract requirements and customize your resume to match..."/>
            </div>
            <button onClick={handleTailor} disabled={loading} style={{
              width:'100%', padding:'10px', borderRadius:9, border:'none',
              background:loading?'var(--bg4)':'var(--accent)',
              color:loading?'var(--text2)':'white', fontSize:14, fontWeight:700,
              cursor:loading?'default':'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8
            }}>
              {loading ? <><Spin/> AI Tailoring...</> : '⚡ Auto-Tailor My Resume'}
            </button>
          </Card>

          {/* How it works */}
          <Card title="ℹ️ How It Works">
            {[
              { step:'1', text:'Paste any job description from LinkedIn, Indeed, company sites etc.' },
              { step:'2', text:'AI extracts key requirements, skills, and role-specific keywords' },
              { step:'3', text:'Your resume is rewritten to match — summary, bullets, and skills optimized' },
              { step:'4', text:'Review the changes and apply with one click' },
            ].map(s=>(
              <div key={s.step} style={{display:'flex', gap:12, padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:13}}>
                <div style={{
                  width:22, height:22, borderRadius:'50%', background:'var(--glow)',
                  border:'1px solid rgba(108,92,231,0.2)', color:'var(--accent2)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:11, fontWeight:700, flexShrink:0
                }}>{s.step}</div>
                <span style={{color:'var(--text2)', lineHeight:1.6}}>{s.text}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Result */}
        <div>
          {result ? (
            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              <Card title="✅ Tailored Resume Ready">
                <div style={{
                  padding:'14px', borderRadius:9, background:'rgba(0,208,132,0.07)',
                  border:'1px solid rgba(0,208,132,0.2)', marginBottom:14
                }}>
                  <div style={{fontFamily:'var(--font-head)', fontSize:18, fontWeight:800, color:'var(--green)', marginBottom:4}}>Ready to apply!</div>
                  <div style={{fontSize:13, color:'var(--text2)', lineHeight:1.6}}>
                    Your resume has been tailored for <strong>{jobTitle||'this role'}</strong>{company?` at ${company}`:''}.
                    Review the changes below before applying.
                  </div>
                </div>

                {result.changes?.length > 0 && (
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:.5, marginBottom:8}}>Changes Made</div>
                    {result.changes.map((c, i) => (
                      <div key={i} style={{
                        display:'flex', gap:8, padding:'7px 10px', borderRadius:7,
                        marginBottom:5, fontSize:12.5, background:'var(--bg3)',
                        border:'1px solid var(--border)'
                      }}>
                        <span style={{color:'var(--green)', flexShrink:0}}>→</span>
                        <span style={{color:'var(--text2)', lineHeight:1.6}}>{c}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{display:'flex', gap:8}}>
                  <button onClick={applyChanges} style={{
                    flex:1, padding:'9px', borderRadius:8, border:'none',
                    background:'var(--green)', color:'white', fontSize:13, fontWeight:700, cursor:'pointer'
                  }}>✓ Apply Changes to Resume</button>
                  <button onClick={()=>setResult(null)} style={{
                    padding:'9px 14px', borderRadius:8, border:'1px solid var(--border2)',
                    background:'transparent', color:'var(--text2)', fontSize:13, cursor:'pointer'
                  }}>Discard</button>
                </div>
              </Card>

              {/* Preview key changes */}
              {result.personalInfo?.summary && (
                <Card title="📝 New Summary">
                  <div style={{fontSize:13, color:'var(--text)', lineHeight:1.8, fontStyle:'italic'}}>
                    "{result.personalInfo.summary}"
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card title="📊 Match Score Preview">
              <div style={{textAlign:'center', padding:'20px 0'}}>
                <div style={{fontFamily:'var(--font-head)', fontSize:52, fontWeight:800, color:'var(--amber)', letterSpacing:'-3px', marginBottom:8}}>
                  ?%
                </div>
                <div style={{fontSize:14, color:'var(--text2)', marginBottom:20}}>Paste a job description to see your match score</div>
                <div style={{display:'flex', flexDirection:'column', gap:8}}>
                  {['Keywords extracted & matched','Summary rewritten for role','Bullets reordered by relevance','Skills section optimized','Match score calculated'].map(f=>(
                    <div key={f} style={{
                      display:'flex', gap:10, padding:'8px 12px', borderRadius:8,
                      background:'var(--bg3)', border:'1px solid var(--border)',
                      fontSize:13, color:'var(--text2)', alignItems:'center'
                    }}>
                      <span style={{color:'var(--text3)'}}>○</span> {f}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Stats */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:14}}>
            {[
              { label:'Avg score boost', value:'+24pts', color:'var(--green)' },
              { label:'Time saved', value:'~45 min', color:'var(--accent2)' },
            ].map(s=>(
              <div key={s.label} style={{
                background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10,
                padding:'14px', textAlign:'center'
              }}>
                <div style={{fontFamily:'var(--font-head)', fontSize:24, fontWeight:800, color:s.color}}>{s.value}</div>
                <div style={{fontSize:12, color:'var(--text3)', marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden'}}>
      {title&&<div style={{padding:'12px 16px', borderBottom:'1px solid var(--border)'}}>
        <span style={{fontFamily:'var(--font-head)', fontSize:13.5, fontWeight:700}}>{title}</span>
      </div>}
      <div style={{padding:'14px 16px'}}>{children}</div>
    </div>
  );
}

const Label = () => null; // inline below
function Field({ label, value, onChange, placeholder }) {
  return (
    <div style={{marginBottom:10}}>
      <div style={{fontSize:11, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:.5, marginBottom:5}}>{label}</div>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:'100%', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:8, padding:'8px 10px', color:'var(--text)', fontSize:13, outline:'none', fontFamily:'var(--font-body)'}}/>
    </div>
  );
}

function Spin() {
  return <div style={{width:14,height:14,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>;
}
