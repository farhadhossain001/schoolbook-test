import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_BOOKS } from '../constants';
import BookCard from '../components/BookCard';
import { ArrowLeft, BookX } from 'lucide-react';

const BookList: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const filteredBooks = MOCK_BOOKS.filter(book => book.classLevel === classId);

  const toBanglaDigit = (str: string | undefined) => {
    if (!str) return "";
    return str.replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[85vh]">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <Link 
          to="/"
          className="self-start inline-flex items-center text-slate-500 hover:text-indigo-600 transition-colors text-sm font-semibold bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 hover:shadow-md"
        >
          <ArrowLeft size={16} className="mr-2" /> হোম পেজ
        </Link>
        
        <div className="bg-indigo-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
           <div className="relative z-10">
              <span className="opacity-80 font-medium tracking-wide text-indigo-100 uppercase text-xs mb-2 block">লাইব্রেরি কালেকশন</span>
              <h1 className="text-3xl sm:text-4xl font-black mb-2">
                শ্রেণী {toBanglaDigit(classId)}
              </h1>
              <p className="text-indigo-100 font-medium">
                মোট {toBanglaDigit(filteredBooks.length.toString())} টি বই পাওয়া গেছে
              </p>
           </div>
        </div>
      </div>

      {/* Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-6 bg-slate-100 rounded-full mb-6">
            <BookX size={64} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">কোনো বই পাওয়া যায়নি</h3>
          <p className="text-slate-500 max-w-xs mx-auto mb-8 leading-relaxed">
            এই শ্রেণীর জন্য বর্তমানে কোনো পাঠ্যবই আমাদের সংগ্রহে নেই। শীঘ্রই যুক্ত করা হবে।
          </p>
          <button 
            onClick={() => navigate('/')} 
            className="px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            অন্যান্য শ্রেণী দেখুন
          </button>
        </div>
      )}
    </div>
  );
};

export default BookList;