// const mysql = require('mysql2/promise'); // Use /promise for async/await support

// const pool = mysql.createPool({
//     host: 'localhost',      // e.g., 'localhost' or an IP address
//     user: 'root',           // your MySQL username
//     password: '#32Kohlapuri',   // your MySQL password
//     database: 'urlshortener',    // name of your database
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

// module.exports = pool;


const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;

console.log("Database Config:", {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME
});