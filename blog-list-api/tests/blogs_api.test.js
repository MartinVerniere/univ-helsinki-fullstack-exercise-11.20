const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const api = supertest(app)

let token = ''

describe('when initially blogs database is empty', () => {
	beforeEach(async () => {
		await User.deleteMany({})
		await Blog.deleteMany({})

		const saltRounds = 10
		const passwordHash = await bcrypt.hash('password', saltRounds)
		const user = new User({ username: 'test', name: 'test', passwordHash: passwordHash })
		await user.save()

		const newUserID = user._id
		await Blog.insertMany(helper.initialBlogs.map(blog => ({ ...blog, user: newUserID })))

		const response = await api.post('/api/login').send({ username: 'test', password: 'password' })
		token = response.body.token
	})

	describe('while fetching blogs', () => {
		test('are returned as json', async () => {
			await api
				.get('/api/blogs')
				.expect(200)
				.expect('Content-Type', /application\/json/)
		})

		test('are all returned', async () => {
			const response = await api.get('/api/blogs')

			assert.strictEqual(response.body.length, helper.initialBlogs.length)
		})

		test('are all returned with property id', async () => {
			const response = await api.get('/api/blogs')
			const blogs = response.body

			blogs.forEach(blog => {
				assert(blog.id)
			});
		})
	})

	describe('while adding blogs', () => {
		test('a valid blog can be added', async () => {
			const newBlog = {
				title: "Test title",
				author: "Test author",
				url: "https://test.com/",
				likes: 0,
			}

			await api
				.post('/api/blogs')
				.send(newBlog)
				.set('Authorization', `Bearer ${token}`)
				.expect(201)
				.expect('Content-Type', /application\/json/)

			const blogsAtEnd = await helper.blogsInDb()
			assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

			const contents = blogsAtEnd.map(n => n.title)
			assert(contents.includes('Test title'))
		})

		test('blogs added without property likes, default to 0', async () => {
			const newBlog = {
				title: "Test title",
				author: "Test author",
				url: "https://test.com/",
			}

			const response = await api
				.post('/api/blogs')
				.send(newBlog)
				.set('Authorization', `Bearer ${token}`)
				.expect(201)
				.expect('Content-Type', /application\/json/)

			const addedBlog = response.body

			assert.strictEqual(addedBlog.likes, 0)
		})

		test('blogs added without property title, return error 404', async () => {
			const newBlog = {
				author: "Test author",
				url: "https://test.com/",
			}

			await api
				.post('/api/blogs')
				.set('Authorization', `Bearer ${token}`)
				.send(newBlog)
				.expect(400)
		})

		test('blogs added without property url, return error 404', async () => {
			const newBlog = {
				title: "Test title",
				author: "Test author",
			}

			await api
				.post('/api/blogs')
				.set('Authorization', `Bearer ${token}`)
				.send(newBlog)
				.expect(400)
		})

		test('blogs added without token, return error 401 Unauthorized', async () => {
			const newBlog = {
				title: "Test title",
				author: "Test author",
			}

			await api
				.post('/api/blogs')
				.send(newBlog)
				.expect(401)
		})
	})

	describe('while removing blogs', () => {
		test('a blog with valid id can be deleted', async () => {
			const blogsAtStart = await helper.blogsInDb()
			const blogToDelete = blogsAtStart[0]

			await api
				.delete(`/api/blogs/${blogToDelete.id}`)
				.set('Authorization', `Bearer ${token}`)
				.expect(204)

			const blogsAtEnd = await helper.blogsInDb()

			assert(!blogsAtEnd.includes(blogToDelete))

			assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
		})

		test('a blog with invalid id cant be deleted', async () => {
			await api
				.delete(`/api/blogs/12`)
				.set('Authorization', `Bearer ${token}`)
				.expect(400)
		})
	})

	describe('while editing blogs', () => {
		test('a blog with valid id can be edited', async () => {
			const blogsAtStart = await helper.blogsInDb()
			const blogToEdit = blogsAtStart[0]

			const editedBlog = { ...blogToEdit, likes: blogToEdit.likes + 1000 }

			await api
				.put(`/api/blogs/${blogToEdit.id}`)
				.send(editedBlog)
				.expect(201)

			const blogsAtEnd = await helper.blogsInDb()
			const updatedBlog = blogsAtEnd.find(blog => blog.id === blogToEdit.id)

			assert.ok(updatedBlog)
			assert.strictEqual(updatedBlog.likes, editedBlog.likes)
		})

		test('a blog with invalid id cant be edited', async () => {
			const blogsAtStart = await helper.blogsInDb()
			const blogToEdit = blogsAtStart[0]

			const editedBlog = { ...blogToEdit, likes: blogToEdit.likes + 1000 }

			await api
				.put(`/api/blogs/5a422bc61b54a676234d17fc`)
				.send(editedBlog)
				.expect(404)
		})
	})

	after(async () => {
		await mongoose.connection.close()
	})
})