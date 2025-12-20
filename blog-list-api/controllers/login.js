import jwt from 'jsonwebtoken'
import { compare } from 'bcrypt'
import express from 'express'
import User from '../models/user.js'

const { sign } = jwt

const loginRouter = express.Router()

loginRouter.post('/', async (request, response) => {
	const { username, password } = request.body

	const user = await User.findOne({ username })
	const passwordCorrect = user === null
		? false
		: await compare(password, user.passwordHash)

	if (!(user && passwordCorrect)) {
		return response.status(401).json({
			error: 'invalid username or password'
		})
	}

	const userForToken = {
		username: user.username,
		id: user._id,
	}

	const token = sign(userForToken, process.env.SECRET)

	response
		.status(200)
		.send({ token, username: user.username, name: user.name })
})

export default loginRouter