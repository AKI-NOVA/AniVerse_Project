import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, Calendar, Users, Play, Heart, Plus, 
  Clock, Tag, ExternalLink, ChevronRight, Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { jikanApi } from '../services/jikanApi';
import AnimeCard from '../components/AnimeCard';

const AnimePage = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { 
    darkMode, 
    openStatusModal,
    addToFavorites, 
    removeFromFavorites, 
    isInList, 
    isInFavorites 
  } = useApp();

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        setLoading(true);
        
        const [animeData, charactersData, recommendationsData] = await Promise.all([
          jikanApi.getAnimeById(id),
          jikanApi.getAnimeCharacters(id),
          jikanApi.getAnimeRecommendations(id),
        ]);

        setAnime(animeData.data);
        setCharacters(charactersData.data?.slice(0, 12) || []);
        setRecommendations(recommendationsData.data?.slice(0, 8) || []);
      } catch (error) {
        console.error('Error fetching anime data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnimeData();
    }
  }, [id]);

  const handleListButtonClick = () => {
    openStatusModal('anime', anime);
  };

  const handleAddToFavorites = () => {
    if (isInFavorites('anime', anime.mal_id)) {
      removeFromFavorites('anime', anime.mal_id);
    } else {
      addToFavorites('anime', anime);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Anime not found
          </h1>
          <Link to="/" className="text-blue-500 hover:text-blue-600">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  const inList = isInList('anime', anime.mal_id);
  const inFavorites = isInFavorites('anime', anime.mal_id);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${anime.images?.jpg?.large_image_url})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="relative h-full flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-6 md:space-y-0 md:space-x-8">
              {/* Poster */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-shrink-0"
              >
                <img
                  src={anime.images?.jpg?.large_image_url}
                  alt={anime.title}
                  className="w-48 md:w-64 h-64 md:h-80 object-cover rounded-xl shadow-2xl"
                />
              </motion.div>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1"
              >
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  {anime.title}
                </h1>
                
                {anime.title_english && anime.title_english !== anime.title && (
                  <h2 className="text-xl md:text-2xl text-white/80 mb-4">
                    {anime.title_english}
                  </h2>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mb-6 text-white/80">
                  {anime.score && (
                    <div className="flex items-center space-x-1">
                      <Star size={20} className="text-yellow-400 fill-current" />
                      <span className="text-lg font-semibold">{anime.score}</span>
                      <span className="text-sm">({anime.scored_by?.toLocaleString()} users)</span>
                    </div>
                  )}
                  
                  {anime.year && (
                    <div className="flex items-center space-x-1">
                      <Calendar size={18} />
                      <span>{anime.year}</span>
                    </div>
                  )}
                  
                  {anime.episodes && (
                    <div className="flex items-center space-x-1">
                      <Users size={18} />
                      <span>{anime.episodes} episodes</span>
                    </div>
                  )}
                  
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                    {anime.type}
                  </span>
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    anime.status === 'Finished Airing' 
                      ? 'bg-green-600 text-white'
                      : anime.status === 'Currently Airing'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-white'
                  }`}>
                    {anime.status}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  {anime.trailer?.youtube_id && (
                    <a
                      href={`https://www.youtube.com/watch?v=${anime.trailer.youtube_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors duration-200"
                    >
                      <Play size={20} className="fill-current" />
                      <span>Play Trailer</span>
                    </a>
                  )}

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
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 mb-8 border-b border-gray-200 dark:border-gray-700">
          {['overview', 'characters', 'recommendations'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-b-2 border-blue-500'
                  : darkMode
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab anime={anime} darkMode={darkMode} />
        )}
        
        {activeTab === 'characters' && (
          <CharactersTab characters={characters} darkMode={darkMode} />
        )}
        
        {activeTab === 'recommendations' && (
          <RecommendationsTab recommendations={recommendations} darkMode={darkMode} />
        )}
      </div>
    </div>
  );
};

const OverviewTab = ({ anime, darkMode }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Main Content */}
    <div className="lg:col-span-2 space-y-8">
      {/* Synopsis */}
      <div>
        <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Synopsis
        </h3>
        <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {anime.synopsis || 'No synopsis available.'}
        </p>
      </div>

      {/* Genres */}
      {anime.genres && anime.genres.length > 0 && (
        <div>
          <h3 className={`text-xl font-bold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Tag className="mr-2" size={20} />
            Genres
          </h3>
          <div className="flex flex-wrap gap-2">
            {anime.genres.map((genre) => (
              <span
                key={genre.mal_id}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                }`}
              >
                {genre.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* Sidebar */}
    <div className="space-y-6">
      {/* Stats Card */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Details
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Type', value: anime.type },
            { label: 'Episodes', value: anime.episodes || 'Unknown' },
            { label: 'Status', value: anime.status },
            { label: 'Aired', value: anime.aired?.string || 'Unknown' },
            { label: 'Duration', value: anime.duration || 'Unknown' },
            { label: 'Rating', value: anime.rating || 'Unknown' },
            { label: 'Source', value: anime.source || 'Unknown' },
            { label: 'Studio', value: anime.studios?.[0]?.name || 'Unknown' },
          ].map((item) => (
            <div key={item.label} className="flex justify-between">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {item.label}:
              </span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* External Links */}
      {anime.external && anime.external.length > 0 && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            External Links
          </h3>
          <div className="space-y-2">
            {anime.external.slice(0, 5).map((link, index) => (
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
);

const CharactersTab = ({ characters, darkMode }) => (
  <div>
    <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      Characters & Voice Actors
    </h3>
    
    {characters.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character) => (
          <Link
            key={character.character.mal_id}
            to={`/character/${character.character.mal_id}`}
            className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-xl p-4 shadow-lg transition-colors duration-200`}
          >
            <div className="flex items-start space-x-4">
              <img
                src={character.character.images?.jpg?.image_url}
                alt={character.character.name}
                className="w-16 h-20 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {character.character.name}
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {character.role}
                </p>
                {character.voice_actors?.[0] && (
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    CV: {character.voice_actors[0].person.name}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    ) : (
      <p className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        No character information available.
      </p>
    )}
  </div>
);

const RecommendationsTab = ({ recommendations, darkMode }) => (
  <div>
    <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      Recommended Anime
    </h3>
    
    {recommendations.length > 0 ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {recommendations.map((rec) => (
          <AnimeCard key={rec.entry.mal_id} anime={rec.entry} />
        ))}
      </div>
    ) : (
      <p className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        No recommendations available.
      </p>
    )}
  </div>
);

export default AnimePage;
