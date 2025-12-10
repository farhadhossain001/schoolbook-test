import React from 'react';
import { Book } from '../types';
import { ArrowRight, BookOpenCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/book/${book.id}`);
  };

  const toBanglaDigit = (str: string) => {
    return str.replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white rounded-2xl p-3 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_10px_25px_-5px_rgba(6,81,237,0.2)] border border-slate-100 hover:border-indigo-100 cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 mb-3">
        <img 
          src={book.thumbnailUrl} 
          alt={book.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute top-0 right-0 p-2">
          <span className="bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm border border-white/50">
            শ্রেণী {toBanglaDigit(book.classLevel)}
          </span>
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow px-1">
        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
          {book.subject}
        </span>
        <h3 className="text-base font-bold text-slate-800 leading-snug mb-2 line-clamp-2 group-hover:text-indigo-700 transition-colors">
          {book.title}
        </h3>
        
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors">
             <BookOpenCheck size={14} /> 
             পড়ুন
          </span>
          <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
             <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;