import React, { useState } from 'react';
import { generateInterviewQuestions, getIdealAnswer, analyzeSkillGap } from '../utils/aiService';

export default function InterviewPrep({ resume, showToast }) {
  const [questions, setQuestions] = useState([]);
  const [skillGap, setSkillGap] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState({ questions: false, skills: false });
  const [selectedQ, setSelectedQ] = useState(null);
  const [answer, setAnswer] = useState('');
  const [answerLoading, setAnswerLoading] = useState(false);
  const [tab, setTab] = useState('questions');

  async function generateQuestions() {
    if (!jobTitle) { showToast('Enter a job title first', 'error'); return; }
    setLoading(p => ({ ...p, questions: true }));
    showToast('🤖 Generating interview questions...');
    try {
      const qs = await generateInterviewQuestions(resume?.data, jobTitle);
      setQuestions(qs);
      showToast(`✅ ${qs.length} questions generated!`, 'success');
    } catch (err) {
      showToast(`❌ Error: ${err.message}`, 'error');
    } finally {
      setLoading(p => ({ ...p, questions: false }));
    }
  }

  async function analyzeGap() {
    if (!jobTitle) { showToast('Enter a job title first', 'error'); return; }
    setLoading(p => ({ ...p, skills: true }));
    showToast('🧠 Analyzing skill gaps...');
    try {
      const gap = await analyzeSkillGap(resume?.data, jobTitle, jobDesc);
      setSkillGap(gap);
      showToast('✅ Skill gap analysis complete!', 'success');
    } catch (err) {
      showToast(`❌ Error: ${err.message}`, 'error');
    } finally {
      setLoading(p => ({ ...p, skills: false }));
    }
  }

  async function getAnswer(question) {
    setSelectedQ(question);
    setAnswer('');
    setAnswerLoading(true);
    try {
      const ans = await getIdealAnswer(question.question, resume?.data);
      setAnswer(ans);
    } catch (err) {
      setAnswer(`Error getting answer: ${err.message}`);
    } finally {
      setAnswerLoading(false);
    }
  }

  const diffColor = { Easy: 'var(--green)', Medium: 'var(--amber)', Hard: 'var(--red)' };
  const catColor = { Technical: 'var(--cyan)', Behavioral: 'var(--accent2)', Leadership: 'var(--pink)', 'System Design': 'var(--amber)' };

  return (
    <div style={{ padding: 24 }}>
      {/* Setup bar */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
        padding: '14px 18px', marginBottom: 18,
        display: 'flex', alignItems: 'flex-end', gap: 12
      }}>
        <div style={{ flex: 1 }}>
          <div style={LabelStyle}>Target Role</div>
          <input value={jobTitle} onChange={e => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Software Engineer, Product Manager..."
            style={InputStyle} />
        </div>
        <div style={{ flex: 2 }}>
          <div style={LabelStyle}>Job Description (optional)</div>
          <input value={jobDesc} onChange={e => setJobDesc(e.target.value)}
            placeholder="Paste JD for more targeted questions and skill gap analysis..."
            style={InputStyle} />
        </div>
        <button onClick={generateQuestions} disabled={loading.questions} style={PrimaryBtn}>
          {loading.questions ? <><Spin /> Generating...</> : '⚡ Generate Questions'}
        </button>
        <button onClick={analyzeGap} disabled={loading.skills} style={SecondaryBtn}>
          {loading.skills ? <><Spin /> Analyzing...</> : '🧠 Skill Gap'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
        {['questions', 'skillgap'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)',
            background: tab === t ? 'var(--glow)' : 'transparent',
            color: tab === t ? 'var(--accent2)' : 'var(--text2)',
            borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`
          }}>
            {t === 'questions' ? `❓ Practice Questions ${questions.length ? `(${questions.length})` : ''}` : '📊 Skill Gap Analysis'}
          </button>
        ))}
      </div>

      {tab === 'questions' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Questions list */}
          <div>
            {questions.length === 0 ? (
              <EmptyState
                icon="❓"
                title="No questions yet"
                desc="Enter a job title and click Generate Questions to get AI-tailored interview questions based on your resume."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {questions.map((q, i) => (
                  <div key={i}
                    onClick={() => getAnswer(q)}
                    style={{
                      padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                      background: selectedQ?.question === q.question ? 'var(--glow)' : 'var(--bg2)',
                      border: `1px solid ${selectedQ?.question === q.question ? 'rgba(108,92,231,0.25)' : 'var(--border)'}`,
                      transition: 'all .15s'
                    }}
                  >
                    <div style={{ display: 'flex', gap: 7, marginBottom: 6, flexWrap: 'wrap' }}>
                      <Chip text={q.category} color={catColor[q.category] || 'var(--text2)'} />
                      <Chip text={q.difficulty} color={diffColor[q.difficulty] || 'var(--amber)'} />
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.6, fontWeight: 500 }}>{q.question}</div>
                    {q.tip && <div style={{ fontSize: 11.5, color: 'var(--text3)', marginTop: 5, fontStyle: 'italic' }}>💡 {q.tip}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Answer panel */}
          <div>
            {selectedQ ? (
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>AI Answer Guide</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text2)', lineHeight: 1.6 }}>"{selectedQ.question}"</div>
                </div>
                <div style={{ padding: 16 }}>
                  {answerLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ height: 12, borderRadius: 6, width: '90%' }} className="loading-skeleton" />
                      <div style={{ height: 12, borderRadius: 6, width: '75%' }} className="loading-skeleton" />
                      <div style={{ height: 12, borderRadius: 6, width: '85%' }} className="loading-skeleton" />
                      <div style={{ height: 12, borderRadius: 6, width: '60%' }} className="loading-skeleton" />
                    </div>
                  ) : (
                    <div style={{ fontSize: 13.5, lineHeight: 1.9, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{answer}</div>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState icon="💬" title="Select a question" desc="Click any question on the left to get an AI-generated answer guide tailored to your resume." />
            )}
          </div>
        </div>
      )}

      {tab === 'skillgap' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
          <div>
            {!skillGap ? (
              <EmptyState icon="📊" title="No analysis yet" desc="Enter a target role and click Skill Gap to see where you stand and what to learn." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Card title="🎯 Skill Gaps">
                  {(skillGap.skill_gaps || []).map((sg, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600 }}>{sg.skill}</span>
                          <PriorityBadge priority={sg.priority} />
                        </div>
                        <span style={{
                          color: sg.current_level >= sg.required_level ? 'var(--green)' : sg.current_level >= sg.required_level * 0.7 ? 'var(--amber)' : 'var(--red)',
                          fontSize: 12
                        }}>
                          {sg.current_level}% / {sg.required_level}% needed
                        </span>
                      </div>
                      <div style={{ height: 7, background: 'var(--bg4)', borderRadius: 10, overflow: 'hidden', marginBottom: 4 }}>
                        <div style={{
                          height: '100%', borderRadius: 10, transition: 'width .8s ease',
                          width: `${sg.current_level}%`,
                          background: sg.current_level >= sg.required_level ? 'var(--green)' : sg.current_level >= sg.required_level * 0.7 ? 'var(--amber)' : 'var(--red)'
                        }} />
                      </div>
                      {sg.learning_resource && (
                        <div style={{ fontSize: 11.5, color: 'var(--text3)' }}>📚 {sg.learning_resource}</div>
                      )}
                    </div>
                  ))}
                </Card>

                {skillGap.learning_path?.length > 0 && (
                  <Card title="🗺️ Learning Path">
                    {skillGap.learning_path.map((step, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          background: 'var(--glow)', border: '1px solid rgba(108,92,231,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700, color: 'var(--accent2)'
                        }}>{i + 1}</div>
                        <span style={{ color: 'var(--text2)', lineHeight: 1.6 }}>{step}</span>
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Readiness score */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Card title="📈 Interview Readiness">
              {skillGap ? (
                <>
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{
                      fontFamily: 'var(--font-head)', fontSize: 52, fontWeight: 800, letterSpacing: '-2px',
                      color: skillGap.readiness_score >= 75 ? 'var(--green)' : skillGap.readiness_score >= 55 ? 'var(--amber)' : 'var(--red)',
                      lineHeight: 1
                    }}>{skillGap.readiness_score}%</div>
                    <div style={{ fontSize: 14, color: 'var(--text2)', marginTop: 6 }}>
                      {skillGap.readiness_score >= 75 ? 'Interview Ready!' : skillGap.readiness_score >= 55 ? 'Almost There' : 'Needs Work'}
                    </div>
                  </div>
                  {skillGap.strengths?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>Your Strengths</div>
                      {skillGap.strengths.map(s => (
                        <div key={s} style={{ display: 'flex', gap: 7, padding: '5px 0', fontSize: 13, color: 'var(--green)' }}>
                          <span>✓</span> {s}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text3)', fontSize: 13 }}>
                  Run the skill gap analysis to see your interview readiness score
                </div>
              )}
            </Card>

            {/* Static tips */}
            <Card title="🎙️ Interview Tips">
              {[
                'Use the STAR method: Situation, Task, Action, Result',
                'Have 3 quantified achievements ready to discuss',
                'Research the company\'s recent news and products',
                'Prepare 2-3 smart questions to ask the interviewer',
                'Practice out loud — don\'t just read your answers',
              ].map((tip, i) => (
                <div key={i} style={{ fontSize: 12.5, color: 'var(--text2)', padding: '6px 0', borderBottom: '1px solid var(--border)', lineHeight: 1.6 }}>
                  {i + 1}. {tip}
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────

function Chip({ text, color }) {
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: `${color}18`, color, border: `1px solid ${color}30`
    }}>{text}</span>
  );
}

function PriorityBadge({ priority }) {
  const c = { critical: 'var(--red)', important: 'var(--amber)', 'nice-to-have': 'var(--green)' };
  return <Chip text={priority} color={c[priority] || 'var(--text2)'} />;
}

function EmptyState({ icon, title, desc }) {
  return (
    <div style={{
      textAlign: 'center', padding: '50px 24px',
      background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, maxWidth: 300, margin: '0 auto' }}>{desc}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      {title && <div style={{ padding: '11px 15px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'var(--font-head)', fontSize: 13.5, fontWeight: 700 }}>{title}</span>
      </div>}
      <div style={{ padding: '14px 15px' }}>{children}</div>
    </div>
  );
}

const LabelStyle = { fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 5 };
const InputStyle = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, padding: '8px 10px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)' };
const PrimaryBtn = { padding: '9px 16px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap', fontFamily: 'var(--font-body)' };
const SecondaryBtn = { padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap', fontFamily: 'var(--font-body)' };

function Spin() {
  return <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />;
}
