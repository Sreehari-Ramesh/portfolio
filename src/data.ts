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
  { term: 'Building since 2023', detail: 'Agents, RAG and AI backends running in production' },
]

// Each word lists the words it "attends" to most, from 0 to 1.
export const statement = {
  text: 'Physics taught me to model systems of many interacting parts. Now the parts are language models, tools and the people who check their work.',
  links: {
    physics: { model: 0.9, systems: 0.8, interacting: 0.6, taught: 0.5 },
    taught: { physics: 0.8, me: 0.6, model: 0.5 },
    model: { systems: 0.9, physics: 0.7, models: 0.5 },
    systems: { parts: 0.9, interacting: 0.8, many: 0.6, model: 0.6 },
    many: { parts: 0.8, interacting: 0.6 },
    interacting: { parts: 0.9, systems: 0.7, many: 0.5 },
    parts: { systems: 0.8, models: 0.75, tools: 0.7, people: 0.7, interacting: 0.6 },
    now: { parts: 0.6, physics: 0.4 },
    language: { models: 1 },
    models: { language: 0.95, parts: 0.7, tools: 0.5, model: 0.5 },
    tools: { models: 0.7, parts: 0.7, people: 0.4 },
    people: { check: 0.85, work: 0.7, parts: 0.6 },
    check: { work: 0.85, people: 0.8, models: 0.5 },
    work: { check: 0.8, their: 0.7, people: 0.6, models: 0.5 },
  } as Record<string, Record<string, number>>,
}

export type Project = {
  name: string
  summary: string
  problem: string
  built: string
  outcome: string
  stack: string[]
  repo?: string
  context?: string
}

export const featured: Project[] = [
  {
    name: 'Loomin-Docs',
    summary: 'A shared document editor with an AI assistant that runs fully offline.',
    problem:
      "Teams working with sensitive documents can't paste them into cloud AI tools.",
    built:
      'A shared editor where an assistant answers questions from your own files and cites the passages it used, with models running locally through Ollama.',
    outcome: 'Runs fully offline on an air-gapped RHEL 9 server, installed from a single bundle.',
    stack: ['React', 'TipTap', 'FastAPI', 'WebSockets', 'FAISS', 'Ollama', 'Docker'],
    repo: 'https://github.com/Sreehari-Ramesh/Loomin-docs_',
  },
  {
    name: 'Dubai travel agents',
    summary: 'A chat where a small team of agents finds and books activities in Dubai.',
    problem:
      'Booking activities over chat means answering questions, checking availability and knowing when a person should step in.',
    built:
      'A root agent that routes each message to an information or booking specialist, and escalates hard cases to a human supervisor by email.',
    outcome: 'Supervisor replies flow back into the same conversation automatically.',
    stack: ['Google ADK', 'LiteLLM', 'FastAPI', 'React', 'SMTP / IMAP'],
    repo: 'https://github.com/Sreehari-Ramesh/multi-agent-travel-assistant-system',
  },
  {
    name: 'Text-to-SQL agent',
    summary: 'Lets a business ask its own database questions in plain language.',
    problem:
      'Business teams waited on manual reports to answer simple questions about their own data.',
    built:
      'An agent that turns plain-language questions into SQL, runs it, does the sums and explains the result in a sentence.',
    outcome: 'Cut reliance on manual reporting by about 70%.',
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

// Results from production work, shown as the headline of the Impact section.
export const impact: { figure: string; text: string; where: string }[] = [
  { figure: '80%+', text: 'of onboarding and support queries handled by assistants on WhatsApp, Telegram and the web', where: 'White Paper Alliance' },
  { figure: '5,000+', text: 'conversations a month handled by those assistants with memory and grounded answers', where: 'White Paper Alliance' },
  { figure: '~70%', text: 'less manual reporting once people could ask the database questions directly', where: 'White Paper Alliance' },
  { figure: '~40%', text: 'lower retrieval latency from re-ranking and persistent vector indexes', where: 'White Paper Alliance' },
  { figure: '< 1 hr', text: 'per SEO audit, down from days, with automated issue detection and scoring', where: 'White Paper Alliance' },
  { figure: '100+', text: 'business groups moved to an automated reminder bot with access control', where: 'White Paper Alliance' },
]

export const career: { org: string; role: string; period: string; place: string }[] = [
  { org: 'Cyber Core Technology', role: 'AI/ML Engineer', period: '2026 – now', place: 'Abu Dhabi' },
  { org: 'White Paper Alliance', role: 'AI/ML Engineer', period: '2025 – 2026', place: 'Dubai' },
  { org: 'Innoneur', role: 'AI/ML and data engineer', period: '2023 – 2025', place: 'Trivandrum' },
  { org: 'CodeClause, The Sparks Foundation', role: 'Data analyst', period: '2023', place: 'Remote' },
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
