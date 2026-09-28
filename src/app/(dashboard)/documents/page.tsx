import { PageContainer } from "@/components/layout/page-container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DocumentsPage() {
  return (
    <PageContainer
      title="Document Dashboard"
      description="Manage uploaded PDFs, inspect chunking status, and select active context"
      action={
        <Button variant="primary" size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Upload PDF
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Documents Repository</CardTitle>
          <CardDescription>PDF documents ready for RAG similarity querying</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
            <FileText className="h-12 w-12 text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-200">No Documents Uploaded</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Upload a PDF document to trigger the parsing, chunking, and pgvector embedding ingestion pipeline.
            </p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
