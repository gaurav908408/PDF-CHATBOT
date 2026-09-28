import { PageContainer } from "@/components/layout/page-container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileUp, MessageSquare, Database, Cpu, ShieldCheck } from "lucide-react";

export default function DashboardPage() {
  return (
    <PageContainer
      title="Architecture & Overview"
      description="Production Modular PDF RAG Pipeline powered by PostgreSQL pgvector"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-indigo-900/50 bg-indigo-950/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-600/20 text-indigo-400">
                <FileUp className="h-5 w-5" />
              </div>
              <CardTitle>Document Storage</CardTitle>
            </div>
            <CardDescription>PDF text extraction & metadata isolation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 mb-4">
              Page-aware parser preserving original PDF page boundaries for verified source references.
            </p>
            <Link href="/documents">
              <Button variant="outline" size="sm" className="w-full">
                Manage Documents
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-emerald-900/50 bg-emerald-950/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-600/20 text-emerald-400">
                <Database className="h-5 w-5" />
              </div>
              <CardTitle>pgvector Store</CardTitle>
            </div>
            <CardDescription>Vector similarity search & topK indexing</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 mb-4">
              Configurable sliding-window recursive chunking with HNSW index cosine similarity search.
            </p>
            <div className="text-xs font-mono text-emerald-400 bg-slate-900 p-2 rounded border border-slate-800">
              <=> cosine_similarity
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-900/50 bg-brand-950/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-brand-600/20 text-brand-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <CardTitle>Grounded RAG Chat</CardTitle>
            </div>
            <CardDescription>Strict prompt system preventing hallucinations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 mb-4">
              Answers strictly using document chunks. Clear notification if context is missing.
            </p>
            <Link href="/chat">
              <Button variant="primary" size="sm" className="w-full">
                Launch Chatbot
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <CardTitle>System Pipeline Readiness</CardTitle>
            </div>
            <CardDescription>Phase 1 Architecture Initialization Completed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1">Architecture</span>
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-brand-400" /> Modular Services
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1">Validation</span>
                <span className="font-semibold text-white">Zod Strict Typing</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1">Vector DB</span>
                <span className="font-semibold text-white">PostgreSQL pgvector</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1">Frontend UI</span>
                <span className="font-semibold text-white">Next.js + Tailwind</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
