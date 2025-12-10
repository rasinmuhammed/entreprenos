
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-nebula-950 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-tech-purple/20 rounded-full blur-[100px] animate-blob mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-tech-cyan/10 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
           <div className="inline-flex items-center gap-2 mb-4">
              <div className="relative group">
                <div className="absolute inset-0 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-tech-cyan/20" />
                <Hexagon className="w-10 h-10 relative z-10 text-tech-cyan" />
              </div>
              <h1 className="text-3xl font-light text-white tracking-tighter">Entrepren<span className="text-tech-cyan font-normal">OS</span></h1>
           </div>
           <p className="text-white/40 text-sm">Adaptive Operating System for Founders</p>
        </div>

        <GlassPane className="p-8">
           <div className="flex justify-between mb-8 border-b border-white/5 pb-4">
              <button 
                onClick={() => setIsLogin(true)}
                className={`text-sm font-medium transition-colors ${isLogin ? 'text-white' : 'text-white/40 hover:text-white'}`}
              >
                Secure Login
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`text-sm font-medium transition-colors ${!isLogin ? 'text-white' : 'text-white/40 hover:text-white'}`}
              >
                Create Account
              </button>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <label className="block text-[10px] font-mono uppercase text-white/40 mb-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                        <input 
                           type="text" 
                           value={name} 
                           onChange={e => setName(e.target.value)} 
                           className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-tech-cyan/50 focus:outline-none transition-colors"
                           placeholder="John Doe"
                           required={!isLogin}
                        />
                      </div>
                   </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-[10px] font-mono uppercase text-white/40 mb-1">Email Address</label>
                <div className="relative">
                   <Mail className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                   <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-tech-cyan/50 focus:outline-none transition-colors"
                      placeholder="founder@startup.com"
                      required
                   />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-white/40 mb-1">Password</label>
                <div className="relative">
                   <Lock className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                   <input 
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-tech-cyan/50 focus:outline-none transition-colors"
                      placeholder="••••••••"
                      required
                   />
                </div>
              </div>

              {auth.error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                   {auth.error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={auth.isLoading}
                className="w-full py-3 bg-tech-cyan hover:bg-cyan-400 text-nebula-950 font-medium rounded-xl flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
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
              <button onClick={() => {}} className="text-xs text-white/30 hover:text-white transition-colors">
                 Forgot Encryption Key?
              </button>
           </div>
        </GlassPane>
        
        <div className="text-center mt-6 text-[10px] text-white/20 font-mono">
           SECURE CONNECTION • ENCRYPTED • V2.5.0
        </div>
      </motion.div>
    </div>
  );
};
