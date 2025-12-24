import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  Settings, 
  Plus, 
  Link as LinkIcon, 
  Lock, 
  LogOut, 
  Database, 
  UploadCloud, 
  Loader2, 
  Edit2, 
  Trash2, 
  X, 
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getApiUrl, setApiUrl, addBookToSheet, updateBookInSheet, deleteBookFromSheet, getAdminPassword, fetchBooksFromSheet } from '../services/api';
import { useBooks } from '../context/BookContext';
import { Book } from '../types';
import { CLASSES, MOCK_BOOKS } from '../constants';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { books, refreshBooks, isUsingLive } = useBooks();
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  // Config State
  const [scriptUrl, setScriptUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error'|'info', text: string} | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const initialFormState: Partial<Book> = {
    title: '',
    subject: '',
    classLevel: '10',
    thumbnailUrl: '',
    pdfUrl: '',
    description: ''
  };
  const [formData, setFormData] = useState<Partial<Book>>(initialFormState);

  // Filter books for display with defensive coding
  const filteredBooks = books.filter(b => {
    const q = searchTerm.toLowerCase();
    const title = b.title ? String(b.title).toLowerCase() : '';
    const subject = b.subject ? String(b.subject).toLowerCase() : '';
    const id = b.id ? String(b.id) : '';
    
    return title.includes(q) || subject.includes(q) || id.includes(q);
  });

  useEffect(() => {
    setScriptUrl(getApiUrl());
    // Auto-open settings if no URL is set
    if (!getApiUrl()) setShowSettings(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === getAdminPassword()) {
      setIsAuthenticated(true);
    } else {
      alert('ভুল পাসওয়ার্ড');
    }
  };

  const handleConfigSave = () => {
    let cleanUrl = scriptUrl;
    if (cleanUrl.includes('/exec')) {
      cleanUrl = cleanUrl.split('/exec')[0] + '/exec';
    }
    setApiUrl(cleanUrl);
    setScriptUrl(cleanUrl);
    setMessage({ type: 'success', text: 'সেটিংস আপডেট করা হয়েছে।' });
    setTimeout(() => {
       window.location.reload();
    }, 1000);
  };

  const populateForm = (book: Book) => {
    setEditingId(book.id);
    setFormData({
      title: book.title,
      subject: book.subject,
      classLevel: book.classLevel,
      thumbnailUrl: book.thumbnailUrl,
      pdfUrl: book.pdfUrl,
      description: book.description || ''
    });
    // Scroll to top on mobile
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMessage({ type: 'info', text: `এডিট মোড: "${book.title}"` });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scriptUrl) {
      setMessage({ type: 'error', text: 'সেটিংস থেকে API URL সেট করুন।' });
      setShowSettings(true);
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ type: 'info', text: 'অপেক্ষা করুন...' });

    const bookData: Book = {
      id: editingId || Date.now().toString(),
      title: formData.title!,
      subject: formData.subject!,
      classLevel: formData.classLevel!,
      thumbnailUrl: formData.thumbnailUrl || 'https://placehold.co/300x400?text=No+Cover',
      pdfUrl: formData.pdfUrl!,
      description: formData.description
    };

    let success = false;
    
    if (editingId) {
      success = await updateBookInSheet(bookData);
    } else {
      success = await addBookToSheet(bookData);
    }
    
    if (success) {
      setMessage({ type: 'success', text: 'সফলভাবে পাঠানো হয়েছে! রিফ্রেশ হচ্ছে...' });
      setFormData(initialFormState);
      setEditingId(null);
      
      setTimeout(async () => {
        await refreshBooks();
        setMessage(null);
      }, 2500);
    } else {
      setMessage({ type: 'error', text: 'সমস্যা হয়েছে। নেটওয়ার্ক চেক করুন।' });
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`সতর্কতা: "${title}" বইটি স্থায়ীভাবে মুছে ফেলা হবে।`)) return;
    
    setMessage({ type: 'info', text: 'মুছে ফেলা হচ্ছে...' });
    const success = await deleteBookFromSheet(id);
    
    if (success) {
      setMessage({ type: 'success', text: 'বই মুছে ফেলা হয়েছে। রিফ্রেশ হচ্ছে...' });
      setTimeout(async () => {
        await refreshBooks();
        setMessage(null);
      }, 2500);
    } else {
      setMessage({ type: 'error', text: 'মুছে ফেলতে সমস্যা হয়েছে।' });
    }
  };

  const handleSyncMockBooks = async () => {
    if (!scriptUrl) {
      setMessage({ type: 'error', text: 'সেটিংস ঠিক নেই।' });
      setShowSettings(true);
      return;
    }
    if (!window.confirm('শিটে ১০টি ডেমো বই যুক্ত হবে। আপনি কি নিশ্চিত?')) return;

    setIsSyncing(true);
    setMessage({ type: 'info', text: 'আপলোড শুরু হচ্ছে...' });
    
    let successCount = 0;
    const total = MOCK_BOOKS.length;

    for (let i = 0; i < total; i++) {
      const book = MOCK_BOOKS[i];
      const bookToUpload = { ...book, id: Date.now().toString() + i };
      
      try {
        await new Promise(r => setTimeout(r, 800));
        const success = await addBookToSheet(bookToUpload);
        if (success) {
          successCount++;
          setMessage({ type: 'info', text: `আপলোড হচ্ছে... (${i + 1}/${total})` });
        }
      } catch (e) {
        console.error(e);
      }
    }

    setIsSyncing(false);
    if (successCount > 0) {
      setMessage({ type: 'success', text: 'আপলোড সম্পন্ন! রিফ্রেশ হচ্ছে...' });
      setTimeout(refreshBooks, 3000);
    } else {
      setMessage({ type: 'error', text: 'আপলোড ব্যর্থ।' });
    }
  };

  const handleManualRefresh = async () => {
     setMessage({ type: 'info', text: 'ডাটা রিফ্রেশ হচ্ছে...' });
     await refreshBooks();
     setMessage(null);
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 px-4">
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-white/20">
          <div className="flex justify-center mb-6">
             <div className="p-4 bg-indigo-50 rounded-2xl shadow-inner">
               <Lock size={32} className="text-indigo-600" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-center text-slate-800 mb-2">এডমিন এক্সেস</h2>
          <p className="text-center text-slate-500 text-sm mb-8">ম্যানেজমেন্ট ড্যাশবোর্ডে লগইন করুন</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="পাসওয়ার্ড"
                />
                <div className="absolute right-3 top-3 text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                </div>
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
              প্রবেশ করুন
            </button>
            <div className="text-center mt-6">
              <button type="button" onClick={() => navigate('/')} className="text-sm font-medium text-slate-400 hover:text-indigo-600 transition-colors">
                ← ওয়েবসাইটে ফিরে যান
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-100/50 pb-20 font-sans">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-200">
              <Database size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">ড্যাশবোর্ড</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ম্যানেজমেন্ট প্যানেল</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleManualRefresh} 
              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all active:scale-95" 
              title="Refresh Data"
            >
               <RefreshCw size={20} className={message?.text.includes('রিফ্রেশ') ? 'animate-spin' : ''} />
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <button 
              onClick={() => setIsAuthenticated(false)} 
              className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all text-sm font-bold"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">মোট বই</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-3xl font-black text-slate-800">{books.length}</span>
              <BookOpen size={20} className="text-indigo-200 mb-1" />
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">স্টেটাস</span>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${isUsingLive ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
              <span className={`text-sm font-bold ${isUsingLive ? 'text-green-600' : 'text-amber-600'}`}>
                {isUsingLive ? 'লাইভ ডাটা' : 'অফলাইন/ডেমো'}
              </span>
            </div>
          </div>

           {/* Quick Action: Settings Toggle */}
           <div 
             onClick={() => setShowSettings(!showSettings)}
             className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between group ${showSettings ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
           >
             <span className={`text-xs font-bold uppercase ${showSettings ? 'text-indigo-200' : 'text-slate-400'}`}>সেটিংস</span>
             <div className="flex items-end justify-between mt-2">
               <span className={`text-sm font-bold ${showSettings ? 'text-white' : 'text-slate-700'}`}>API কনফিগারেশন</span>
               <Settings size={20} className={showSettings ? 'text-white' : 'text-slate-300 group-hover:text-indigo-500'} />
             </div>
           </div>

           {/* Quick Action: Mock Sync */}
           <button 
             onClick={handleSyncMockBooks}
             disabled={isSyncing}
             className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all flex flex-col justify-between text-left group"
           >
             <span className="text-xs font-bold text-slate-400 uppercase group-hover:text-amber-600">টুলস</span>
             <div className="flex items-end justify-between mt-2">
               <span className="text-sm font-bold text-slate-700 group-hover:text-amber-700">ডেমো বই আপলোড</span>
               {isSyncing ? <Loader2 size={20} className="animate-spin text-amber-600" /> : <UploadCloud size={20} className="text-slate-300 group-hover:text-amber-600" />}
             </div>
           </button>
        </div>

        {/* Collapsible Settings Panel */}
        {showSettings && (
          <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-xl animate-in slide-in-from-top-4 duration-300">
             <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2"><LinkIcon size={18} /> Google Apps Script URL</h3>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
             </div>
             <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <input 
                    type="text" 
                    value={scriptUrl}
                    onChange={(e) => setScriptUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/..."
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-sm font-mono focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none text-slate-300 placeholder:text-slate-600"
                  />
                  <p className="text-xs text-slate-400 mt-2">Apps Script Deployment URL দিন। অবশ্যই 'Anyone' পারমিশন থাকতে হবে।</p>
                </div>
                <button 
                  onClick={handleConfigSave}
                  className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-xl font-bold transition-colors whitespace-nowrap"
                >
                  সেভ করুন
                </button>
             </div>
          </div>
        )}

        {/* Main Content Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Editor Form (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`bg-white rounded-2xl shadow-sm border p-6 sticky top-24 transition-all duration-300 ${editingId ? 'border-orange-200 ring-4 ring-orange-50' : 'border-slate-200'}`}>
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                   {editingId ? <Edit2 size={20} className="text-orange-500" /> : <Plus size={20} className="text-indigo-600" />}
                   {editingId ? 'বই সম্পাদন' : 'নতুন বই যুক্ত করুন'}
                 </h2>
                 {editingId && (
                   <button onClick={cancelEdit} className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold hover:bg-red-100 transition">
                     বাতিল
                   </button>
                 )}
               </div>

               {message && (
                 <div className={`p-4 rounded-xl mb-6 text-sm flex items-start gap-3 ${
                   message.type === 'success' ? 'bg-green-50 text-green-800' : 
                   message.type === 'error' ? 'bg-red-50 text-red-800' : 
                   'bg-blue-50 text-blue-800'
                 }`}>
                   {message.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : 
                    message.type === 'error' ? <AlertCircle size={18} className="mt-0.5 shrink-0" /> : 
                    <Loader2 size={18} className="mt-0.5 shrink-0 animate-spin" />}
                   <span className="font-medium">{message.text}</span>
                 </div>
               )}

               <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-1">
                   <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide ml-1">বইয়ের নাম</label>
                   <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-slate-800 font-medium" placeholder="উদাহরণ: গণিত" />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide ml-1">বিষয়</label>
                      <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm" placeholder="বিজ্ঞান" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide ml-1">শ্রেণী</label>
                      <div className="relative">
                        <select value={formData.classLevel} onChange={e => setFormData({...formData, classLevel: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm appearance-none cursor-pointer">
                          {CLASSES.map(c => <option key={c.id} value={c.value}>{c.label}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                 </div>

                 <div className="space-y-1">
                   <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide ml-1">Google Drive PDF Link</label>
                   <input required type="url" value={formData.pdfUrl} onChange={e => setFormData({...formData, pdfUrl: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-xs font-mono text-slate-600" placeholder="https://drive.google.com/..." />
                 </div>

                 <div className="space-y-1">
                   <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide ml-1">Cover Image URL (Optional)</label>
                   <input type="url" value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-xs font-mono text-slate-600" />
                 </div>

                 <div className="space-y-1">
                   <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide ml-1">বিবরণ</label>
                   <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm resize-none" placeholder="বই সম্পর্কে কিছু লিখুন..." />
                 </div>

                 <button 
                   type="submit" 
                   disabled={isSubmitting}
                   className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2 mt-2 ${editingId ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
                 >
                   {isSubmitting ? (
                     <><Loader2 size={20} className="animate-spin" /> প্রক্রিয়াধীন...</>
                   ) : editingId ? (
                     <><Save size={20} /> আপডেট করুন</>
                   ) : (
                     <><Plus size={20} /> সেভ করুন</>
                   )}
                 </button>
               </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Book List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
             {/* List Header & Search */}
             <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                   <h2 className="font-bold text-slate-800 text-lg pl-2">বইয়ের তালিকা</h2>
                   <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-bold">{filteredBooks.length}</span>
                </div>
                <div className="relative w-full sm:w-64">
                   <input 
                     type="text" 
                     placeholder="খুঁজুন..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
                   />
                   <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                </div>
             </div>

             {/* List Content */}
             <div className="grid grid-cols-1 gap-3">
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => (
                    <div 
                      key={book.id} 
                      className={`group bg-white p-3 rounded-xl border shadow-sm hover:shadow-md transition-all flex gap-4 items-center ${editingId === book.id ? 'border-orange-300 bg-orange-50/30' : 'border-slate-200 hover:border-indigo-200'}`}
                    >
                      {/* Thumbnail */}
                      <div className="h-16 w-12 bg-slate-100 rounded-md overflow-hidden flex-shrink-0 relative shadow-sm">
                        <img src={book.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      </div>

                      {/* Info */}
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start">
                           <div>
                             <h3 className={`font-bold text-sm truncate pr-2 ${editingId === book.id ? 'text-orange-700' : 'text-slate-800'}`}>
                               {book.title}
                             </h3>
                             <div className="flex items-center gap-2 mt-1">
                               <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">শ্রেণী {book.classLevel}</span>
                               <span className="text-[10px] text-slate-400">•</span>
                               <span className="text-[10px] font-medium text-slate-500">{book.subject}</span>
                             </div>
                           </div>
                           
                           {/* Actions */}
                           <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => populateForm(book)}
                                className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                title="এডিট করুন"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(book.id, book.title)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 size={16} />
                              </button>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-400 font-medium">কোনো বই পাওয়া যায়নি</p>
                    {searchTerm && <button onClick={() => setSearchTerm('')} className="text-indigo-600 text-xs font-bold mt-2 hover:underline">ফিল্টার ক্লিয়ার করুন</button>}
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;