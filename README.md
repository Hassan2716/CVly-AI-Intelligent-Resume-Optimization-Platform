# ✦ CVly AI — Intelligent Resume Optimization Platform

> **AI-powered resume builder that helps you get hired faster.** Create, optimize, and tailor ATS-friendly resumes with real-time AI feedback, job matching, cover letter generation, and interview preparation — all in one platform.



---

## 📸 Preview

| Dashboard | Resume Editor | ATS Optimizer |
|-----------|--------------|---------------|
| Score trends, AI suggestions, activity feed | Live WYSIWYG editor with 3 templates | Real-time keyword analysis & scoring |

| Job Matching | Cover Letter | Interview Prep |
|-------------|-------------|----------------|
| Auto-tailor resume to any JD | AI-generated in 4 tone styles | Questions + skill gap analysis |

---

## ✨ Features

### 🎯 Core
- **Resume Editor** — Live split-panel editor with instant preview. Edit sections, bullets, skills in real time
- **6 Templates** — Executive Classic, Modern Split, Minimal Clean, Bold Impact, Dark Pro, Corporate Pro — all ATS-friendly
- **PDF Export** — High-quality, print-ready PDF generation with one click

### 🤖 AI-Powered (Gemini)
- **ATS Optimizer** — Score your resume 0–100 across 5 dimensions with detailed section feedback
- **Keyword Analysis** — Match and gap analysis against any job description
- **Bullet Point Enhancer** — Transform weak statements into quantified achievements
- **Summary Rewriter** — Generate compelling, role-specific professional summaries
- **Skill Suggestions** — AI recommends in-demand skills for your target role
- **Job Matching** — Paste any JD → AI auto-tailors your entire resume
- **Cover Letter Generator** — 4 tone options, personalized to your resume + target role
- **Interview Prep** — Role-specific questions by category with STAR-method answer guides
- **Skill Gap Analysis** — Visual gap chart with learning path recommendations
- **AI Chat Assistant** — Floating chat panel for on-demand resume advice

### 📁 Data & Workflow
- **Version Control** — Save snapshots, compare versions with side-by-side diff view
- **Persistent Storage** — All data saved locally, no account required
- **Dashboard** — Score trends, activity feed, AI suggestions at a glance

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org) v18 or higher
- A free [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/cvly-ai.git

# Navigate into the project
cd cvly-ai

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npm run dev
```

Open **http://localhost:3000** in your browser.

### API Key Setup

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Open `src/utils/aiService.js`
3. Replace `YOUR_GEMINI_API_KEY_HERE` with your key:

```js
const API_KEY = 'your-actual-key-here';
```

4. Save and restart the dev server — all AI features will be live instantly.

---

## 🏗️ Project Structure

```
cvly-ai/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                  # App entry point
    ├── App.jsx                   # Root component + routing state
    ├── styles/
    │   └── global.css            # Design system, CSS variables, animations
    ├── components/
    │   ├── Sidebar.jsx           # Navigation sidebar
    │   ├── Topbar.jsx            # Header with export + AI toggle
    │   ├── AIPanel.jsx           # Sliding AI chat assistant
    │   └── Toast.jsx             # Notification system
    ├── pages/
    │   ├── Dashboard.jsx         # Home: stats, resume list, activity
    │   ├── Editor.jsx            # WYSIWYG editor + live preview templates
    │   ├── ATSOptimizer.jsx      # ATS scoring, keyword gap, issue cards
    │   ├── Templates.jsx         # 6 template picker with thumbnails
    │   ├── JobMatch.jsx          # AI job tailoring + diff preview
    │   ├── CoverLetter.jsx       # AI cover letter with tone selector
    │   ├── InterviewPrep.jsx     # Questions + skill gap + readiness score
    │   └── Versions.jsx          # Snapshot history + diff view
    └── utils/
        ├── aiService.js          # All Gemini API calls (9 AI functions)
        └── resumeUtils.js        # Storage, PDF export, parsing, scoring
```

---

## 🔌 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5 |
| Styling | CSS-in-JS with CSS Variables |
| AI | Google Gemini 2.0 Flash |
| PDF Export | html2canvas + jsPDF |
| Storage | localStorage (client-side) |
| Fonts | Syne + DM Sans (Google Fonts) |
| Build | Vite |
| Deploy | Vercel / Netlify / Docker |

---

## 🚀 Deployment

### Vercel (Recommended — Free)
```bash
npm install -g vercel
npm run build
vercel --prod
```

### Netlify (Free)
```bash
npm run build
# Drag the dist/ folder to netlify.com/drop
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

```bash
docker build -t cvly-ai .
docker run -p 3000:3000 cvly-ai
```

---

## ⚙️ Environment Variables

For production deployments, use environment variables instead of hardcoding your API key:

Create a `.env` file in the root:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Update `aiService.js`:
```js
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
```

> ⚠️ Never commit your `.env` file. It's already in `.gitignore`.

---

## 🗺️ Roadmap

- [ ] User authentication (Supabase)
- [ ] Cloud storage (PostgreSQL + S3)
- [ ] Resume file upload + AI parsing (PDF/DOCX)
- [ ] LinkedIn profile import
- [ ] More templates (target: 10+)
- [ ] Shareable public resume links
- [ ] Multi-language support
- [ ] Mobile responsive redesign
- [ ] Team/agency plan with multiple profiles
- [ ] Job application tracker

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Google Gemini](https://deepmind.google/technologies/gemini/) — AI engine
- [Syne Font](https://fonts.google.com/specimen/Syne) — Display typography
- [DM Sans](https://fonts.google.com/specimen/DM+Sans) — Body typography
- [jsPDF](https://github.com/parallax/jsPDF) — PDF generation
- [html2canvas](https://html2canvas.hertzen.com/) — Resume rendering

---

<div align="center">
  <strong>Built with ✦ by CVly AI</strong><br/>
  <sub>If this helped you, please ⭐ star the repo!</sub>
</div>
