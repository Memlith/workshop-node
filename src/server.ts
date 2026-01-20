console.log('Hello World, Node Workshop!');

import express from 'express'
import dotenv from 'dotenv'
import dataBase from './database/ormconfig'

import routes from './routes'

dotenv.config()
const app = express()
const port = process.env.port || 3001

app.use(express.json) // habilita o express para receber dados no formato json
app.use(routes) //habilita rotas

app.listen(port, () => {
    console.log(`Server is running in port ${port}`)
    console.log(`Database`, dataBase.isInitialized ? 'initialized' : 'not initialized')
})