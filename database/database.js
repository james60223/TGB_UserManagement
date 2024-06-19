// database.js
const mysql = require('mysql2');
require('dotenv').config();

// Create a connection to the MySQL database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    // password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        fullname VARCHAR(255) NOT NULL,
        user_chat_id VARCHAR(255) NOT NULL,
        wallet_address VARCHAR(255) NOT NULL,
        active_point INT DEFAULT 0,
        blue_stars INT DEFAULT 0,
        red_stars INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

connection.query(createTableQuery, (err, results) => {
    if (err) {
        console.error('Error creating table:', err);
        return;
    }
    console.log('Table "users" created or already exists');
});

// insert user if not exist.
const insertUserIfNotExists = (username, fullname, user_chat_id, wallet_address, active_point, blue_stars, red_stars) => {
    const checkUserQuery = 'SELECT COUNT(*) AS count FROM users WHERE user_chat_id = ?';
    const insertUserQuery = `
        INSERT INTO users (username, fullname, user_chat_id, wallet_address, active_point, blue_stars, red_stars)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    connection.beginTransaction((err) => {
        if (err) {
            console.error('Error starting transaction:', err);
            return;
        }

        connection.query(checkUserQuery, [user_chat_id], (err, results) => {
            if (err) {
                return connection.rollback(() => {
                    console.error('Error checking user existence:', err);
                });
            }

            const userCount = results[0].count;

            if (userCount > 0) {
                console.log('User already exists, not inserting.');
                return;
            }

            connection.query(insertUserQuery, [username, fullname, user_chat_id, wallet_address, active_point, blue_stars, red_stars], (err, results) => {
                if (err) {
                    return connection.rollback(() => {
                        console.error('Error inserting user:', err);
                    });
                }

                connection.commit((err) => {
                    if (err) {
                        return connection.rollback(() => {
                            console.error('Error committing transaction:', err);
                        });
                    }

                    console.log('User inserted with ID:', results.insertId);
                });
            });
        });
    });
};

module.exports = {
    connection,
    insertUserIfNotExists
};
