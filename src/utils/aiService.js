// CVly AI — Claude API Integration Layer
// Uses Anthropic's claude-sonnet-4-20250514 for all AI features

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL   = 'claude-sonnet-4-20250514';

async function callClaude(systemPrompt, userMessage, maxTokens = 1000) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

// ─── RESUME OPTIMIZATION ───────────────────────────────────────────────────

export async function rewriteSummary(currentSummary, jobTitle, skills) {
  const system = `You are an expert resume writer specializing in ATS optimization.
Write compelling, quantified professional summaries. Be concise (3-4 sentences max).
Use strong action verbs. Focus on impact and value delivered. Return ONLY the summary text, no preamble.`;
  const prompt = `Rewrite this professional summary for a ${jobTitle} role.
Current skills: ${skills.join(', ')}

Current summary:
${currentSummary}

Make it more impactful, ATS-friendly, and compelling. Use first-person implied style (no "I").`;
  return callClaude(system, prompt, 300);
}

export async function enhanceBullets(bullets, role, company) {
  const system = `You are an expert resume writer. Transform weak bullet points into powerful, 
quantified achievement statements using the STAR method (Situation, Task, Action, Result).
Use strong action verbs (Led, Engineered, Architected, Delivered, Scaled, etc.).
Add realistic placeholder metrics where missing (e.g., "by X%", "serving X users").
Return ONLY a JSON array of improved bullet strings. No markdown, no explanation.`;
  const prompt = `Improve these bullet points for ${role} at ${company}:
${JSON.stringify(bullets)}
Return as JSON array: ["bullet1", "bullet2", ...]`;
  const raw = await callClaude(system, prompt, 600);
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return bullets;
  }
}

export async function generateSkillSuggestions(role, currentSkills, industry = '') {
  const system = `You are a technical recruiter and career expert. Return ONLY a JSON array of skill strings.
No explanation, no markdown. Skills should be specific, ATS-relevant keywords.`;
  const prompt = `Suggest 12 additional skills for a ${role}${industry ? ` in ${industry}` : ''}.
Current skills: ${currentSkills.join(', ')}.
Focus on in-demand, ATS-scanned keywords. Return JSON array of strings only.`;
  const raw = await callClaude(system, prompt, 300);
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return [];
  }
}

// ─── ATS ANALYSIS ─────────────────────────────────────────────────────────

export async function analyzeATS(resumeData, jobDescription) {
  const system = `You are an ATS (Applicant Tracking System) expert. Analyze resumes against job descriptions.
Return ONLY valid JSON matching the exact schema provided. No markdown, no explanation.`;
  const prompt = `Analyze this resume against the job description.

RESUME:
${JSON.stringify(resumeData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Return JSON with this EXACT schema:
{
  "overall_score": <number 0-100>,
  "keyword_score": <number 0-100>,
  "format_score": <number 0-100>,
  "readability_score": <number 0-100>,
  "completeness_score": <number 0-100>,
  "impact_score": <number 0-100>,
  "match_percentage": <number 0-100>,
  "matched_keywords": ["keyword1", "keyword2"],
  "missing_keywords": ["keyword1", "keyword2"],
  "issues": [
    { "type": "error|warning|ok", "section": "string", "message": "string", "fix": "string" }
  ],
  "summary": "One sentence overall assessment"
}`;
  const raw = await callClaude(system, prompt, 800);
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

// ─── JOB TAILORING ────────────────────────────────────────────────────────

export async function tailorResume(resumeData, jobDescription) {
  const system = `You are an expert resume tailoring specialist. 
Modify resume content to specifically match the job description while keeping it truthful.
Return ONLY valid JSON. No explanation.`;
  const prompt = `Tailor this resume for the following job description.

CURRENT RESUME:
${JSON.stringify(resumeData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Return the complete modified resume as JSON with the same schema as input, plus a "changes" array listing what you changed.
Keep all factual information accurate — only rephrase and reorder, don't fabricate.`;
  const raw = await callClaude(system, prompt, 1000);
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

// ─── COVER LETTER ─────────────────────────────────────────────────────────

export async function generateCoverLetter(resumeData, jobTitle, company, tone = 'professional') {
  const system = `You are an elite career coach writing persuasive cover letters.
Write in a ${tone} tone. Be specific, compelling, and human.
3 paragraphs: hook + value proposition, key achievements that match role, closing CTA.
Under 350 words. Return ONLY the letter text, no "Dear" template labels.`;
  const prompt = `Write a cover letter for ${resumeData.personalInfo?.name || 'the applicant'} applying to ${jobTitle} at ${company}.

Resume highlights:
- Current role: ${resumeData.experience?.[0]?.role || 'Professional'}
- Key skills: ${resumeData.skills?.slice(0,8).join(', ') || 'various'}
- Top achievement: ${resumeData.experience?.[0]?.bullets?.[0] || 'Delivered significant results'}
- Education: ${resumeData.education?.[0]?.degree || ''} from ${resumeData.education?.[0]?.school || ''}

Start directly with the opening paragraph (no "Dear Hiring Manager" — that's added separately).`;
  return callClaude(system, prompt, 500);
}

// ─── INTERVIEW PREP ───────────────────────────────────────────────────────

export async function generateInterviewQuestions(resumeData, jobTitle) {
  const system = `You are a senior technical interviewer and career coach.
Generate realistic, targeted interview questions. Return ONLY valid JSON array.`;
  const prompt = `Generate 10 interview questions for ${resumeData.personalInfo?.name || 'candidate'} interviewing for ${jobTitle}.
Based on their background: ${resumeData.experience?.[0]?.role || 'professional'} with skills: ${resumeData.skills?.slice(0,6).join(', ')}.

Return JSON array:
[{ "question": "...", "category": "Technical|Behavioral|Leadership|System Design", "difficulty": "Easy|Medium|Hard", "tip": "Key point to address in answer" }]`;
  const raw = await callClaude(system, prompt, 800);
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return [];
  }
}

export async function getIdealAnswer(question, resumeData) {
  const system = `You are an expert career coach helping candidates ace interviews.
Provide a structured STAR-method answer framework. Be specific and practical.
Return ONLY the answer guidance (2-3 paragraphs). No headers.`;
  const prompt = `How should ${resumeData.personalInfo?.name || 'the candidate'} answer this interview question:
"${question}"

Their background: ${resumeData.experience?.[0]?.role || 'Professional'} with skills: ${resumeData.skills?.slice(0,5).join(', ')}.
Reference their real experience where relevant. Keep it conversational and confident.`;
  return callClaude(system, prompt, 400);
}

// ─── SKILL GAP ANALYSIS ───────────────────────────────────────────────────

export async function analyzeSkillGap(resumeData, jobTitle, jobDescription) {
  const system = `You are a technical recruiter analyzing skill gaps. Return ONLY valid JSON.`;
  const prompt = `Analyze skill gaps for ${resumeData.personalInfo?.name || 'candidate'} targeting ${jobTitle}.
Their current skills: ${resumeData.skills?.join(', ')}.
Job requirements from: ${jobDescription.substring(0, 500)}

Return JSON:
{
  "readiness_score": <0-100>,
  "skill_gaps": [
    { "skill": "name", "current_level": <0-100>, "required_level": <0-100>, "priority": "critical|important|nice-to-have", "learning_resource": "suggestion" }
  ],
  "strengths": ["skill1", "skill2"],
  "learning_path": ["step1", "step2", "step3"]
}`;
  const raw = await callClaude(system, prompt, 600);
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

// ─── CHAT ASSISTANT ───────────────────────────────────────────────────────

export async function chatWithAI(messages, resumeData) {
  const system = `You are CVly AI, an intelligent resume and career assistant built into the CVly AI platform.
You have full context of the user's resume and help them improve it.
Be concise, actionable, and specific. Use the resume data to give personalized advice.
Current resume: ${JSON.stringify(resumeData).substring(0, 1500)}

You can help with: rewriting content, keyword optimization, ATS scoring, career advice, cover letters, interview prep.`;
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system,
      messages: messages.map(m => ({ role: m.role, content: m.content }))
    })
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}
