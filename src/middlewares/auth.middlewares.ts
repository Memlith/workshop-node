import { Request, Response, NextFunction } from "express";
import Token from "../models/token.entity";

export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.params
    if (!authorization) return res.status(401).json({ error: 'Token is required' })

    // verifica se token existe
    const userToken = await Token.findOneBy({ token: authorization })
    if (!userToken) return res.status(401).json({ error: 'Invalid token' })

    //verifica se token expirou
    if (userToken.expiresAt < new Date()) {
        await userToken.remove()
        return res.status(401).json({ error: 'Token expired' })
    }
    // adiciona o id do usuario ao header de request
    req.headers.userId = userToken.userId.toString()

    //continua a execucao
    next()

}