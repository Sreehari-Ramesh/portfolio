// All site content lives here so it can be edited without touching layout code.

export const profile = {
  name: 'Sreehari Ramesh',
  role: 'AI/ML Engineer',
  location: 'UAE',
  email: 'sreehariramesh14581@gmail.com',
  github: 'https://github.com/Sreehari-Ramesh',
  linkedin: 'https://www.linkedin.com/in/sreehari-ramesh-25b636224/',
}

export const facts: { term: string; detail: string }[] = [
  { term: 'Trained in', detail: "Physics, master's degree from St. Aloysius College" },
  { term: 'Published on', detail: 'How gravitational waves change the pressure of sound waves' },
  { term: 'Building since 2023', detail: 'Agents, RAG and AI backends at three companies' },
]

export type Stage = { label: string; text: string }

export type Project = {
  name: string
  summary: string
  stages: Stage[]
  stack: string[]
  repo?: string
  context?: string
}

export const featured: Project[] = [
  {
    name: 'Loomin-Docs',
    summary: 'A shared document editor with an AI assistant that runs fully offline.',
    stages: [
      { label: 'Upload', text: 'Drop a PDF, Markdown or text file into the sidebar while others keep editing the document live.' },
      { label: 'Embed', text: 'The file is split into passages and embedded on the machine with all-MiniLM-L6-v2. Nothing leaves the network.' },
      { label: 'Search', text: 'FAISS finds the passages closest to your question.' },
      { label: 'Generate', text: 'Llama 3, Mistral or Qwen runs locally through Ollama and answers from those passages only.' },
      { label: 'Cite', text: 'The answer arrives with clickable citations. The whole stack installs on an air-gapped RHEL 9 server from one bundle.' },
    ],
    stack: ['React', 'TipTap', 'FastAPI', 'WebSockets', 'FAISS', 'Ollama', 'Docker'],
    repo: 'https://github.com/Sreehari-Ramesh/Loomin-docs_',
  },
  {
    name: 'Dubai travel agents',
    summary: 'A chat where a small team of agents finds and books activities in Dubai.',
    stages: [
      { label: 'Ask', text: 'A traveller writes in a WhatsApp-style chat: “Can I book a desert safari for four on Friday?”' },
      { label: 'Route', text: 'The root agent reads the intent, picks a specialist and decides whether a person needs to step in.' },
      { label: 'Act', text: 'The information agent returns prices, policies and photos. The booking agent checks availability and books.' },
      { label: 'Escalate', text: 'Anything the agents should not decide alone is emailed to a human supervisor.' },
      { label: 'Reply', text: 'The supervisor’s email reply is picked up over IMAP and posted back into the same conversation.' },
    ],
    stack: ['Google ADK', 'LiteLLM', 'FastAPI', 'React', 'SMTP / IMAP'],
    repo: 'https://github.com/Sreehari-Ramesh/multi-agent-travel-assistant-system',
  },
  {
    name: 'Text-to-SQL agent',
    summary: 'Lets a business ask its own database questions in plain language.',
    stages: [
      { label: 'Ask', text: '“How much did we invoice in March compared with February?”' },
      { label: 'Map', text: 'The agent works out which tables and columns the question is about.' },
      { label: 'Query', text: 'It writes the SQL and runs it against the business database.' },
      { label: 'Compute', text: 'It does the sums, comparisons and aggregations the question needs.' },
      { label: 'Answer', text: 'It replies in a sentence anyone can read. This cut reliance on manual reports by about 70%.' },
    ],
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
