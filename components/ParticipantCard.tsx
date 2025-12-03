import React from 'react';
import { CheckCircle, Dog, Gift } from 'lucide-react';
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
      className={`group relative flex items-center justify-between p-4 rounded-2xl shadow-sm border transition-all duration-300 active:scale-[0.98] text-left w-full overflow-hidden
        ${isReady 
            ? 'bg-white dark:bg-slate-900 border-green-200 dark:border-green-900 shadow-green-100/50 dark:shadow-none hover:shadow-green-200 dark:hover:border-green-700 hover:-translate-y-1' 
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-md hover:-translate-y-1'
        }`}
    >
      {isReady && <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 dark:bg-green-500/10 rotate-45 translate-x-8 -translate-y-8"></div>}
      
      <div className="flex items-center z-10 w-full">
        <div>
          <span className={`block font-bold text-lg flex items-center gap-2 transition-colors ${isReady ? 'text-green-800 dark:text-green-400' : 'text-slate-700 dark:text-slate-200 group-hover:text-red-700 dark:group-hover:text-red-400'}`}>
            {p.name} {isPet && <Dog size={14} className="text-orange-500"/>}
          </span>
          <span className={`text-xs font-medium flex items-center gap-1.5 ${isReady ? 'text-green-600 dark:text-green-500' : 'text-slate-400 dark:text-slate-500'}`}>
             {isReady ? (
                 <><CheckCircle size={12} className="fill-green-600 dark:fill-green-500 text-white dark:text-slate-900"/> Perfil Completo</>
             ) : (
                 <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div> Aguardando...</span>
             )}
          </span>
        </div>
      </div>
      {isReady ? (
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
          </div>
      ) : (
          <div className="text-slate-300 dark:text-slate-600 group-hover:text-red-400 dark:group-hover:text-red-400 transition-colors">
            <Gift className="w-5 h-5" />
          </div>
      )}
    </button>
  );
};

export default ParticipantCard;