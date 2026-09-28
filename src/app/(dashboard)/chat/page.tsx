import { PageContainer } from "@/components/layout/page-container";
import { ChatInterface } from "@/components/chat/chat-interface";

export default function ChatPage() {
  return (
    <PageContainer
      title="RAG Chatbot"
      description="Ask questions grounded strictly in your uploaded PDF documents with verifiable source citations"
    >
      <ChatInterface />
    </PageContainer>
  );
}
