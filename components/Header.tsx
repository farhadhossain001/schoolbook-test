import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Library, X, Menu } from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <header 
        className={`sticky top-0 z-40 transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-white/90 backdrop-blur-md border-slate-200 shadow-sm' 
            : 'bg-white border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform duration-300">
                <Library size={24} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-800 leading-none">
                  স্কুল<span className="text-indigo-600">বুকস</span>
                </span>
                <span className="text-[10px] sm:text-xs font-medium text-slate-500 tracking-wide">
                  ডিজিটাল লাইব্রেরি
                </span>
              </div>
            </Link>

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-md mx-12">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="বই, বিষয় বা শ্রেণী খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-full focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm font-medium placeholder:text-slate-400"
                />
                <Search className="absolute left-4 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
              >
                {isSearchOpen ? <X size={24} /> : <Search size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      <div className={`md:hidden fixed inset-x-0 top-16 z-30 bg-white border-b border-slate-100 p-4 transition-all duration-300 transform origin-top ${isSearchOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
        <form onSubmit={handleSearch} className="relative">
          <input
            autoFocus={isSearchOpen}
            type="text"
            placeholder="বই অনুসন্ধান করুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-800"
          />
           <Search className="absolute left-3.5 top-3.5 text-slate-400" size={20} />
        </form>
      </div>
    </>
  );
};

export default Header;