const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

async function readJSON(filePath) {
  const absPath = path.resolve(filePath);
  const data = await fs.promises.readFile(absPath, 'utf-8');
  return JSON.parse(data);
}

async function readCSV(filePath) {
  const absPath = path.resolve(filePath);
  const data = await fs.promises.readFile(absPath, 'utf-8');
  return parse(data, { columns: true });
}

module.exports = {
  readJSON,
  readCSV,
}; 