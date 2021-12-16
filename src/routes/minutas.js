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
const handelbars = require('handlebars');
const uuid = require('uuid').v4;
const cloudinary = require('cloudinary').v2;
const fs = require('fs-extra');


cloudinary.config({
    cloud_name: 'minutasdb',
    api_key: '451487518734312',
    api_secret: 'lNvD2BXxiLcHY8-q-IlHaN00P9k',

});



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

router.get('/delete/:id', isLoggedIn, async(req, res)=>{
    const {id} = req.params;
    await pool.query('DELETE FROM vigilantes WHERE ID = ?', [id]);
    req.flash('success', 'Usuario eliminado');
    res.redirect('/minutas/listVigilantes');
});

router.get('/editVigilante/:id', isLoggedIn, async(req, res)=>{
    const {id} = req.params;
    const users = await pool.query('SELECT * FROM vigilantes WHERE ID = ?', [id]);
    
    res.render('minutas/editVigilante', {users: users[0]});
});

router.post('/editVigilante/:id', async(req, res)=>{

    const {id} = req.params;
    const {nombre, correo, cedula, turno, contraseña} = req.body;
    
    console.log(nombre);
    await pool.query('UPDATE vigilantes SET nombre = ?, correo = ?, cedula = ?, turno = ?, contraseña= ? WHERE id = ?', [nombre, correo, cedula, turno, contraseña, id]);
    req.flash('success', 'Información actualizada');
    res.redirect('/minutas/listVigilantes');
});

router.get('/profile',isLoggedIn,(req,res)=>{
    res.render('minutas/profile');
  });


router.post('/actualizarFoto/:id', isLoggedIn, async (req, res) => {
    const id = req.params.id;
    var resultado ={};
    try{
        resultado = await cloudinary.uploader.upload(req.file.path);
        await fs.unlink(req.file.path);
     }catch(e){
        resultado.url = "";
        resultado.public_id = "";
     }
    const result = await cloudinary.uploader.upload(req.file.path);
    const profile_img = result.url;
    const public_id = result.public_id;
    await pool.query('UPDATE vigiliantes SET profile_img = ?, public_id = ? WHERE id = ?', [profile_img, public_id, id]);
    req.flash('success', 'Se actualizo su foto de perfil correctamente');
    await fs.unlink(req.file.path);

    res.redirect('/profile');
});

module.exports = router;