import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

const initialState = {
  myList: {
    anime: [],
    manga: [],
    characters: [],
  },
  favorites: {
    anime: [],
    manga: [],
    characters: [],
  },
  searchHistory: [],
  darkMode: false,
  loading: false,
  error: null,
  statusModal: {
    isOpen: false,
    item: null,
    type: null,
  },
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'UPSERT_LIST_ITEM': {
      const { type, item, trackingData } = action.payload;
      const list = state.myList[type];
      const existingItemIndex = list.findIndex(i => i.mal_id === item.mal_id);

      let newList;
      if (existingItemIndex > -1) {
        // Update existing item
        newList = list.map((listItem, index) => 
          index === existingItemIndex 
            ? { ...listItem, trackingData: { ...listItem.trackingData, ...trackingData } }
            : listItem
        );
      } else {
        // Add new item
        const newItem = { ...item, trackingData };
        newList = [...list, newItem];
      }

      return {
        ...state,
        myList: {
          ...state.myList,
          [type]: newList,
        },
      };
    }
    
    case 'ADD_TO_LIST': { // Kept for character additions
      const { type, item } = action.payload;
      return {
        ...state,
        myList: {
          ...state.myList,
          [type]: [...state.myList[type], item],
        },
      };
    }

    case 'REMOVE_FROM_LIST':
      return {
        ...state,
        myList: {
          ...state.myList,
          [action.payload.type]: state.myList[action.payload.type].filter(
            item => item.mal_id !== action.payload.id
          ),
        },
      };

    case 'UPDATE_ITEM_STATUS': {
      const { type, id, status, progress } = action.payload;
      return {
        ...state,
        myList: {
          ...state.myList,
          [type]: state.myList[type].map(item =>
            item.mal_id === id
              ? {
                  ...item,
                  trackingData: {
                    ...item.trackingData,
                    status: status !== undefined ? status : item.trackingData.status,
                    progress: progress !== undefined ? progress : item.trackingData.progress,
                  },
                }
              : item
          ),
        },
      };
    }
    
    case 'ADD_TO_FAVORITES':
      return {
        ...state,
        favorites: {
          ...state.favorites,
          [action.payload.type]: [...state.favorites[action.payload.type], action.payload.item],
        },
      };
    
    case 'REMOVE_FROM_FAVORITES':
      return {
        ...state,
        favorites: {
          ...state.favorites,
          [action.payload.type]: state.favorites[action.payload.type].filter(
            item => item.mal_id !== action.payload.id
          ),
        },
      };
    
    case 'ADD_SEARCH_HISTORY':
      return {
        ...state,
        searchHistory: [action.payload, ...state.searchHistory.slice(0, 9)],
      };
    
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    
    case 'LOAD_LOCAL_DATA':
      return { ...state, ...action.payload };

    case 'OPEN_STATUS_MODAL':
      return {
        ...state,
        statusModal: {
          isOpen: true,
          item: action.payload.item,
          type: action.payload.type,
        },
      };

    case 'CLOSE_STATUS_MODAL':
      return {
        ...state,
        statusModal: {
          isOpen: false,
          item: null,
          type: null,
        },
      };
    
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedData = localStorage.getItem('animeAppData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_LOCAL_DATA', payload: parsedData });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  useEffect(() => {
    const dataToSave = {
      myList: state.myList,
      favorites: state.favorites,
      searchHistory: state.searchHistory,
      darkMode: state.darkMode,
    };
    localStorage.setItem('animeAppData', JSON.stringify(dataToSave));
  }, [state.myList, state.favorites, state.searchHistory, state.darkMode]);

  const value = {
    ...state,
    dispatch,
    
    addToList: (type, item) => {
      dispatch({ type: 'ADD_TO_LIST', payload: { type, item } });
    },
    
    removeFromList: (type, id) => {
      dispatch({ type: 'REMOVE_FROM_LIST', payload: { type, id } });
    },

    upsertListItem: (type, item, trackingData) => {
      dispatch({ type: 'UPSERT_LIST_ITEM', payload: { type, item, trackingData } });
    },

    updateItemStatus: (type, id, updates) => {
      dispatch({ type: 'UPDATE_ITEM_STATUS', payload: { type, id, ...updates } });
    },
    
    addToFavorites: (type, item) => {
      dispatch({ type: 'ADD_TO_FAVORITES', payload: { type, item } });
    },
    
    removeFromFavorites: (type, id) => {
      dispatch({ type: 'REMOVE_FROM_FAVORITES', payload: { type, id } });
    },
    
    isInList: (type, id) => {
      if (!state.myList[type]) return false;
      return state.myList[type].some(item => item.mal_id === id);
    },

    getItemFromList: (type, id) => {
      if (!state.myList[type]) return undefined;
      return state.myList[type].find(item => item.mal_id === id);
    },
    
    isInFavorites: (type, id) => {
      if (!state.favorites[type]) return false;
      return state.favorites[type].some(item => item.mal_id === id);
    },
    
    addToSearchHistory: (query) => {
      if (query && !state.searchHistory.includes(query)) {
        dispatch({ type: 'ADD_SEARCH_HISTORY', payload: query });
      }
    },

    openStatusModal: (type, item) => {
      dispatch({ type: 'OPEN_STATUS_MODAL', payload: { type, item } });
    },

    closeStatusModal: () => {
      dispatch({ type: 'CLOSE_STATUS_MODAL' });
    },
    
    setLoading: (loading) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },
    
    setError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },
    
    clearError: () => {
      dispatch({ type: 'CLEAR_ERROR' });
    },
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
