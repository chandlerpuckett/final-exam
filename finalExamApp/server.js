'use strict';

// ===== packages ===== //

const express = require('express');
const pg = require('pg');
const superagent = require('superagent');

require('dotenv').config();

// ===== global variables | package init ===== //

const PORT = process.env.PORT || 3003;

// -- database

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', (error) => console.error(error));

// -- app inits
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended : true}));
app.use(express.static('./public'));


// ===== routes ===== //

app.get('/', getPokemon);
app.get('/favorites', showFavorites);

app.post('/pokemon', addToFavorites);


// ===== functions ===== //

// -- pull from API
function getPokemon (req,res){
  const pokeUrl = `https://pokeapi.co/api/v2/pokemon?limit=20&offset=0`;

  superagent.get(pokeUrl)
    .then(result => {
      let list = result.body.results;

      list.sort((a,b) => {
        if(a.name < b.name){
          return -1;
        } else if (a.name > b.name){
          return 1;
        } else {
          return 0;
        }
      });

      res.render('./show', {pokemon : list});
    })
    .catch(error => console.log(error));
}

// ---- add to DB ----
function addToFavorites (req,res){
  console.log('-- save route --');
  console.log(req.body);

  const sqlQuery = 'INSERT INTO pokemon (name) VALUES ($1)';

  const {name} = req.body;
  const value = [name];

  console.log('SQL QUERY: ', sqlQuery);
  console.log('SQL VAL: ', value);

  client.query(sqlQuery, value)
    .then( () => {
      console.log('SAVED TO DB');
      res.redirect('/');
    })
    .catch(error => console.log(error));

}

// ---- pull from DB ----
function showFavorites (req,res){
  console.log('--fav route--');

  const sqlQuery = 'SELECT * FROM pokemon';

  client.query(sqlQuery)
    .then(result => {
      res.render('./favorites', {pokemon : result.rows} );
    })
    .catch(error => console.log(error));
}


// ===== listen ===== //

// doesn't work in this repo for some reason? copy pasted into a test repo & it works perfectly. saves / pulls / redirects / favorites page totally fine.

// client.connect()
//   .then(() => {
//     app.listen(PORT, () => console.log(`tight, running on ${PORT}, rad`));
//   });


// but this does? so confused.

client.connect()
  .then(app.listen(PORT, () => console.log(`tight, running on ${PORT}, rad`)));


