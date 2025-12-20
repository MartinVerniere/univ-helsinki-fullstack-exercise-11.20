import { hash } from 'bcrypt'
import User from '../models/user.js'
import Blog from '../models/blog.js'
import assert, { strictEqual } from 'node:assert'
import { test, before, after, beforeEach, describe } from 'node:test'
import mongoose from 'mongoose'
import supertest from 'supertest'
import app from '../app.js'
import testHelper from './test_helper.js'

const { usersInDb } = testHelper
const { connection } = mongoose
const api = supertest(app)

before(async () => {
	await mongoose.connect(process.env.MONGODB_URI)
})

describe('when there is initially one user in db', () => {
	beforeEach(async () => {
		await User.deleteMany({})
		await Blog.deleteMany({})

		const passwordHash = await hash('sekret', 10)
		const user = new User({ name: 'test user', username: 'root', passwordHash })

		await user.save()
	})

	test('creation succeeds with valid username and password ', async () => {
		const usersAtStart = await usersInDb()

		console.log('Users in DB: ', usersAtStart)

		const newUser = {
			username: 'mluukkai',
			name: 'Matti Luukkainen',
			password: 'salainen',
		}

		await api
			.post('/api/users')
			.send(newUser)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const usersAtEnd = await usersInDb()
		strictEqual(usersAtEnd.length, usersAtStart.length + 1)

		const usernames = usersAtEnd.map(u => u.username)
		assert(usernames.includes(newUser.username))
	})

	test('creation fails with a invalid username - too short', async () => {
		const newUser = {
			username: 'ml',
			name: 'Matti Luukkainen',
			password: 'salainen',
		}

		await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)
	})

	test('creation fails with a invalid username - already exists', async () => {
		const newUser = {
			username: 'root',
			name: 'Matti Luukkainen',
			password: 'salainen',
		}

		await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)
	})

	test('creation fails with a invalid username - none sent', async () => {
		const newUser = {
			name: 'Matti Luukkainen',
			password: 'salainen',
		}

		await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)
	})

	test('creation fails with a invalid password - too short', async () => {
		const newUser = {
			username: 'root',
			name: 'Matti Luukkainen',
			password: 'sa',
		}

		await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)
	})

	test('creation fails with a invalid password - none sent', async () => {
		const newUser = {
			username: 'root',
			name: 'Matti Luukkainen',
		}

		await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)
	})
})

after(async () => {
	await connection.close()
})