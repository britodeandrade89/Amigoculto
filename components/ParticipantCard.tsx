import React from 'react';
import { CheckCircle, Gift, Trees } from 'lucide-react';
import { Participant, ParticipantState } from '../types';

interface ParticipantCardProps {
  p: Participant;
  state: ParticipantState | undefined;
  onSelect: (id: string) => void;
  isPet?: boolean;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({ p, state, onSelect, isPet }) => {
  const isReady = state?.status === 'ready';

  return (
    <button
      onClick={() => onSelect(p.id)}
      className="bg-white dark:bg-slate-800 rounded-xl p-3 pl-5 shadow-lg flex items-center justify-between w-full transition-transform active:scale-[0.98] border-b-4 border-slate-200 dark:border-slate-700"
    >
      <div className="text-left">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight">
          {p.name}
        </h3>
        <div className="flex items-center gap-1 mt-1">
            {isReady ? (
                <>
                    <Trees className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-700 font-bold">Pronto!</span>
                </>
            ) : (
                <>
                    <Trees className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500 font-medium">Aguardando...</span>
                </>
            )}
        </div>
      </div>

      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-inner transition-colors ${
          isReady ? 'bg-green-700 text-yellow-300' : 'bg-green-600 text-white'
      }`}>
        {isReady ? <CheckCircle className="w-6 h-6" /> : <Gift className="w-6 h-6" />}
      </div>
    </button>
  );
};

export default ParticipantCard;