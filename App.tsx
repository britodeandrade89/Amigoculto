import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken, User as AuthUser } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { Loader2, Sparkles, Moon, Sun } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white">
      <Loader2 className="animate-spin w-12 h-12" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-red-200 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white p-5 shadow-xl sticky top-0 z-20 border-b border-red-900">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
                <h1 className="font-bold text-lg leading-tight tracking-tight">Sorteador</h1>
                <p className="text-[10px] text-red-200 font-medium tracking-widest uppercase">Do Amigo Oculto</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 bg-black/20 hover:bg-black/30 rounded-full transition text-white/80 hover:text-white backdrop-blur-md border border-white/10"
                title="Alternar Tema"
            >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {currentUserData && (
                <button 
                onClick={() => { setCurrentUserData(null); setView('login'); }}
                className="text-xs bg-black/20 hover:bg-black/30 py-1.5 px-3 rounded-lg transition font-medium backdrop-blur-md border border-white/10"
                >
                Sair
                </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full p-4 pb-12 flex-grow relative">
        {/* Background Decorativo */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0 invert dark:invert-0" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
        </div>

        <div className="relative z-10">
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
        </div>
      </main>
      
      <footer className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-inner transition-colors duration-300">
        <div className="max-w-md mx-auto px-4 flex flex-col gap-2">
            <p className="font-semibold text-slate-600 dark:text-slate-300">Desenvolvido por: <span className="text-red-600 dark:text-red-400">André Brito</span></p>
            <p>Versão: 1.0</p>
            <div className="h-px bg-slate-100 dark:bg-slate-800 w-1/2 mx-auto my-1"></div>
            <p className="text-[10px] text-slate-500 dark:text-slate-500">
                Contato: <a href="mailto:britodeandrade@gmail.com" className="hover:text-red-500 transition-colors">britodeandrade@gmail.com</a>
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-500 font-mono tracking-tighter">
                + 55 21 994 527 694
            </p>
        </div>
      </footer>
    </div>
  );
}