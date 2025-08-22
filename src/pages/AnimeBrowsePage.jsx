import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Calendar, Star, TrendingUp, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { jikanApi } from '../services/jikanApi';
import AnimeCard from '../components/AnimeCard';

const AnimeBrowsePage = () => {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('airing');
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const { darkMode } = useApp();

  const filterOptions = [
    { value: 'airing', label: 'Currently Airing', icon: TrendingUp },
    { value: 'upcoming', label: 'Upcoming', icon: Clock },
    { value: 'bypopularity', label: 'Most Popular', icon: Star },
    { value: 'favorite', label: 'Most Favorited', icon: Star },
  ];

  useEffect(() => {
    // Fetch genres
    const fetchGenres = async () => {
      try {
        const genreData = await jikanApi.getAnimeGenres();
        setGenres(genreData.data || []);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    fetchAnime(true);
  }, [filter, selectedGenre]);

  const fetchAnime = async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      
      let animeData;
      if (selectedGenre) {
        animeData = await jikanApi.searchAnime('', currentPage, { 
          genres: selectedGenre,
          order_by: 'popularity',
          sort: 'desc'
        });
      } else {
        animeData = await jikanApi.getTopAnime(currentPage, filter);
      }

      const newAnime = animeData.data || [];
      
      if (reset) {
        setAnime(newAnime);
        setPage(1);
      } else {
        setAnime(prev => [...prev, ...newAnime]);
      }
      
      setHasMore(animeData.pagination?.has_next_page || false);
      setPage(prev => reset ? 2 : prev + 1);
    } catch (error) {
      console.error('Error fetching anime:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchAnime(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setSelectedGenre('');
  };

  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId);
    setFilter('');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Browse Anime
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Discover amazing anime from various genres and categories
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-6">
          {/* Category Filters */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleFilterChange(value)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === value && !selectedGenre
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Genre Filters */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Genres
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleGenreChange('')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !selectedGenre
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                All Genres
              </button>
              {genres.slice(0, 20).map((genre) => (
                <button
                  key={genre.mal_id}
                  onClick={() => handleGenreChange(genre.mal_id.toString())}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedGenre === genre.mal_id.toString()
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading && anime.length === 0 ? (
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
              {anime.map((animeItem) => (
                <AnimeCard key={animeItem.mal_id} anime={animeItem} />
              ))}
            </motion.div>

            {/* Load More */}
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

        {/* Empty State */}
        {!loading && anime.length === 0 && (
          <div className={`text-center py-16 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Filter size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No anime found</h3>
            <p>Try adjusting your filters to find more anime</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimeBrowsePage;
