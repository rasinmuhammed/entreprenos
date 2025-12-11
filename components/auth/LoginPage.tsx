
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { GlassPane } from '../ui/GlassPane';
import { Hexagon, Loader2, ArrowRight, Lock, Mail, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, auth } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login(email, password);
    } else {
      await register(name, email, password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden font-sans">
      {/* Executive Background - Subtle & Professional */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.03)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-100 pointer-events-none" />
      
      {/* Ambient Blobs (Light Mode Optimized) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-100/50 rounded-full blur-[80px] animate-blob mix-blend-multiply" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-100/50 rounded-full blur-[80px] animate-blob animation-delay-2000 mix-blend-multiply" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
           <div className="inline-flex items-center gap-3 mb-4">
              <div className="relative group">
                <div className="absolute inset-0 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-tech-purple/20" />
                <Hexagon className="w-10 h-10 relative z-10 text-tech-purple" />
              </div>
              <h1 className="text-3xl font-bold font-display tracking-tight text-ink-950">Entrepren<span className="text-tech-purple">OS</span></h1>
           </div>
           <p className="text-ink-500 text-sm font-medium">Adaptive Operating System for Founders</p>
        </div>

        <GlassPane className="p-8 bg-white border border-slate-200 shadow-xl">
           <div className="flex justify-between mb-8 border-b border-slate-100 pb-1">
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 pb-3 text-sm font-bold transition-all relative ${isLogin ? 'text-tech-purple' : 'text-ink-400 hover:text-ink-600'}`}
              >
                Secure Login
                {isLogin && <motion.div layoutId="tab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-tech-purple" />}
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 pb-3 text-sm font-bold transition-all relative ${!isLogin ? 'text-tech-purple' : 'text-ink-400 hover:text-ink-600'}`}
              >
                Register
                {!isLogin && <motion.div layoutId="tab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-tech-purple" />}
              </button>
           </div>

           <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <label className="block text-[10px] font-mono uppercase font-bold text-ink-500 mb-1.5">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-3 top-3 w-4 h-4 text-ink-400 group-focus-within:text-tech-purple transition-colors" />
                        <input 
                           type="text" 
                           value={name} 
                           onChange={e => setName(e.target.value)} 
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-ink-900 focus:bg-white focus:border-tech-purple focus:ring-4 focus:ring-tech-purple/10 focus:outline-none transition-all placeholder-ink-300 font-medium"
                           placeholder="Founder Name"
                           required={!isLogin}
                        />
                      </div>
                   </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-ink-500 mb-1.5">Email Address</label>
                <div className="relative group">
                   <Mail className="absolute left-3 top-3 w-4 h-4 text-ink-400 group-focus-within:text-tech-purple transition-colors" />
                   <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-ink-900 focus:bg-white focus:border-tech-purple focus:ring-4 focus:ring-tech-purple/10 focus:outline-none transition-all placeholder-ink-300 font-medium"
                      placeholder="founder@venture.com"
                      required
                   />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-ink-500 mb-1.5">Password</label>
                <div className="relative group">
                   <Lock className="absolute left-3 top-3 w-4 h-4 text-ink-400 group-focus-within:text-tech-purple transition-colors" />
                   <input 
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-ink-900 focus:bg-white focus:border-tech-purple focus:ring-4 focus:ring-tech-purple/10 focus:outline-none transition-all placeholder-ink-300 font-medium"
                      placeholder="••••••••"
                      required
                   />
                </div>
              </div>

              {auth.error && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-600 font-bold flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                   {auth.error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={auth.isLoading}
                className="w-full py-3.5 bg-tech-purple hover:bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 hover:scale-[1.02]"
              >
                 {auth.isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                 ) : (
                    <>
                       {isLogin ? 'Initialize Session' : 'Register Founder'}
                       <ArrowRight className="w-4 h-4" />
                    </>
                 )}
              </button>
           </form>

           <div className="mt-6 text-center">
              <button onClick={() => {}} className="text-xs text-ink-400 hover:text-tech-purple transition-colors font-semibold">
                 Forgot Encryption Key?
              </button>
           </div>
        </GlassPane>
        
        <div className="text-center mt-8 text-[10px] text-ink-300 font-mono font-bold tracking-widest uppercase">
           Secure Connection • Encrypted • V3.0.0
        </div>
      </motion.div>
    </div>
  );
};
