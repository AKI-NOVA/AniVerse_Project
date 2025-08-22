import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, BookOpen, Users, Grid3X3, List } from 'lucide-react';
import { useApp } from '../context/AppContext';
import MyListItemCard from '../components/MyListItemCard';

const MyListPage = () => {
  const [activeTab, setActiveTab] = useState('anime');
  const [viewMode, setViewMode] = useState('grid');
  const [listType, setListType] = useState('mylist');
  
  const { myList, favorites, darkMode } = useApp();

  // Define status categories for My List
  const listStatuses = {
    anime: ['Watching', 'Completed', 'On Hold', 'Dropped', 'Plan to Watch'],
    manga: ['Reading', 'Completed', 'On Hold', 'Dropped', 'Plan to Read'],
  };
  const [activeStatus, setActiveStatus] = useState(listStatuses.anime[0]);

  const contentTabs = [
    { key: 'anime', label: 'Anime', icon: BookOpen, count: myList.anime.length },
    { key: 'manga', label: 'Manga', icon: BookOpen, count: myList.manga.length },
    { key: 'characters', label: 'Characters', icon: Users, count: myList.characters.length },
  ];

  const favoritesTabs = [
    { key: 'anime', label: 'Anime', icon: BookOpen, count: favorites.anime.length },
    { key: 'manga', label: 'Manga', icon: BookOpen, count: favorites.manga.length },
    { key: 'characters', label: 'Characters', icon: Users, count: favorites.characters.length },
  ];

  const handleContentTabClick = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === 'anime') setActiveStatus('Watching');
    if (tabKey === 'manga') setActiveStatus('Reading');
  };

  const currentList = listType === 'mylist' ? myList : favorites;
  const currentContentTabs = listType === 'mylist' ? contentTabs : favoritesTabs;
  
  const filteredList = listType === 'mylist' && (activeTab === 'anime' || activeTab === 'manga')
    ? currentList[activeTab]?.filter(item => item.trackingData?.status === activeStatus) || []
    : currentList[activeTab] || [];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            My Collection
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage your saved anime, manga, and favorite characters
          </p>
        </div>

        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setListType('mylist')}
            className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
              listType === 'mylist'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : darkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            My List
          </button>
          <button
            onClick={() => setListType('favorites')}
            className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors flex items-center space-x-2 ${
              listType === 'favorites'
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                : darkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Heart size={16} />
            <span>Favorites</span>
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
            {currentContentTabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => handleContentTabClick(key)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors rounded-t-lg ${
                  activeTab === key
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
          <div className="flex space-x-1">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-500'}`}><Grid3X3 size={20} /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-500'}`}><List size={20} /></button>
          </div>
        </div>

        {listType === 'mylist' && (activeTab === 'anime' || activeTab === 'manga') && (
          <div className="flex flex-wrap gap-2 mb-8">
            {listStatuses[activeTab].map(status => (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`px-4 py-2 text-xs font-medium rounded-full transition-colors ${
                  activeStatus === status
                    ? 'bg-blue-600 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        )}

        <div className="min-h-96">
          {filteredList.length > 0 ? (
            <motion.div
              key={`${listType}-${activeTab}-${activeStatus}-${viewMode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredList.map((item) => (
                <MyListItemCard key={item.mal_id} item={item} type={activeTab} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`${listType}-${activeTab}-empty`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-16 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              <div className="mb-4">
                <BookOpen size={64} className="mx-auto opacity-50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                This list is empty
              </h3>
              <p>
                Add some {activeTab} to get started!
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyListPage;
