import { test, before, after, beforeEach, describe } from 'node:test'
import mongoose from 'mongoose'
import assert, { strictEqual, ok } from 'node:assert'
import supertest from 'supertest'
import app from '../app.js'
import testHelper from './test_helper.js'
import User from '../models/user.js'
import Blog from '../models/blog.js'
import { hash } from 'bcrypt'

const { initialBlogs, blogsInDb } = testHelper
const { connection } = mongoose
const api = supertest(app)

before(async () => {
	await mongoose.connect(process.env.MONGODB_URI)
})

const loginAndGetToken = async () => {
	const response = await api
		.post('/api/login')
		.send({ username: 'test', password: 'password' })
	return response.body.token
}

describe('blog API', () => {
	beforeEach(async () => {
		await User.deleteMany({})
		await Blog.deleteMany({})

		const saltRounds = 10
		const passwordHash = await hash('password', saltRounds)
		const user = new User({ username: 'test', name: 'test', passwordHash: passwordHash })
		await user.save()

		const newUserID = user._id
		await Blog.insertMany(initialBlogs.map(blog => ({ ...blog, user: newUserID })))
	})

	describe('while fetching blogs', () => {
		test('they are returned as json', async () => {
			await api
				.get('/api/blogs')
				.expect(200)
				.expect('Content-Type', /application\/json/)
		})

		test('they are all returned', async () => {
			const response = await api.get('/api/blogs')

			strictEqual(response.body.length, initialBlogs.length)
		})

		test('they are all returned with property id', async () => {
			const response = await api.get('/api/blogs')
			const blogs = response.body

			blogs.forEach(blog => {
				assert(blog.id)
			})
		})
	})

	describe('while adding blogs', () => {
		test('a valid blog can be added', async () => {
			const token = await loginAndGetToken()

			const newBlog = {
				title: 'Test title',
				author: 'Test author',
				url: 'https://test.com/',
				likes: 0,
			}

			await api
				.post('/api/blogs')
				.send(newBlog)
				.set('Authorization', `Bearer ${token}`)
				.expect(201)
				.expect('Content-Type', /application\/json/)

			const blogsAtEnd = await blogsInDb()
			strictEqual(blogsAtEnd.length, initialBlogs.length + 1)

			const contents = blogsAtEnd.map(n => n.title)
			assert(contents.includes('Test title'))
		})

		test('when blogs added without property likes, default to 0', async () => {
			const token = await loginAndGetToken()

			const newBlog = {
				title: 'Test title',
				author: 'Test author',
				url: 'https://test.com/',
			}

			const response = await api
				.post('/api/blogs')
				.send(newBlog)
				.set('Authorization', `Bearer ${token}`)
				.expect(201)
				.expect('Content-Type', /application\/json/)

			const addedBlog = response.body

			strictEqual(addedBlog.likes, 0)
		})

		test('when blogs added without property title, return error 404', async () => {
			const token = await loginAndGetToken()

			const newBlog = {
				author: 'Test author',
				url: 'https://test.com/',
			}

			await api
				.post('/api/blogs')
				.set('Authorization', `Bearer ${token}`)
				.send(newBlog)
				.expect(400)
		})

		test('when blogs added without property url, return error 404', async () => {
			const token = await loginAndGetToken()

			const newBlog = {
				title: 'Test title',
				author: 'Test author',
			}

			await api
				.post('/api/blogs')
				.set('Authorization', `Bearer ${token}`)
				.send(newBlog)
				.expect(400)
		})

		test('when blogs added without token, return error 401 Unauthorized', async () => {
			const newBlog = {
				title: 'Test title',
				author: 'Test author',
			}

			await api
				.post('/api/blogs')
				.send(newBlog)
				.expect(401)
		})
	})

	describe('while removing blogs', () => {
		test('a blog with valid id can be deleted', async () => {
			const blogsAtStart = await blogsInDb()
			const blogToDelete = blogsAtStart[0]
			const token = await loginAndGetToken()

			await api
				.delete(`/api/blogs/${blogToDelete.id}`)
				.set('Authorization', `Bearer ${token}`)
				.expect(204)

			const blogsAtEnd = await blogsInDb()

			assert(!blogsAtEnd.includes(blogToDelete))

			strictEqual(blogsAtEnd.length, initialBlogs.length - 1)
		})

		test('a blog with invalid id cant be deleted', async () => {
			const token = await loginAndGetToken()

			await api
				.delete('/api/blogs/12')
				.set('Authorization', `Bearer ${token}`)
				.expect(400)
		})
	})

	describe('while editing blogs', () => {
		test('a blog with valid id can be edited', async () => {
			const blogsAtStart = await blogsInDb()
			const blogToEdit = blogsAtStart[0]

			const editedBlog = { ...blogToEdit, likes: blogToEdit.likes + 1000 }

			await api
				.put(`/api/blogs/${blogToEdit.id}`)
				.send(editedBlog)
				.expect(201)

			const blogsAtEnd = await blogsInDb()
			const updatedBlog = blogsAtEnd.find(blog => blog.id === blogToEdit.id)

			ok(updatedBlog)
			strictEqual(updatedBlog.likes, editedBlog.likes)
		})

		test('a blog with invalid id cant be edited', async () => {
			const blogsAtStart = await blogsInDb()
			const blogToEdit = blogsAtStart[0]

			const editedBlog = { ...blogToEdit, likes: blogToEdit.likes + 1000 }

			await api
				.put('/api/blogs/5a422bc61b54a676234d17fc')
				.send(editedBlog)
				.expect(404)
		})
	})

	after(async () => {
		await connection.close()
	})
})