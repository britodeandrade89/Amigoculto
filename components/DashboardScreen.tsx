import React, { useState, useEffect } from 'react';
import { doc, writeBatch } from 'firebase/firestore';
import { CheckCircle, Wand2, Lock, Gift, Share2, PartyPopper, Users, MessageCircle, ShoppingBag, BrainCircuit, X, KeyRound, User as UserIcon } from 'lucide-react';
import { Participant, ParticipantState } from '../types';
import { APP_ID } from '../constants';
import { db } from '../services/firebase';
import { User as AuthUser } from 'firebase/auth';

interface DashboardScreenProps {
  currentUser: Participant;
  participantsState: Record<string, ParticipantState>;
  allParticipants: Participant[];
  userAuth: AuthUser | null;
  onViewProfile: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ currentUser, participantsState, allParticipants, onViewProfile }) => {
  const [revealing, setRevealing] = useState(false);
  const [myTarget, setMyTarget] = useState<ParticipantState | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const readyCount = Object.values(participantsState).filter((p: ParticipantState) => p.status === 'ready').length;
  const isDrawDone = Object.values(participantsState).some((p: ParticipantState) => p.targetId);
  const myData = participantsState[currentUser.id];
  const allReady = readyCount === allParticipants.length;

  const initiateDraw = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async () => {
    if (passwordInput === "1008") {
      setShowPasswordModal(false);
      await performDraw();
    } else {
      setErrorMsg("Senha incorreta!");
    }
  };

  const performDraw = async () => {
    if (!allReady || isDrawDone) return;
    let ids = allParticipants.map(p => p.id);
    let valid = false;
    let shuffled: string[] = [];
    let attempts = 0;
    while (!valid && attempts < 1000) {
      attempts++;
      shuffled = [...ids];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      valid = shuffled.every((target, idx) => target !== ids[idx]);
    }
    const batch = writeBatch(db);
    ids.forEach((sourceId, idx) => {
      const ref = doc(db, 'artifacts', APP_ID, 'public', 'data', 'secret_santa_users_v2', sourceId);
      batch.update(ref, { targetId: shuffled[idx] });
    });
    await batch.commit();
  };

  useEffect(() => {
    if (myData?.targetId && participantsState[myData.targetId]) {
      setMyTarget(participantsState[myData.targetId]);
    }
  }, [myData, participantsState]);

  const getWhatsAppLink = (targetPhone: string, type: string, data: any = {}) => {
    let msg = "";
    if (type === 'remind') msg = `Ei ${data.name}, estamos esperando você preencher o Amigo Oculto! 🎁`;
    if (type === 'remindPet') msg = `Ei, não esquece de preencher o amigo oculto do pet ${data.name}! 🐾`;
    if (type === 'drawAnnounce') msg = `📣 O SORTEIO FOI REALIZADO! 🎁\n\nAcessem o App agora e vejam quem vocês tiraram! É só clicar no botão "VER MEU AMIGO".\n\nBoa sorte! 🤫`;
    
    // Link de compartilhamento do presente tirado
    if (type === 'shareResult') {
        const { targetName, gift, price, link } = data;
        msg = `🎁 Tirei meu Amigo Oculto: *${targetName}*!\n\n🤖 O Analista IA sugeriu (e ele aprovou!): *${gift}*\n💰 Preço Est: ${price}\n🔗 Link de Compra: ${link}\n\n(Ou a opção manual: ${data.manual})`;
    }
    
    // Se não tiver telefone, abre só com o texto para a pessoa escolher o grupo
    const phonePart = targetPhone ? `/${targetPhone}` : '';
    return `https://wa.me${phonePart}?text=${encodeURIComponent(msg)}`;
  };

  if (myTarget && revealing) {
    const targetParticipantInfo = allParticipants.find(p => p.id === myTarget.id);
    const isTargetPet = targetParticipantInfo?.type === 'pet';
    return (
      <div className="pt-10 space-y-8 animate-zoom-in text-center px-4">
        <div className="inline-block p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-400 mb-2 shadow-inner">
            <PartyPopper size={32} />
        </div>
        
        <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Seu Amigo Oculto É</h2>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl w-full mx-auto flex flex-col items-center justify-center shadow-lg border-2 border-yellow-400 mb-6 bg-gradient-to-br from-yellow-50 to-white dark:from-slate-800 dark:to-slate-900">
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <UserIcon className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{myTarget.name}</h3>
                {isTargetPet && <span className="text-xs bg-orange-500 px-2 py-0.5 rounded text-white mt-2">Pet</span>}
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden text-left mx-2 border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="bg-slate-50 dark:bg-slate-800 p-4 text-center border-b border-slate-100 dark:border-slate-700">
             <h4 className="font-bold text-slate-600 dark:text-slate-300 text-sm tracking-wide">LISTA DE DESEJOS (ATÉ R$ 50)</h4>
          </div>
          <div className="p-6 space-y-8">
            <div className="relative">
              <div className="absolute -left-2 top-0 bottom-0 w-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              <div className="pl-4">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Opção 1 (Pessoal)</span>
                <p className="text-xl text-slate-800 dark:text-slate-100 font-medium">{myTarget.manualGift}</p>
              </div>
            </div>
            
            {myTarget.aiResult && (
                <div className="relative pt-6 border-t border-dashed border-slate-200 dark:border-slate-700">
                    <div className="absolute -left-2 top-6 bottom-0 w-1 bg-purple-200 dark:bg-purple-900/50 rounded-full"></div>
                    <div className="pl-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider">
                                <BrainCircuit size={12}/> Sugestão IA
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                {myTarget.aiResult.match}% Match
                            </span>
                        </div>
                        <p className="text-xl text-slate-800 dark:text-slate-100 font-medium mb-1">{myTarget.aiResult.gift}</p>
                        <p className="text-sm text-green-600 dark:text-green-400 font-bold mb-4">~ {myTarget.aiResult.estimated_price}</p>
                        
                        <a 
                            href={myTarget.aiResult.mlLink}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-center text-yellow-900 font-bold py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm shadow-yellow-200 dark:shadow-none"
                        >
                            <ShoppingBag size={18} /> Comprar Agora
                        </a>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center">Busca automática no Mercado Livre</p>
                    </div>
                </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pb-8">
            <button onClick={() => setRevealing(false)} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                Voltar
            </button>
            <a 
                href={getWhatsAppLink('', 'shareResult', { 
                    targetName: myTarget.name, 
                    gift: myTarget.aiResult?.gift, 
                    price: myTarget.aiResult?.estimated_price || 'R$ 50',
                    link: myTarget.aiResult?.mlLink || '',
                    manual: myTarget.manualGift
                })} 
                target="_blank" 
                rel="noreferrer" 
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-lg shadow-green-200 dark:shadow-none"
            >
            <Share2 size={18} /> Compartilhar
            </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-6">
      {/* MODAL DE SENHA */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl relative overflow-hidden transition-colors">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-purple-600"></div>
            
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2"><Lock size={20} className="text-slate-400"/> Segurança</h3>
               <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"><X size={20} className="text-slate-400"/></button>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-800 dark:text-red-200 p-4 rounded-2xl text-sm mb-6 text-left leading-relaxed">
               <strong>Atenção:</strong> O sorteio será gerado instantaneamente pela IA. Certifique-se de que todos estão de acordo.
            </div>

            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wide">Senha do Administrador</p>
            
            <div className="relative mb-6">
                <input 
                type="password" 
                autoFocus
                className="w-full text-center text-3xl font-black tracking-[0.5em] p-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/30 outline-none transition-all text-slate-800 dark:text-slate-100"
                placeholder="••••"
                maxLength={4}
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setErrorMsg(""); }}
                />
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={20} />
            </div>
            
            {errorMsg && <div className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-200 text-sm font-bold py-2 px-4 rounded-lg mb-4 animate-shake">{errorMsg}</div>}

            <button 
              onClick={handlePasswordSubmit}
              className="w-full bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              CONFIRMAR SORTEIO
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Olá, {currentUser.name.split(' ')[0]}!</h2>
          <div className="flex items-center gap-2 mt-1">
             <div className={`w-2 h-2 rounded-full ${myData?.status === 'ready' ? 'bg-green-500' : 'bg-orange-400 animate-pulse'}`}></div>
             <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {myData?.status === 'ready' ? 'Perfil Ativo' : 'Pendente'}
             </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-full border border-slate-100 dark:border-slate-700">
            <button onClick={onViewProfile} className="text-slate-600 dark:text-slate-300 text-xs font-bold hover:text-red-600 dark:hover:text-red-400 transition px-3 py-1">
                {myData?.status === 'ready' ? 'EDITAR' : 'COMPLETAR'}
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-slate-400" /> Participantes
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${readyCount === allParticipants.length ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
            {readyCount} / {allParticipants.length} Prontos
          </span>
        </div>

        <div className="p-4 space-y-2">
          {allParticipants.map(p => {
             const pData = participantsState[p.id];
             const isReady = pData?.status === 'ready';
             return (
               <div key={p.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isReady ? 'border-green-100 dark:border-green-900 bg-green-50/30 dark:bg-green-900/10' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                 <div className="flex items-center w-full">
                   <div className="flex flex-col">
                      <span className={`font-bold text-sm ${isReady ? 'text-green-900 dark:text-green-300' : 'text-slate-600 dark:text-slate-300'}`}>{p.name}</span>
                      {isReady 
                        ? <span className="text-[10px] font-bold text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle size={10}/> Pronto</span>
                        : <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Aguardando...</span>
                      }
                   </div>
                 </div>
                 
                 {!isReady && (
                   <a 
                    href={getWhatsAppLink(p.phone, 'remind', {name: p.name})} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:border-green-200 shadow-sm transition-all active:scale-90" 
                    title="Cobrar no WhatsApp"
                   >
                     <MessageCircle size={18} />
                   </a>
                 )}
               </div>
             )
          })}
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          {!isDrawDone && (
            <div className="text-center">
              {allReady ? (
                <button 
                  onClick={initiateDraw}
                  className="w-full bg-gradient-to-r from-red-600 to-purple-700 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-red-200 dark:shadow-none transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <Wand2 className="animate-pulse" /> REALIZAR SORTEIO AGORA
                </button>
              ) : (
                <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 p-4 rounded-2xl flex items-center justify-center gap-3 text-sm border border-orange-100 dark:border-orange-900/50 shadow-sm">
                  <Lock className="w-5 h-5 flex-shrink-0 text-orange-400 dark:text-orange-300" />
                  <span className="font-medium">O sorteio será liberado quando todos ficarem verdes.</span>
                </div>
              )}
            </div>
          )}
          {isDrawDone && (
            <div className="text-center animate-bounce-in space-y-4">
              <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-200 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm">
                <CheckCircle size={24} className="fill-green-600 dark:fill-green-500 text-white dark:text-slate-900"/> Sorteio Realizado!
              </div>
              
              <button 
                onClick={() => setRevealing(true)} 
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-yellow-200 dark:shadow-none transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <Gift className="w-8 h-8" /> VER MEU AMIGO
              </button>
              
              <a 
                href={getWhatsAppLink('', 'drawAnnounce')} 
                target="_blank" 
                rel="noreferrer" 
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-lg shadow-green-200 dark:shadow-none"
              >
                <Share2 size={20} /> AVISAR NO GRUPO 📢
              </a>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-2">Toque para avisar a todos que o resultado saiu!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;