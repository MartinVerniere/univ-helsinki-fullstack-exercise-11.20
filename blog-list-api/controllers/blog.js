import { Router } from 'express'
import Blog from '../models/blog.js'
import middleware from '../utils/middleware.js'

const blogsRouter = Router()

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, url: 1, likes: 1 })
	response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
	const blog = await Blog.findById(request.params.id)
	if (blog) {
		response.json(blog)
	} else {
		response.status(404).end()
	}
})

blogsRouter.post('/', middleware.tokenExtractor, middleware.userExtractor, async (request, response) => {
	const user = request.user
	const body = request.body
	if (!body.url || !body.title) { response.status(400).json({ error: 'title and url are required' }) }

	const blog = new Blog({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes || 0,
		user: user._id
	})

	const savedBlog = await blog.save()
	user.blogs = user.blogs.concat(savedBlog._id)
	await user.save()

	const savedBlogWithUser = await Blog.findById(savedBlog._id).populate('user', { username: 1, name: 1, url: 1, likes: 1 })
	response.status(201).json(savedBlogWithUser)
})

blogsRouter.delete('/:id', middleware.tokenExtractor, middleware.userExtractor, async (request, response) => {
	const blogToDelete = await Blog.findById(request.params.id)
	if (!blogToDelete) { return response.status(400).json({ error: 'Blog doesnt exist' }) }
	const blogCreatorId = blogToDelete.user.toString()

	const user = request.user

	if (blogCreatorId !== user.id.toString()) { return response.status(401).json({ error: 'Not authorized to delete this blog' }) }

	await Blog.findByIdAndDelete(request.params.id)

	response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
	const { id } = request.params
	const { title, author, url, likes, user } = request.body

	console.log('id: ', id)

	const blogToUpdate = await Blog.findById(id)

	if (!blogToUpdate) return response.status(404).end()

	blogToUpdate.title = title || blogToUpdate.title
	blogToUpdate.author = author || blogToUpdate.author
	blogToUpdate.url = url || blogToUpdate.url
	blogToUpdate.likes = likes || blogToUpdate.likes
	blogToUpdate.user = user || blogToUpdate.user

	const updatedBlog = await blogToUpdate.save()

	const blogWithUser = await updatedBlog.populate('user', { username: 1, name: 1 })

	response.status(201).json(blogWithUser)
})

export default blogsRouter