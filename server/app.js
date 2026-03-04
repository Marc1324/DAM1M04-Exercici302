const express = require('express');
const hbs = require('hbs');
const path = require('path');

// CORRECCIÓ 1: Com que db.js i app.js estan a la mateixa carpeta, és './db'
const db = require('./db'); 

// CORRECCIÓ 2: La ruta cap a common.json des de la carpeta server
const commonData = require('./data/common.json');

const app = express();

app.set('view engine', 'hbs');

// CORRECCIÓ 3: Com que app.js ja és dins de 'server', 
// mirem una carpeta enrere per algunes rutes si cal, 
// o definim directament les carpetes de vistes.
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// La carpeta public està fora de server, pugem un nivell amb '../'
app.use(express.static(path.join(__dirname, '../public')));

// B) Pàgina Principal -> index.hbs
app.get('/', async (req, res) => {
    try {
        const [movies] = await db.query(`SELECT title, release_year FROM film LIMIT 5`);
        const [categories] = await db.query('SELECT name FROM category LIMIT 5');
        res.render('index', { ...commonData, movies, categories });
    } catch (err) { res.status(500).send(err.message); }
});

// C) Pàgina Pel·lícules -> informe.hbs
app.get('/movies', async (req, res) => {
    try {
        const [movies] = await db.query(`
            SELECT f.title, f.release_year, GROUP_CONCAT(a.first_name SEPARATOR ', ') as actors 
            FROM film f 
            JOIN film_actor fa ON f.film_id = fa.film_id 
            JOIN actor a ON fa.actor_id = a.actor_id 
            GROUP BY f.film_id LIMIT 15`);
        res.render('informe', { ...commonData, movies });
    } catch (err) { res.status(500).send(err.message); }
});

// D) Ruta Customers
app.get('/customers', async (req, res) => {
    try {
        const [customers] = await db.query('SELECT customer_id, first_name, last_name FROM customer LIMIT 25');
        for (let c of customers) {
            const [rentals] = await db.query('SELECT rental_date FROM rental WHERE customer_id = ? LIMIT 5', [c.customer_id]);
            c.rentals = rentals;
        }
        res.render('customers', { ...commonData, customers });
    } catch (err) { res.status(500).send(err.message); }
});

app.listen(3000, () => console.log('Servidor OK a http://localhost:3000'));