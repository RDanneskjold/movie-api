require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const MOVIES = require('./movies.json')
const cors = require('cors')
const helmet = require('helmet')

const app = express()

app.use(morgan('dev'))
app.use(cors())
app.use(helmet())

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
    console.log('validate bearer token middleware')
    
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        res.status(401).json({ error: 'Unauthorized Request'})
    }
    next()
})

app.get('/movies', function handleGetMovie(req, res) {
    let response = MOVIES;
    const { name = "", genre, country, avg_vote } = req.query;

    // filter our pokemon by name if name query param is present
    if(name) {
        response = response.filter(movie =>
            movie.film_title.toLowerCase().includes(name.toLowerCase())
        )
    }

    if(genre) {
        response = response.filter(movie => 
            movie.genre.toLowerCase().includes(genre.toLowerCase())
        )
    }

    if(country) {
        response = response.filter(movie => 
            movie.country.toLowerCase().includes(country.toLowerCase())
        )
    }

    if(avg_vote) {
        console.log(typeof(Number(avg_vote)))
        response = response.filter(movie => 
            movie.avg_vote >= Number(avg_vote)
        )
        response.sort((a, b) => {
            return a.avg_vote > b.avg_vote ? 1 : a.avg_vote < b.avg_vote ? -1 : 0;
        })
    }

    res.json(response)
})

const PORT = 8000

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})

// export API_TOKEN=490c7188-6b7d-11e9-a923-1681be663d3e

// echo $API_TOKEN