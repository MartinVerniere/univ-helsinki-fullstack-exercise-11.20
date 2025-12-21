import Blog from './Blog'

const BlogList = ({ blogs, likeBlog, user, deleteBlog }) => {
	return (
		<div className='blog-container'>
			{blogs.map(blog =>
				<Blog
					key={blog.id}
					blog={blog}
					likeBlog={likeBlog}
					user={user}
					deleteBlog={deleteBlog}
				/>
			)}
		</div>
	)
}

export default BlogList