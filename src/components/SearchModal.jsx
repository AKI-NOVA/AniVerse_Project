import React, { useState, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { jikanApi } from '../services/jikanApi';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ anime: [], manga: [], characters: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('anime');
  const { searchHistory, addToSearchHistory, darkMode } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ anime: [], manga: [], characters: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          const [animeResults, mangaResults, characterResults] = await Promise.all([
            jikanApi.searchAnime(query, 1, { limit: 5 }),
            jikanApi.searchManga(query, 1, { limit: 5 }),
            jikanApi.searchCharacters(query, 1),
          ]);

          setResults({
            anime: animeResults.data || [],
            manga: mangaResults.data || [],
            characters: characterResults.data?.slice(0, 5) || [],
          });
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults({ anime: [], manga: [], characters: [] });
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleSearch = (searchQuery) => {
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery.trim());
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}&type=${activeTab}`);
      onClose();
    }
  };

  const handleResultClick = (type, id) => {
    if (type === 'anime') navigate(`/anime/${id}`);
    else if (type === 'manga') navigate(`/manga/${id}`);
    else if (type === 'characters') navigate(`/character/${id}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className={`inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl rounded-2xl`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Search Anime, Manga & Characters
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'}`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-6">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
                placeholder="Search for anime, manga, or characters..."
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                autoFocus
              />
            </div>

            {/* Tabs */}
            <div className="flex mt-4 space-x-1">
              {['anime', 'manga', 'characters'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : darkMode
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : query.length > 2 ? (
              <div className="space-y-2">
                {results[activeTab]?.map((item) => (
                  <div
                    key={item.mal_id}
                    onClick={() => handleResultClick(activeTab, item.mal_id)}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <img
                      src={item.images?.jpg?.small_image_url || item.images?.jpg?.image_url}
                      alt={item.title || item.name}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.title || item.name}
                      </p>
                      <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {activeTab === 'anime' && `${item.type} • ${item.year || 'TBA'}`}
                        {activeTab === 'manga' && `${item.type} • ${item.volumes || '?'} volumes`}
                        {activeTab === 'characters' && item.about?.slice(0, 100)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {results[activeTab]?.length === 0 && (
                  <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No {activeTab} found for "{query}"
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search History */}
                {searchHistory.length > 0 && (
                  <div>
                    <h4 className={`text-sm font-medium mb-2 flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Clock size={16} className="mr-1" />
                      Recent Searches
                    </h4>
                    <div className="space-y-1">
                      {searchHistory.slice(0, 5).map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(item)}
                          className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                            darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <h4 className={`text-sm font-medium mb-2 flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <TrendingUp size={16} className="mr-1" />
                    Popular Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['Naruto', 'One Piece', 'Attack on Titan', 'Demon Slayer', 'Jujutsu Kaisen'].map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSearch(term)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
