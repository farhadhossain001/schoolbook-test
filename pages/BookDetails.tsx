import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_BOOKS } from '../constants';
import { ArrowLeft, BookOpen, Download, Share2, Info } from 'lucide-react';

const BookDetails: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  
  const book = MOCK_BOOKS.find(b => b.id === bookId);

  // Robust Navigation: Always go up to the Class List or Home
  const handleBack = () => {
    if (book) {
        navigate(`/class/${book.classLevel}`);
    } else {
        navigate('/');
    }
  };

  const handleReadClick = () => {
    navigate(`/read/${bookId}`);
  };

  const toBanglaDigit = (str: string) => {
    return str.replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);
  };

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">বইটি খুঁজে পাওয়া যায়নি</h2>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">হোম</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button 
        onClick={handleBack} 
        className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors font-semibold bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 cursor-pointer"
      >
        <ArrowLeft size={18} className="mr-2" /> ফিরে যান
      </button>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
        <div className="md:flex">
          {/* Image Sidebar */}
          <div className="md:w-5/12 bg-slate-50 p-8 flex items-center justify-center relative">
             <div className="absolute inset-0 bg-indigo-50/50 pattern-grid-lg opacity-20"></div>
             <div className="relative z-10 w-48 sm:w-64 aspect-[3/4] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] rounded-r-xl rounded-l-sm transform md:rotate-y-12 transition-transform duration-500 hover:scale-105">
                <img 
                  src={book.thumbnailUrl} 
                  alt={book.title} 
                  className="w-full h-full object-cover rounded-r-xl rounded-l-sm"
                />
                {/* Book Spine Effect */}
                <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/20 to-transparent pointer-events-none"></div>
             </div>
          </div>

          {/* Info Section */}
          <div className="p-8 md:p-12 md:w-7/12 flex flex-col">
             <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                  শ্রেণী {toBanglaDigit(book.classLevel)}
                </span>
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                  {book.subject}
                </span>
             </div>

             <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">
                {book.title}
             </h1>

             <div className="prose prose-slate prose-sm text-slate-600 leading-relaxed mb-8 flex-grow">
               <p>{book.description || "এই বইটির জন্য কোনো বিস্তারিত বিবরণ নেই।"}</p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
               <button 
                  onClick={handleReadClick}
                  className="group relative bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]"
               >
                 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                 <div className="relative flex items-center justify-center gap-2">
                   <BookOpen size={20} />
                   এখনই পড়ুন
                 </div>
               </button>
               
               <a 
                  href={book.pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-colors"
               >
                 <Download size={20} />
                 ডাউনলোড
               </a>
             </div>

             <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-sm font-medium cursor-not-allowed">
                <Info size={16} /> এটি জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ডের একটি বই
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;