import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, Calendar, BookOpen, Plus, Heart, 
  Tag, ExternalLink, User, Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { jikanApi } from '../services/jikanApi';

const MangaPage = () => {
  const { id } = useParams();
  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { 
    darkMode, 
    openStatusModal,
    addToFavorites, 
    removeFromFavorites, 
    isInList, 
    isInFavorites 
  } = useApp();

  useEffect(() => {
    const fetchMangaData = async () => {
      try {
        setLoading(true);
        const mangaData = await jikanApi.getMangaById(id);
        setManga(mangaData.data);
      } catch (error) {
        console.error('Error fetching manga data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMangaData();
    }
  }, [id]);

  const handleListButtonClick = () => {
    openStatusModal('manga', manga);
  };

  const handleAddToFavorites = () => {
    if (isInFavorites('manga', manga.mal_id)) {
      removeFromFavorites('manga', manga.mal_id);
    } else {
      addToFavorites('manga', manga);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Manga not found
          </h1>
          <Link to="/manga" className="text-blue-500 hover:text-blue-600">
            Return to manga browse
          </Link>
        </div>
      </div>
    );
  }

  const inList = isInList('manga', manga.mal_id);
  const inFavorites = isInFavorites('manga', manga.mal_id);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-shrink-0"
            >
              <img
                src={manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url}
                alt={manga.title}
                className="w-64 h-80 object-cover rounded-xl shadow-2xl"
              />
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 text-white"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {manga.title}
              </h1>
              {manga.title_english && manga.title_english !== manga.title && (
                <h2 className="text-xl md:text-2xl text-white/80 mb-4">
                  {manga.title_english}
                </h2>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-white/90">
                {manga.score && (
                  <div className="flex items-center space-x-1">
                    <Star size={20} className="text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold">{manga.score}</span>
                    <span className="text-sm">({manga.scored_by?.toLocaleString()} users)</span>
                  </div>
                )}
                {manga.published?.from && (
                  <div className="flex items-center space-x-1">
                    <Calendar size={18} />
                    <span>{new Date(manga.published.from).getFullYear()}</span>
                  </div>
                )}
                {manga.chapters && (
                  <div className="flex items-center space-x-1">
                    <BookOpen size={18} />
                    <span>{manga.chapters} chapters</span>
                  </div>
                )}
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  {manga.type}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  manga.status === 'Finished' 
                    ? 'bg-green-600 text-white'
                    : manga.status === 'Publishing'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-white'
                }`}>
                  {manga.status}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleListButtonClick}
                  className={`${
                    inList
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors duration-200`}
                >
                  <Plus size={20} />
                  <span>{inList ? 'Update Status' : 'Add to List'}</span>
                </button>
                <button
                  onClick={handleAddToFavorites}
                  className={`${
                    inFavorites
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-white/20 hover:bg-white/30'
                  } backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors duration-200`}
                >
                  <Heart size={20} className={inFavorites ? 'fill-current' : ''} />
                  <span>{inFavorites ? 'Favorited' : 'Favorite'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Synopsis */}
            <div>
              <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Synopsis
              </h3>
              <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {manga.synopsis || 'No synopsis available.'}
              </p>
            </div>

            {/* Genres */}
            {manga.genres && manga.genres.length > 0 && (
              <div>
                <h3 className={`text-xl font-bold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Tag className="mr-2" size={20} />
                  Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {manga.genres.map((genre) => (
                    <span
                      key={genre.mal_id}
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Authors */}
            {manga.authors && manga.authors.length > 0 && (
              <div>
                <h3 className={`text-xl font-bold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <User className="mr-2" size={20} />
                  Authors
                </h3>
                <div className="space-y-2">
                  {manga.authors.map((author) => (
                    <div
                      key={author.mal_id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        darkMode ? 'bg-gray-800' : 'bg-gray-100'
                      }`}
                    >
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {author.name}
                      </span>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {author.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Details
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Type', value: manga.type },
                  { label: 'Chapters', value: manga.chapters || 'Unknown' },
                  { label: 'Volumes', value: manga.volumes || 'Unknown' },
                  { label: 'Status', value: manga.status },
                  { label: 'Published', value: manga.published?.string || 'Unknown' },
                  { label: 'Rank', value: manga.rank ? `#${manga.rank}` : 'N/A' },
                  { label: 'Popularity', value: manga.popularity ? `#${manga.popularity}` : 'N/A' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {item.label}:
                    </span>
                    <span className={`font-medium text-right ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* External Links */}
            {manga.external && manga.external.length > 0 && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  External Links
                </h3>
                <div className="space-y-2">
                  {manga.external.slice(0, 5).map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                        darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span>{link.name}</span>
                      <ExternalLink size={16} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaPage;
