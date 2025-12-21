import { useState } from 'react'

const Blog = ({ blog, likeBlog, user, deleteBlog }) => {
	const blogStyle = {
		paddingTop: 10,
		paddingLeft: 2,
		border: 'solid',
		borderWidth: 1,
		marginBottom: 5
	}

	const [visible, setVisible] = useState(false)

	//const hideWhenVisible = { display: visible ? 'none' : '' }
	const showWhenVisible = { display: visible ? '' : 'none' }

	const toggleVisibility = () => {
		setVisible(!visible)
	}

	const like = (event) => {
		event.preventDefault()
		likeBlog({
			id: blog.id,
			user: blog.user.id,
			likes: blog.likes + 1,
			author: blog.author,
			title: blog.title,
			url: blog.url
		})
	}

	const remove = (event) => {
		event.preventDefault()
		deleteBlog({
			id: blog.id,
			user: blog.user.id,
			likes: blog.likes,
			author: blog.author,
			title: blog.title,
			url: blog.url
		})
	}

	return (
		<div style={blogStyle}>
			<div className='general-info'>
				{blog.title} {blog.author}
				<button
					data-testid="view-blog-button"
					onClick={toggleVisibility}
				>
					{visible ? 'hide' : 'view'}
				</button>
			</div>
			<div style={showWhenVisible} className='detailed-info'>
				<div className='url'>
					{blog.url}
				</div>
				<div className='likes'>
					likes: {blog.likes} <button data-testid="like-blog-button" onClick={like}>like</button>
				</div>
				<div className='user'>
					{blog.user && blog.user.name}
				</div>
				<div className='delete'>
					{blog.user && (blog.user.username === user.username) &&
						<button data-testid="delete-blog-button" onClick={remove}>delete</button>
					}
				</div>
			</div>
		</div >
	)
}

export default Blog