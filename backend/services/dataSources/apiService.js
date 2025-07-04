const axios = require('axios');

async function fetchData(config, endpoint, params = {}) {
  const headers = config.authToken ? { Authorization: `Bearer ${config.authToken}` } : {};
  const response = await axios.get(`${config.baseUrl}${endpoint}`, {
    headers,
    params,
  });
  return response.data;
}

module.exports = {
  fetchData,
}; 