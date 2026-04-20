import React, { useState } from 'react';
import { generateCoverLetter } from '../utils/aiService';

export default function CoverLetter({ resume, showToast }) {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [tone, setTone] = useState('professional');
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!jobTitle || !company) { showToast('Fill in job title and company name', 'error'); return; }
    setLoading(true);
    showToast('✦ AI writing your cover letter...');
    try {
      const result = await generateCoverLetter(resume?.data, jobTitle, company, tone);
      setLetter(result);
      showToast('✅ Cover letter ready!', 'success');
    } catch (err) {
      showToast(`❌ Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    const full = `Dear Hiring Manager,\n\n${letter}\n\nSincerely,\n${resume?.data?.personalInfo?.name || ''}`;
    navigator.clipboard.writeText(full);
    showToast('📋 Copied to clipboard!', 'success');
  }

  return (
    <div style={{padding:24}}>
      <div style={{display:'grid', gridTemplateColumns:'320px 1fr', gap:16, alignItems:'start'}}>

        {/* Controls */}
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          <Card title="⚙️ Settings">
            <Field label="Job Title" value={jobTitle} onChange={setJobTitle} placeholder="Senior Product Manager"/>
            <Field label="Company" value={company} onChange={setCompany} placeholder="Google, Stripe, etc."/>
            <div style={{marginBottom:14}}>
              <Label>Tone & Style</Label>
              {[
                {id:'professional', label:'Professional', desc:'Confident & polished'},
                {id:'enthusiastic', label:'Enthusiastic', desc:'Energy & passion-driven'},
                {id:'creative', label:'Creative', desc:'Unique & memorable'},
                {id:'executive', label:'Executive', desc:'Senior-level authority'},
              ].map(t=>(
                <div key={t.id} onClick={()=>setTone(t.id)} style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'8px 10px', borderRadius:8, marginBottom:5, cursor:'pointer',
                  background:tone===t.id?'var(--glow)':'var(--bg3)',
                  border:`1px solid ${tone===t.id?'rgba(108,92,231,0.2)':'var(--border)'}`,
                  transition:'all .15s'
                }}>
                  <div style={{
                    width:16, height:16, borderRadius:'50%', flexShrink:0,
                    border:`2px solid ${tone===t.id?'var(--accent)':'var(--border2)'}`,
                    background:tone===t.id?'var(--accent)':'transparent',
                    display:'flex', alignItems:'center', justifyContent:'center'
                  }}>
                    {tone===t.id&&<div style={{width:6,height:6,borderRadius:'50%',background:'white'}}/>}
                  </div>
                  <div>
                    <div style={{fontSize:13, fontWeight:500, color:tone===t.id?'var(--accent2)':'var(--text)'}}>{t.label}</div>
                    <div style={{fontSize:11, color:'var(--text3)'}}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={generate} disabled={loading} style={{
              width:'100%', padding:'10px', borderRadius:9, border:'none',
              background:loading?'var(--bg4)':'var(--accent)',
              color:loading?'var(--text2)':'white', fontSize:14, fontWeight:700, cursor:loading?'default':'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8
            }}>
              {loading?<><Spin/>Generating...</>:'✦ Generate Cover Letter'}
            </button>
          </Card>

          <Card title="💡 Writing Tips">
            {[
              'Opens with a compelling hook tied to the company',
              'References 2-3 specific achievements with numbers',
              'Mirrors keywords from the job description',
              'Ends with a clear call-to-action',
              'Stays under 350 words for maximum impact',
            ].map((tip,i)=>(
              <div key={i} style={{fontSize:12.5, color:'var(--text2)', padding:'6px 0', borderBottom:'1px solid var(--border)', lineHeight:1.6}}>
                ✓ {tip}
              </div>
            ))}
          </Card>
        </div>

        {/* Letter preview */}
        <Card title={letter ? '✉️ Your Cover Letter' : '✉️ Cover Letter Preview'} action={
          letter && (
            <div style={{display:'flex', gap:6}}>
              <button onClick={generate} disabled={loading} style={GhostBtn}>↻ Regenerate</button>
              <button onClick={copyToClipboard} style={GreenBtn}>Copy</button>
            </div>
          )
        }>
          {letter ? (
            <div style={{
              background:'var(--bg3)', border:'1px solid var(--border2)',
              borderRadius:10, padding:'22px 24px',
              fontSize:14, lineHeight:2, color:'var(--text)',
              fontFamily:'var(--font-body)'
            }}>
              <p style={{marginBottom:18, color:'var(--text2)'}}>Dear Hiring Manager,</p>
              {letter.split('\n\n').filter(Boolean).map((para, i) => (
                <p key={i} style={{marginBottom:18, lineHeight:2}}>{para}</p>
              ))}
              <p style={{marginTop:20, color:'var(--text2)'}}>
                Sincerely,<br/>
                <strong style={{color:'var(--text)'}}>{resume?.data?.personalInfo?.name || 'Your Name'}</strong>
              </p>
            </div>
          ) : (
            <div style={{
              textAlign:'center', padding:'60px 20px',
              color:'var(--text3)'
            }}>
              <div style={{fontSize:48, marginBottom:14}}>✉️</div>
              <div style={{fontFamily:'var(--font-head)', fontSize:18, fontWeight:700, marginBottom:8, color:'var(--text2)'}}>
                Your AI cover letter will appear here
              </div>
              <div style={{fontSize:13, lineHeight:1.7, maxWidth:320, margin:'0 auto'}}>
                Fill in the job details on the left and click Generate. The AI will write a personalized, compelling letter based on your resume.
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children, action }) {
  return (
    <div style={{background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden'}}>
      {title&&<div style={{padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8}}>
        <span style={{fontFamily:'var(--font-head)', fontSize:13.5, fontWeight:700, flex:1}}>{title}</span>
        {action}
      </div>}
      <div style={{padding:'16px'}}>{children}</div>
    </div>
  );
}

function Label({ children }) {
  return <div style={{fontSize:11, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:.5, marginBottom:7}}>{children}</div>;
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div style={{marginBottom:12}}>
      <Label>{label}</Label>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:'100%', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:8, padding:'8px 10px', color:'var(--text)', fontSize:13, outline:'none', fontFamily:'var(--font-body)'}}/>
    </div>
  );
}

const GhostBtn = { padding:'5px 11px', borderRadius:7, fontSize:12, fontWeight:500, background:'transparent', border:'1px solid var(--border2)', color:'var(--text2)', cursor:'pointer' };
const GreenBtn = { padding:'5px 11px', borderRadius:7, fontSize:12, fontWeight:600, background:'rgba(0,208,132,0.12)', border:'1px solid rgba(0,208,132,0.25)', color:'var(--green)', cursor:'pointer' };

function Spin() {
  return <div style={{width:14,height:14,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>;
}
