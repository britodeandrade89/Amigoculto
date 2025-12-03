import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken, User as AuthUser } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { Loader2, Moon, Sun, Trees } from 'lucide-react';
import { auth, db } from './services/firebase';
import { PARTICIPANTS_DATA, APP_ID } from './constants';
import { Participant, ParticipantState, ViewState } from './types';
import LoginScreen from './components/LoginScreen';
import QuizScreen from './components/QuizScreen';
import DashboardScreen from './components/DashboardScreen';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currentUserData, setCurrentUserData] = useState<Participant | null>(null); 
  const [participantsState, setParticipantsState] = useState<Record<string, ParticipantState>>({}); 
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>('login'); 
  
  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const initAuth = async () => {
      // Check for custom token injected by global scope
      const initialToken = (typeof window !== 'undefined' && (window as any).__initial_auth_token);
      
      try {
        if (initialToken) {
          await signInWithCustomToken(auth, initialToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth init failed", error);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const collRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'secret_santa_users_v2'); 
    
    const unsubscribe = onSnapshot(collRef, (snapshot) => {
      const data: Record<string, ParticipantState> = {};
      snapshot.forEach((doc) => {
        data[doc.id] = doc.data() as ParticipantState;
      });
      setParticipantsState(data);
      setLoading(false);
    }, (error) => { 
      console.error("Firestore snapshot error", error); 
      setLoading(false); 
    });
    
    return () => unsubscribe();
  }, [user]);

  const handleLogin = (participantId: string) => {
    const selectedUser = PARTICIPANTS_DATA.find(p => p.id === participantId);
    if (!selectedUser) return;
    
    setCurrentUserData(selectedUser);
    
    if (participantsState[participantId]?.status === 'ready') {
      setView('dashboard');
    } else {
      setView('quiz');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-red-900 flex items-center justify-center text-white">
      <Loader2 className="animate-spin w-12 h-12" />
    </div>
  );

  return (
    <div className="min-h-screen font-sans selection:bg-red-200 flex flex-col transition-colors duration-300 christmas-bg text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="bg-red-700 text-white p-4 shadow-xl sticky top-0 z-50 border-b-4 border-yellow-500">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Trees className="w-8 h-8 text-green-300" />
             <div>
                <h1 className="font-bold text-xl leading-none">Sorteador</h1>
                <p className="text-[10px] text-red-200 font-bold tracking-widest uppercase">De Amigo Oculto de Natal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 bg-red-800/50 hover:bg-red-800 rounded-full transition text-white/80 hover:text-white border border-red-600"
                title="Alternar Tema"
            >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {currentUserData && (
                <button 
                onClick={() => { setCurrentUserData(null); setView('login'); }}
                className="text-xs bg-red-800/50 hover:bg-red-800 py-2 px-3 rounded-lg transition font-bold border border-red-600"
                >
                Sair
                </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full p-4 pb-12 flex-grow relative z-10">
          {view === 'login' && (
          <LoginScreen 
              participants={PARTICIPANTS_DATA} 
              participantsState={participantsState}
              onSelect={handleLogin} 
          />
          )}
          {view === 'quiz' && currentUserData && (
          <QuizScreen 
              user={user}
              participant={currentUserData} 
              existingData={participantsState[currentUserData.id]}
              onComplete={() => setView('dashboard')}
          />
          )}
          {view === 'dashboard' && currentUserData && (
          <DashboardScreen 
              currentUser={currentUserData}
              participantsState={participantsState}
              allParticipants={PARTICIPANTS_DATA}
              userAuth={user}
              onViewProfile={() => setView('quiz')}
          />
          )}
      </main>
      
      <footer className="text-center py-6 text-red-200 text-xs bg-red-900/90 backdrop-blur-sm border-t border-red-800">
        <div className="max-w-md mx-auto px-4 flex flex-col gap-1">
            <p className="font-semibold">Desenvolvido por: André Brito</p>
            <p className="opacity-70">Feliz Natal! 🎄</p>
        </div>
      </footer>
    </div>
  );
}