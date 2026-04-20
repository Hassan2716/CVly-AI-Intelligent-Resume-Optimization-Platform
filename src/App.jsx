import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import ATSOptimizer from './pages/ATSOptimizer';
import Templates from './pages/Templates';
import JobMatch from './pages/JobMatch';
import CoverLetter from './pages/CoverLetter';
import InterviewPrep from './pages/InterviewPrep';
import Versions from './pages/Versions';
import AIPanel from './components/AIPanel';
import Toast from './components/Toast';
import { loadResumes, saveResumes, SAMPLE_RESUME, quickScore } from './utils/resumeUtils';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [resumes, setResumes] = useState(() => loadResumes());
  const [activeResumeId, setActiveResumeId] = useState(() => loadResumes()[0]?.id || 'resume_1');
  const [aiOpen, setAiOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('executive');

  const activeResume = resumes.find(r => r.id === activeResumeId) || resumes[0];

  useEffect(() => { saveResumes(resumes); }, [resumes]);

  function showToast(msg, type = 'default') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function updateResumeData(newData) {
    setResumes(prev => prev.map(r =>
      r.id === activeResumeId
        ? { ...r, data: newData, updatedAt: new Date().toISOString(), score: quickScore(newData) }
        : r
    ));
  }

  function createNewResume() {
    const id = `resume_${Date.now()}`;
    const newResume = {
      id,
      name: 'New Resume',
      data: JSON.parse(JSON.stringify(SAMPLE_RESUME)),
      score: 0,
      updatedAt: new Date().toISOString()
    };
    setResumes(prev => [newResume, ...prev]);
    setActiveResumeId(id);
    setPage('editor');
    showToast('✨ New resume created!');
  }

  const pages = {
    dashboard: <Dashboard resumes={resumes} activeResume={activeResume} setPage={setPage} setActiveResumeId={setActiveResumeId} createNew={createNewResume} showToast={showToast} />,
    editor: <Editor resume={activeResume} updateData={updateResumeData} showToast={showToast} selectedTemplate={selectedTemplate} setPage={setPage} />,
    ats: <ATSOptimizer resume={activeResume} updateData={updateResumeData} showToast={showToast} />,
    templates: <Templates selected={selectedTemplate} onSelect={t => { setSelectedTemplate(t); showToast('Template applied!'); }} setPage={setPage} />,
    'job-match': <JobMatch resume={activeResume} updateData={updateResumeData} showToast={showToast} />,
    cover: <CoverLetter resume={activeResume} showToast={showToast} />,
    interview: <InterviewPrep resume={activeResume} showToast={showToast} />,
    versions: <Versions resumeId={activeResumeId} currentData={activeResume?.data} updateData={updateResumeData} showToast={showToast} />
  };

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <Sidebar page={page} setPage={setPage} createNew={createNewResume} />

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', marginLeft:224 }}>
        <Topbar page={page} resume={activeResume} setAiOpen={() => setAiOpen(o => !o)} showToast={showToast} setPage={setPage} />

        <main style={{
          flex:1, overflowY:'auto',
          background: page === 'editor' ? 'var(--bg)' : 'var(--bg)',
          transition: 'margin-right .25s ease',
          marginRight: aiOpen ? 340 : 0
        }}>
          {pages[page] || pages.dashboard}
        </main>
      </div>

      <AIPanel
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        resume={activeResume?.data}
        showToast={showToast}
      />

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
