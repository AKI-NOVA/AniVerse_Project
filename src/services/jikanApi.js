import axios from 'axios';

const BASE_URL = 'https://api.jikan.moe/v4';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// A more robust queue system to handle API rate limiting.
const requestQueue = [];
let isProcessing = false;
const RATE_LIMIT_DELAY = 1100; // A safe delay of 1.1 seconds between requests.

const processQueue = async () => {
  if (requestQueue.length === 0 || isProcessing) {
    return;
  }

  isProcessing = true;
  const { config, resolve, reject } = requestQueue.shift();

  try {
    // Make the API call
    const response = await api(config);
    resolve(response);
  } catch (error) {
    // If the request fails, reject the promise
    reject(error);
  } finally {
    // After the request is done, wait for the delay, then process the next item.
    setTimeout(() => {
      isProcessing = false;
      processQueue();
    }, RATE_LIMIT_DELAY);
  }
};

const makeRequest = (config) => {
  // Return a new promise for each request
  return new Promise((resolve, reject) => {
    // Add the request details to the queue
    requestQueue.push({ config, resolve, reject });
    // Start processing the queue if it's not already running
    processQueue();
  });
};


export const jikanApi = {
  // Anime endpoints
  getTopAnime: async (page = 1, filter = 'airing') => {
    const response = await makeRequest({
      url: `/top/anime?page=${page}&filter=${filter}`,
    });
    return response.data;
  },

  getAnimeById: async (id) => {
    const response = await makeRequest({
      url: `/anime/${id}/full`,
    });
    return response.data;
  },

  getAnimeCharacters: async (id) => {
    const response = await makeRequest({
      url: `/anime/${id}/characters`,
    });
    return response.data;
  },

  getAnimeRecommendations: async (id) => {
    const response = await makeRequest({
      url: `/anime/${id}/recommendations`,
    });
    return response.data;
  },

  searchAnime: async (query, page = 1, filters = {}) => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      ...filters,
    });
    
    const response = await makeRequest({
      url: `/anime?${params.toString()}`,
    });
    return response.data;
  },

  // Manga endpoints
  getTopManga: async (page = 1, params = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      ...params,
    });
    const response = await makeRequest({
      url: `/top/manga?${queryParams.toString()}`,
    });
    return response.data;
  },

  getMangaById: async (id) => {
    const response = await makeRequest({
      url: `/manga/${id}/full`,
    });
    return response.data;
  },

  searchManga: async (query, page = 1, filters = {}) => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      ...filters,
    });
    
    const response = await makeRequest({
      url: `/manga?${params.toString()}`,
    });
    return response.data;
  },

  // Character endpoints
  getCharacterById: async (id) => {
    const response = await makeRequest({
      url: `/characters/${id}/full`,
    });
    return response.data;
  },

  searchCharacters: async (query, page = 1, filters = {}) => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      ...filters,
    });
    const response = await makeRequest({
      url: `/characters?${params.toString()}`,
    });
    return response.data;
  },

  // Genres
  getAnimeGenres: async () => {
    const response = await makeRequest({
      url: '/genres/anime',
    });
    return response.data;
  },

  getMangaGenres: async () => {
    const response = await makeRequest({
      url: '/genres/manga',
    });
    return response.data;
  },

  // Seasons
  getCurrentSeason: async () => {
    const response = await makeRequest({
      url: '/seasons/now',
    });
    return response.data;
  },

  getUpcomingSeason: async () => {
    const response = await makeRequest({
      url: '/seasons/upcoming',
    });
    return response.data;
  },
};
