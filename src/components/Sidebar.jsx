import React from 'react';

const NAV = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'editor',    icon: '✎', label: 'Resume Editor' },
  { id: 'ats',       icon: '◎', label: 'ATS Optimizer', badge: 'AI' },
  { id: 'templates', icon: '⊡', label: 'Templates' },
  null,
  { id: 'job-match', icon: '⇌', label: 'Job Matching', badge: 'AI' },
  { id: 'cover',     icon: '✉', label: 'Cover Letter', badge: 'AI' },
  { id: 'interview', icon: '◈', label: 'Interview Prep', badge: 'AI' },
  null,
  { id: 'versions',  icon: '⊙', label: 'Versions' },
];

const S = {
  sidebar: {
    width:224, minHeight:'100vh', background:'var(--bg2)',
    borderRight:'1px solid var(--border)', display:'flex',
    flexDirection:'column', position:'fixed', left:0, top:0, bottom:0, zIndex:100
  },
  logo: {
    padding:'18px 18px 14px', borderBottom:'1px solid var(--border)',
    fontFamily:'var(--font-head)', fontSize:21, fontWeight:800,
    letterSpacing:'-0.5px', display:'flex', alignItems:'center', gap:10
  },
  logoIcon: {
    width:30, height:30, borderRadius:8, flexShrink:0,
    background:'linear-gradient(135deg, #6c5ce7, #fd79a8)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:14, color:'white'
  },
  nav: { padding:'10px 8px', flex:1, display:'flex', flexDirection:'column', gap:1 },
  divider: { height:1, background:'var(--border)', margin:'8px 10px' },
  navItem: (active) => ({
    display:'flex', alignItems:'center', gap:9,
    padding:'8px 12px', borderRadius:8,
    cursor:'pointer', fontSize:13.5,
    color: active ? 'var(--accent2)' : 'var(--text2)',
    background: active ? 'var(--glow)' : 'transparent',
    border: `1px solid ${active ? 'rgba(108,92,231,0.2)' : 'transparent'}`,
    fontWeight: active ? 500 : 400,
    transition:'all .15s',
    userSelect:'none'
  }),
  icon: { fontSize:14, width:17, textAlign:'center', flexShrink:0 },
  badge: {
    marginLeft:'auto', background:'var(--accent)', color:'white',
    fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:20, letterSpacing:.5
  },
  footer: { padding:'10px 10px', borderTop:'1px solid var(--border)' },
  userCard: {
    display:'flex', alignItems:'center', gap:10,
    padding:'8px 10px', borderRadius:8, cursor:'pointer', transition:'background .15s'
  },
  avatar: {
    width:32, height:32, borderRadius:'50%', flexShrink:0,
    background:'linear-gradient(135deg, var(--accent), var(--cyan))',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:12, fontWeight:700, color:'white'
  }
};

export default function Sidebar({ page, setPage, createNew }) {
  return (
    <aside style={S.sidebar}>
      <div style={S.logo}>
        <div style={S.logoIcon}>✦</div>
        CVly<span style={{color:'var(--accent2)'}}>AI</span>
      </div>

      <nav style={S.nav}>
        {NAV.map((item, i) => {
          if (!item) return <div key={i} style={S.divider}/>;
          const active = page === item.id;
          return (
            <div
              key={item.id}
              style={S.navItem(active)}
              onClick={() => setPage(item.id)}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background='var(--bg3)'; e.currentTarget.style.color='var(--text)'; }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text2)'; } }}
            >
              <span style={S.icon}>{item.icon}</span>
              {item.label}
              {item.badge && <span style={S.badge}>{item.badge}</span>}
            </div>
          );
        })}
      </nav>

      <div style={S.footer}>
        <button
          onClick={createNew}
          style={{
            width:'100%', padding:'8px', borderRadius:8, marginBottom:8,
            background:'var(--glow)', border:'1px solid rgba(108,92,231,0.2)',
            color:'var(--accent2)', fontSize:13, fontWeight:600, cursor:'pointer',
            transition:'all .15s'
          }}
        >+ New Resume</button>
        <div style={S.userCard}>
          <div style={S.avatar}>AJ</div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:13, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>Alex Johnson</div>
            <div style={{fontSize:11, color:'var(--accent2)'}}>✦ Pro Plan</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
