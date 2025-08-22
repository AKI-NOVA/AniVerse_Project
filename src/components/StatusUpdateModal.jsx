import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';

const StatusUpdateModal = () => {
  const {
    darkMode,
    statusModal: { isOpen, item, type },
    closeStatusModal,
    upsertListItem,
    getItemFromList,
  } = useApp();

  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);

  const animeStatuses = ['Watching', 'Completed', 'On Hold', 'Dropped', 'Plan to Watch'];
  const mangaStatuses = ['Reading', 'Completed', 'On Hold', 'Dropped', 'Plan to Read'];
  const currentStatuses = type === 'anime' ? animeStatuses : mangaStatuses;
  const defaultStatus = type === 'anime' ? 'Plan to Watch' : 'Plan to Read';
  const watchStatus = type === 'anime' ? 'Watching' : 'Reading';

  useEffect(() => {
    if (isOpen && item) {
      const existingItem = getItemFromList(type, item.mal_id);
      if (existingItem && existingItem.trackingData) {
        setStatus(existingItem.trackingData.status);
        setProgress(existingItem.trackingData.progress);
      } else {
        setStatus(defaultStatus);
        setProgress(0);
      }
    }
  }, [isOpen, item, type]);

  const handleSave = () => {
    const total = type === 'anime' ? item.episodes : item.chapters;
    let finalProgress = progress;
    let finalStatus = status;

    if (finalStatus === 'Completed') {
      finalProgress = total || 0;
    } else if (finalStatus === 'Plan to Watch' || finalStatus === 'Plan to Read' || finalStatus === 'Dropped') {
      finalProgress = 0;
    } else if (finalStatus === watchStatus) {
      const cappedProgress = total ? Math.min(progress, total) : progress;
      if (total && cappedProgress >= total) {
        finalStatus = 'Completed';
        finalProgress = total;
      } else {
        finalProgress = cappedProgress;
      }
    } else if (finalStatus === 'On Hold') {
      finalProgress = total ? Math.min(progress, total) : progress;
    }

    upsertListItem(type, item, { status: finalStatus, progress: finalProgress });
    closeStatusModal();
  };

  const totalEpisodes = type === 'anime' ? item?.episodes : item?.chapters;
  const showProgressControls = status === watchStatus && totalEpisodes > 0;

  const handleProgressInputChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setProgress(0);
      return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= totalEpisodes) {
      setProgress(numValue);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60"
            onClick={closeStatusModal}
          />
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`relative w-full max-w-lg p-6 rounded-2xl shadow-xl ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Update Status</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.title}
                </p>
              </div>
              <button
                onClick={closeStatusModal}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {currentStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        status === s
                          ? 'bg-blue-600 text-white font-semibold'
                          : darkMode
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {showProgressControls && (
                <div>
                  <label htmlFor="progress" className="block text-sm font-medium mb-2">
                    {type === 'anime' ? 'Episodes Watched' : 'Chapters Read'}
                  </label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setProgress(p => Math.max(0, p - 1))} disabled={progress <= 0} className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} disabled:opacity-50`}>
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        value={progress}
                        onChange={handleProgressInputChange}
                        className={`w-20 text-center py-1 rounded-md border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}
                      />
                      <button onClick={() => setProgress(p => Math.min(totalEpisodes, p + 1))} disabled={progress >= totalEpisodes} className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} disabled:opacity-50`}>
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="font-semibold">{progress} / {totalEpisodes}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={closeStatusModal}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
              >
                <Save size={18} />
                <span>Save</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StatusUpdateModal;
