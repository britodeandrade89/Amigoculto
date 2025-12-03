import React from 'react';
import { Gift } from 'lucide-react';
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
    <div className="animate-fade-in relative pt-4">
        {/* Dark Red Dome Background */}
        <div className="bg-[#4a0404] rounded-t-[3rem] p-8 pb-16 text-center shadow-2xl mx-2 border-b-4 border-yellow-600">
            <div className="flex justify-center mb-3">
                 <div className="relative">
                    <Gift className="w-10 h-10 text-red-500 absolute -top-1 -right-8 rotate-12" />
                    <Gift className="w-12 h-12 text-green-600 relative z-10" />
                    <Gift className="w-8 h-8 text-yellow-500 absolute top-2 -left-6 -rotate-12" />
                 </div>
            </div>
            <h2 className="font-christmas text-4xl text-white mb-2 tracking-wide">Quem vai brincar?</h2>
            <p className="text-red-200 text-sm max-w-[220px] mx-auto leading-relaxed">
                Selecione seu nome para entrar na brincadeira e cadastrar seus presentes.
            </p>
        </div>

        {/* Participant Cards Stacked (Negative Margin to overlap the Dome) */}
        <div className="px-2 -mt-10 space-y-3 pb-8">
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
  );
};

export default LoginScreen;