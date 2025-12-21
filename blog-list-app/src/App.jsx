import { useState, useEffect, useRef } from 'react'
import blogService from './services/blogs'
import loginService from './services/login'
import BlogList from './components/BlogList'
import LoginForm from './components/LoginForm'
import BlogsForm from './components/BlogsForm'
import Notification from './components/Notification'
import Togglable from './components/Togglable'

const App = () => {
	const [blogs, setBlogs] = useState([])
	const [user, setUser] = useState(null)
	const [message, setMessage] = useState(null)

	const blogFormRef = useRef()

	const login = async (userObject) => {
		try {
			const user = await loginService.login(userObject)
			window.localStorage.setItem('loggedNoteappUser', JSON.stringify(user))
			blogService.setToken(user.token)
			setUser(user)
		} catch (error) {
			console.log(error)
			setMessage('invalid username or password')
			setTimeout(() => {
				setMessage(null)
			}, 5000)
		}
	}

	const handleLogout = () => {
		window.localStorage.removeItem('loggedNoteappUser')
		blogService.setToken(null)
		setUser(null)
	}

	const createBlog = async (blogObject) => {
		try {
			const blogAdded = await blogService.create(blogObject)
			blogFormRef.current.toggleVisibility()
			setBlogs(blogs.concat(blogAdded))
			setMessage(`a new blog ${blogAdded.title} by ${blogAdded.author} added`)

			setTimeout(() => {
				setMessage(null)
			}, 5000)
		} catch (error) {
			console.log(error)
			setMessage(`Blog '${blogObject.title}' couldnt be added to the list`)

			setTimeout(() => {
				setMessage(null)
			}, 5000)
		}
	}

	const likeBlog = async (blogObject) => {
		try {
			const blogLiked = await blogService.update(blogObject)
			console.log(blogLiked)
			setMessage(`blog ${blogLiked.title} by ${blogLiked.author} has been liked`)

			setBlogs(blogs.map(blog => blog.id === blogLiked.id ? blogLiked : blog))

			setTimeout(() => {
				setMessage(null)
			}, 5000)
		} catch (error) {
			console.log(error)
			setMessage(`Blog '${blogObject.title}' couldnt be liked`)

			setTimeout(() => {
				setMessage(null)
			}, 5000)
		}
	}

	const deleteBlog = async (blogObject) => {
		if (window.confirm(`Remove blog "${blogObject.title}" by ${blogObject.author}?`)) {
			try {
				await blogService.remove(blogObject)
				setMessage(`blog ${blogObject.title} by ${blogObject.author} has been deleted`)

				setBlogs(blogs.filter(blog => blog.id !== blogObject.id))

				setTimeout(() => {
					setMessage(null)
				}, 5000)
			} catch (error) {
				console.log(error)
				setMessage(`Blog '${blogObject.title}' couldnt be deleted`)

				setTimeout(() => {
					setMessage(null)
				}, 5000)
			}
		} else {
			console.log('Delete canceled')
			return
		}
	}

	const loginForm = () => (
		<Togglable data-testid="show-login-form" buttonLabel="login" ref={null}>
			<LoginForm login={login} />
		</Togglable>
	)

	const blogForm = () => (
		<Togglable data-testid="show-blog-form" buttonLabel="new blog" ref={blogFormRef}>
			<h2>Create new</h2>
			<BlogsForm createBlog={createBlog} likeBlog={likeBlog} />
		</Togglable>
	)

	const sortComparison = (firstBlog, secondBlog) => secondBlog.likes - firstBlog.likes

	useEffect(() => {
		blogService.getAll().then(blogs =>
			setBlogs(blogs.sort(sortComparison))
		)
	}, [])

	useEffect(() => {
		const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
		if (loggedUserJSON) {
			const user = JSON.parse(loggedUserJSON)
			setUser(user)
			blogService.setToken(user.token)
		}
	}, [])

	useEffect(() => {
		setBlogs(blogs.sort(sortComparison))
	}, [blogs])

	return (
		<div>
			<h1>Blogs</h1>
			{message && <Notification message={message} />}

			{!user && loginForm()}

			{user &&
				<div>
					<div>{user.name} logged in</div>
					<button onClick={() => handleLogout()}>logout</button>
					<h2>blogs</h2>
					{blogForm()}
					<BlogList blogs={blogs} likeBlog={likeBlog} user={user} deleteBlog={deleteBlog} />
				</div>
			}
			<footer>Version 1.0.1</footer>
		</div >
	)
}

export default App