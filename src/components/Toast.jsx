import React, { useEffect, useState } from 'react';

export default function Toast({ msg, type }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 10); }, []);
  const colors = { success:'var(--green)', error:'var(--red)', default:'var(--accent2)' };
  return (
    <div style={{
      position:'fixed', bottom:24, right:24, zIndex:9999,
      background:'var(--bg3)', border:'1px solid var(--border3)',
      borderLeft:`3px solid ${colors[type]||colors.default}`,
      borderRadius:10, padding:'11px 16px',
      fontSize:13, color:'var(--text)',
      display:'flex', alignItems:'center', gap:10,
      boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      opacity: visible ? 1 : 0,
      transition:'all .25s ease'
    }}>
      {msg}
    </div>
  );
}
