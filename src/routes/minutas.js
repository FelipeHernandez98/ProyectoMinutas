const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isLoggedIn } = require('../lib/auth');
const LocalStrategy = require('passport-local').Strategy;
const helpers = require('../lib/helpers');
const moment = require('moment');
const LocalStorage = require('node-localstorage').LocalStorage,
    localStorage = new LocalStorage('./scratch');
const pool = require('../database');


router.get('/addMinuta', isLoggedIn, (req, res)=>{
    res.render('minutas/addMinuta');
});

router.post('/addMinuta/:id/:nombre', isLoggedIn,  async(req, res)=>{
    req.check('id_vigilante', 'El id del vigilante es requerido').notEmpty();
    req.check('descripcion', 'La descripcion es requerida').notEmpty();
    req.check('fecha', 'La fecha es requerida').notEmpty();
    
    const {id, nombre} = req.params;
    var {descripcion, fecha} = req.body;

    var fecha2;
    fecha2 = moment(fecha);
    fecha2 = fecha2.format('YYYY-MM-DD HH:mm:ss ');
    fecha = fecha2;

    var id_vigilante;
    var nombre_vigilante;
    id_vigilante= id;
    nombre_vigilante = nombre;

    newMinuta = {
        id_vigilante,
        nombre_vigilante,
        descripcion,
        fecha
    }

    await pool.query('INSERT INTO minuta set ?', [newMinuta]);
    req.flash('success', 'Minuta guardada correctamente');
    res.redirect('/minutas/listMinutas');
});

router.get('/listMinutas', isLoggedIn, async(req, res)=>{
    const minutas = await pool.query('SELECT * FROM minuta');
    for(i=0; i<minutas.length; i++){
        const fecha = minutas[i].fecha;
        const fechaNueva = moment(fecha);
        minutas[i].fecha = fechaNueva.format('DD/MM/YYYY  hh:mm:ss A');
        
    }
    
    res.render('minutas/listMinutas', {minutas});
});

router.get('/adminOption', isLoggedIn, (req, res)=>{
    res.render('minutas/adminOption');
});

router.get('/listVigilantes', isLoggedIn, async(req, res)=>{
    const vigilantes = await pool.query('SELECT * FROM vigilantes');
    res.render('minutas/listVigilantes', {vigilantes});
});

module.exports = router;