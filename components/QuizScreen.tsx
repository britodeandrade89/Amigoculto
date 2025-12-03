import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { BrainCircuit, Wand2, Sparkles, CheckCircle, Percent, ExternalLink, ShoppingBag } from 'lucide-react';
import { Participant, ParticipantState, GiftSuggestion } from '../types';
import { QUIZ_QUESTIONS, APP_ID } from '../constants';
import { db } from '../services/firebase';
import { generateGiftSuggestions } from '../services/gemini';
import { User as AuthUser } from 'firebase/auth';

interface QuizScreenProps {
  user: AuthUser | null;
  participant: Participant;
  existingData: ParticipantState | undefined;
  onComplete: () => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ user, participant, existingData, onComplete }) => {
  const [step, setStep] = useState<'manual' | 'quiz' | 'generating' | 'selection' | 'review'>(
    existingData ? 'review' : 'manual'
  );
  const [manualGift, setManualGift] = useState(existingData?.manualGift || '');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>(existingData?.quizAnswers || {});
  
  const [aiResult, setAiResult] = useState<GiftSuggestion | null>(existingData?.aiResult || null);
  const [aiCandidates, setAiCandidates] = useState<GiftSuggestion[] | null>(null); 
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState<number | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleGenerateSuggestion = async () => {
    setStep('generating');
    try {
      const suggestions = await generateGiftSuggestions(participant, manualGift, quizAnswers);
      setAiCandidates(suggestions);
      setStep('selection');
    } catch (error) {
      console.error("Error generating suggestions", error);
      // Even in error, gemini service provides fallback, but if that fails too:
      setStep('manual'); 
    }
  };

  const confirmSelection = async () => {
      if (selectedCandidateIndex === null || !aiCandidates) return;
      const selected = aiCandidates[selectedCandidateIndex];
      setAiResult(selected);
      await saveProfile(selected);
      setStep('review');
  };

  const saveProfile = async (finalResult: GiftSuggestion) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'secret_santa_users_v2', participant.id);
    await setDoc(docRef, {
      id: participant.id,
      name: participant.name,
      avatar: participant.avatar,
      manualGift,
      quizAnswers,
      aiResult: finalResult,
      status: 'ready',
      updatedAt: new Date().toISOString()
    }, { merge: true });
  };

  if (step === 'manual') {
    return (
      <div className="space-y-6 pt-4 animate-slide-up">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-red-600"></div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2 mt-8">Olá, {participant.name.split(' ')[0]}!</h2>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto leading-relaxed">
             Para começar, conte o que você gostaria de ganhar (até R$ 50).
          </p>
          <input 
            type="text" 
            placeholder="Ex: Livro, Chinelo, Caneca..."
            className="w-full p-4 border-2 border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none mb-4 transition-all text-center font-medium placeholder:text-slate-400"
            value={manualGift}
            onChange={(e) => setManualGift(e.target.value)}
          />
          <button 
            disabled={!manualGift.trim()}
            onClick={() => setStep('quiz')}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold disabled:opacity-50 hover:bg-black transition-all hover:scale-[1.02] shadow-lg"
          >
            Continuar para o Analista IA
          </button>
        </div>
      </div>
    );
  }

  if (step === 'quiz') {
    return (
      <div className="space-y-6 pt-4 animate-slide-up">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500" style={{width: `${((currentQuestionIndex + 1) / 10) * 100}%`}}></div>
          <div className="flex items-center gap-3 mb-8 text-purple-700">
            <div className="p-2 bg-purple-50 rounded-lg">
                <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
                <h2 className="font-bold text-lg leading-none">Analista Virtual</h2>
                <span className="text-xs text-purple-400 font-medium">Pergunta {currentQuestionIndex + 1} de 10</span>
            </div>
          </div>
          <p className="text-xl font-bold text-slate-800 mb-6 leading-relaxed">
             {participant.type === 'pet' 
                ? `Pensando no ${participant.name}: ${QUIZ_QUESTIONS[currentQuestionIndex]}`
                : QUIZ_QUESTIONS[currentQuestionIndex]}
          </p>
          <input 
            autoFocus
            type="text"
            className="w-full p-4 border-2 border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none mb-8 transition-all text-lg"
            placeholder="Sua resposta..."
            value={quizAnswers[currentQuestionIndex] || ''}
            onChange={(e) => setQuizAnswers({...quizAnswers, [currentQuestionIndex]: e.target.value})}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && quizAnswers[currentQuestionIndex]) {
                if (currentQuestionIndex < 9) setCurrentQuestionIndex(prev => prev + 1);
                else handleGenerateSuggestion();
              }
            }}
          />
          <div className="flex justify-between items-center">
             <button 
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} 
                disabled={currentQuestionIndex === 0} 
                className="text-slate-400 font-medium px-4 py-2 hover:bg-slate-50 rounded-lg transition disabled:opacity-0"
             >
                Voltar
            </button>
            <button 
              onClick={() => {
                if (currentQuestionIndex < 9) setCurrentQuestionIndex(prev => prev + 1);
                else handleGenerateSuggestion();
              }}
              disabled={!quizAnswers[currentQuestionIndex]}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 transition-all shadow-lg shadow-purple-200"
            >
              {currentQuestionIndex === 9 ? 'Gerar Sugestões' : 'Próxima'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center pt-24 text-center animate-pulse px-6">
        <div className="bg-white p-6 rounded-full shadow-xl mb-6 relative">
            <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping opacity-75"></div>
            <Wand2 className="w-12 h-12 text-purple-600 relative z-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">A Mágica está Acontecendo...</h2>
        <p className="text-slate-500 max-w-xs mx-auto">Nossa IA está analisando seu perfil para encontrar 2 presentes perfeitos até R$ 50,00.</p>
      </div>
    );
  }

  if (step === 'selection' && aiCandidates) {
      return (
        <div className="space-y-6 pt-4 animate-slide-up pb-20">
            <div className="text-center px-4">
                <div className="inline-flex items-center justify-center p-3 bg-purple-100 text-purple-700 rounded-full mb-4">
                    <Sparkles size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    Sugestões Encontradas!
                </h2>
                <p className="text-slate-600 leading-relaxed">
                    A IA analisou seu perfil. Escolha qual destas duas opções você prefere ganhar:
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {aiCandidates.map((cand, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setSelectedCandidateIndex(idx)}
                        className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 text-left w-full ${
                            selectedCandidateIndex === idx 
                            ? 'border-purple-600 bg-purple-50 shadow-xl scale-[1.02] ring-2 ring-purple-200' 
                            : 'border-slate-100 bg-white hover:border-purple-200 hover:shadow-lg'
                        }`}
                    >
                        {selectedCandidateIndex === idx && (
                            <div className="absolute -top-3 -right-3 bg-purple-600 text-white p-1.5 rounded-full shadow-md">
                                <CheckCircle size={20} className="fill-white text-purple-600" />
                            </div>
                        )}
                        <div className="flex items-center justify-between mb-3">
                             <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-100 px-2 py-1 rounded">Opção {idx + 1}</span>
                             <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                                <Percent size={12} /> {cand.match}% Match
                             </div>
                        </div>
                        <h3 className="font-bold text-xl text-slate-800 leading-snug mb-2">{cand.gift}</h3>
                        <p className="text-sm text-slate-500 mb-4 italic leading-relaxed">"{cand.reason}"</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
                            <p className="text-xs text-green-700 font-bold bg-green-50 px-2 py-1 rounded">~ {cand.estimated_price}</p>
                            <a 
                            href={cand.mlLink} 
                            target="_blank" 
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()} 
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                            >
                                Ver no Mercado Livre <ExternalLink size={12}/>
                            </a>
                        </div>
                    </button>
                ))}
            </div>

            <div className="fixed bottom-4 left-0 right-0 p-4 max-w-md mx-auto z-20">
                <button 
                    disabled={selectedCandidateIndex === null}
                    onClick={confirmSelection}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black transition-all hover:scale-[1.02]"
                >
                    Confirmar Minha Escolha
                </button>
            </div>
        </div>
      );
  }

  if (step === 'review') {
    return (
      <div className="space-y-6 pt-8 animate-slide-up">
        <div className="bg-green-100 border border-green-200 p-6 rounded-3xl flex flex-col items-center gap-3 text-center shadow-sm">
          <div className="p-3 bg-green-200 rounded-full text-green-700">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-800">Tudo Pronto!</h3>
            <p className="text-sm text-green-700">Seu perfil foi salvo com sucesso.</p>
          </div>
        </div>

        <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-[10px] px-3 py-1 rounded-bl-xl font-bold">OPÇÃO 1</div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">Escolha Pessoal</p>
            <p className="text-lg text-slate-800 font-medium">{manualGift}</p>
            </div>

            {aiResult && (
            <div className="bg-white p-5 rounded-2xl border-2 border-purple-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] px-3 py-1 rounded-bl-xl font-bold flex items-center gap-1">
                <BrainCircuit size={10}/> Opção IA (Escolhida)
                </div>
                
                <p className="text-[10px] text-purple-400 uppercase tracking-wider font-bold mb-2">Baseado no Perfil</p>
                <p className="text-lg text-slate-800 font-medium leading-tight mb-2">{aiResult.gift}</p>
                <p className="text-sm text-green-600 font-bold mb-3">~ {aiResult.estimated_price}</p>

                <a 
                href={aiResult.mlLink}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
                >
                <ShoppingBag size={16} /> Ver no Mercado Livre
                </a>
            </div>
            )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
            <button onClick={() => setStep('manual')} className="w-full text-slate-500 bg-slate-100 hover:bg-slate-200 font-medium py-3 rounded-xl text-sm transition">
                Refazer tudo
            </button>
            <button 
            onClick={onComplete}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-black transition flex items-center justify-center gap-2"
            >
            Ir para o Painel
            </button>
        </div>
      </div>
    );
  }

  return null;
};

export default QuizScreen;