import { useState } from 'react'

const BlogsForm = ({ createBlog }) => {
	const [title, setTitle] = useState('')
	const [author, setAuthor] = useState('')
	const [url, setURL] = useState('')

	const addBlog = (event) => {
		event.preventDefault()
		createBlog({
			title: title,
			author: author,
			url: url
		})

		setTitle('')
		setAuthor('')
		setURL('')
	}
	return (
		<form onSubmit={addBlog}>
			<div>
				<label>
          title
					<input
						type="text"
						value={title}
						onChange={({ target }) => setTitle(target.value)}
					/>
				</label>
			</div>
			<div>
				<label>
          author
					<input
						type="text"
						value={author}
						onChange={({ target }) => setAuthor(target.value)}
					/>
				</label>
			</div>
			<div>
				<label>
          url
					<input
						type="text"
						value={url}
						onChange={({ target }) => setURL(target.value)}
					/>
				</label>
			</div>
			<button type="submit">create</button>
		</form>
	)
}

export default BlogsForm