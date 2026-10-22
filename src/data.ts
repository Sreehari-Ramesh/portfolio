// All site content lives here so it can be edited without touching layout code.

export const profile = {
  name: 'Sreehari Ramesh',
  role: 'AI/ML Engineer',
  location: 'UAE',
  email: 'sreehariramesh14581@gmail.com',
  github: 'https://github.com/Sreehari-Ramesh',
  linkedin: 'https://www.linkedin.com/in/sreehari-ramesh-25b636224/',
  // Formspree form that delivers contact-form messages to the email above
  formspreeId: 'mljgqyvb',
}

export const facts: { term: string; detail: string }[] = [
  { term: 'Trained in', detail: "Physics, master's degree from St. Aloysius College" },
  { term: 'Published on', detail: 'How gravitational waves change the pressure of sound waves' },
  { term: 'Building since 2023', detail: 'Agents, RAG and AI backends at three companies' },
]

// Diagram coordinates are in a 600 x 400 box. The `out` node is what the
// system hands back to people, drawn in the accent colour.
export type Diagram = {
  nodes: { id: string; label: string; x: number; y: number; out?: boolean }[]
  edges: [string, string][]
}

export type Project = {
  name: string
  summary: string
  highlights: string[]
  diagram: Diagram
  tone: 'sage' | 'paper' | 'blush'
  stack: string[]
  repo?: string
  context?: string
}

export const featured: Project[] = [
  {
    name: 'Loomin-Docs',
    summary: 'A shared document editor with an AI assistant that runs fully offline.',
    highlights: [
      'Answers questions from your uploaded files and cites the passages it used',
      'Lets several people edit the same document live',
      'Runs entirely offline, installed on an air-gapped RHEL 9 server from one bundle',
    ],
    diagram: {
      nodes: [
        { id: 'files', label: 'Your files', x: 90, y: 110 },
        { id: 'embed', label: 'Embed locally', x: 270, y: 70 },
        { id: 'faiss', label: 'FAISS search', x: 460, y: 125 },
        { id: 'editor', label: 'Shared editor', x: 110, y: 300 },
        { id: 'llm', label: 'Local LLM', x: 300, y: 245 },
        { id: 'answer', label: 'Cited answer', x: 495, y: 305, out: true },
      ],
      edges: [['files', 'embed'], ['embed', 'faiss'], ['faiss', 'llm'], ['editor', 'llm'], ['llm', 'answer']],
    },
    tone: 'sage',
    stack: ['React', 'TipTap', 'FastAPI', 'WebSockets', 'FAISS', 'Ollama', 'Docker'],
    repo: 'https://github.com/Sreehari-Ramesh/Loomin-docs_',
  },
  {
    name: 'Dubai travel agents',
    summary: 'A chat where a small team of agents finds and books activities in Dubai.',
    highlights: [
      'A root agent sends each message to an information agent or a booking agent',
      'Shows prices, policies and photos, then checks availability and books in the chat',
      'Emails hard cases to a human supervisor and posts their reply back into the chat',
    ],
    diagram: {
      nodes: [
        { id: 'user', label: 'Traveller', x: 75, y: 200 },
        { id: 'root', label: 'Root agent', x: 245, y: 200 },
        { id: 'info', label: 'Info agent', x: 410, y: 85 },
        { id: 'book', label: 'Booking agent', x: 410, y: 315 },
        { id: 'human', label: 'Supervisor', x: 535, y: 200, out: true },
      ],
      edges: [['user', 'root'], ['root', 'info'], ['root', 'book'], ['book', 'human'], ['info', 'human']],
    },
    tone: 'blush',
    stack: ['Google ADK', 'LiteLLM', 'FastAPI', 'React', 'SMTP / IMAP'],
    repo: 'https://github.com/Sreehari-Ramesh/multi-agent-travel-assistant-system',
  },
  {
    name: 'Text-to-SQL agent',
    summary: 'Lets a business ask its own database questions in plain language.',
    highlights: [
      'Turns a question like “March versus February invoices?” into SQL and runs it',
      'Does the sums and comparisons the question needs',
      'Cut reliance on manual reports by about 70%',
    ],
    diagram: {
      nodes: [
        { id: 'q', label: 'Question', x: 75, y: 200 },
        { id: 'agent', label: 'SQL agent', x: 240, y: 200 },
        { id: 'schema', label: 'Schema', x: 400, y: 85 },
        { id: 'db', label: 'Business DB', x: 400, y: 315 },
        { id: 'answer', label: 'Plain answer', x: 515, y: 200, out: true },
      ],
      edges: [['q', 'agent'], ['agent', 'schema'], ['agent', 'db'], ['schema', 'answer'], ['db', 'answer']],
    },
    tone: 'paper',
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

export type Job = {
  org: string
  place: string
  period: string
  roles: string[]
  intro?: string
  highlights: { figure?: string; text: string }[]
}

export const jobs: Job[] = [
  {
    org: 'Cyber Core Technology',
    place: 'Abu Dhabi',
    period: 'Aug 2026 – now',
    roles: ['AI/ML Engineer'],
    intro: 'My current role, building AI systems in Abu Dhabi.',
    highlights: [],
  },
  {
    org: 'White Paper Alliance',
    place: 'Dubai',
    period: 'Jul 2025 – Jul 2026',
    roles: ['AI/ML Engineer'],
    highlights: [
      { figure: '80%+', text: 'of onboarding and support queries handled by WhatsApp, Telegram and web assistants, across 5,000+ conversations a month' },
      { figure: '~70%', text: 'less manual reporting after a Text-to-SQL agent let people ask the database directly' },
      { figure: '~40%', text: 'lower retrieval latency in FastAPI services built on FAISS and CrossEncoder re-ranking' },
      { figure: '< 1 hr', text: 'per SEO audit, down from days, with automated issue detection and severity scoring' },
      { figure: '100+', text: 'business groups moved to a Telegram reminder bot with access control and an audit trail' },
    ],
  },
  {
    org: 'Innoneur',
    place: 'Trivandrum',
    period: 'Jul 2023 – Jun 2025',
    roles: ['AI/ML Engineer', 'AI / Data Engineer'],
    highlights: [
      { text: 'Core developer on an AI platform, integrating GenAI agents, RAG pipelines and automation workflows.' },
      { text: 'Built concierge and personalization features from dynamic user profiles and retrieval.' },
      { text: 'Implemented multi-agent RAG to answer analytical questions across several data sources.' },
      { text: 'Delivered anomaly detection, forecasting and recommendation models for personalized learning.' },
    ],
  },
  {
    org: 'CodeClause and The Sparks Foundation',
    place: 'Remote and Mumbai',
    period: 'May – Jul 2023',
    roles: ['Data Analyst'],
    intro: 'Where I moved from physics into data: analysis, dashboards and first ML models.',
    highlights: [],
  },
]

export const education = [
  { title: "Master's degree, Physics", org: 'St. Aloysius College, Mangalore', period: '2020 – 2022' },
  { title: "Bachelor's degree, Physics", org: 'University of Calicut', period: '2017 – 2020' },
]

export const extras: { label: string; items: string[] }[] = [
  {
    label: 'Certifications',
    items: [
      'One Million Prompters, Dubai Centre for Artificial Intelligence',
      'Docker',
      'Google Data Analytics',
      'Introduction to R for Data Science',
      'Excel Basics for Data Analysis',
    ],
  },
  { label: 'Languages', items: ['Malayalam (native)', 'English (full professional)', 'Hindi (professional)'] },
]

export const stack: { group: string; items: string[] }[] = [
  { group: 'Agents', items: ['LangGraph', 'AutoGen', 'CrewAI', 'Semantic Kernel', 'OpenAI Agents SDK', 'Google ADK', 'Model Context Protocol'] },
  { group: 'Retrieval', items: ['LangChain', 'LlamaIndex', 'FAISS', 'Qdrant', 'Milvus', 'ChromaDB', 'Pinecone', 'OpenSearch'] },
  { group: 'Models', items: ['OpenAI', 'Azure OpenAI', 'Claude', 'Gemini', 'Hugging Face', 'Ollama', 'LoRA / QLoRA'] },
  { group: 'Evaluation', items: ['LangSmith', 'Arize Phoenix', 'TruLens', 'Ragas', 'MLflow'] },
  { group: 'Machine learning', items: ['PyTorch', 'TensorFlow', 'scikit-learn', 'Transformers'] },
  { group: 'Backend', items: ['Python', 'TypeScript', 'SQL', 'FastAPI', 'async Python', 'SQLAlchemy', 'WebSockets', 'Django'] },
  { group: 'Automation', items: ['n8n', 'WhatsApp Business API', 'Telegram bots', 'Webhooks', 'Pandas'] },
  { group: 'Infrastructure', items: ['Azure', 'AWS', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'Linux'] },
]
