import { DataSource } from 'typeorm'
import dotenv from 'dotenv'
import { join } from 'path'

dotenv.config() // carrega as variáveis de ambiente do arquivo .env

const dataBase = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE || './src/database/database.sqlite',
  entities: [join(__dirname, '..', 'models/*.{ts,js}')],
  logging: true, // log das queries executadas
  synchronize: true // cria as tabelas automaticamente
})

dataBase.initialize()
  .then(() => {
    console.log('Database initialized');
  })
  .catch((err) => {
    console.error('Error initializing database', err);
  })

export default dataBase