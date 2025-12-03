import React from 'react';
import { Users } from 'lucide-react';
import { Participant, ParticipantState } from '../types';
import ParticipantCard from './ParticipantCard';

interface LoginScreenProps {
  participants: Participant[];
  participantsState: Record<string, ParticipantState>;
  onSelect: (id: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ participants, participantsState, onSelect }) => {
  const humans = participants.filter(p => p.type === 'human');
  
  return (
    <div className="space-y-8 pt-6 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="inline-block p-3 rounded-full bg-red-50 border border-red-100 shadow-inner mb-2">
            <Users className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Quem vai brincar?</h2>
        <p className="text-slate-500 text-sm max-w-[200px] mx-auto leading-relaxed">
            Selecione seu nome para entrar na brincadeira e cadastrar seus presentes.
        </p>
      </div>
      <div>
        <div className="grid grid-cols-1 gap-3">
          {humans.map((p) => (
            <ParticipantCard 
              key={p.id} 
              p={p} 
              state={participantsState[p.id]} 
              onSelect={onSelect} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;