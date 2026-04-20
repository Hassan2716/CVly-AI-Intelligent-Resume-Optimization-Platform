import React from 'react';
import { loadVersions } from '../utils/resumeUtils';

export default function Dashboard({ resumes, activeResume, setPage, setActiveResumeId, createNew, showToast }) {
  const score = activeResume?.score || 0;
  const scoreColor = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--amber)' : 'var(--red)';

  const stats = [
    { label:'ATS Score', value: score, unit:'/ 100', color: scoreColor, sub:'Latest resume' },
    { label:'Resumes', value: resumes.length, color:'var(--accent2)', sub:`${resumes.length} versions saved` },
    { label:'Keyword Match', value:'78%', color:'var(--cyan)', sub:'vs target job' },
    { label:'Profile Complete', value:`${Math.round(score * 0.95)}%`, color:'var(--amber)', sub:'Add LinkedIn to boost' },
  ];

  return (
    <div style={{padding:24}}>
      {/* Stats */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22}}>
        {stats.map((s, i) => (
          <div key={i} className="fade-up" style={{
            background:'var(--bg2)', border:'1px solid var(--border)',
            borderRadius:14, padding:'16px 18px',
            animation:`fadeUp .35s ${i*0.07}s both`,
            position:'relative', overflow:'hidden'
          }}>
            <div style={{
              position:'absolute', top:0, left:0, right:0, height:2,
              background: s.color
            }}/>
            <div style={{fontSize:12, color:'var(--text2)', marginBottom:6}}>{s.label}</div>
            <div style={{fontFamily:'var(--font-head)', fontSize:30, fontWeight:800, color:s.color, letterSpacing:'-1px', lineHeight:1}}>
              {s.value}<span style={{fontSize:14, fontWeight:400, color:'var(--text3)'}}>{s.unit}</span>
            </div>
            <div style={{fontSize:11.5, color:'var(--text3)', marginTop:5}}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 320px', gap:16}}>
        {/* Resumes list */}
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          <Card title="📄 My Resumes" action={<Btn onClick={createNew}>+ New</Btn>}>
            {resumes.map(r => {
              const sc = r.score || 0;
              const c = sc >= 80 ? 'var(--green)' : sc >= 60 ? 'var(--amber)' : 'var(--red)';
              const circ = Math.PI * 2 * 14;
              return (
                <div key={r.id}
                  onClick={() => { setActiveResumeId(r.id); setPage('editor'); }}
                  style={{
                    display:'flex', alignItems:'center', gap:14,
                    padding:'10px 0', borderBottom:'1px solid var(--border)',
                    cursor:'pointer', transition:'all .15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.paddingLeft='6px'}
                  onMouseLeave={e => e.currentTarget.style.paddingLeft='0'}
                >
                  <div style={{
                    width:34, height:42, background:'var(--bg3)', borderRadius:4,
                    border:'1px solid var(--border2)', display:'flex', alignItems:'center',
                    justifyContent:'center', fontSize:16, flexShrink:0
                  }}>📄</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:14, fontWeight:500, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.name}</div>
                    <div style={{fontSize:11.5, color:'var(--text3)'}}>
                      {r.data?.personalInfo?.title || 'No title'} • {new Date(r.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <svg width="34" height="34" style={{flexShrink:0, transform:'rotate(-90deg)'}}>
                    <circle cx="17" cy="17" r="14" fill="none" stroke="var(--bg4)" strokeWidth="2.5"/>
                    <circle cx="17" cy="17" r="14" fill="none" stroke={c} strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray={circ.toFixed(1)}
                      strokeDashoffset={(circ - (sc/100)*circ).toFixed(1)}/>
                    <text x="17" y="21" textAnchor="middle" fontSize="9" fontWeight="700" fill={c}
                      style={{transform:'rotate(90deg)', transformOrigin:'17px 17px'}}>{sc}</text>
                  </svg>
                </div>
              );
            })}
          </Card>

          {/* AI Suggestions */}
          <Card title="✦ AI Suggestions">
            {[
              { type:'warn', text:'Add quantified metrics to your experience bullets — e.g. "improved performance by 40%"', action:'Fix in Editor', page:'editor' },
              { type:'error', text:'Missing keywords: Kubernetes, CI/CD, Agile — found in your target job descriptions', action:'Optimize ATS', page:'ats' },
              { type:'ok', text:'Your summary section is strong and well-targeted for Software Engineering roles' },
            ].map((s, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'flex-start', gap:10,
                padding:'10px 12px', borderRadius:8, marginBottom:8,
                background: s.type==='error'?'rgba(255,107,107,0.05)':s.type==='warn'?'rgba(249,185,59,0.05)':'rgba(0,208,132,0.05)',
                border:`1px solid ${s.type==='error'?'rgba(255,107,107,0.15)':s.type==='warn'?'rgba(249,185,59,0.15)':'rgba(0,208,132,0.15)'}`,
                fontSize:12.5
              }}>
                <span style={{flexShrink:0, marginTop:1}}>
                  {s.type==='error'?'✗':s.type==='warn'?'⚠':'✓'}
                </span>
                <span style={{flex:1, lineHeight:1.6}}>{s.text}</span>
                {s.action && (
                  <button onClick={() => setPage(s.page)} style={{
                    flexShrink:0, padding:'3px 9px', borderRadius:6, fontSize:11,
                    background:'transparent', border:'1px solid var(--border2)',
                    color:'var(--text2)', cursor:'pointer'
                  }}>{s.action}</button>
                )}
              </div>
            ))}
          </Card>
        </div>

        {/* Right column */}
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          <Card title="📈 Score History">
            <ScoreChart />
          </Card>
          <Card title="⏱ Recent Activity">
            {[
              { dot:'var(--accent)', text:'AI rewrote 3 bullet points with quantified results', time:'2m ago' },
              { dot:'var(--green)', text:'ATS score improved 68 → 82 after keyword additions', time:'1h ago' },
              { dot:'var(--amber)', text:'Resume tailored for Senior Engineer at TechCorp', time:'3h ago' },
              { dot:'var(--cyan)', text:'Cover letter generated for Meta application', time:'Yesterday' },
            ].map((a, i) => (
              <div key={i} style={{display:'flex', alignItems:'flex-start', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:12.5}}>
                <div style={{width:7, height:7, borderRadius:'50%', background:a.dot, marginTop:4, flexShrink:0}}/>
                <div style={{flex:1, lineHeight:1.5}}>{a.text}</div>
                <div style={{fontSize:11, color:'var(--text3)', flexShrink:0}}>{a.time}</div>
              </div>
            ))}
          </Card>

          <div style={{
            background:'var(--glow)', border:'1px solid rgba(108,92,231,0.2)',
            borderRadius:14, padding:'16px', textAlign:'center'
          }}>
            <div style={{fontSize:24, marginBottom:8}}>🎯</div>
            <div style={{fontFamily:'var(--font-head)', fontSize:14, fontWeight:700, marginBottom:6}}>Ready to tailor your resume?</div>
            <div style={{fontSize:12, color:'var(--text2)', marginBottom:12, lineHeight:1.6}}>Paste a job description and let AI customize your resume for a 90%+ match score.</div>
            <button onClick={() => setPage('job-match')} style={{
              width:'100%', padding:'9px', borderRadius:8,
              background:'var(--accent)', border:'none', color:'white',
              fontSize:13, fontWeight:600, cursor:'pointer'
            }}>Auto-Tailor My Resume →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children, action }) {
  return (
    <div style={{background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden'}}>
      <div style={{padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8}}>
        <span style={{fontFamily:'var(--font-head)', fontSize:13.5, fontWeight:700, flex:1}}>{title}</span>
        {action}
      </div>
      <div style={{padding:'14px 16px'}}>{children}</div>
    </div>
  );
}

function Btn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding:'5px 11px', borderRadius:7, fontSize:12, fontWeight:500,
      background:'var(--glow)', border:'1px solid rgba(108,92,231,0.2)',
      color:'var(--accent2)', cursor:'pointer'
    }}>{children}</button>
  );
}

function ScoreChart() {
  const pts = [58,62,65,68,72,74,82];
  const W=268, H=90, min=50, max=95;
  const xs = pts.map((_,i) => i*(W/(pts.length-1)));
  const ys = pts.map(p => H - ((p-min)/(max-min))*H);
  const path = xs.map((x,i) => (i===0?'M':'L')+x.toFixed(1)+','+ys[i].toFixed(1)).join(' ');
  const area = path + ` L${W},${H} L0,${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', height:H}}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6c5ce7" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#6c5ce7" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)"/>
      <path d={path} fill="none" stroke="#6c5ce7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {xs.map((x,i) => (
        <g key={i}>
          <circle cx={x.toFixed(1)} cy={ys[i].toFixed(1)} r="3.5" fill="#6c5ce7"/>
          <text x={x.toFixed(1)} y={H-2} textAnchor="middle" fontSize="8.5" fill="var(--text3)">v{i+1}</text>
        </g>
      ))}
    </svg>
  );
}
