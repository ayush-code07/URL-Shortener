const mysql = require('mysql2/promise'); // Use /promise for async/await support

const pool = mysql.createPool({
    host: 'localhost',      // e.g., 'localhost' or an IP address
    user: 'root',           // your MySQL username
    password: '#32Kohlapuri',   // your MySQL password
    database: 'urlshortener',    // name of your database
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;