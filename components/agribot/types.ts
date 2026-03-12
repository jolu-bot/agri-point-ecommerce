// Message type used throughout the chatbot
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative';
  isStreaming?: boolean;
  toolStatus?: string;
  intent?: string;
  suggestions?: string[];
  escalated?: boolean;
}

// Intent type for message classification
export type Intent =
  | 'conseil'
  | 'produit'
  | 'commande'
  | 'compte'
  | 'urgence'
  | 'culture'
  | 'campagne'
  | 'roi'
  | 'navigation'
  | string;

// Quick suggestion chip
export interface Suggestion {
  label: string;
  text: string;
  intent: Intent;
}

// Streaming SSE event from /api/agribot
export interface SSEEvent {
  type: 'token' | 'tool_start' | 'done' | 'error';
  token?: string;
  message?: string;
  tags?: string[];
  intent?: string;
  suggestions?: string[];
  escalate?: boolean;
}
