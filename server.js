require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const MOVIES = require('./movies.json')
const cors = require('cors')
const helmet = require('helmet')

const app = express()
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'

app.use(morgan(morganSetting))
app.use(cors())
app.use(helmet())

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
    
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        res.status(401).json({ error: 'Unauthorized Request'})
    }
    next()
})

app.get('/movie', function handleGetMovie(req, res) {
    let response = MOVIES;
    const { name = "", genre, country, avg_vote } = req.query;

    
    if(avg_vote) {
        if(Number(avg_vote) < 0 || Number(avg_vote) > 10) {
            res.status(400).json({ error: 'If included, avg_vote must be between 0 and 10'})
        }
        response = response.filter(movie => 
            movie.avg_vote >= Number(avg_vote)
        )
        response.sort((a, b) => {
            return a.avg_vote > b.avg_vote ? 1 : a.avg_vote < b.avg_vote ? -1 : 0;
        })
    }
    
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
        let countrySearch = country.replace(/\s+/g, '')
        response = response.filter(movie => 
            movie.country.replace(/\s+/g, '').toLowerCase().includes(countrySearch.toLowerCase())
        )
    }


    res.json(response)
})

app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        response = { error }
    }
    res.status(500).json(response)
})

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
})
