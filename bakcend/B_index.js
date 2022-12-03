require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const cors = require('cors');
// MIDDLEWARE JSON
app.set('trust proxy', 1);
app.use(express.json());
app.use(cors({ credentials: true }));

// var sesion
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);

// ROUTES
const routeLog = require('./Rutas/Rutas_logs');
const routetrans = require('./Rutas/Rutas_trans');
const routeinfo = require('./Rutas/Rutas_info');
app.use('/Login', routeLog);
app.use('/Transacciones', routetrans);
app.use('/Info', routeinfo);

// open app port 3005
app.listen(3005, (err) => {
  if (err) {
    console.log('Error', err);
    return;
  }
  console.log('listening on port 3000');
});
