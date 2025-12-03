import { Participant } from './types';

// Hardcoded participant list
export const PARTICIPANTS_DATA: Participant[] = [
  { 
    id: 'rebecca', 
    name: 'Rebecca Brito', 
    phone: '5521992730461', 
    avatar: 'https://i.pravatar.cc/150?u=rebecca', 
    type: 'human' 
  }, 
  { 
    id: 'marcia', 
    name: 'Márcia Brito', 
    phone: '5521992072518', 
    avatar: 'https://i.pravatar.cc/150?u=marcia', 
    type: 'human' 
  }, 
  { 
    id: 'andre', 
    name: 'André Brito', 
    phone: '5521994527694', 
    avatar: 'https://i.pravatar.cc/150?u=andre',
    type: 'human' 
  }, 
  { 
    id: 'max', 
    name: 'Max Machado', 
    phone: '5521994906827', 
    avatar: 'https://i.pravatar.cc/150?u=max',
    type: 'human' 
  }, 
  { 
    id: 'marcelly', 
    name: 'Marcelly Bispo', 
    phone: '5521967099550', 
    avatar: 'https://i.pravatar.cc/150?u=marcelly', 
    type: 'human' 
  }, 
  { 
    id: 'salvador', 
    name: 'Salvador Andrade', 
    phone: '5521992072518', 
    avatar: 'https://i.pravatar.cc/150?u=salvador', 
    type: 'human' 
  }, 
];

export const QUIZ_QUESTIONS = [
  "Como você prefere passar um domingo livre?",
  "Qual sua cor favorita ou paleta de cores?",
  "Você prefere algo útil para o dia a dia ou algo decorativo?",
  "Qual seu gênero de filme ou livro favorito?",
  "Você gosta mais de doces, salgados ou bebidas?",
  "Você se considera mais caseiro ou aventureiro?",
  "Tem algum hobby específico (cozinhar, pintar, jogos, plantas)?",
  "Você prefere ganhar uma experiência ou um objeto físico?",
  "Qual o cheiro que você mais gosta (ex: lavanda, café, cítrico)?",
  "Defina seu estilo em uma palavra (ex: clássico, moderno, geek, zen)."
];

export const APP_ID = (typeof window !== 'undefined' && (window as any).__app_id) || 'default-app-id';