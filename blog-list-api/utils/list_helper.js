const lodash = require('lodash')

const dummy = (blogs) => {
	return 1
}

const totalLikes = (blogs) => {
	let likes = 0
	blogs.forEach(blog => {
		likes += blog.likes
	});

	return likes
}

const favouriteBlog = (blogs) => {
	let currentBlog = blogs[0]

	blogs.forEach(blog => {
		if (blog.likes > currentBlog.likes) currentBlog = blog
	})

	return currentBlog
}

const mostBlogs = (blogs) => {
	const listAuthorBlogs = lodash.countBy(blogs, 'author')
	const arrayAuthorBlogs = lodash.map(listAuthorBlogs, (count, author) => ({
		author,
		blogs: count
	}))

	return lodash.maxBy(arrayAuthorBlogs, 'blogs')
}

const mostLikes = (blogs) => {
	const listAuthorBlogs = lodash.groupBy(blogs, 'author')
	const arrayAuthorBlogs = lodash.map(listAuthorBlogs, (blogs, author) => ({
		author,
		likes: lodash.sumBy(blogs, 'likes')
	}))

	return lodash.maxBy(arrayAuthorBlogs, 'likes')
}

module.exports = {
	dummy,
	totalLikes,
	favouriteBlog,
	mostBlogs,
	mostLikes
}