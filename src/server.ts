console.log('Hello World, Node Workshop!');

import express from 'express'
import dotenv from 'dotenv'
import dataBase from './database/ormconfig'
import routes from './routes'
import cors from 'cors'
import cookieParser from 'cookie-parser'

dotenv.config()
const app = express()
const port = process.env.port || 3001

app.use(express.json) // habilita o express para receber dados no formato json
app.use(routes) //habilita rotas
//app.use(cors()) // habilita o CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://mynodeapp.com'],
    credentials: true // habilita os cookies
}))
app.use(cookieParser())

app.listen(port, () => {
    console.log(`Server is running in port ${port}`)
    console.log(`Database`, dataBase.isInitialized ? 'initialized' : 'not initialized')
})