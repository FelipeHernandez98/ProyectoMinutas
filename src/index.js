const express = require('express');
const validator = require('express-validator');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySqlStore = require('express-mysql-session');
const { database }= require('./keys');
const passport = require('passport');
const bodyParser = require('body-parser');


//Inicializaciones
const app = express();
require('./lib/passport');

//Configuraciones
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars'),
}));
app.set('view engine', '.hbs');

//Midlewares
app.use(session({
    secret: 'Minutas',
    resave: false,
    saveUninitialized: false,
    store: new MySqlStore(database)
}))
app.use(flash());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(validator());

//Variables globales
app.use((req, res, next)=>{
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.user = req.user;
    next();
});

//Archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

//Rutas
app.use(require('./routes'));
app.use(require('./routes/authentication'));
app.use('/minutas', require('./routes/minutas'));

//Public
app.use(express.static(path.join(__dirname, 'public')));

//Iniciando el servidor
app.listen(app.get('port'), () => {

    console.log('Servidor en el puerto', app.get('port'));

});