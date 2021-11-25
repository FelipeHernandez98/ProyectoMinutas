const express = require('express');
const router = express.Router();

const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
const LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');

// SIGNUP
router.get('/addVigilante',  (req, res) => {
  localStorage.clear();
  res.render('auth/addVigilante');
});

router.post('/addVigilante', passport.authenticate('local.signup', {
  successRedirect: 'minutas/listMinutas',
  failureRedirect: '/addVigilante',
  failureFlash: true
}));

// SINGIN
router.get('/signin', (req,res)=>{
  res.render('auth/signin');
  
});
router.post('/signin',(req,res,next)=>{
  req.check('cedula', 'Cedula is Required').notEmpty();
  req.check('contraseña', 'Contraseña is Required').notEmpty();
  const errors = req.validationErrors();
  if (errors.length > 0) {
    req.flash('message', errors[0].msg);
    res.redirect('/signin');
  }
  passport.authenticate('local.signin', {
    successRedirect: 'minutas/listminutas',
    failureRedirect: '/signin',
    failureFlash: true
  })(req,res,next)
  
});

router.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/signin');
});


module.exports = router;