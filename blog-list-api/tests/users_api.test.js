import { hash } from 'bcrypt'
import User, { deleteMany } from '../models/user'
import { deleteMany as _deleteMany } from '../models/blog'
import assert, { strictEqual } from 'node:assert'
import { test, after, beforeEach, describe } from 'node:test'
import { connection } from 'mongoose'
import supertest from 'supertest'
import app from '../app'
import { usersInDb } from './test_helper'

const api = supertest(app)

describe('when there is initially one user in db', () => {
	beforeEach(async () => {
		await deleteMany({})
		await _deleteMany({})

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