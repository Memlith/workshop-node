import { Request, Response } from 'express'
import User from '../../models/user.entity'
import Token from '../../models/token.entity'
import bcrypt from 'bcrypt'

export default class AuthController {
    static async store(req: Request, res: Response) {
        const { name, email, password } = req.body

        if (!name) return res.status(400).json({ error: 'Name is required' })
        if (!email) return res.status(400).json({ error: 'Email is required' })
        if (!password) return res.status(400).json({ error: 'Password is required' })

        const userCheck = await User.findOneBy({ email })
        if (userCheck) return res.status(400).json({ error: 'Email already registered' })

        const user = new User()
        user.name = name
        user.email = email
        // Gera a hash da senha com bcrypt - para não salvar a senha em texto puro
        user.password = bcrypt.hashSync(password, 10)
        await user.save()

        // Não vamos retornar a hash da senha
        return res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email
        })
    }
    static async login(req: Request, res: Response) {
        const { email, password } = req.body

        if (!email) return res.status(400).json({ error: 'Email is required' })
        if (!password) return res.status(400).json({ error: 'Password is required' })

        const user = await User.findOneBy({ email })
        if (!user) return res.status(401).json({ error: 'User not found' })

        const passwordMatch = bcrypt.compareSync(password, user.password)
        if (!passwordMatch) return res.status(401).json({ error: 'Invalid password' })

        // remove todos os tokens do user
        await Token.delete({ user: { id: user.id } })
        const token = new Token()
        //gera um token aleatorio
        token.token = bcrypt.hashSync(Math.random().toString(36), 1).slice(-20)
        //define a data de expiracao do token para daqui 1 hora
        token.expiresAt = new Date(Date.now() + 60 * 60 * 1000)
        // gera um refresh token aleatorio
        token.refreshToken = bcrypt.hashSync(Math.random().toString(36), 1).slice(-20)

        token.user = user
        await token.save()

        // Aqui estamos definindo o cookie como HTTP Only, Secure e SameSite None
        res.cookie('token', token.token, { httpOnly: true, secure: true, sameSite: 'none' })
        return res.json({
            token: token.token,
            expiresAt: token.expiresAt,
            refreshToken: token.refreshToken
        })
    }

    static async refresh(req: Request, res: Response) {
        const { authorization } = req.params

        if (!authorization) return res.status(400).json({ error: 'Refresh token is required' })

        const token = await Token.findOneBy({ refreshToken: authorization })
        if (!token) return res.status(401).json({ error: 'Invalid refresh token' })

        // verifica se o refresh token ainda e valido
        if (token.expiresAt < new Date()) {
            await token.remove()
            return res.status(401).json({ error: 'Refresh token expired' })
        }

        //atualiza os tokens
        token.token = token.refreshToken = bcrypt.hashSync(Math.random().toString(36), 1).slice(-20)
        token.refreshToken = token.refreshToken = bcrypt.hashSync(Math.random().toString(36), 1).slice(-20)
        token.expiresAt = token.expiresAt = new Date(Date.now() + 60 * 60 * 1000)
        await token.save()

        res.cookie('token', token.token, { httpOnly: true, secure: true, sameSite: 'none' })
        return res.json({
            token: token.token,
            expiresAt: token.expiresAt,
            refreshToken: token.refreshToken
        })
    }

    static async logout(req: Request, res: Response) {
        const { authorization } = req.headers

        if (!authorization) return res.status(400).json({ error: 'Token is required' })
        //verifica se token existe
        const userToken = await Token.findOneBy({ token: authorization })
        if (!userToken) return res.status(401).json({ error: 'Invalid token' })

        // remove o token
        await userToken.remove()

        //remove o token do cookie
        res.clearCookie('token')

        //retorna uma resposta vazia
        return res.status(204).json()
    }

}