import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Star, Calendar } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import AnimeCard from '../components/AnimeCard';
import { useApp } from '../context/AppContext';
import { jikanApi } from '../services/jikanApi';

const HomePage = () => {
  const [sections, setSections] = useState({
    trending: [],
    popular: [],
    upcoming: [],
    currentSeason: [],
  });
  const [loading, setLoading] = useState(true);
  const { darkMode } = useApp();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        const [trendingData, popularData, upcomingData, currentSeasonData] = await Promise.all([
          jikanApi.getTopAnime(1, 'airing'),
          jikanApi.getTopAnime(1, 'bypopularity'),
          jikanApi.getUpcomingSeason(),
          jikanApi.getCurrentSeason(),
        ]);

        setSections({
          trending: trendingData.data?.slice(0, 8) || [],
          popular: popularData.data?.slice(0, 8) || [],
          upcoming: upcomingData.data?.slice(0, 8) || [],
          currentSeason: currentSeasonData.data?.slice(0, 8) || [],
        });
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const sectionConfigs = [
    {
      key: 'trending',
      title: 'Trending Now',
      icon: TrendingUp,
      description: 'Currently airing anime that everyone is talking about',
    },
    {
      key: 'popular',
      title: 'Most Popular',
      icon: Star,
      description: 'Top-rated anime loved by the community',
    },
    {
      key: 'currentSeason',
      title: 'This Season',
      icon: Calendar,
      description: 'New releases for the current season',
    },
    {
      key: 'upcoming',
      title: 'Coming Soon',
      icon: Clock,
      description: 'Upcoming anime to look forward to',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <HeroSection />

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {sectionConfigs.map((config, index) => (
          <AnimeSection
            key={config.key}
            title={config.title}
            icon={config.icon}
            description={config.description}
            anime={sections[config.key]}
            delay={index * 0.2}
            darkMode={darkMode}
          />
        ))}
      </div>
    </div>
  );
};

const AnimeSection = ({ title, icon: Icon, description, anime, delay, darkMode }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="mb-16"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Icon className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={28} />
            <h2 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h2>
          </div>
          <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
        </div>
      </div>

      {/* Anime Grid */}
      {anime.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6">
          {anime.map((animeItem) => (
            <AnimeCard key={animeItem.mal_id} anime={animeItem} />
          ))}
        </div>
      ) : (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>No anime found for this section.</p>
        </div>
      )}
    </motion.section>
  );
};

export default HomePage;
