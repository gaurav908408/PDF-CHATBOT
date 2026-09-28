import { PageContainer } from "@/components/layout/page-container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MessageSquare, Bot } from "lucide-react";

export default function ChatPage() {
  return (
    <PageContainer
      title="RAG Assistant Chat"
      description="Ask questions grounded strictly in your uploaded PDF documents"
    >
      <Card className="h-[600px] flex flex-col justify-between">
        <CardHeader className="border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-600/20 text-brand-400">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Assistant Session</CardTitle>
                <CardDescription>Target: All Documents</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <MessageSquare className="h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-200">Start a Grounded Conversation</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Select an uploaded document or ask a question to query your pgvector similarity database.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
