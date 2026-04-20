import React, { useState } from 'react';
import { rewriteSummary, enhanceBullets, generateSkillSuggestions } from '../utils/aiService';
import { genId, saveVersion } from '../utils/resumeUtils';

const TEMPLATES = {
  executive: ExecutiveTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
};

export default function Editor({ resume, updateData, showToast, selectedTemplate, setPage }) {
  const data = resume?.data || {};
  const [aiLoading, setAiLoading] = useState({});
  const Template = TEMPLATES[selectedTemplate] || TEMPLATES.executive;

  function set(path, value) {
    const keys = path.split('.');
    const newData = JSON.parse(JSON.stringify(data));
    let obj = newData;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length-1]] = value;
    updateData(newData);
  }

  function setAI(key, val) { setAiLoading(p => ({ ...p, [key]: val })); }

  async function aiRewriteSummary() {
    setAI('summary', true);
    showToast('✦ AI rewriting summary...');
    try {
      const result = await rewriteSummary(data.personalInfo?.summary, data.personalInfo?.title, data.skills || []);
      set('personalInfo.summary', result);
      showToast('✅ Summary rewritten!', 'success');
    } catch { showToast('❌ AI error — check API key', 'error'); }
    setAI('summary', false);
  }

  async function aiEnhanceBullets(expIdx) {
    const exp = data.experience[expIdx];
    setAI(`bullets_${expIdx}`, true);
    showToast('✦ AI enhancing bullets...');
    try {
      const result = await enhanceBullets(exp.bullets, exp.role, exp.company);
      const newData = JSON.parse(JSON.stringify(data));
      newData.experience[expIdx].bullets = result;
      updateData(newData);
      showToast('✅ Bullets enhanced!', 'success');
    } catch { showToast('❌ AI error', 'error'); }
    setAI(`bullets_${expIdx}`, false);
  }

  async function aiSuggestSkills() {
    setAI('skills', true);
    showToast('✦ AI suggesting skills...');
    try {
      const suggestions = await generateSkillSuggestions(data.personalInfo?.title || 'Software Engineer', data.skills || []);
      const newSkills = [...new Set([...(data.skills||[]), ...suggestions])];
      set('skills', newSkills.slice(0, 20));
      showToast(`✅ Added ${suggestions.length} skill suggestions!`, 'success');
    } catch { showToast('❌ AI error', 'error'); }
    setAI('skills', false);
  }

  function addExperience() {
    const newExp = { id:genId(), role:'', company:'', location:'', startDate:'', endDate:'', current:false, bullets:[''] };
    set('experience', [...(data.experience||[]), newExp]);
  }

  function removeExperience(idx) {
    const newExp = [...data.experience];
    newExp.splice(idx, 1);
    set('experience', newExp);
  }

  function updateExp(idx, field, value) {
    const newExp = JSON.parse(JSON.stringify(data.experience));
    newExp[idx][field] = value;
    const newData = { ...data, experience: newExp };
    updateData(newData);
  }

  function updateBullet(expIdx, bIdx, value) {
    const newExp = JSON.parse(JSON.stringify(data.experience));
    newExp[expIdx].bullets[bIdx] = value;
    updateData({ ...data, experience: newExp });
  }

  function addBullet(expIdx) {
    const newExp = JSON.parse(JSON.stringify(data.experience));
    newExp[expIdx].bullets.push('');
    updateData({ ...data, experience: newExp });
  }

  function addSkill(skill) {
    if (skill && !data.skills?.includes(skill)) set('skills', [...(data.skills||[]), skill]);
  }

  function removeSkill(skill) {
    set('skills', (data.skills||[]).filter(s => s !== skill));
  }

  function handleSave() {
    saveVersion(resume?.id, data, `Manual save — ${new Date().toLocaleTimeString()}`);
    showToast('✅ Version saved!', 'success');
  }

  return (
    <div style={{display:'grid', gridTemplateColumns:'420px 1fr', height:'calc(100vh - 54px)'}}>
      {/* ─── LEFT: FORM ─── */}
      <div style={{
        display:'flex', flexDirection:'column', overflow:'hidden',
        borderRight:'1px solid var(--border)', background:'var(--bg)'
      }}>
        <div style={{
          padding:'9px 14px', borderBottom:'1px solid var(--border)',
          background:'var(--bg2)', display:'flex', alignItems:'center', gap:8, flexShrink:0
        }}>
          <span style={{fontFamily:'var(--font-head)', fontSize:13, fontWeight:700, flex:1}}>Edit Resume</span>
          <button onClick={() => setPage('templates')} style={GhostBtn}>Templates</button>
          <button onClick={handleSave} style={GreenBtn}>Save Version</button>
        </div>

        <div style={{flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:12}}>

          {/* Personal Info */}
          <Section title="👤 Personal Info">
            <div style={TwoCol}>
              <Field label="Full Name" value={data.personalInfo?.name||''} onChange={v=>set('personalInfo.name',v)}/>
              <Field label="Job Title" value={data.personalInfo?.title||''} onChange={v=>set('personalInfo.title',v)}/>
            </div>
            <div style={TwoCol}>
              <Field label="Email" value={data.personalInfo?.email||''} onChange={v=>set('personalInfo.email',v)}/>
              <Field label="Phone" value={data.personalInfo?.phone||''} onChange={v=>set('personalInfo.phone',v)}/>
            </div>
            <div style={TwoCol}>
              <Field label="Location" value={data.personalInfo?.location||''} onChange={v=>set('personalInfo.location',v)}/>
              <Field label="LinkedIn" value={data.personalInfo?.linkedin||''} onChange={v=>set('personalInfo.linkedin',v)}/>
            </div>
            <Field label="Website" value={data.personalInfo?.website||''} onChange={v=>set('personalInfo.website',v)}/>
          </Section>

          {/* Summary */}
          <Section title="📝 Summary">
            <textarea style={{...Input, minHeight:90, resize:'vertical', width:'100%'}}
              value={data.personalInfo?.summary||''}
              onChange={e=>set('personalInfo.summary',e.target.value)}
              placeholder="Write a compelling professional summary..."/>
            <AIBtn loading={aiLoading.summary} onClick={aiRewriteSummary}>✦ AI Rewrite Summary</AIBtn>
          </Section>

          {/* Experience */}
          <Section title="💼 Experience" action={<SmlBtn onClick={addExperience}>+ Add</SmlBtn>}>
            {(data.experience||[]).map((exp, i) => (
              <div key={exp.id} style={{marginBottom:16, paddingBottom:16, borderBottom:'1px solid var(--border)'}}>
                <div style={TwoCol}>
                  <Field label="Role" value={exp.role} onChange={v=>updateExp(i,'role',v)}/>
                  <Field label="Company" value={exp.company} onChange={v=>updateExp(i,'company',v)}/>
                </div>
                <div style={TwoCol}>
                  <Field label="Start" value={exp.startDate} onChange={v=>updateExp(i,'startDate',v)}/>
                  <Field label="End" value={exp.current?'Present':exp.endDate} onChange={v=>updateExp(i,'endDate',v)} disabled={exp.current}/>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:8}}>
                  <input type="checkbox" checked={exp.current} onChange={e=>updateExp(i,'current',e.target.checked)} id={`cur_${i}`}/>
                  <label htmlFor={`cur_${i}`} style={{fontSize:12, color:'var(--text2)'}}>Currently working here</label>
                </div>
                <div style={{marginBottom:8}}>
                  <div style={Label}>Bullet Points</div>
                  {(exp.bullets||[]).map((b, bi) => (
                    <div key={bi} style={{display:'flex', gap:6, marginBottom:5}}>
                      <textarea style={{...Input, resize:'vertical', flex:1, minHeight:52}}
                        value={b} onChange={e=>updateBullet(i,bi,e.target.value)}
                        placeholder="Describe your achievement with impact..."/>
                    </div>
                  ))}
                  <button onClick={()=>addBullet(i)} style={{...GhostSmBtn, marginBottom:6}}>+ Add Bullet</button>
                </div>
                <div style={{display:'flex', gap:8}}>
                  <AIBtn loading={aiLoading[`bullets_${i}`]} onClick={()=>aiEnhanceBullets(i)} small>✦ AI Enhance Bullets</AIBtn>
                  <button onClick={()=>removeExperience(i)} style={{...GhostSmBtn, color:'var(--red)', borderColor:'rgba(255,107,107,0.2)'}}>Remove</button>
                </div>
              </div>
            ))}
          </Section>

          {/* Education */}
          <Section title="🎓 Education">
            {(data.education||[]).map((edu, i) => (
              <div key={edu.id} style={{marginBottom:12, paddingBottom:12, borderBottom:'1px solid var(--border)'}}>
                <div style={TwoCol}>
                  <Field label="Degree" value={edu.degree} onChange={v=>{const n=JSON.parse(JSON.stringify(data));n.education[i].degree=v;updateData(n);}}/>
                  <Field label="School" value={edu.school} onChange={v=>{const n=JSON.parse(JSON.stringify(data));n.education[i].school=v;updateData(n);}}/>
                </div>
                <div style={TwoCol}>
                  <Field label="Year From" value={edu.startDate} onChange={v=>{const n=JSON.parse(JSON.stringify(data));n.education[i].startDate=v;updateData(n);}}/>
                  <Field label="Year To" value={edu.endDate} onChange={v=>{const n=JSON.parse(JSON.stringify(data));n.education[i].endDate=v;updateData(n);}}/>
                </div>
              </div>
            ))}
            <button onClick={()=>{
              const newEdu={id:genId(),degree:'',school:'',startDate:'',endDate:'',gpa:'',honors:''};
              set('education',[...(data.education||[]),newEdu]);
            }} style={GhostSmBtn}>+ Add Education</button>
          </Section>

          {/* Skills */}
          <Section title="⚡ Skills">
            <div style={{display:'flex', flexWrap:'wrap', gap:6, marginBottom:10}}>
              {(data.skills||[]).map(s => (
                <span key={s} onClick={()=>removeSkill(s)} style={{
                  padding:'3px 9px', borderRadius:20, fontSize:12, cursor:'pointer',
                  background:'rgba(108,92,231,0.1)', color:'var(--accent2)',
                  border:'1px solid rgba(108,92,231,0.2)'
                }}>{s} ×</span>
              ))}
            </div>
            <div style={{display:'flex', gap:8}}>
              <input style={{...Input, flex:1}} placeholder="Add skill..." id="skill-input"
                onKeyDown={e=>{if(e.key==='Enter'){addSkill(e.target.value);e.target.value='';}}}/>
              <AIBtn loading={aiLoading.skills} onClick={aiSuggestSkills} small>✦ AI Suggest</AIBtn>
            </div>
          </Section>

          {/* Projects */}
          <Section title="🚀 Projects">
            {(data.projects||[]).map((p, i) => (
              <div key={p.id} style={{marginBottom:10, paddingBottom:10, borderBottom:'1px solid var(--border)'}}>
                <Field label="Project Name" value={p.name} onChange={v=>{const n=JSON.parse(JSON.stringify(data));n.projects[i].name=v;updateData(n);}}/>
                <Field label="Description" value={p.description} onChange={v=>{const n=JSON.parse(JSON.stringify(data));n.projects[i].description=v;updateData(n);}} textarea/>
              </div>
            ))}
            <button onClick={()=>{
              const np={id:genId(),name:'',description:'',tech:[],link:''};
              set('projects',[...(data.projects||[]),np]);
            }} style={GhostSmBtn}>+ Add Project</button>
          </Section>

        </div>
      </div>

      {/* ─── RIGHT: LIVE PREVIEW ─── */}
      <div style={{background:'#e8e6e0', overflowY:'auto', display:'flex', flexDirection:'column', alignItems:'center', padding:28}}>
        <div style={{width:'100%', maxWidth:620, marginBottom:10, display:'flex', alignItems:'center', gap:8}}>
          <span style={{fontSize:12, color:'#888', fontFamily:'var(--font-body)'}}>Live Preview</span>
          <span style={{flex:1}}/>
          <span style={{fontSize:11, color:'#aaa'}}>Saved automatically</span>
        </div>
        <div id="resume-preview-page" style={{width:'100%', maxWidth:620}}>
          <Template data={data}/>
        </div>
      </div>
    </div>
  );
}

// ─── SHARED FORM HELPERS ───────────────────────────────────────────────────

const Input = {
  background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:7,
  padding:'7px 10px', color:'var(--text)', fontSize:13, outline:'none', width:'100%',
  transition:'border-color .15s'
};
const Label = { fontSize:11, color:'var(--text3)', fontWeight:600, letterSpacing:.5, textTransform:'uppercase', marginBottom:5 };
const TwoCol = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 };
const GhostBtn = { padding:'5px 11px', borderRadius:7, fontSize:12, fontWeight:500, background:'transparent', border:'1px solid var(--border2)', color:'var(--text2)', cursor:'pointer' };
const GreenBtn = { padding:'5px 11px', borderRadius:7, fontSize:12, fontWeight:600, background:'rgba(0,208,132,0.12)', border:'1px solid rgba(0,208,132,0.25)', color:'var(--green)', cursor:'pointer' };
const GhostSmBtn = { padding:'4px 9px', borderRadius:6, fontSize:11.5, background:'transparent', border:'1px solid var(--border2)', color:'var(--text2)', cursor:'pointer' };

function Field({ label, value, onChange, textarea, disabled }) {
  return (
    <div style={{marginBottom:8}}>
      <div style={Label}>{label}</div>
      {textarea
        ? <textarea style={{...Input, minHeight:60, resize:'vertical'}} value={value||''} onChange={e=>onChange(e.target.value)}/>
        : <input style={{...Input, opacity:disabled?.5:1}} value={value||''} onChange={e=>!disabled&&onChange(e.target.value)} disabled={disabled}/>
      }
    </div>
  );
}

function Section({ title, children, action }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden'}}>
      <div onClick={()=>setOpen(o=>!o)} style={{
        padding:'9px 13px', borderBottom:open?'1px solid var(--border)':'none',
        background:'var(--bg3)', cursor:'pointer', display:'flex', alignItems:'center', gap:8
      }}>
        <span style={{fontSize:13, fontWeight:600, flex:1}}>{title}</span>
        {action && <span onClick={e=>e.stopPropagation()}>{action}</span>}
        <span style={{fontSize:11, color:'var(--text3)'}}>{open?'▲':'▼'}</span>
      </div>
      {open && <div style={{padding:13}}>{children}</div>}
    </div>
  );
}

function SmlBtn({ onClick, children }) {
  return <button onClick={onClick} style={GhostSmBtn}>{children}</button>;
}

function AIBtn({ onClick, loading, children, small }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      padding: small?'4px 10px':'6px 12px',
      borderRadius:7, fontSize: small?11.5:12.5, fontWeight:500,
      background:loading?'var(--bg3)':'var(--glow)',
      border:'1px solid rgba(108,92,231,0.2)',
      color: loading?'var(--text3)':'var(--accent2)',
      cursor: loading?'default':'pointer', transition:'all .15s',
      display:'inline-flex', alignItems:'center', gap:5
    }}>
      {loading ? <><Spinner/> Processing...</> : children}
    </button>
  );
}

function Spinner() {
  return <div style={{width:10, height:10, border:'2px solid var(--border2)', borderTopColor:'var(--accent2)', borderRadius:'50%', animation:'spin .7s linear infinite'}}/>;
}

// ─── RESUME TEMPLATES ──────────────────────────────────────────────────────

function ExecutiveTemplate({ data }) {
  const pi = data.personalInfo || {};
  return (
    <div style={{background:'white', fontFamily:"'DM Sans', sans-serif", color:'#1a1a2e', boxShadow:'0 4px 40px rgba(0,0,0,0.18)', borderRadius:4}}>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg, #1e1b4b, #4338ca)', color:'white', padding:'28px 32px'}}>
        <div style={{fontFamily:"'Syne', sans-serif", fontSize:26, fontWeight:800, marginBottom:3}}>{pi.name||'Your Name'}</div>
        <div style={{fontSize:14, opacity:.85, marginBottom:12}}>{pi.title||'Your Title'}</div>
        <div style={{display:'flex', gap:18, fontSize:12, opacity:.75, flexWrap:'wrap'}}>
          {pi.email && <span>✉ {pi.email}</span>}
          {pi.phone && <span>✆ {pi.phone}</span>}
          {pi.location && <span>◎ {pi.location}</span>}
          {pi.linkedin && <span>in {pi.linkedin}</span>}
        </div>
      </div>
      {/* Body */}
      <div style={{padding:'22px 32px'}}>
        {pi.summary && <Section2 title="Summary"><p style={{fontSize:13, lineHeight:1.8, color:'#374151'}}>{pi.summary}</p></Section2>}
        {data.experience?.length > 0 && (
          <Section2 title="Experience">
            {data.experience.map(exp => (
              <div key={exp.id} style={{marginBottom:16}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:2}}>
                  <span style={{fontWeight:700, fontSize:14}}>{exp.role||'Role'}</span>
                  <span style={{fontSize:12, color:'#6366f1', fontWeight:500}}>{exp.startDate} – {exp.current?'Present':exp.endDate}</span>
                </div>
                <div style={{fontSize:13, color:'#6b7280', marginBottom:6}}>{exp.company}{exp.location?` · ${exp.location}`:''}</div>
                {exp.bullets?.filter(Boolean).map((b,i)=>(
                  <div key={i} style={{fontSize:12.5, color:'#374151', lineHeight:1.7, paddingLeft:14, position:'relative', marginBottom:3}}>
                    <span style={{position:'absolute', left:0, color:'#6366f1', fontSize:10}}>▸</span>{b}
                  </div>
                ))}
              </div>
            ))}
          </Section2>
        )}
        {data.education?.length > 0 && (
          <Section2 title="Education">
            {data.education.map(edu => (
              <div key={edu.id} style={{marginBottom:10}}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <span style={{fontWeight:700, fontSize:14}}>{edu.degree||'Degree'}</span>
                  <span style={{fontSize:12, color:'#6366f1'}}>{edu.startDate}{edu.endDate?` – ${edu.endDate}`:''}</span>
                </div>
                <div style={{fontSize:13, color:'#6b7280'}}>{edu.school}</div>
              </div>
            ))}
          </Section2>
        )}
        {data.skills?.length > 0 && (
          <Section2 title="Skills">
            <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
              {data.skills.map(s=><span key={s} style={{background:'#eef2ff', color:'#4338ca', fontSize:11.5, padding:'3px 9px', borderRadius:20, fontWeight:500}}>{s}</span>)}
            </div>
          </Section2>
        )}
        {data.projects?.filter(p=>p.name).length > 0 && (
          <Section2 title="Projects">
            {data.projects.filter(p=>p.name).map(p=>(
              <div key={p.id} style={{marginBottom:8}}>
                <div style={{fontWeight:700, fontSize:13, marginBottom:2}}>{p.name}</div>
                <div style={{fontSize:12.5, color:'#374151', lineHeight:1.7}}>{p.description}</div>
              </div>
            ))}
          </Section2>
        )}
        {data.certifications?.length > 0 && (
          <Section2 title="Certifications">
            {data.certifications.map(c=>(
              <div key={c.id} style={{fontSize:13, marginBottom:4}}>
                <strong>{c.name}</strong> — {c.issuer} ({c.date})
              </div>
            ))}
          </Section2>
        )}
      </div>
    </div>
  );
}

function Section2({ title, children }) {
  return (
    <div style={{marginBottom:20}}>
      <div style={{fontFamily:"'Syne',sans-serif", fontSize:11, fontWeight:800, letterSpacing:1.5, textTransform:'uppercase', color:'#4338ca', borderBottom:'2px solid #e0e7ff', paddingBottom:5, marginBottom:10}}>
        {title}
      </div>
      {children}
    </div>
  );
}

function ModernTemplate({ data }) {
  const pi = data.personalInfo || {};
  return (
    <div style={{background:'white', fontFamily:"'DM Sans',sans-serif", color:'#1a1a2e', display:'flex', boxShadow:'0 4px 40px rgba(0,0,0,0.18)', borderRadius:4, minHeight:800}}>
      <div style={{width:'34%', background:'#1e1b4b', color:'white', padding:'28px 20px'}}>
        <div style={{width:60, height:60, borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, marginBottom:14}}>{(pi.name||'?')[0]}</div>
        <div style={{fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:800, marginBottom:4}}>{pi.name||'Your Name'}</div>
        <div style={{fontSize:12, opacity:.7, marginBottom:20}}>{pi.title}</div>
        <SideSection title="Contact">
          {pi.email&&<p style={{fontSize:11.5, opacity:.8, marginBottom:3}}>✉ {pi.email}</p>}
          {pi.phone&&<p style={{fontSize:11.5, opacity:.8, marginBottom:3}}>✆ {pi.phone}</p>}
          {pi.location&&<p style={{fontSize:11.5, opacity:.8, marginBottom:3}}>◎ {pi.location}</p>}
        </SideSection>
        {data.skills?.length>0 && <SideSection title="Skills">{data.skills.map(s=><div key={s} style={{fontSize:11.5, opacity:.8, marginBottom:3}}>• {s}</div>)}</SideSection>}
        {data.education?.length>0 && <SideSection title="Education">{data.education.map(e=><div key={e.id} style={{marginBottom:8}}><div style={{fontSize:12, fontWeight:600}}>{e.degree}</div><div style={{fontSize:11, opacity:.7}}>{e.school}</div><div style={{fontSize:11, opacity:.6}}>{e.startDate}–{e.endDate}</div></div>)}</SideSection>}
      </div>
      <div style={{flex:1, padding:'28px 24px'}}>
        {pi.summary&&<div style={{marginBottom:18}}><Heading2>Profile</Heading2><p style={{fontSize:12.5, lineHeight:1.8, color:'#4b5563'}}>{pi.summary}</p></div>}
        {data.experience?.length>0&&<div style={{marginBottom:18}}><Heading2>Experience</Heading2>{data.experience.map(e=>(
          <div key={e.id} style={{marginBottom:14}}>
            <div style={{fontWeight:700, fontSize:13.5}}>{e.role}</div>
            <div style={{fontSize:12, color:'#7c3aed', marginBottom:5}}>{e.company} • {e.startDate}–{e.current?'Present':e.endDate}</div>
            {e.bullets?.filter(Boolean).map((b,i)=><div key={i} style={{fontSize:12, color:'#374151', lineHeight:1.7, paddingLeft:12, position:'relative', marginBottom:2}}><span style={{position:'absolute',left:0,color:'#7c3aed'}}>›</span>{b}</div>)}
          </div>
        ))}</div>}
        {data.projects?.filter(p=>p.name).length>0&&<div><Heading2>Projects</Heading2>{data.projects.filter(p=>p.name).map(p=><div key={p.id} style={{marginBottom:8}}><div style={{fontWeight:700, fontSize:12.5}}>{p.name}</div><div style={{fontSize:12, color:'#4b5563'}}>{p.description}</div></div>)}</div>}
      </div>
    </div>
  );
}

function SideSection({ title, children }) {
  return <div style={{marginBottom:18}}><div style={{fontSize:10, fontWeight:800, letterSpacing:1.2, textTransform:'uppercase', opacity:.5, borderBottom:'1px solid rgba(255,255,255,0.2)', paddingBottom:4, marginBottom:8}}>{title}</div>{children}</div>;
}
function Heading2({ children }) {
  return <div style={{fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800, letterSpacing:1, textTransform:'uppercase', color:'#7c3aed', borderBottom:'2px solid #ede9fe', paddingBottom:4, marginBottom:10}}>{children}</div>;
}

function MinimalTemplate({ data }) {
  const pi = data.personalInfo || {};
  return (
    <div style={{background:'white', fontFamily:"'DM Sans',sans-serif", color:'#111', padding:'36px 40px', boxShadow:'0 4px 40px rgba(0,0,0,0.18)', borderRadius:4}}>
      <div style={{borderBottom:'2px solid #111', paddingBottom:14, marginBottom:20}}>
        <div style={{fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, letterSpacing:'-1px', marginBottom:4}}>{pi.name||'Your Name'}</div>
        <div style={{fontSize:14, color:'#555', marginBottom:8}}>{pi.title}</div>
        <div style={{display:'flex', gap:16, fontSize:12, color:'#888', flexWrap:'wrap'}}>
          {pi.email&&<span>{pi.email}</span>}
          {pi.phone&&<span>{pi.phone}</span>}
          {pi.location&&<span>{pi.location}</span>}
        </div>
      </div>
      {pi.summary&&<MinSection title="Summary"><p style={{fontSize:13, lineHeight:1.8, color:'#333'}}>{pi.summary}</p></MinSection>}
      {data.experience?.length>0&&<MinSection title="Experience">{data.experience.map(e=>(
        <div key={e.id} style={{marginBottom:14}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
            <span style={{fontWeight:700, fontSize:13.5}}>{e.role} — {e.company}</span>
            <span style={{fontSize:12, color:'#888'}}>{e.startDate}–{e.current?'Present':e.endDate}</span>
          </div>
          {e.bullets?.filter(Boolean).map((b,i)=><div key={i} style={{fontSize:12.5, color:'#444', lineHeight:1.7, paddingLeft:14, position:'relative', marginBottom:2}}><span style={{position:'absolute',left:0}}>–</span>{b}</div>)}
        </div>
      ))}</MinSection>}
      {data.skills?.length>0&&<MinSection title="Skills"><div style={{fontSize:13, color:'#333', lineHeight:2}}>{data.skills.join(' · ')}</div></MinSection>}
    </div>
  );
}
function MinSection({ title, children }) {
  return <div style={{marginBottom:18}}><div style={{fontSize:11, fontWeight:800, letterSpacing:1.5, textTransform:'uppercase', color:'#888', marginBottom:8}}>{title}</div>{children}</div>;
}
