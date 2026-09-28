# Modular Production-Grade PDF RAG Chatbot

An enterprise-ready, modular, and scalable Retrieval-Augmented Generation (RAG) system built with **Next.js**, **TypeScript**, **PostgreSQL + pgvector**, and **Tailwind CSS**.

---

## 🌟 Key Features

- 📄 **Page-Aware PDF Parsing**: Extracts text while preserving page numbers for accurate source citation.
- ✂️ **Configurable Chunking**: Recursive sliding-window chunking with configurable size and overlap.
- ⚡ **pgvector Vector Database**: Native vector similarity search in PostgreSQL using cosine metric (`<=>`).
- 🤖 **Grounded AI Answers**: Custom system prompt preventing hallucination and strictly citing source pages.
- 💬 **Modern ChatGPT UI**: Modern chat layout with source citation cards, auto-scroll, copy features, and loading states.
- 📂 **Multi-Document Management**: Upload, inspect, filter, and delete documents with instant status indicators.
- 🛡️ **Production Security**: Zod input validation, sanitized error responses, user scoping, and safe secret handling.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend Services**: Next.js Route Handlers, Zod Validation
- **Database / Vector Search**: PostgreSQL with `pgvector` extension
- **AI & Processing**: Abstracted Embedding & LLM service layer, `pdf-parse`

---

## 🏗️ Architecture & Data Flow

```
[ User PDF ] ──► [ Validation ] ──► [ Page Parsing ] ──► [ Recursive Chunker ]
                                                                 │
[ Vector Search ] ◄── [ Store Embeddings ] ◄── [ Batch Embeddings Engine ]
       │
       ▼
[ Grounded Context ] ──► [ LLM Prompt Engine ] ──► [ Chat UI + Page Citations ]
```

---

## 📁 Directory Structure

```text
src/
├── app/                  # App Router pages and API routes
├── components/           # UI primitives, chat components, upload handlers
├── lib/                  # AI, PDF processing, Vector DB, and utilities
├── services/             # Core business services (Document, RAG, Chat)
├── types/                # TypeScript interfaces and schema contracts
└── config/               # Zod env schema and constants
```

---

## 🚀 Quick Setup Guide

### 1. Prerequisites
- Node.js >= 20.x
- PostgreSQL database with `pgvector` enabled (`CREATE EXTENSION IF NOT EXISTS vector;`)

### 2. Environment Setup
Copy `.env.example` to `.env.local` and populate the variables:
```bash
cp .env.example .env.local
```

### 3. Installation
```bash
npm install
```

### 4. Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

---

## 📄 License
MIT License.
