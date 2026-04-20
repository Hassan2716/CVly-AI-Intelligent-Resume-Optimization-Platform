// Resume data management — localStorage-based version control

export const BLANK_RESUME = {
  personalInfo: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    summary: ''
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: []
};

export const SAMPLE_RESUME = {
  personalInfo: {
    name: 'Alex Johnson',
    title: 'Senior Software Engineer',
    email: 'alex@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexjohnson',
    website: 'alexjohnson.dev',
    summary: 'Results-driven Software Engineer with 6+ years building scalable web applications and distributed systems. Led cross-functional teams delivering high-impact products used by millions. Passionate about clean architecture, developer experience, and mentoring engineers.'
  },
  experience: [
    {
      id: 'exp1',
      role: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      startDate: 'Jan 2021',
      endDate: 'Present',
      current: true,
      bullets: [
        'Led migration of monolithic architecture to microservices, reducing API latency by 60% and improving system reliability to 99.9% uptime',
        'Engineered real-time analytics dashboard serving 50,000+ concurrent users with sub-100ms response times',
        'Mentored and grew a team of 5 engineers, improving sprint velocity by 30% through targeted coaching',
        'Architected event-driven data pipeline processing 2M+ events/day using Kafka and Node.js'
      ]
    },
    {
      id: 'exp2',
      role: 'Software Engineer',
      company: 'StartupXYZ',
      location: 'Remote',
      startDate: 'Jun 2018',
      endDate: 'Dec 2020',
      current: false,
      bullets: [
        'Built full-stack SaaS platform from ground up using React and Node.js, acquired 5,000+ users in first quarter',
        'Integrated 12+ third-party APIs reducing manual workflows by 70% and saving $200K annually',
        'Implemented CI/CD pipeline cutting deployment time from 2 hours to 8 minutes'
      ]
    }
  ],
  education: [
    {
      id: 'edu1',
      degree: 'BSc Computer Science',
      school: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      startDate: '2014',
      endDate: '2018',
      gpa: '3.8',
      honors: 'Magna Cum Laude'
    }
  ],
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'PostgreSQL', 'Docker', 'Redis', 'GraphQL', 'Kubernetes', 'System Design', 'CI/CD'],
  projects: [
    {
      id: 'proj1',
      name: 'OpenMetrics Dashboard',
      description: 'Open-source real-time metrics visualization tool with 2,000+ GitHub stars',
      tech: ['React', 'D3.js', 'WebSockets', 'Go'],
      link: 'github.com/alexjohnson/openmetrics'
    }
  ],
  certifications: [
    { id: 'cert1', name: 'AWS Solutions Architect — Professional', issuer: 'Amazon Web Services', date: '2022' }
  ],
  languages: [
    { id: 'lang1', language: 'English', level: 'Native' },
    { id: 'lang2', language: 'Spanish', level: 'Conversational' }
  ]
};

// ─── LOCAL STORAGE OPERATIONS ─────────────────────────────────────────────

const STORAGE_KEY = 'cvly_resumes';
const VERSIONS_KEY = 'cvly_versions';

export function loadResumes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [{ id: 'resume_1', name: 'My Resume', data: SAMPLE_RESUME, score: 82, updatedAt: new Date().toISOString() }];
    return JSON.parse(raw);
  } catch { return []; }
}

export function saveResumes(resumes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
}

export function loadVersions(resumeId) {
  try {
    const raw = localStorage.getItem(`${VERSIONS_KEY}_${resumeId}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveVersion(resumeId, versionData, label) {
  const versions = loadVersions(resumeId);
  const newVersion = {
    id: `v${Date.now()}`,
    label: label || `Version ${versions.length + 1}`,
    data: versionData,
    timestamp: new Date().toISOString(),
    score: versionData._atsScore || 0
  };
  versions.unshift(newVersion);
  localStorage.setItem(`${VERSIONS_KEY}_${resumeId}`, JSON.stringify(versions.slice(0, 20)));
  return newVersion;
}

// ─── RESUME PARSING ───────────────────────────────────────────────────────

export async function parseResumeText(text) {
  // Simple heuristic parser — in production use Affinda/Sovren API
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const resume = JSON.parse(JSON.stringify(BLANK_RESUME));

  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) resume.personalInfo.email = emailMatch[0];

  // Extract phone
  const phoneMatch = text.match(/[\+]?[\d\s\-().]{10,}/);
  if (phoneMatch) resume.personalInfo.phone = phoneMatch[0].trim();

  // Extract LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) resume.personalInfo.linkedin = linkedinMatch[0];

  // First non-empty line likely name
  if (lines[0] && lines[0].length < 60 && !lines[0].includes('@')) {
    resume.personalInfo.name = lines[0];
  }

  // Look for summary section
  const summaryIdx = lines.findIndex(l => /summary|profile|objective/i.test(l));
  if (summaryIdx !== -1) {
    const summaryLines = [];
    for (let i = summaryIdx + 1; i < Math.min(summaryIdx + 6, lines.length); i++) {
      if (/^(experience|education|skills|work)/i.test(lines[i])) break;
      summaryLines.push(lines[i]);
    }
    resume.personalInfo.summary = summaryLines.join(' ');
  }

  // Extract skills section
  const skillsIdx = lines.findIndex(l => /^skills?/i.test(l));
  if (skillsIdx !== -1) {
    const skillLine = lines[skillsIdx + 1] || '';
    resume.skills = skillLine.split(/[,|•·]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 30);
  }

  return resume;
}

// ─── PDF EXPORT ───────────────────────────────────────────────────────────

export async function exportToPDF(elementId, filename = 'resume') {
  const { default: html2canvas } = await import('html2canvas');
  const { jsPDF } = await import('jspdf');

  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${filename}.pdf`);
}

// ─── SCORING HELPERS ──────────────────────────────────────────────────────

export function quickScore(resumeData) {
  let score = 0;
  const pi = resumeData.personalInfo || {};
  if (pi.name) score += 5;
  if (pi.email) score += 5;
  if (pi.phone) score += 5;
  if (pi.linkedin) score += 5;
  if (pi.summary && pi.summary.length > 50) score += 15;
  if (resumeData.experience?.length > 0) score += 20;
  if (resumeData.experience?.length > 1) score += 10;
  const totalBullets = resumeData.experience?.reduce((a, e) => a + (e.bullets?.length || 0), 0) || 0;
  if (totalBullets >= 6) score += 15;
  const hasMetrics = resumeData.experience?.some(e => e.bullets?.some(b => /\d+%|\d+x|\$\d+|\d+ (users|engineers|teams)/i.test(b)));
  if (hasMetrics) score += 10;
  if (resumeData.skills?.length >= 6) score += 5;
  if (resumeData.education?.length > 0) score += 5;
  return Math.min(score, 100);
}

export function genId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2,6)}`;
}
