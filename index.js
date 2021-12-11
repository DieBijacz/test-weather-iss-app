require('dotenv').config()
const express = require('express')
const Database = require('nedb')
const app = express()

const apiKey = process.env.apiKey
const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Starting server at ${port}`)
})
app.use(express.static('public'))
app.use(express.json({limit: '1mb'}))

const myDatabase = new Database('myCoords.db')
const ISSdatabase = new Database('ISScoords.db')
myDatabase.loadDatabase()
ISSdatabase.loadDatabase()

app.post('/myCoords', (req, resp) => {
    const data = req.body
    myDatabase.insert(data)
    resp.json(data)
})

app.post('/ISScoords', (req, resp) => {
    const data = req.body
    ISSdatabase.insert(data)
    resp.json(data)
})

app.get('/ISScoordsDB', (req, resp) => {
    ISSdatabase.find({}, (err, data) => {
        err ? resp.end : resp.json(data)
    })
})

app.get('/ISScoordsDBclear', (req, resp) => {
    ISSdatabase.remove({}, {multi: true}, (err, data) => {
        err ? resp.end : resp.json(data)
    })
})

app.get('/apiKey', (req, resp) => {
    resp.json(apiKey)
})