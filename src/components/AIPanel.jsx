import React, { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '../utils/aiService';

const SUGGESTIONS = [
  'Improve my summary',
  'Add more keywords',
  'Enhance bullet points',
  'Check my ATS score',
  'What skills should I add?',
  'Make it more impactful'
];

export default function AIPanel({ open, onClose, resume, showToast }) {
  const [messages, setMessages] = useState([
    { role:'assistant', content:"Hi! I'm CVly AI. I've analyzed your resume and I'm ready to help you optimize it. What would you like to improve?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages]);

  async function send(text) {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    const userMsg = { role:'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const reply = await chatWithAI([...messages, userMsg], resume);
      setMessages(prev => [...prev, { role:'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role:'assistant', content:`I encountered an error: ${err.message}. Please check your API connection and try again.` }]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div style={{
      position:'fixed', right:0, top:54, bottom:0, width:340,
      background:'var(--bg2)', borderLeft:'1px solid var(--border)',
      display:'flex', flexDirection:'column', zIndex:90,
      animation:'fadeIn .2s ease'
    }}>
      {/* Header */}
      <div style={{
        padding:'12px 16px', borderBottom:'1px solid var(--border)',
        display:'flex', alignItems:'center', gap:10, flexShrink:0
      }}>
        <div style={{
          width:26, height:26, borderRadius:8, flexShrink:0,
          background:'linear-gradient(135deg, var(--accent), var(--pink))',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:13, color:'white'
        }}>✦</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:'var(--font-head)', fontSize:14, fontWeight:700}}>CVly AI Assistant</div>
          <div style={{fontSize:11, color:'var(--green)'}}>● Online — Claude powered</div>
        </div>
        <button onClick={onClose} style={{
          background:'none', border:'none', color:'var(--text2)',
          fontSize:18, cursor:'pointer', lineHeight:1, padding:4
        }}>×</button>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:14, display:'flex', flexDirection:'column', gap:10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            padding:'10px 12px', borderRadius:10, fontSize:13, lineHeight:1.7,
            border:'1px solid',
            background: m.role==='assistant' ? 'var(--glow)' : 'var(--bg3)',
            borderColor: m.role==='assistant' ? 'rgba(108,92,231,0.2)' : 'var(--border2)',
            alignSelf: m.role==='user' ? 'flex-end' : 'stretch',
            maxWidth: m.role==='user' ? '85%' : '100%'
          }}>
            {m.role==='assistant' && (
              <div style={{fontSize:10, fontWeight:700, color:'var(--accent2)', marginBottom:4, letterSpacing:.5}}>
                CVLY AI
              </div>
            )}
            <div style={{whiteSpace:'pre-wrap'}}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{
            padding:'10px 12px', borderRadius:10, fontSize:13,
            background:'var(--glow)', border:'1px solid rgba(108,92,231,0.2)'
          }}>
            <div style={{fontSize:10, fontWeight:700, color:'var(--accent2)', marginBottom:6, letterSpacing:.5}}>CVLY AI</div>
            <div style={{display:'flex', gap:5}}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width:6, height:6, borderRadius:'50%', background:'var(--accent)',
                  animation:`pulse 1.2s ${i*0.2}s infinite`
                }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Suggestions */}
      {messages.length < 3 && (
        <div style={{padding:'0 14px 10px', display:'flex', flexWrap:'wrap', gap:6}}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)} style={{
              padding:'4px 10px', borderRadius:20, fontSize:11.5,
              border:'1px solid var(--border2)', color:'var(--text2)',
              background:'transparent', cursor:'pointer', transition:'all .15s'
            }}
            onMouseEnter={e => { e.target.style.borderColor='var(--accent)'; e.target.style.color='var(--accent2)'; }}
            onMouseLeave={e => { e.target.style.borderColor='var(--border2)'; e.target.style.color='var(--text2)'; }}
            >{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{padding:'10px 12px', borderTop:'1px solid var(--border)', flexShrink:0}}>
        <div style={{display:'flex', gap:8}}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==='Enter' && !e.shiftKey && send()}
            placeholder="Ask anything about your resume..."
            disabled={loading}
            style={{
              flex:1, background:'var(--bg3)', border:'1px solid var(--border2)',
              borderRadius:8, padding:'8px 11px', color:'var(--text)',
              fontSize:13, outline:'none', fontFamily:'var(--font-body)'
            }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{
            width:34, height:34, borderRadius:8,
            background: input.trim() ? 'var(--accent)' : 'var(--bg4)',
            border:'none', color:'white', fontSize:15, cursor:'pointer',
            flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center'
          }}>↑</button>
        </div>
      </div>
    </div>
  );
}
