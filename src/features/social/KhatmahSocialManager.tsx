import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Trophy, BookOpen, ChevronRight, Hash, ShieldCheck, Sparkles, X, LayoutGrid, Plus, CheckCircle2, Send, Lock, Globe, Loader2, Settings, RefreshCcw, LogOut } from 'lucide-react';
import { useUserStore, KhatmahCircle } from '../../store/useUserStore';
import { useTranslations } from '../../hooks/useTranslations';

export const KhatmahSocialManager: React.FC = () => {
  const { user, circles, isAuthenticated, joinCircle, createCircle, assignHizb, setActiveHizb, language, fetchUserData, leaveCircle } = useUserStore();
  const { t } = useTranslations();
  
  const [activeCircleId, setActiveCircleId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  const [selectedMember, setSelectedMember] = useState('');
  const [hizbNum, setHizbNum] = useState(1);
  
  const [showLeaveModal, setShowLeaveModal] = useState<KhatmahCircle | null>(null);
  const [newLeaderId, setNewLeaderId] = useState('');

  const activeCircle = circles.find(c => c.id === activeCircleId);

  const confirmLeave = async () => {
    if (!showLeaveModal) return;
    
    const isLeader = (showLeaveModal.leaderId || (showLeaveModal as any).leader_id) === user?.id;
    if (isLeader && showLeaveModal.members.length > 1 && !newLeaderId) {
      setError(language === 'ar' ? 'يرجى اختيار قائد جديد قبل المغادرة' : 'Please select a new leader before leaving');
      return;
    }

    setLoading(true);
    try {
      await leaveCircle(showLeaveModal.id, newLeaderId);
      setShowLeaveModal(null);
      setNewLeaderId('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const interval = setInterval(() => fetchUserData(), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleJoin = async () => {
    if (!joinCode) return;
    setError('');
    setLoading(true);
    const result = await joinCircle(joinCode);
    if (!result.success) setError(result.message || 'Error');
    else { setJoinCode(''); setShowAddMenu(false); }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newGroupName) return;
    setLoading(true);
    await createCircle(newGroupName);
    setNewGroupName(''); setShowAddMenu(false);
    setLoading(false);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-10 py-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between px-4">
        <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
          <div className="p-3 bg-spiritual-accent/10 rounded-2xl text-spiritual-accent shadow-sm"><Users size={24} /></div>
          <h2 className="text-3xl font-black text-spiritual-accent italic tracking-tight">{t('group_khatmah')}</h2>
          <button onClick={handleRefresh} className={`p-2 text-spiritual-emerald/40 hover:text-spiritual-emerald transition-all ${isRefreshing ? 'animate-spin' : ''}`}><RefreshCcw size={18} /></button>
        </div>
        <button onClick={() => setShowAddMenu(true)} className="p-3 bg-spiritual-emerald text-white rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center gap-2 font-black text-[10px] uppercase"><Plus size={18} /> {t('create_group')}</button>
      </div>

      <div className="grid gap-12">
        {circles.map((circle) => {
          const isLeader = circle.leaderId === user?.id;
          const totalGroupProgress = Math.round(circle.members.reduce((acc, m) => acc + m.progress, 0) / (circle.members.length || 1));
          
          return (
            <div key={circle.id} className="space-y-6">
              <div className="flex items-center justify-between px-4 bg-emerald-50/30 p-6 rounded-[2.5rem] border border-emerald-100/50">
                <div className={`flex items-center gap-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-spiritual-emerald shadow-sm font-black text-xl">{circle.name[0]}</div>
                  <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-spiritual-dark italic tracking-tight">{circle.name}</h3>
                      {circle.khatmatCount > 0 && (
                        <div className="flex items-center gap-1 bg-spiritual-accent/10 px-2 py-1 rounded-lg border border-spiritual-accent/20">
                          <Trophy size={14} className="text-spiritual-accent" />
                          <span className="text-xs font-black text-spiritual-accent">x{circle.khatmatCount}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-spiritual-dark text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest">{circle.code}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{circle.members.length} {t('group_members')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <Trophy size={16} className="text-spiritual-accent" />
                    <span className="text-2xl font-black text-spiritual-emerald">{totalGroupProgress}%</span>
                  </div>
                  <div className="w-24 h-1.5 bg-emerald-100 rounded-full overflow-hidden"><div className="h-full bg-spiritual-accent" style={{ width: `${totalGroupProgress}%` }} /></div>
                  
                  {/* Quick Access for the current user's assignment */}
                  {circle.assignments.find(a => a.memberId === user?.id) && (
                    <button 
                      onClick={() => setActiveHizb({ circleId: circle.id, hizbNum: circle.assignments.find(a => a.memberId === user?.id)!.hizbNumber })}
                      className="mt-2 px-4 py-1.5 bg-spiritual-accent text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-md hover:scale-105 transition-all flex items-center gap-1"
                    >
                      <BookOpen size={12} /> {language === 'ar' ? 'ابدأ حزبي' : 'Read My Hizb'}
                    </button>
                  )}

                  <button onClick={() => setShowLeaveModal(circle)} className="text-[10px] text-red-400 font-bold hover:text-red-600 flex items-center gap-1 mt-2"><LogOut size={12} /> {language === 'ar' ? 'مغادرة' : 'Leave'}</button>
                </div>
              </div>

              <div className="grid gap-4 px-2">
                {(circle.assignments || []).sort((a,b) => a.hizbNumber - b.hizbNumber).map((assign, i) => {
                  const isMe = assign.memberId === user?.id;
                  const progress = Math.round((assign.readAyahs / (assign.totalAyahs || 1)) * 100);
                  
                  return (
                    <motion.div
                      key={i} 
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center justify-between p-6 rounded-[2.5rem] border transition-all text-right relative overflow-hidden cursor-pointer ${isMe ? 'bg-white border-spiritual-emerald shadow-xl ring-4 ring-emerald-500/5' : 'bg-white/50 border-slate-100 opacity-80'}`}
                      onClick={() => { if(isMe) setActiveHizb({ circleId: circle.id, hizbNum: assign.hizbNumber }); }}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${isMe ? 'bg-spiritual-emerald text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>{assign.hizbNumber}</div>
                        <div className="text-right">
                          <h5 className={`font-black text-lg ${isMe ? 'text-spiritual-dark' : 'text-slate-400'}`}>{assign.memberName} {isMe && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full mr-1 italic">أنت</span>}</h5>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('group_mission')} {assign.hizbNumber}</p>
                          {assign.lastReadSurahName && (
                            <p className="text-[9px] font-black text-spiritual-accent mt-1 uppercase tracking-tighter">
                              {language === 'ar' ? 'وصل إلى' : 'Last read'}: {assign.lastReadSurahName} (الآية {assign.lastReadAyah})
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 relative z-10">
                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                             <span className={`text-xl font-black ${isMe ? 'text-spiritual-emerald' : 'text-slate-300'}`}>{assign.status === 'completed' ? '100%' : `${progress}%`}</span>
                             {assign.status === 'completed' && <CheckCircle2 size={16} className="text-spiritual-accent" />}
                          </div>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className={`h-full ${isMe ? 'bg-spiritual-accent' : 'bg-slate-200'}`} /></div>
                        </div>
                        {isMe && <ChevronRight size={20} className="text-spiritual-emerald" />}
                      </div>
                      {isMe && <div className="absolute top-0 right-0 w-32 h-32 bg-spiritual-emerald/5 rounded-full -mr-16 -mt-16 blur-2xl" />}
                    </motion.div>
                  );
                })}
              </div>

              {isLeader && (
                <button onClick={() => { fetchUserData(); setActiveCircleId(circle.id); }} className="w-full py-4 border-2 border-dashed border-emerald-100 rounded-[2rem] text-spiritual-emerald font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 mt-4">
                  <ShieldCheck size={18} /> {t('group_assign_title')}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Menus and Modals same as before but using activeCircle from latest state */}
      <AnimatePresence>
        {showAddMenu && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddMenu(false)} className="absolute inset-0 bg-spiritual-dark/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl bg-[#FDFCF7] rounded-[3rem] shadow-2xl z-[110] p-8 md:p-12 overflow-hidden">
              <div className="flex justify-between items-center mb-10">
                <h4 className="text-2xl font-black text-spiritual-dark italic">{t('create_group')}</h4>
                <button onClick={() => setShowAddMenu(false)} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={24} /></button>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-4 bg-emerald-50 rounded-3xl text-spiritual-emerald w-fit"><Plus size={24} /></div>
                  <div className="space-y-2"><h5 className="font-black text-spiritual-dark uppercase text-xs tracking-widest">{t('create_group')}</h5><input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder={t('group_placeholder')} className="w-full p-4 bg-white border border-emerald-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-spiritual-emerald/20 transition-all" /></div>
                  <button onClick={handleCreate} disabled={loading} className="w-full py-4 bg-spiritual-dark text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-spiritual-emerald transition-all shadow-lg flex items-center justify-center gap-2">{loading ? <Loader2 className="animate-spin" size={16} /> : t('group_btn_create')}</button>
                </div>
                <div className="space-y-6">
                  <div className="p-4 bg-spiritual-accent/10 rounded-3xl text-spiritual-accent w-fit"><Hash size={24} /></div>
                  <div className="space-y-2"><h5 className="font-black text-spiritual-dark uppercase text-xs tracking-widest">{t('join_group')}</h5><input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="ENTER CODE" className="w-full p-4 bg-white border border-emerald-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-spiritual-emerald/20 transition-all uppercase" /></div>
                  {error && <p className="text-[10px] text-red-500 font-bold">{error}</p>}
                  <button onClick={handleJoin} disabled={loading} className="w-full py-4 bg-spiritual-emerald text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-800 transition-all shadow-lg flex items-center justify-center gap-2">{loading ? <Loader2 className="animate-spin" size={16} /> : t('group_btn_join')}</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeCircle && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveCircleId(null)} className="absolute inset-0 bg-spiritual-dark/60 backdrop-blur-md" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative w-full max-w-2xl bg-[#FDFCF7] rounded-t-[3rem] md:rounded-[3rem] shadow-2xl z-[110] p-8 md:p-12 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-10">
                <h4 className="text-2xl font-black text-spiritual-dark italic">{t('group_assign_title')}</h4>
                <button onClick={() => setActiveCircleId(null)} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={24} /></button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase mr-2">{t('group_members')}</label>
                  <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} className="w-full p-5 bg-white border border-emerald-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-spiritual-emerald/20 transition-all">
                    <option value="">{t('group_members')}</option>
                    {activeCircle.members.map(m => (<option key={m.id} value={m.id + '|' + m.name}>{m.name}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase mr-2">{t('group_mission')} (1-60)</label>
                  <input 
                    type="number" min="1" max="60" 
                    value={hizbNum} 
                    onChange={(e) => setHizbNum(parseInt(e.target.value))} 
                    className={`w-full p-5 bg-white border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-spiritual-emerald/20 transition-all ${activeCircle.assignments.some(a => a.hizbNumber === hizbNum) ? 'border-red-200 text-red-400' : 'border-emerald-100 text-spiritual-dark'}`} 
                  />
                  {activeCircle.assignments.some(a => a.hizbNumber === hizbNum) && (
                    <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest mt-1">
                      {language === 'ar' ? 'هذا الحزب معين مسبقاً لعضو آخر' : 'Hizb already assigned to another member'}
                    </p>
                  )}
                </div>
                <button 
                  disabled={activeCircle.assignments.some(a => a.hizbNumber === hizbNum)}
                  onClick={async () => { 
                    if(selectedMember) {
                      const [id, name] = selectedMember.split('|');
                      await assignHizb(activeCircle.id, id, name, hizbNum); 
                      setActiveCircleId(null);
                    }
                  }} 
                  className="w-full py-5 bg-spiritual-emerald text-white rounded-2xl font-black shadow-xl hover:bg-emerald-800 disabled:opacity-50 disabled:grayscale transition-all"
                >
                  {t('group_assign_btn')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLeaveModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLeaveModal(null)} className="absolute inset-0 bg-spiritual-dark/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl z-[110] p-8 overflow-hidden">
              <h4 className="text-xl font-black text-red-500 mb-4">Leave Group?</h4>
              {(showLeaveModal.leaderId || (showLeaveModal as any).leader_id) === user?.id && showLeaveModal.members.length > 1 && (
                <div className="space-y-2 mb-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Select New Leader</label>
                  <select value={newLeaderId} onChange={(e) => setNewLeaderId(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none">
                    <option value="">Choose member...</option>
                    {showLeaveModal.members.filter(m => m.id !== user?.id).map(m => (<option key={m.id} value={m.id}>{m.name}</option>))}
                  </select>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={confirmLeave} disabled={loading} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm">Confirm Leave</button>
                <button onClick={() => setShowLeaveModal(null)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
