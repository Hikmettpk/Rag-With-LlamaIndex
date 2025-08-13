# RAG Financial Reports Analyzer

This project implements a Retrieval-Augmented Generation (RAG) system for analyzing financial reports using LlamaIndex and PostgreSQL vector database.

## Features

- PDF document processing and embedding
- Vector similarity search using pgvector
- Natural language querying of financial documents
- Docker support for easy deployment

## Installation

### Local Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rag-finreports.git
cd rag-finreports
```

2. Create and activate a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  
# On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file:
```bash
PGHOST=localhost
PGPORT=5432
PGDATABASE=rag_fin
PGUSER=postgres
PGPASSWORD=your_password
OPENAI_API_KEY=your_openai_api_key
```

### Docker Setup

1. Make sure Docker and Docker Compose are installed
2. Create `.env` file as described above
3. Run:
```bash
docker-compose up --build
```

## Usage

1. Place your PDF files in `data/pdfs/` directory

2. Build the index:
```bash
python -m src.ingest.build_index
```

3. Query the documents:
```bash
python -m src.query.ask "Your question here"
```

Backend run kodu 
PYTHONPATH=$PWD uvicorn src.api.main:app --host 0.0.0.0 --port 8000

