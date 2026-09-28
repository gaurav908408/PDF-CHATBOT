import { query } from "./client";
import { Document, DocumentChunk, DocumentStatus } from "@/types/document";
import { Conversation, Message, MessageRole, SourceCitation } from "@/types/chat";
import { VectorSearchResult } from "@/types/rag";

// --- DOCUMENT QUERIES ---

export async function createDocument(doc: {
  fileName: string;
  fileSize: number;
  filePath: string;
  mimeType: string;
  userId?: string;
}): Promise<Document> {
  const sql = `
    INSERT INTO documents (file_name, file_size, file_path, mime_type, user_id, status)
    VALUES ($1, $2, $3, $4, $5, 'PROCESSING')
    RETURNING id, user_id as "userId", file_name as "fileName", file_size as "fileSize",
              file_path as "filePath", mime_type as "mimeType", total_pages as "totalPages",
              status, error_message as "errorMessage", created_at as "createdAt", updated_at as "updatedAt";
  `;
  const result = await query<Document>(sql, [doc.fileName, doc.fileSize, doc.filePath, doc.mimeType, doc.userId || null]);
  return result.rows[0];
}

export async function getDocumentById(id: string): Promise<Document | null> {
  const sql = `
    SELECT id, user_id as "userId", file_name as "fileName", file_size as "fileSize",
           file_path as "filePath", mime_type as "mimeType", total_pages as "totalPages",
           status, error_message as "errorMessage", created_at as "createdAt", updated_at as "updatedAt"
    FROM documents WHERE id = $1;
  `;
  const result = await query<Document>(sql, [id]);
  return result.rows[0] || null;
}

export async function getAllDocuments(userId?: string): Promise<Document[]> {
  const sql = `
    SELECT id, user_id as "userId", file_name as "fileName", file_size as "fileSize",
           file_path as "filePath", mime_type as "mimeType", total_pages as "totalPages",
           status, error_message as "errorMessage", created_at as "createdAt", updated_at as "updatedAt"
    FROM documents
    WHERE ($1::uuid IS NULL OR user_id = $1)
    ORDER BY created_at DESC;
  `;
  const result = await query<Document>(sql, [userId || null]);
  return result.rows;
}

export async function updateDocumentStatus(
  id: string,
  status: DocumentStatus,
  totalPages?: number,
  errorMessage?: string
): Promise<void> {
  const sql = `
    UPDATE documents
    SET status = $2,
        total_pages = COALESCE($3, total_pages),
        error_message = $4,
        updated_at = NOW()
    WHERE id = $1;
  `;
  await query(sql, [id, status, totalPages || null, errorMessage || null]);
}

export async function deleteDocument(id: string): Promise<boolean> {
  const sql = `DELETE FROM documents WHERE id = $1;`;
  const result = await query(sql, [id]);
  return (result.rowCount ?? 0) > 0;
}

// --- CHUNK & VECTOR SEARCH QUERIES ---

export async function insertDocumentChunk(chunk: {
  documentId: string;
  chunkIndex: number;
  pageNumber: number;
  content: string;
  tokenCount: number;
  embedding: number[];
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const sql = `
    INSERT INTO document_chunks (document_id, chunk_index, page_number, content, token_count, embedding, metadata)
    VALUES ($1, $2, $3, $4, $5, $6::vector, $7::jsonb);
  `;
  await query(sql, [
    chunk.documentId,
    chunk.chunkIndex,
    chunk.pageNumber,
    chunk.content,
    chunk.tokenCount,
    JSON.stringify(chunk.embedding),
    JSON.stringify(chunk.metadata || {}),
  ]);
}

export async function searchVectorChunks(
  queryEmbedding: number[],
  topK: number = 5,
  similarityThreshold: number = 0.70,
  documentId?: string
): Promise<VectorSearchResult[]> {
  const embeddingString = JSON.stringify(queryEmbedding);

  const sql = `
    SELECT 
      dc.id,
      dc.document_id as "documentId",
      dc.chunk_index as "chunkIndex",
      dc.page_number as "pageNumber",
      dc.content,
      dc.token_count as "tokenCount",
      dc.metadata,
      1 - (dc.embedding <=> $1::vector) as score,
      d.file_name as "fileName"
    FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    WHERE ($2::uuid IS NULL OR dc.document_id = $2)
      AND (1 - (dc.embedding <=> $1::vector)) >= $3
    ORDER BY score DESC
    LIMIT $4;
  `;

  const result = await query<{
    id: string;
    documentId: string;
    chunkIndex: number;
    pageNumber: number;
    content: string;
    tokenCount: number;
    metadata: Record<string, unknown>;
    score: number;
    fileName: string;
  }>(sql, [embeddingString, documentId || null, similarityThreshold, topK]);

  return result.rows.map((row) => ({
    chunk: {
      id: row.id,
      documentId: row.documentId,
      chunkIndex: row.chunkIndex,
      pageNumber: row.pageNumber,
      content: row.content,
      tokenCount: row.tokenCount,
      metadata: { ...row.metadata, fileName: row.fileName },
    },
    score: row.score,
  }));
}

// --- CONVERSATION & MESSAGE QUERIES ---

export async function createConversation(title: string, documentId?: string, userId?: string): Promise<Conversation> {
  const sql = `
    INSERT INTO conversations (title, document_id, user_id)
    VALUES ($1, $2, $3)
    RETURNING id, user_id as "userId", document_id as "documentId", title,
              created_at as "createdAt", updated_at as "updatedAt";
  `;
  const result = await query<Conversation>(sql, [title, documentId || null, userId || null]);
  return result.rows[0];
}

export async function getConversationById(id: string): Promise<Conversation | null> {
  const sql = `
    SELECT id, user_id as "userId", document_id as "documentId", title,
           created_at as "createdAt", updated_at as "updatedAt"
    FROM conversations WHERE id = $1;
  `;
  const result = await query<Conversation>(sql, [id]);
  return result.rows[0] || null;
}

export async function getAllConversations(userId?: string): Promise<Conversation[]> {
  const sql = `
    SELECT id, user_id as "userId", document_id as "documentId", title,
           created_at as "createdAt", updated_at as "updatedAt"
    FROM conversations
    WHERE ($1::uuid IS NULL OR user_id = $1)
    ORDER BY updated_at DESC;
  `;
  const result = await query<Conversation>(sql, [userId || null]);
  return result.rows;
}

export async function createMessage(msg: {
  conversationId: string;
  role: MessageRole;
  content: string;
  sources?: SourceCitation[];
}): Promise<Message> {
  const sql = `
    INSERT INTO messages (conversation_id, role, content, sources)
    VALUES ($1, $2, $3, $4::jsonb)
    RETURNING id, conversation_id as "conversationId", role, content, sources, created_at as "createdAt";
  `;
  const result = await query<Message>(sql, [
    msg.conversationId,
    msg.role,
    msg.content,
    JSON.stringify(msg.sources || []),
  ]);

  // Touch conversation updated_at
  await query(`UPDATE conversations SET updated_at = NOW() WHERE id = $1;`, [msg.conversationId]);

  return result.rows[0];
}

export async function getMessagesByConversationId(conversationId: string): Promise<Message[]> {
  const sql = `
    SELECT id, conversation_id as "conversationId", role, content, sources, created_at as "createdAt"
    FROM messages
    WHERE conversation_id = $1
    ORDER BY created_at ASC;
  `;
  const result = await query<Message>(sql, [conversationId]);
  return result.rows;
}
