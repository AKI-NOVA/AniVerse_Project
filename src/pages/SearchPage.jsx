import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { jikanApi } from '../services/jikanApi';
import AnimeCard from '../components/AnimeCard';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || 'anime',
    genre: '',
    year: '',
    status: '',
    rating: '',
    order_by: 'popularity',
    sort: 'desc',
  });
  const [genres, setGenres] = useState([]);
  
  const { darkMode, addToSearchHistory } = useApp();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    // Fetch genres for filters
    const fetchGenres = async () => {
      try {
        const genreData = filters.type === 'anime' 
          ? await jikanApi.getAnimeGenres()
          : await jikanApi.getMangaGenres();
        setGenres(genreData.data || []);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
  }, [filters.type]);

  useEffect(() => {
    if (query) {
      handleSearch(true);
      addToSearchHistory(query);
    }
  }, [query, filters]);

  const handleSearch = async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      
      const searchFilters = {
        ...filters,
        ...(filters.genre && { genres: filters.genre }),
        ...(filters.year && { start_date: `${filters.year}-01-01`, end_date: `${filters.year}-12-31` }),
        ...(filters.status && { status: filters.status }),
        ...(filters.rating && { rating: filters.rating }),
        order_by: filters.order_by,
        sort: filters.sort,
      };

      let searchResults;
      if (filters.type === 'anime') {
        searchResults = await jikanApi.searchAnime(query, currentPage, searchFilters);
      } else if (filters.type === 'manga') {
        searchResults = await jikanApi.searchManga(query, currentPage, searchFilters);
      } else {
        searchResults = await jikanApi.searchCharacters(query, currentPage);
      }

      const newResults = searchResults.data || [];
      
      if (reset) {
        setResults(newResults);
        setPage(1);
      } else {
        setResults(prev => [...prev, ...newResults]);
      }
      
      setHasMore(searchResults.pagination?.has_next_page || false);
      setPage(prev => reset ? 2 : prev + 1);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      handleSearch(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Search Results
          </h1>
          {query && (
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Showing results for "{query}" in {filters.type}
            </p>
          )}
        </div>

        {/* Filters Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {/* Type Selector */}
            <div className="flex space-x-1">
              {['anime', 'manga', 'characters'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleFilterChange('type', type)}
                  className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                    filters.type === type
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : darkMode
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <SlidersHorizontal size={20} />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 mb-6 shadow-lg`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Genre Filter */}
              {filters.type !== 'characters' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Genre
                  </label>
                  <select
                    value={filters.genre}
                    onChange={(e) => handleFilterChange('genre', e.target.value)}
                    className={`w-full rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="">All Genres</option>
                    {genres.map((genre) => (
                      <option key={genre.mal_id} value={genre.mal_id}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Year Filter */}
              {filters.type !== 'characters' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Year
                  </label>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className={`w-full rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="">All Years</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Status Filter */}
              {filters.type === 'anime' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className={`w-full rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="">All Status</option>
                    <option value="airing">Airing</option>
                    <option value="complete">Completed</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
              )}

              {/* Sort By */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sort By
                </label>
                <select
                  value={filters.order_by}
                  onChange={(e) => handleFilterChange('order_by', e.target.value)}
                  className={`w-full rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="popularity">Popularity</option>
                  <option value="score">Score</option>
                  <option value="title">Title</option>
                  <option value="start_date">Release Date</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {loading && results.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
              {results.map((item) => (
                <AnimeCard 
                  key={item.mal_id} 
                  anime={item} 
                  type={filters.type}
                />
              ))}
            </div>

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
        ) : query ? (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Search size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p>Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Search size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Start searching</h3>
            <p>Enter a search term to find anime, manga, or characters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
