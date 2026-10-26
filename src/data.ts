// All site content lives here so it can be edited without touching layout code.

export const profile = {
  name: 'Sreehari Ramesh',
  role: 'AI/ML Engineer',
  location: 'UAE',
  email: 'sreehariramesh14581@gmail.com',
  github: 'https://github.com/Sreehari-Ramesh',
  linkedin: 'https://www.linkedin.com/in/sreehari-ramesh-25b636224/',
  x: 'https://x.com/SreehariRamesh0',
  // Formspree form that delivers contact-form messages to the email above
  formspreeId: 'mljgqyvb',
}

export const facts: { term: string; detail: string }[] = [
  { term: 'Focus', detail: 'Agentic AI, RAG pipelines and LLM backends' },
  { term: 'In production since 2023', detail: 'At product and services companies in the UAE and India' },
  { term: 'Background', detail: "Master's in Physics, with published research" },
]

// Each word lists the words it "attends" to most, from 0 to 1.
export const statement = {
  text: 'Good AI systems work like a team: models that reason, tools that act, retrieval that grounds each answer, and people who check the work.',
  links: {
    good: { systems: 0.8, ai: 0.6 },
    ai: { systems: 0.9, models: 0.7 },
    systems: { ai: 0.8, team: 0.9, models: 0.7, tools: 0.6, retrieval: 0.6, people: 0.6 },
    team: { systems: 0.9, people: 0.75, models: 0.6, tools: 0.6, retrieval: 0.6 },
    models: { reason: 0.95, ai: 0.6, team: 0.5 },
    reason: { models: 0.95, answer: 0.5 },
    tools: { act: 0.95, models: 0.5 },
    act: { tools: 0.95, team: 0.4 },
    retrieval: { grounds: 0.95, answer: 0.8 },
    grounds: { retrieval: 0.9, answer: 0.9, each: 0.5 },
    answer: { grounds: 0.85, retrieval: 0.75, each: 0.6, check: 0.5 },
    people: { check: 0.9, work: 0.75, team: 0.6 },
    check: { work: 0.9, people: 0.85, answer: 0.5 },
    work: { check: 0.8, people: 0.6, team: 0.6 },
  } as Record<string, Record<string, number>>,
}

export type Project = {
  name: string
  summary: string
  // one paragraph: the need, then what was built
  story: string
  // the closing sentence of that paragraph, set brighter
  outcome: string
  stack: string[]
  repo?: string
  context?: string
}

export const featured: Project[] = [
  {
    name: 'Loomin-Docs',
    summary: 'A shared document editor with an AI assistant that runs fully offline.',
    story:
      "Teams working with sensitive documents can't paste them into cloud AI tools, so I built a shared editor whose assistant answers from your own files and cites the passages it used, with every model running locally through Ollama.",
    outcome: 'It installs on an air-gapped RHEL 9 server from a single bundle.',
    stack: ['React', 'TipTap', 'FastAPI', 'WebSockets', 'FAISS', 'Ollama', 'Docker'],
    repo: 'https://github.com/Sreehari-Ramesh/Loomin-docs_',
  },
  {
    name: 'Dubai travel agents',
    summary: 'A chat where a small team of agents finds and books activities in Dubai.',
    story:
      'Booking activities over chat means answering questions, checking availability and knowing when a person should step in. A root agent routes each message to an information or booking specialist and escalates hard cases to a human supervisor by email.',
    outcome: 'Their reply flows straight back into the same conversation.',
    stack: ['Google ADK', 'LiteLLM', 'FastAPI', 'React', 'SMTP / IMAP'],
    repo: 'https://github.com/Sreehari-Ramesh/multi-agent-travel-assistant-system',
  },
  {
    name: 'Text-to-SQL agent',
    summary: 'Lets a business ask its own database questions in plain language.',
    story:
      'Business teams were waiting on manual reports for simple questions about their own data. This agent turns a plain-language question into SQL, runs it, does the sums and explains the answer in a sentence.',
    outcome: 'It cut reliance on manual reporting by about 70%.',
    stack: ['Python', 'LLM tool calling', 'SQL', 'SQLAlchemy', 'FastAPI'],
    context: 'Built at White Paper Alliance',
  },
]

export type Earlier = { name: string; note: string; kind: string; repo: string }

export const earlier: Earlier[] = [
  { name: 'Chat with PDF using Llama 2', note: 'Ask questions about a PDF with an open-source LLM', kind: 'LLM', repo: 'Chat-with-PDF-using-Llama2' },
  { name: 'Image recognition', note: 'Classifying images with a neural network', kind: 'Deep learning', repo: 'Image-recognition-using-AI' },
  { name: 'Credit card fraud detection', note: 'Spotting fraudulent transactions in imbalanced data', kind: 'ML', repo: 'Credit-Card-Fraud-Detection' },
  { name: 'Bengaluru home prices', note: 'Predicting house prices from location and size', kind: 'ML', repo: 'Bengaluru-Home-price-prediction' },
  { name: 'Medical cost prediction', note: 'Exploring and modelling insurance charges', kind: 'ML', repo: 'Medical-Cost-Prediction-EDA-Model-' },
  { name: 'Student performance', note: 'Predicting exam scores from study habits', kind: 'ML', repo: 'Student-performance-prediction' },
  { name: 'Global terrorism dashboard', note: 'Interactive dashboard of incidents worldwide', kind: 'Analytics', repo: 'GLOBAL-TERRORISM-DASHBOARD' },
  { name: 'Customer personality sales', note: 'Segmenting customers to explain sales', kind: 'Analytics', repo: 'Sales-Analysis-Based-on-Customer-Personality' },
]

// One entry per company, newest first. Results with a figure lead with it in
// bold; the rest read as plain lines.
export type Role = {
  org: string
  role: string
  period: string
  place: string
  summary: string
  results: { figure?: string; text: string }[]
}

export const experience: Role[] = [
  {
    org: 'Cyber Core Technology',
    role: 'AI/ML Engineer',
    period: 'Aug 2026 – now',
    place: 'Abu Dhabi',
    summary: 'My current role, building AI and machine learning systems as part of the engineering team.',
    results: [],
  },
  {
    org: 'White Paper Alliance',
    role: 'AI/ML Engineer',
    period: 'Jul 2025 – Jul 2026',
    place: 'Dubai',
    summary: 'Shipped production GenAI: assistants, retrieval services and automation used across the business.',
    results: [
      { figure: '80%+', text: 'of onboarding and support queries handled by assistants on WhatsApp, Telegram and the web, across 5,000+ conversations a month' },
      { figure: '~70%', text: 'less manual reporting once people could ask the database questions directly through a Text-to-SQL agent' },
      { figure: '~40%', text: 'lower retrieval latency from re-ranking and persistent vector indexes' },
      { figure: '< 1 hr', text: 'per SEO audit, down from days, with automated issue detection and scoring' },
      { figure: '100+', text: 'business groups moved to an automated reminder bot with access control and an audit trail' },
    ],
  },
  {
    org: 'Innoneur',
    role: 'AI/ML Engineer, earlier AI/Data Engineer',
    period: 'Jul 2023 – Jun 2025',
    place: 'Trivandrum',
    summary: 'Core developer on an AI platform, integrating agents, retrieval and automation into one product.',
    results: [
      { text: 'Built concierge and personalization features from dynamic user profiles and retrieval' },
      { text: 'Implemented multi-agent RAG to answer analytical questions across several data sources' },
      { text: 'Delivered anomaly detection, forecasting and recommendation models for personalized learning' },
    ],
  },
  {
    org: 'CodeClause and The Sparks Foundation',
    role: 'Data Analyst',
    period: 'May – Jul 2023',
    place: 'Remote and Mumbai',
    summary: 'Where I started in data: analysis, dashboards and my first machine learning models.',
    results: [],
  },
]

export const principles: { title: string; text: string }[] = [
  { title: 'Grounded answers', text: 'Every answer should show where it came from. I build retrieval that cites its sources.' },
  { title: 'People in the loop', text: 'Agents should know when to stop and ask. I design hand-offs to humans from the start.' },
  { title: 'Measured, not guessed', text: 'I test retrieval quality, groundedness, latency and cost against real datasets, with tracing.' },
  { title: 'Runs where the data lives', text: 'From cloud APIs to fully offline servers, models go wherever the data is allowed to be.' },
]

export type SkillGroup = { group: string; items: string[] }

export const stack: SkillGroup[] = [
  { group: 'Agents', items: ['LangGraph', 'AutoGen', 'CrewAI', 'Semantic Kernel', 'OpenAI Agents SDK', 'Google ADK', 'Model Context Protocol'] },
  { group: 'Retrieval', items: ['LangChain', 'LlamaIndex', 'FAISS', 'Qdrant', 'Milvus', 'ChromaDB', 'Pinecone', 'OpenSearch'] },
  { group: 'Models', items: ['OpenAI', 'Azure OpenAI', 'Claude', 'Gemini', 'Hugging Face', 'Ollama', 'LoRA / QLoRA'] },
  { group: 'Evaluation', items: ['LangSmith', 'Arize Phoenix', 'TruLens', 'Ragas', 'MLflow'] },
  { group: 'Machine learning', items: ['PyTorch', 'TensorFlow', 'scikit-learn', 'Transformers'] },
  { group: 'Backend', items: ['Python', 'TypeScript', 'SQL', 'FastAPI', 'async Python', 'SQLAlchemy', 'WebSockets', 'Django'] },
  { group: 'Automation', items: ['n8n', 'WhatsApp Business API', 'Telegram bots', 'Webhooks', 'Pandas'] },
  { group: 'Infrastructure', items: ['Azure', 'AWS', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'Linux'] },
]
