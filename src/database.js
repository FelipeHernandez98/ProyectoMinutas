const mysql = require('mysql');

const { database} = require('./keys');
const { promisify} = require('util')
const pool = mysql.createPool(database);
 
pool.getConnection((err, connection)=>{
    if(err){
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            console.log('LA CONEXIÓN A LA BASE DE DATOS SE HA CERRADO');
        }
        if(err.code === 'ER_CON_COUUNT_ERROR'){
            console.log('LA BASE DE DATOS TIENE DEMASIADAS CONEXIONES')
        }
        if(err.code === 'ECONNREFUSED'){
            console.log('LA CONEXIÓN A LA BASE DE DATOS FUE RECHAZADA')
        }
    }

    if(connection) connection.release();
    console.log('Conexion a la base de datos exitosa');
    return
});

pool.query = promisify(pool.query);
module.exports = pool;