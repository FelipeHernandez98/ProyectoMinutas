const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database');
const helpers = require('./helpers');
const bcrypt = require('bcryptjs')
const cloudinary = require('cloudinary').v2;
const fs = require('fs-extra');

passport.use('local.signin', new LocalStrategy({
    usernameField: 'cedula',
    passwordField: 'contraseña',
    passReqToCallback: true
  }, async (req, cedula, contraseña, done) => {
    const rows = await pool.query('SELECT * FROM vigilantes WHERE cedula = ?', [cedula]);
   
  if (rows.length > 0) {
    const user = rows[0];
    var validPassword = false;
    if(contraseña === user.contraseña){
      validPassword = true;
    }
    console.log(validPassword);
    if (validPassword) {
      done(null, user, req.flash('success', 'Bienvenido ' + user.nombre));
    } else {
      done(null, false, req.flash('message', 'Contraseña incorrecta'));
    }
  } else {
    return done(null, false, req.flash('message', 'El usuario no existe'));
  }
  }));

 


  passport.use('local.signup', new LocalStrategy({
    usernameField: 'cedula',
    passwordField: 'contraseña',
    passReqToCallback: true
  }, async (req, cedula, contraseña, done) => {
  
    

    const { nombre,  correo, rol, turno } = req.body;
    let newUser = {
      nombre,
      correo,
      cedula,
      rol,
      turno,
      contraseña,
    };

    newUser.contraseña = await helpers.encryptPassword(contraseña);
    // Guardando en la base de datos
    const result = await pool.query('INSERT INTO vigilantes SET ? ', newUser);
    newUser.id = result.insertId;
    return done(null, newUser);
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('SELECT * FROM vigilantes WHERE id = ?', [id]);
    done(null, rows[0]);
  });