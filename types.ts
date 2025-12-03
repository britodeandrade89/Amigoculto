export interface Participant {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  type: 'human' | 'pet';
}

export interface GiftSuggestion {
  gift: string;
  reason: string;
  match: number;
  estimated_price: string;
  mlLink?: string;
}

export interface ParticipantState {
  id: string;
  name: string;
  avatar: string;
  status: 'pending' | 'ready';
  manualGift?: string;
  quizAnswers?: Record<string, string>;
  aiResult?: GiftSuggestion;
  targetId?: string;
  updatedAt?: string;
}

export type ViewState = 'login' | 'quiz' | 'dashboard';