const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.MARIADB_HOST || 'db',
  user: process.env.MARIADB_USER || 'eprovider_user',
  password: process.env.MARIADB_PASSWORD || 'EproviderKompVika2026!',
  database: process.env.MARIADB_DATABASE || 'eprovider',
  port: process.env.MARIADB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }
  console.log('Connected to MariaDB');
});

module.exports = db;
