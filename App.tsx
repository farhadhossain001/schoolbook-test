import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import BookList from './pages/BookList';
import BookDetails from './pages/BookDetails';
import PdfViewer from './pages/PdfViewer';
import SearchResults from './pages/SearchResults';

// Helper to conditionally render header
const Layout: React.FC = () => {
  const location = useLocation();
  // Don't show header on read page to maximize space
  const isReader = location.pathname.startsWith('/read/');

  return (
    <>
      {!isReader && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/class/:classId" element={<BookList />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/book/:bookId" element={<BookDetails />} />
        <Route path="/read/:bookId" element={<PdfViewer />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Layout />
    </Router>
  );
};

export default App;