const {
  ConnectingAirportsOutlined,
  ConstructionOutlined,
} = require('@mui/icons-material');
const express = require('express');
const { connect } = require('../Db/database.js');
const router = express.Router();
var connection = require('../Db/database.js');

router.post('/Transaccion', async (req, res) => {
  //const usr = req.session.all

  const ac = req.body.ac;
  const cant = req.body.cant;

  const conp = req.body.conp;

  const tarj = req.body.tarj;
  const csv = req.body.csv;

  const fv = req.body.fv;
  const cuot = req.body.cuot;

  /*  const usr = req.session.all
    
    const ac = req.query.ac
    const cant = req.query.cant
    
    const conp = req.query.conp

    const tarj = req.query.tarj
    const csv = req.query.csv

    const fv = req.query.fv 
    const cuot =  req.query.cuot */

  connection.query(
    "WITH ab as (SELECT tarjeta.Nombre_tarjeta, tarjeta.Num_tarjeta, tarjeta.Codigo_seg, tarjeta.Fecha_vencimiento, tipo_tarjeta.Tipo, if(tipo_tarjeta.Debito_credito=0, 'Debito', 'Credito') as Debito_credito, cuenta_bancaria.Cantidad FROM db_pagos.cuenta_bancaria LEFT JOIN tarjeta ON db_pagos.cuenta_bancaria.Id_tarjeta = db_pagos.tarjeta.Id_tarjeta LEFT JOIN db_pagos.tipo_tarjeta ON db_pagos.tipo_tarjeta.Id_tipo_tarjeta = db_pagos.tarjeta.Id_tipo_tarjeta where Num_cuenta = ?) select * from ab where Num_tarjeta = ?",
    [Number(req.body.Num_cuenta), tarj],
    function (err, results) {
      const a = results;
      console.log(a);

      console.log(csv);

      if (a[0].Codigo_seg == csv) {
        if (results.length == 0) {
          console.log('la tarjeta no se encuentra');
          res.send(JSON.stringify('la tarjeta no se encuentra', null, 4));
          throw err;
        } else {
          connection.query(
            'SELECT * FROM db_pagos.cuenta_bancaria where Num_cuenta = ?;',
            [ac],
            function (err, results) {
              if (results.length == 0) {
                console.log('la cuenta a depositar no existe');
                res.send(
                  JSON.stringify('la cuenta a depositar no existe', null, 4)
                );
                throw err;
              } else {
                const acp = results[0].Cantidad;
                const aci = results[0].Id_cuenta;

                if (a[0].Debito_credito == 'Debito') {
                  if (a[0].Cantidad >= cant) {
                    const result = a[0].Cantidad - Number(cant);
                    connection.query(
                      'SELECT Id_tarjeta FROM db_pagos.tarjeta where Num_tarjeta = ?;',
                      [a[0].Num_tarjeta],
                      function (err, results) {
                        connection.query(
                          'UPDATE db_pagos.cuenta_bancaria SET Cantidad = ? WHERE Id_tarjeta = ? and Id_cuenta > 0',
                          [result, results[0].Id_tarjeta],
                          function (err, results) {
                            console.log('update cuenta');
                          }
                        );

                        connection.query(
                          'INSERT INTO db_pagos.transacciones (Id_cuenta_entrega, Id_cuenta_recibido, Cantidad, Conpago) values (?,?,?,?)',
                          [req.body.Num_cuenta, ac, Number(cant), conp],
                          function (err, results) {
                            console.log('add transaccion');
                          }
                        );

                        connection.query(
                          'UPDATE db_pagos.cuenta_bancaria SET Cantidad = ? WHERE Num_cuenta = ? and Id_cuenta = ?',
                          [acp + Number(cant), ac, aci],
                          function (err, results) {
                            console.log('Transaccion exitosa');
                            res.send(
                              JSON.stringify('Transaccion exitosa', null, 4)
                            );
                          }
                        );
                      }
                    );
                  } else {
                    console.log('salgo insuficiente');
                    res.send(JSON.stringify('salgo insuficiente', null, 4));
                  }
                } else {
                  if (a[0].Cantidad >= cant / cuot && cuot > 0) {
                    const result = a[0].Cantidad - Number(cant / cuot);
                    connection.query(
                      'SELECT Id_tarjeta FROM db_pagos.tarjeta where Num_tarjeta = ?;',
                      [a[0].Num_tarjeta],
                      function (err, results) {
                        connection.query(
                          'UPDATE db_pagos.cuenta_bancaria SET Cantidad = ? WHERE Id_tarjeta = ? and Id_cuenta > 0',
                          [result, results[0].Id_tarjeta],
                          function (err, results) {
                            console.log('update cuenta');
                          }
                        );

                        connection.query(
                          'INSERT INTO db_pagos.transacciones (Id_cuenta_entrega, Id_cuenta_recibido, Cantidad, Conpago) values (?,?,?,?)',
                          [req.body.Num_cuenta, ac, Number(cant / cuot), conp],
                          function (err, results) {
                            console.log('add transaccion');
                          }
                        );

                        connection.query(
                          'UPDATE db_pagos.cuenta_bancaria SET Cantidad = ? WHERE Num_cuenta = ? and Id_cuenta = ?',
                          [acp + Number(cant / cuot), ac, aci],
                          function (err, results) {
                            console.log('Transaccion exitosa');
                            res.send(
                              JSON.stringify('Transaccion exitosa', null, 4)
                            );
                          }
                        );
                      }
                    );
                  } else {
                    console.log('saldo insuficiente');
                    res.send(JSON.stringify('saldo insuficiente', null, 4));
                  }
                }
              }
            }
          );
        }
      } else {
        console.log('codigo de seguridad invalido');
        res.send(JSON.stringify('codigo de seguridad invalido', null, 4));
      }
    }
  );
});

module.exports = router;
