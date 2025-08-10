const databaseService = require('./databaseService');
const apiService = require('./apiService');
const fileService = require('./fileService');

function getService(dataSourceConfig) {
  switch (dataSourceConfig.type) {
    case 'database':
      return databaseService;
    case 'api':
      return apiService;
    case 'file':
      return fileService;
    default:
      throw new Error(`Unsupported data source type: ${dataSourceConfig.type}`);
  }
}

module.exports = {
  getService,
}; 