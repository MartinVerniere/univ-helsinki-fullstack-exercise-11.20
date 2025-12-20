import { hash } from 'bcrypt'
import { Router } from 'express'
import User from '../models/user.js'

const usersRouter = Router()

usersRouter.get('/', async (request, response) => {
	const users = await User.find({}).populate('blogs', { title: 1, author: 1 })
	response.json(users)
})

usersRouter.post('/', async (request, response) => {
	const { username, name, password } = request.body

	if (!password) return response.status(400).send({ error: 'Password field is obligatory' })
	if (password.length < 3) return response.status(400).send({ error: 'Password length must be larger 3 or more characters long' })

	const saltRounds = 10
	const passwordHash = await hash(password, saltRounds)

	const user = new User({
		username,
		name,
		passwordHash,
	})

	const savedUser = await user.save()

	response.status(201).json(savedUser)
})

export default usersRouter