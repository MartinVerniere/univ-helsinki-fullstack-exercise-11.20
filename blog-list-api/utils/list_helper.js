import { countBy, map, maxBy, groupBy, sumBy } from 'lodash'

const dummy = () => {
	return 1
}

const totalLikes = (blogs) => {
	let likes = 0
	blogs.forEach(blog => { likes += blog.likes })

	return likes
}

const favouriteBlog = (blogs) => {
	let currentBlog = blogs[0]

	blogs.forEach(blog => { if (blog.likes > currentBlog.likes) currentBlog = blog })

	return currentBlog
}

const mostBlogs = (blogs) => {
	const listAuthorBlogs = countBy(blogs, 'author')
	const arrayAuthorBlogs = map(listAuthorBlogs, (count, author) => ({
		author,
		blogs: count
	}))

	return maxBy(arrayAuthorBlogs, 'blogs')
}

const mostLikes = (blogs) => {
	const listAuthorBlogs = groupBy(blogs, 'author')
	const arrayAuthorBlogs = map(listAuthorBlogs, (blogs, author) => ({
		author,
		likes: sumBy(blogs, 'likes')
	}))

	return maxBy(arrayAuthorBlogs, 'likes')
}

export default {
	dummy,
	totalLikes,
	favouriteBlog,
	mostBlogs,
	mostLikes
}