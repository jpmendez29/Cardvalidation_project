const mysql = require('mysql2');
const [host, user, pasw, db] = [process.env.HOST, process.env.USER, process.env.PASW, process.env.DB]


// Mysql connection 

const connection = mysql.createConnection({
    host     : host,
    user     : user,
    password : pasw,
    database : db,
    multipleStatements: true,
    connectTimeout: 30000
    
});

connection.connect(error => {
    if (error) {
        throw error
    }else{
        console.log("********** conectado a la base de datos ************")
    }
})

module.exports = connection