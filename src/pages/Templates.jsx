import React from 'react';

const TEMPLATES = [
  { id:'executive', name:'Executive Classic', tag:'ATS #1', desc:'Professional gradient header, perfect for corporate roles' },
  { id:'modern', name:'Modern Split', tag:'Popular', desc:'Two-column layout with sidebar — eye-catching and modern' },
  { id:'minimal', name:'Minimal Clean', tag:'ATS #2', desc:'Clean typography-first design, maximum readability' },
  { id:'bold', name:'Bold Impact', tag:'Creative', desc:'Strong visual identity for creative professionals' },
  { id:'dark', name:'Dark Pro', tag:'New ✦', desc:'Dark-accented premium look for tech roles' },
  { id:'corporate', name:'Corporate Pro', tag:'ATS #3', desc:'Traditional centered header, maximum ATS compatibility' },
];

export default function Templates({ selected, onSelect, setPage }) {
  return (
    <div style={{padding:24}}>
      <p style={{fontSize:13, color:'var(--text2)', marginBottom:22, lineHeight:1.7}}>
        All templates are ATS-optimized and fully responsive. Click to preview and apply.
        Customize fonts, colors and layout in the Editor.
      </p>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18}}>
        {TEMPLATES.map(t => (
          <div key={t.id}
            onClick={() => onSelect(t.id)}
            style={{
              border:`2px solid ${selected===t.id?'var(--accent2)':'var(--border)'}`,
              borderRadius:14, overflow:'hidden', cursor:'pointer',
              transition:'all .2s', background:'var(--bg2)',
              transform: selected===t.id?'translateY(-2px)':'none',
              boxShadow: selected===t.id?'0 8px 30px rgba(108,92,231,0.2)':'none'
            }}
          >
            {/* Preview thumbnail */}
            <div style={{height:180, background:'#f5f4f0', position:'relative', overflow:'hidden'}}>
              <TemplateThumbnail id={t.id}/>
              {selected===t.id && (
                <div style={{
                  position:'absolute', top:8, right:8,
                  width:24, height:24, borderRadius:'50%',
                  background:'var(--accent)', display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:12, color:'white', fontWeight:700
                }}>✓</div>
              )}
            </div>
            <div style={{padding:'12px 14px', background:'var(--bg2)', borderTop:'1px solid var(--border)'}}>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                <span style={{fontSize:13.5, fontWeight:600}}>{t.name}</span>
                <span style={{
                  marginLeft:'auto', fontSize:10, padding:'2px 7px', borderRadius:20,
                  background:'var(--glow)', color:'var(--accent2)', border:'1px solid rgba(108,92,231,0.2)'
                }}>{t.tag}</span>
              </div>
              <p style={{fontSize:12, color:'var(--text3)', lineHeight:1.5}}>{t.desc}</p>
              {selected===t.id && (
                <button onClick={e=>{e.stopPropagation();setPage('editor');}} style={{
                  marginTop:10, width:'100%', padding:'7px', borderRadius:7,
                  background:'var(--accent)', border:'none', color:'white',
                  fontSize:12, fontWeight:600, cursor:'pointer'
                }}>Open in Editor →</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{marginTop:24, padding:'16px 20px', background:'var(--bg2)', borderRadius:12, border:'1px solid var(--border)', fontSize:13, color:'var(--text2)', lineHeight:1.7}}>
        <strong style={{color:'var(--text)'}}>💡 ATS Tip:</strong> Templates marked "ATS" use single-column layouts and standard headings that all major ATS systems (Greenhouse, Workday, Lever, iCIMS) can parse correctly. The "Creative" and "Dark" templates are best for roles where human review is more likely.
      </div>
    </div>
  );
}

function TemplateThumbnail({ id }) {
  const previews = {
    executive: (
      <div style={{transform:'scale(0.42)', transformOrigin:'top left', width:238, pointerEvents:'none'}}>
        <div style={{background:'linear-gradient(135deg,#1e1b4b,#4338ca)', padding:'14px 16px', color:'white'}}>
          <div style={{fontWeight:800, fontSize:14, fontFamily:'Syne,sans-serif'}}>Alex Johnson</div>
          <div style={{fontSize:9, opacity:.7, marginBottom:6}}>Senior Software Engineer</div>
          <div style={{fontSize:8, opacity:.6}}>alex@example.com • San Francisco</div>
        </div>
        <div style={{background:'white', padding:'12px 16px'}}>
          {['Experience','Education','Skills'].map(s=>(
            <div key={s} style={{marginBottom:10}}>
              <div style={{fontSize:7, fontWeight:800, color:'#4338ca', borderBottom:'1.5px solid #e0e7ff', paddingBottom:2, marginBottom:5, textTransform:'uppercase', letterSpacing:1}}>{s}</div>
              <div style={{height:4,background:'#f3f4f6',borderRadius:2,marginBottom:3,width:'90%'}}/>
              <div style={{height:3,background:'#f3f4f6',borderRadius:2,marginBottom:3,width:'75%'}}/>
              <div style={{height:3,background:'#f3f4f6',borderRadius:2,width:'60%'}}/>
            </div>
          ))}
        </div>
      </div>
    ),
    modern: (
      <div style={{transform:'scale(0.42)', transformOrigin:'top left', width:238, display:'flex', height:428, pointerEvents:'none'}}>
        <div style={{background:'#1e1b4b', width:'35%', padding:'14px 10px', color:'white'}}>
          <div style={{width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.2)',marginBottom:8}}/>
          <div style={{fontWeight:800,fontSize:10,marginBottom:4}}>Alex J.</div>
          {[80,60,70,50,65].map((w,i)=><div key={i} style={{height:3,background:'rgba(255,255,255,0.2)',borderRadius:2,margin:'4px 0',width:`${w}%`}}/>)}
        </div>
        <div style={{background:'white',flex:1,padding:'14px 12px'}}>
          {['Profile','Experience','Projects'].map(s=>(
            <div key={s} style={{marginBottom:10}}>
              <div style={{fontSize:7,fontWeight:800,color:'#7c3aed',borderBottom:'1.5px solid #ede9fe',paddingBottom:2,marginBottom:4,textTransform:'uppercase'}}>{s}</div>
              <div style={{height:3,background:'#f3f4f6',borderRadius:2,marginBottom:2,width:'90%'}}/>
              <div style={{height:3,background:'#f3f4f6',borderRadius:2,width:'70%'}}/>
            </div>
          ))}
        </div>
      </div>
    ),
    minimal: (
      <div style={{transform:'scale(0.42)', transformOrigin:'top left', width:238, background:'white', padding:'16px', pointerEvents:'none'}}>
        <div style={{borderBottom:'1.5px solid #111', paddingBottom:8, marginBottom:10}}>
          <div style={{fontWeight:800, fontSize:14, fontFamily:'Syne,sans-serif', color:'#111'}}>Alex Johnson</div>
          <div style={{fontSize:8, color:'#555', marginTop:2}}>Senior Software Engineer • alex@example.com</div>
        </div>
        {['Summary','Experience','Skills'].map(s=>(
          <div key={s} style={{marginBottom:10}}>
            <div style={{fontSize:6.5, fontWeight:800, color:'#888', textTransform:'uppercase', letterSpacing:1, marginBottom:4}}>{s}</div>
            <div style={{height:3,background:'#f3f4f6',borderRadius:2,marginBottom:2}}/>
            <div style={{height:3,background:'#f3f4f6',borderRadius:2,marginBottom:2,width:'80%'}}/>
          </div>
        ))}
      </div>
    ),
    bold: (
      <div style={{transform:'scale(0.42)', transformOrigin:'top left', width:238, background:'#fef3c7', pointerEvents:'none'}}>
        <div style={{background:'#92400e', padding:'14px 16px', borderBottom:'3px solid #d97706', color:'white'}}>
          <div style={{fontWeight:800,fontSize:13,fontFamily:'Syne,sans-serif'}}>ALEX JOHNSON</div>
          <div style={{fontSize:8,opacity:.7}}>Senior Software Engineer</div>
        </div>
        <div style={{padding:'12px 16px', background:'white'}}>
          {[100,80,70,90,60].map((w,i)=><div key={i} style={{height:4,background:'#fef3c7',borderRadius:2,margin:'4px 0',width:`${w}%`}}/>)}
        </div>
      </div>
    ),
    dark: (
      <div style={{transform:'scale(0.42)', transformOrigin:'top left', width:238, background:'#0f172a', pointerEvents:'none', minHeight:180}}>
        <div style={{padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
          <div style={{fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:800, color:'#818cf8'}}>Alex Johnson</div>
          <div style={{height:2,background:'linear-gradient(90deg,#818cf8,#e879f9)',borderRadius:2,margin:'4px 0',width:'60%'}}/>
        </div>
        <div style={{padding:'12px 16px'}}>
          {[85,70,90,65,80].map((w,i)=><div key={i} style={{height:3,background:'rgba(255,255,255,0.07)',borderRadius:2,margin:'4px 0',width:`${w}%`}}/>)}
        </div>
      </div>
    ),
    corporate: (
      <div style={{transform:'scale(0.42)', transformOrigin:'top left', width:238, background:'white', padding:'16px', pointerEvents:'none'}}>
        <div style={{textAlign:'center', borderBottom:'2px solid #0f172a', paddingBottom:8, marginBottom:10}}>
          <div style={{fontWeight:800, fontSize:13, fontFamily:'Syne,sans-serif', color:'#0f172a'}}>ALEX JOHNSON</div>
          <div style={{fontSize:8, color:'#64748b'}}>Senior Software Engineer</div>
          <div style={{fontSize:7, color:'#94a3b8', marginTop:2}}>alex@example.com | linkedin.com/in/alex</div>
        </div>
        {['Experience','Education','Skills'].map(s=>(
          <div key={s} style={{marginBottom:8}}>
            <div style={{fontSize:7,fontWeight:800,color:'#0f172a',textTransform:'uppercase',letterSpacing:.5,marginBottom:3}}>{s}</div>
            <div style={{height:3,background:'#f1f5f9',borderRadius:2,marginBottom:2}}/>
            <div style={{height:3,background:'#f1f5f9',borderRadius:2,width:'75%'}}/>
          </div>
        ))}
      </div>
    ),
  };
  return previews[id] || null;
}
