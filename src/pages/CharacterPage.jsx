import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Plus, BookOpen, Tv, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { jikanApi } from '../services/jikanApi';

const CharacterPage = () => {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  
  const { 
    darkMode, 
    addToList, 
    removeFromList, 
    addToFavorites, 
    removeFromFavorites, 
    isInList, 
    isInFavorites 
  } = useApp();

  useEffect(() => {
    const fetchCharacterData = async () => {
      try {
        setLoading(true);
        setError(null);
        const characterData = await jikanApi.getCharacterById(id);
        setCharacter(characterData.data);
      } catch (err) {
        console.error('Error fetching character data:', err);
        setError('Failed to load character data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCharacterData();
    }
  }, [id]);

  const handleAddToList = () => {
    if (isInList('characters', character.mal_id)) {
      removeFromList('characters', character.mal_id);
    } else {
      addToList('characters', character);
    }
  };

  const handleAddToFavorites = () => {
    if (isInFavorites('characters', character.mal_id)) {
      removeFromFavorites('characters', character.mal_id);
    } else {
      addToFavorites('characters', character);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-red-600'}`}>
            {error}
          </h1>
          <Link to="/characters" className="text-blue-500 hover:text-blue-600">
            Return to characters browse
          </Link>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Character not found
          </h1>
          <Link to="/characters" className="text-blue-500 hover:text-blue-600">
            Return to characters browse
          </Link>
        </div>
      </div>
    );
  }

  const inList = isInList('characters', character.mal_id);
  const inFavorites = isInFavorites('characters', character.mal_id);
  const biography = character.about || 'No biography available.';
  const isLongBio = biography.length > 600;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
              <img
                src={character.images?.jpg?.image_url}
                alt={character.name}
                className="w-full object-cover rounded-xl shadow-2xl"
              />
            </motion.div>
            
            <div className="space-y-3">
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {character.name}
              </h1>
              {character.name_kanji && (
                <h2 className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {character.name_kanji}
                </h2>
              )}
              {character.nicknames.length > 0 && (
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Nicknames: {character.nicknames.join(', ')}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleAddToList}
                className={`${
                  inList
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors duration-200`}
              >
                <Plus size={20} />
                <span>{inList ? 'In My List' : 'Add to List'}</span>
              </button>
              <button
                onClick={handleAddToFavorites}
                className={`${
                  inFavorites
                    ? 'bg-red-600 hover:bg-red-700'
                    : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                } ${darkMode ? 'text-white' : 'text-gray-800'} px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors duration-200`}
              >
                <Heart size={20} className={inFavorites ? 'fill-current' : ''} />
                <span>{inFavorites ? 'Favorited' : 'Favorite'}</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-12">
            {/* Biography */}
            <section>
              <h3 className={`text-2xl font-bold mb-4 border-b pb-2 ${darkMode ? 'text-white border-gray-700' : 'text-gray-900 border-gray-200'}`}>
                Biography
              </h3>
              <div className={`text-lg leading-relaxed whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {isLongBio && !isBioExpanded ? `${biography.substring(0, 600)}...` : biography}
              </div>
              {isLongBio && (
                <button 
                  onClick={() => setIsBioExpanded(!isBioExpanded)} 
                  className="flex items-center space-x-1 mt-4 text-blue-500 hover:text-blue-600 font-semibold"
                >
                  <span>{isBioExpanded ? 'Read Less' : 'Read More'}</span>
                  {isBioExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              )}
            </section>

            {/* Anime Appearances */}
            {character.anime.length > 0 && (
              <section>
                <h3 className={`text-2xl font-bold mb-6 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Tv className="mr-3 text-blue-500" size={24} />
                  Anime Appearances
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {character.anime.map(({ anime, role }) => (
                    <Link to={`/anime/${anime.mal_id}`} key={anime.mal_id} className="group text-center">
                      <div className="relative">
                        <img src={anime.images.jpg.large_image_url || anime.images.jpg.image_url} alt={anime.title} className="rounded-lg shadow-md w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center p-2">
                           <p className={`text-xs text-white`}>{role}</p>
                        </div>
                      </div>
                      <h4 className={`mt-2 font-semibold text-sm truncate ${darkMode ? 'text-white group-hover:text-blue-400' : 'text-gray-800 group-hover:text-blue-600'}`}>{anime.title}</h4>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Manga Appearances */}
            {character.manga.length > 0 && (
              <section>
                <h3 className={`text-2xl font-bold mb-6 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <BookOpen className="mr-3 text-purple-500" size={24} />
                  Manga Appearances
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {character.manga.map(({ manga, role }) => (
                    <Link to={`/manga/${manga.mal_id}`} key={manga.mal_id} className="group text-center">
                      <div className="relative">
                        <img src={manga.images.jpg.large_image_url || manga.images.jpg.image_url} alt={manga.title} className="rounded-lg shadow-md w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
                         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center p-2">
                           <p className={`text-xs text-white`}>{role}</p>
                        </div>
                      </div>
                      <h4 className={`mt-2 font-semibold text-sm truncate ${darkMode ? 'text-white group-hover:text-purple-400' : 'text-gray-800 group-hover:text-purple-600'}`}>{manga.title}</h4>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Voice Actors */}
            {character.voices.length > 0 && (
              <section>
                <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Voice Actors
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {character.voices.map(({ person, language }) => (
                    <div key={`${person.mal_id}-${language}`} className={`flex items-center space-x-4 p-3 rounded-lg transition-colors duration-200 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      <img src={person.images.jpg.image_url} alt={person.name} className="w-16 h-16 rounded-full object-cover shadow-sm" />
                      <div>
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{person.name}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{language}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CharacterPage;
