import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MOCK_BOOKS } from '../constants';
import BookCard from '../components/BookCard';
import { ArrowLeft, SearchX } from 'lucide-react';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const filteredBooks = MOCK_BOOKS.filter(book => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      book.title.toLowerCase().includes(q) ||
      book.subject.toLowerCase().includes(q) ||
      `class ${book.classLevel}`.includes(q) ||
      book.classLevel === q
    );
  });

  const toBanglaDigit = (num: number) => {
    return num.toString().replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[85vh]">
      <button 
        onClick={() => navigate('/')} 
        className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors text-sm font-semibold bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 hover:shadow-md"
      >
        <ArrowLeft size={16} className="mr-2" /> হোম-এ ফিরে যান
      </button>

      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 mb-2">
          {query ? <span className="text-indigo-600">"{query}"</span> : 'সকল বই'}
          <span className="text-slate-800"> এর ফলাফল</span>
        </h1>
        <p className="text-slate-500 font-medium">
          {toBanglaDigit(filteredBooks.length)} টি বই পাওয়া গেছে
        </p>
      </div>

      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="p-6 bg-red-50 rounded-full mb-6">
            <SearchX size={56} className="text-red-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">দুঃখিত, কোনো মিল পাওয়া যায়নি</h3>
          <p className="text-slate-500 mb-6">
             বানান পরীক্ষা করুন অথবা অন্য কোনো শব্দ দিয়ে অনুসন্ধান করুন।
          </p>
          <button 
            onClick={() => document.querySelector('input')?.focus()}
            className="text-indigo-600 font-bold hover:underline"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;