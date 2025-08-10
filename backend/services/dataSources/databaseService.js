const mysql = require('mysql2/promise');

let connection = null;

async function connect(config) {
  connection = await mysql.createConnection(config);
}

async function query(sql, params = []) {
  if (!connection) throw new Error('Not connected to database');
  const [rows] = await connection.execute(sql, params);
  return rows;
}

async function disconnect() {
  if (connection) {
    await connection.end();
    connection = null;
  }
}

module.exports = {
  connect,
  query,
  disconnect,
}; 