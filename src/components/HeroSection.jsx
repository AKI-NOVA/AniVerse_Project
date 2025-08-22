import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Play, Star, Calendar, Users, Heart, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { jikanApi } from '../services/jikanApi';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const HeroSection = () => {
  const [featuredAnime, setFeaturedAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode, openStatusModal, isInList, addToFavorites, isInFavorites } = useApp();

  useEffect(() => {
    const fetchFeaturedAnime = async () => {
      try {
        const response = await jikanApi.getTopAnime(1, 'airing');
        setFeaturedAnime(response.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching featured anime:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedAnime();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        className="h-full"
      >
        {featuredAnime.map((anime) => (
          <SwiperSlide key={anime.mal_id}>
            <HeroSlide 
              anime={anime} 
              darkMode={darkMode} 
              openStatusModal={openStatusModal} 
              isInList={isInList} 
              addToFavorites={addToFavorites} 
              isInFavorites={isInFavorites} 
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Styles */}
      <style>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: white;
          background: rgba(0, 0, 0, 0.5);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          margin-top: -25px;
        }
        
        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 20px;
        }

        .swiper-pagination-bullet {
          background: white;
          opacity: 0.5;
          width: 12px;
          height: 12px;
        }

        .swiper-pagination-bullet-active {
          opacity: 1;
          background: #3b82f6;
        }
      `}</style>
    </div>
  );
};

const HeroSlide = ({ anime, darkMode, openStatusModal, isInList, addToFavorites, isInFavorites }) => {
  
  const handleAddToList = () => {
    openStatusModal('anime', anime);
  };

  const handleAddToFavorites = () => {
    if (isInFavorites('anime', anime.mal_id)) {
      // In a real app, you might want a confirmation before removing
    } else {
      addToFavorites('anime', anime);
    }
  };

  const inList = isInList('anime', anime.mal_id);
  const inFavorites = isInFavorites('anime', anime.mal_id);
  const listButtonText = inList ? 'Update Status' : 'Add to List';

  return (
    <div className="relative h-full">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
                {anime.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-white/80">
                {anime.score && (
                  <div className="flex items-center space-x-1">
                    <Star size={20} className="text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold">{anime.score}</span>
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
              </div>

              {/* Synopsis */}
              <p className="text-white/90 text-lg leading-relaxed mb-8 line-clamp-3">
                {anime.synopsis}
              </p>

              {/* Genres */}
              {anime.genres && anime.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {anime.genres.slice(0, 4).map((genre) => (
                    <span
                      key={genre.mal_id}
                      className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  to={`/anime/${anime.mal_id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors duration-200"
                >
                  <Play size={20} className="fill-current" />
                  <span>Watch Now</span>
                </Link>

                <button
                  onClick={handleAddToList}
                  className={`${
                    inList
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-white/20 hover:bg-white/30'
                  } backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors duration-200`}
                >
                  <Plus size={20} />
                  <span>{listButtonText}</span>
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
  );
};

export default HeroSection;
