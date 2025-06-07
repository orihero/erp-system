const { pool } = require('../../db/schema');

// Execute query with timeout
const executeQueryWithTimeout = async (query, params, timeout = 10000) => {
  const client = await pool.connect();
  try {
    await client.query('SET statement_timeout = $1', [timeout]);
    return await client.query(query, params);
  } finally {
    client.release();
  }
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Format date to YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Calculate date range for last N days
const getDateRange = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
};

module.exports = {
  executeQueryWithTimeout,
  isValidEmail,
  formatDate,
  getDateRange
}; 