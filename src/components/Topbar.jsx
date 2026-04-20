import React from 'react';
import { exportToPDF } from '../utils/resumeUtils';

const TITLES = {
  dashboard: 'Dashboard',
  editor: 'Resume Editor',
  ats: 'ATS Optimizer',
  templates: 'Templates',
  'job-match': 'Job Matching & Tailoring',
  cover: 'Cover Letter Generator',
  interview: 'Interview Preparation',
  versions: 'Version History'
};

export default function Topbar({ page, resume, setAiOpen, showToast, setPage }) {
  async function handleExport() {
    showToast('⏳ Generating PDF...');
    try {
      await exportToPDF('resume-preview-page', resume?.name || 'resume');
      showToast('✅ PDF downloaded!', 'success');
    } catch {
      showToast('❌ Export failed — open Editor first', 'error');
    }
  }

  return (
    <header style={{
      height:54, background:'var(--bg2)', borderBottom:'1px solid var(--border)',
      display:'flex', alignItems:'center', padding:'0 20px', gap:12,
      position:'sticky', top:0, zIndex:50, flexShrink:0
    }}>
      <span style={{ fontFamily:'var(--font-head)', fontSize:16, fontWeight:700, flex:1 }}>
        {TITLES[page] || 'CVly AI'}
      </span>

      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {/* AI pulse indicator */}
        <div style={{
          display:'inline-flex', alignItems:'center', gap:6,
          padding:'4px 10px', background:'rgba(108,92,231,0.1)',
          border:'1px solid rgba(108,92,231,0.2)', borderRadius:20,
          fontSize:12, color:'var(--accent2)', fontWeight:500
        }}>
          <div style={{
            width:6, height:6, background:'var(--accent)', borderRadius:'50%',
            animation:'pulse 1.5s infinite'
          }}/>
          AI Ready
        </div>

        {page === 'editor' && (
          <button onClick={handleExport} style={btnStyle('ghost')}>
            ↓ Export PDF
          </button>
        )}

        <button onClick={setAiOpen} style={btnStyle('ghost')}>
          ✦ AI Chat
        </button>

        {page !== 'editor' && (
          <button onClick={() => setPage('editor')} style={btnStyle('primary')}>
            + New Resume
          </button>
        )}
      </div>
    </header>
  );
}

function btnStyle(variant) {
  const base = {
    display:'inline-flex', alignItems:'center', gap:6,
    padding:'6px 13px', borderRadius:8, fontSize:13,
    fontWeight:500, cursor:'pointer', border:'none',
    fontFamily:'var(--font-body)', transition:'all .15s'
  };
  if (variant === 'primary') return { ...base, background:'var(--accent)', color:'white' };
  return { ...base, background:'transparent', color:'var(--text2)', border:'1px solid var(--border2)' };
}
