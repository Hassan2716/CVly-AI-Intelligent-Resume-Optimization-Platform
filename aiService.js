// CVly AI — Google Gemini API Integration
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const API_KEY = AIzaSyBkp_pMPf65Fk12blrluDEAu-rXGTJpndI

async function callGemini(systemPrompt, userMessage, maxTokens = 1000) {
  const res = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }],
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 }
    })
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

export async function rewriteSummary(currentSummary, jobTitle, skills) {
  return callGemini(
    `You are an expert resume writer. Write compelling ATS-optimized professional summaries. Return ONLY the summary text, no preamble.`,
    `Rewrite this summary for a ${jobTitle} role. Skills: ${skills.join(', ')}\n\nCurrent: ${currentSummary}`
  );
}

export async function enhanceBullets(bullets, role, company) {
  const raw = await callGemini(
    `You are an expert resume writer. Transform bullet points into powerful quantified achievement statements. Return ONLY a JSON array of strings. No markdown.`,
    `Improve these bullets for ${role} at ${company}:\n${JSON.stringify(bullets)}\nReturn as JSON array: ["bullet1", "bullet2"]`
  );
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); }
  catch { return bullets; }
}

export async function generateSkillSuggestions(role, currentSkills) {
  const raw = await callGemini(
    `You are a technical recruiter. Return ONLY a JSON array of skill strings. No explanation.`,
    `Suggest 12 skills for a ${role}. Current skills: ${currentSkills.join(', ')}. Return JSON array only.`
  );
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); }
  catch { return []; }
}

export async function analyzeATS(resumeData, jobDescription) {
  const raw = await callGemini(
    `You are an ATS expert. Return ONLY valid JSON matching the exact schema. No markdown.`,
    `Analyze this resume against the job description.
RESUME: ${JSON.stringify(resumeData, null, 2)}
JOB: ${jobDescription}
Return JSON:
{
  "overall_score": <0-100>,
  "keyword_score": <0-100>,
  "format_score": <0-100>,
  "readability_score": <0-100>,
  "completeness_score": <0-100>,
  "impact_score": <0-100>,
  "match_percentage": <0-100>,
  "matched_keywords": ["keyword1"],
  "missing_keywords": ["keyword1"],
  "issues": [{ "type": "error|warning|ok", "section": "string", "message": "string", "fix": "string" }],
  "summary": "One sentence assessment"
}`
  , 800);
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); }
  catch { return null; }
}

export async function tailorResume(resumeData, jobDescription) {
  const raw = await callGemini(
    `You are a resume tailoring specialist. Modify resume content to match the job description. Return ONLY valid JSON.`,
    `Tailor this resume for the job. Keep facts accurate, only rephrase.
RESUME: ${JSON.stringify(resumeData, null, 2)}
JOB: ${jobDescription}
Return same JSON schema as input plus a "changes" array listing what changed.`
  , 1000);
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); }
  catch { return null; }
}

export async function generateCoverLetter(resumeData, jobTitle, company, tone = 'professional') {
  return callGemini(
    `You are an elite career coach writing persuasive cover letters. Tone: ${tone}. 3 paragraphs, under 350 words. Return ONLY the letter body, no greeting.`,
    `Write a cover letter for ${resumeData.personalInfo?.name} applying to ${jobTitle} at ${company}.
Skills: ${resumeData.skills?.slice(0,8).join(', ')}
Top achievement: ${resumeData.experience?.[0]?.bullets?.[0] || ''}
Start directly with the opening paragraph.`
  , 500);
}

export async function generateInterviewQuestions(resumeData, jobTitle) {
  const raw = await callGemini(
    `You are a senior interviewer. Generate realistic targeted questions. Return ONLY valid JSON array.`,
    `Generate 10 interview questions for ${jobTitle} role.
Background: ${resumeData.experience?.[0]?.role} with skills: ${resumeData.skills?.slice(0,6).join(', ')}
Return: [{ "question": "...", "category": "Technical|Behavioral|Leadership|System Design", "difficulty": "Easy|Medium|Hard", "tip": "key point to address" }]`
  , 800);
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); }
  catch { return []; }
}

export async function getIdealAnswer(question, resumeData) {
  return callGemini(
    `You are an expert career coach. Provide a structured STAR-method answer framework. 2-3 paragraphs, no headers.`,
    `How should ${resumeData.personalInfo?.name} answer: "${question}"
Their background: ${resumeData.experience?.[0]?.role}, skills: ${resumeData.skills?.slice(0,5).join(', ')}`
  , 400);
}

export async function analyzeSkillGap(resumeData, jobTitle, jobDescription) {
  const raw = await callGemini(
    `You are a technical recruiter analyzing skill gaps. Return ONLY valid JSON.`,
    `Analyze skill gaps for ${jobTitle}.
Current skills: ${resumeData.skills?.join(', ')}
Job: ${jobDescription.substring(0, 500)}
Return: {
  "readiness_score": <0-100>,
  "skill_gaps": [{ "skill": "name", "current_level": <0-100>, "required_level": <0-100>, "priority": "critical|important|nice-to-have", "learning_resource": "suggestion" }],
  "strengths": ["skill1"],
  "learning_path": ["step1", "step2"]
}`
  , 600);
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); }
  catch { return null; }
}

export async function chatWithAI(messages, resumeData) {
  const context = `You are CVly AI, an intelligent resume assistant. Be concise and actionable.
Current resume: ${JSON.stringify(resumeData).substring(0, 1500)}`;
  const history = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
  return callGemini(context, history, 1000);
}
