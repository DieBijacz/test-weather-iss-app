require('dotenv').config()
const express = require('express')
const Database = require('nedb')
const app = express()
console.log(process.env);

const apiKey = process.env.apiKey

app.listen(3000, () => {console.log('listen on 3000')})
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