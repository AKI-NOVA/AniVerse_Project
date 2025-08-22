import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AnimePage from './pages/AnimePage';
import MangaPage from './pages/MangaPage';
import CharacterPage from './pages/CharacterPage';
import SearchPage from './pages/SearchPage';
import MyListPage from './pages/MyListPage';
import AnimeBrowsePage from './pages/AnimeBrowsePage';
import MangaBrowsePage from './pages/MangaBrowsePage';
import CharactersBrowsePage from './pages/CharactersBrowsePage';
import StatusUpdateModal from './components/StatusUpdateModal';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/anime" element={<AnimeBrowsePage />} />
            <Route path="/anime/:id" element={<AnimePage />} />
            <Route path="/manga" element={<MangaBrowsePage />} />
            <Route path="/manga/:id" element={<MangaPage />} />
            <Route path="/characters" element={<CharactersBrowsePage />} />
            <Route path="/character/:id" element={<CharacterPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/my-list" element={<MyListPage />} />
          </Routes>
          <StatusUpdateModal />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
