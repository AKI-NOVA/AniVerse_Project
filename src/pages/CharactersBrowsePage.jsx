import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { jikanApi } from '../services/jikanApi';
import AnimeCard from '../components/AnimeCard';

const CharactersBrowsePage = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { darkMode } = useApp();

  useEffect(() => {
    fetchCharacters(true);
  }, []);

  const fetchCharacters = async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      
      // Note: Jikan API has a /top/characters endpoint
      const response = await jikanApi.searchCharacters('', currentPage, { order_by: 'favorites', sort: 'desc' });
      const newCharacters = response.data || [];
      
      if (reset) {
        setCharacters(newCharacters);
        setPage(1);
      } else {
        setCharacters(prev => [...prev, ...newCharacters]);
      }
      
      setHasMore(response.pagination?.has_next_page || false);
      setPage(prev => reset ? 2 : prev + 1);
    } catch (error) {
      console.error('Error fetching characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchCharacters(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Fan-Favorite Characters
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Discover the most beloved characters in anime and manga
          </p>
        </div>

        {loading && characters.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8"
            >
              {characters.map((char) => (
                <AnimeCard key={char.mal_id} anime={char} type="characters" />
              ))}
            </motion.div>

            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                    loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}

        {!loading && characters.length === 0 && (
          <div className={`text-center py-16 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No characters found</h3>
            <p>We couldn't fetch the characters. Please try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharactersBrowsePage;
