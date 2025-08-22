import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, Play, Heart, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const AnimeCard = ({ anime, type = 'anime' }) => {
  const { 
    addToList, removeFromList, 
    addToFavorites, removeFromFavorites, 
    isInList, isInFavorites, 
    openStatusModal, darkMode 
  } = useApp();

  const handleListButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'anime' || type === 'manga') {
      openStatusModal(type, anime);
    } else { // Handle characters
      if (isInList(type, anime.mal_id)) {
        removeFromList(type, anime.mal_id);
      } else {
        addToList(type, anime);
      }
    }
  };

  const handleAddToFavorites = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInFavorites(type, anime.mal_id)) {
      removeFromFavorites(type, anime.mal_id);
    } else {
      addToFavorites(type, anime);
    }
  };

  const inList = isInList(type, anime.mal_id);
  const inFavorites = isInFavorites(type, anime.mal_id);
  const listButtonText = type === 'characters' 
    ? (inList ? 'In List' : 'Add to List')
    : (inList ? 'Update Status' : 'Add to List');

  // FIX: Use the correct singular path for character links.
  const linkPath = type === 'characters' ? 'character' : type;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`group relative ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}
    >
      <Link to={`/${linkPath}/${anime.mal_id}`}>
        <div className="relative">
          <img
            src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
            alt={anime.title || anime.name}
            className="w-full h-64 sm:h-72 object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {anime.score && (
            <div className="absolute top-2 left-2 flex items-center space-x-1 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
              <Star size={12} className="text-yellow-400 fill-current" />
              <span>{anime.score}</span>
            </div>
          )}

          <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleAddToFavorites}
              title={inFavorites ? 'Remove from Favorites' : 'Add to Favorites'}
              className={`p-2 rounded-full ${
                inFavorites ? 'bg-red-500' : 'bg-black/70'
              } text-white hover:scale-110 transition-transform`}
            >
              <Heart size={16} className={inFavorites ? 'fill-current' : ''} />
            </button>
            
            <button
              onClick={handleListButtonClick}
              title={listButtonText}
              className={`p-2 rounded-full ${
                inList ? 'bg-blue-500' : 'bg-black/70'
              } text-white hover:scale-110 transition-transform`}
            >
              <Plus size={16} />
            </button>
          </div>

          {type === 'anime' && anime.trailer?.youtube_id && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Play size={24} className="text-white fill-current" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className={`font-semibold text-sm sm:text-base mb-2 line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {anime.title || anime.name}
          </h3>
          
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs ${
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}>
                {anime.type}
              </span>
              
              {anime.status && (
                <span className={`text-xs ${
                  anime.status === 'Airing' || anime.status === 'Publishing'
                    ? 'text-green-500'
                    : anime.status === 'Completed'
                    ? 'text-blue-500'
                    : 'text-gray-500'
                }`}>
                  {anime.status}
                </span>
              )}
            </div>

            <div className={`flex items-center justify-between text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {anime.year && (
                <div className="flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>{anime.year}</span>
                </div>
              )}
              
              {type === 'anime' ? (
                anime.episodes && (
                  <span>{anime.episodes} episodes</span>
                )
              ) : (
                anime.chapters && (
                  <span>{anime.chapters} chapters</span>
                )
              )}
            </div>

            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {anime.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre.mal_id}
                    className={`px-2 py-1 rounded text-xs ${
                      darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {genre.name}
                  </span>
                ))}
                {anime.genres.length > 2 && (
                  <span className={`px-2 py-1 rounded text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    +{anime.genres.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default AnimeCard;
