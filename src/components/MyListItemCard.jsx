import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Minus, MoreVertical, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProgressBar from './ProgressBar';

const MyListItemCard = ({ item, type }) => {
  const { darkMode, updateItemStatus, removeFromList, openStatusModal } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // FIX: Provide a default empty object for trackingData to prevent destructuring error.
  // This handles items (like characters) that are added to the list without tracking data.
  const { status, progress } = item.trackingData || {};

  const total = type === 'anime' ? item.episodes : item.chapters;
  const watchStatus = type === 'anime' ? 'Watching' : 'Reading';

  const handleProgressChange = (amount) => {
    if (!total) return; // Don't allow progress change if total is unknown
    const newProgress = Math.max(0, Math.min(total, progress + amount));
    
    if (newProgress >= total) {
      updateItemStatus(type, item.mal_id, { progress: total, status: 'Completed' });
    } else {
      updateItemStatus(type, item.mal_id, { progress: newProgress });
    }
  };

  const handleRemove = () => {
    removeFromList(type, item.mal_id);
    setIsMenuOpen(false);
  };

  const handleEdit = () => {
    // Characters don't have status, so this button shouldn't be shown for them.
    if (type === 'anime' || type === 'manga') {
      openStatusModal(type, item);
    }
    setIsMenuOpen(false);
  };

  const statusConfig = {
    'Watching': { color: 'blue', label: 'Watching' },
    'Reading': { color: 'blue', label: 'Reading' },
    'Completed': { color: 'green', label: 'Completed' },
    'On Hold': { color: 'yellow', label: 'On Hold' },
    'Dropped': { color: 'red', label: 'Dropped' },
    'Plan to Watch': { color: 'gray', label: 'Plan to Watch' },
    'Plan to Read': { color: 'gray', label: 'Plan to Read' },
  };

  // If status is undefined (for characters), this will be null.
  const currentStatusConfig = status ? (statusConfig[status] || statusConfig['Plan to Watch']) : null;
  const statusColor = currentStatusConfig ? {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500',
  }[currentStatusConfig.color] : 'bg-gray-500';

  // Only show the progress tracker if the status is "Watching" or "Reading" and there's a total count.
  const showProgressSection = status && (status === watchStatus) && total > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative group ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg transition-all duration-300 overflow-hidden p-4 flex flex-col space-y-3`}
    >
      <div className="flex items-start space-x-4">
        <Link to={`/${type}/${item.mal_id}`}>
          <img
            src={item.images?.jpg?.image_url}
            alt={item.title || item.name}
            className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/${type}/${item.mal_id}`} className="hover:underline">
            <h3 className={`font-semibold text-base mb-1 line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {item.title || item.name}
            </h3>
          </Link>
          {/* Only show status for anime/manga */}
          {currentStatusConfig && (
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {currentStatusConfig.label}
              </span>
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <MoreVertical size={20} />
          </button>
          {isMenuOpen && (
            <div className={`absolute right-0 mt-2 w-48 ${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-md shadow-lg z-10`}>
              <div className="py-1">
                {/* Only show edit for anime/manga */}
                {(type === 'anime' || type === 'manga') && (
                  <button onClick={handleEdit} className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                    Edit Status
                  </button>
                )}
                {/* Divider only if edit is shown */}
                {(type === 'anime' || type === 'manga') && <div className="border-t my-1 border-gray-200 dark:border-gray-600"></div>}
                <button onClick={handleRemove} className={`block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}>
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showProgressSection && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {progress} / {total}
            </span>
          </div>
          <ProgressBar value={progress} max={total} colorClass={statusColor} />
          <div className="flex items-center justify-end space-x-2">
            <button onClick={() => handleProgressChange(-1)} disabled={progress <= 0} className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 disabled:opacity-50">
              <Minus size={16} />
            </button>
            <button onClick={() => handleProgressChange(1)} disabled={progress >= total} className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 disabled:opacity-50">
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MyListItemCard;
