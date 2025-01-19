const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Configurar sessão
app.use(session({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: true,
}));

// Configurar Passport com Google OAuth 2.0
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

// Serializar e desserializar usuários
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Middleware para inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware para verificar login
function isLoggedIn(req, res, next) {
    req.isAuthenticated() ? next() : res.redirect('/');
}

// Página inicial
app.get('/', (req, res) => {
    res.send(`
        <h1>Bem-vindo!</h1>
        <a href="/auth/google">Login com Google</a>
    `);
});

// Rota de autenticação do Google
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback após autenticação com Google
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => res.redirect('/logado')
);

// Página protegida
app.get('/logado', isLoggedIn, (req, res) => {
    res.send(`
        <h1>Bem-vindo, ${req.user.displayName}!</h1>
        <a href="/logout">Sair</a>
    `);
});

// Logout
app.get('/logout', (req, res) => {
    req.logout(() => res.redirect('/'));
});

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
