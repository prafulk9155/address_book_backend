const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host: 'csms.c3o4gug42144.ap-southeast-2.rds.amazonaws.com',
//     user: 'admin',
//     password: 'Aa96672$67416',
//     database: 'adms',
// });


// const pool = mysql.createPool({
//     host: '127.0.0.1',
//     user: 'root',
//     password: '',
//     database: 'address_book_db',
// });
// const promisePool = pool.promise();


const pool = mysql.createPool({
    host: 'localhost',
    user: 'ogesone',
    password: 'My$ql@ogone#123',
    database: 'sys_db',
});
const promisePool = pool.promise();

// Test the database connection
promisePool.getConnection()
    .then(connection => {
        console.log('Successfully connected to the MySQL database');
        connection.release(); 
    })
    .catch(err => {
        console.error('Error connecting to the MySQL database:', err.message);
    });

module.exports = promisePool;
