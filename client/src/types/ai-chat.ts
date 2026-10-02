export interface ChatProductItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  rating: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: ChatProductItem[];
  createdAt: string;
}

export interface ChatRequestPayload {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  currentProductId?: number;
}
