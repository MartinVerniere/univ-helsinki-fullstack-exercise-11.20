import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('when testing a blog', () => {
	test('renders only title and author at start', async () => {
		const blogObject = {
			title: 'Component testing is done with react-testing-library',
			author: 'author for the test',
			url: 'url for the test',
			likes: 1,
			user: { name: 'Test user', username: 'TestUser' }
		}

		const userObject = { username: 'CurrentUser' }

		const likeBlog = vi.fn()
		const deleteBlog = vi.fn()

		render(<Blog blog={blogObject} user={userObject} likeBlog={likeBlog} deleteBlog={deleteBlog} />)

		//screen.debug()

		const titleElement = screen.queryByText('Component testing is done with react-testing-library')
		const authorElement = screen.queryByText('author for the test')
		const urlElement = screen.getByText('url for the test')
		const likesElement = screen.getByText(/likes: 1/i)



		expect(titleElement).toBeDefined()
		expect(authorElement).toBeDefined()
		expect(urlElement).not.toBeVisible()
		expect(likesElement).not.toBeVisible()
	})

	test('renders url and likes are shown when clicking "view" button', async () => {
		const blogObject = {
			title: 'Component testing is done with react-testing-library',
			author: 'author for the test',
			url: 'url for the test',
			likes: 1,
			user: { name: 'Test user', username: 'TestUser' }
		}

		const userObject = { username: 'CurrentUser' }

		const likeBlog = vi.fn()
		const deleteBlog = vi.fn()

		render(<Blog blog={blogObject} user={userObject} likeBlog={likeBlog} deleteBlog={deleteBlog} />)

		//screen.debug()

		const user = userEvent.setup()
		const button = screen.getByText('view')
		await user.click(button)

		const urlElement = screen.queryByText('url for the test')
		const likesElement = screen.queryByText(1)

		expect(urlElement).toBeDefined()
		expect(likesElement).toBeDefined()
	})

	test('when clicking "view" button twice, event handler is called twice', async () => {
		const blogObject = {
			title: 'Component testing is done with react-testing-library',
			author: 'author for the test',
			url: 'url for the test',
			likes: 1,
			user: { name: 'Test user', username: 'TestUser' }
		}

		const userObject = { username: 'CurrentUser' }

		const likeBlog = vi.fn()
		const deleteBlog = vi.fn()

		render(<Blog blog={blogObject} user={userObject} likeBlog={likeBlog} deleteBlog={deleteBlog} />)

		//screen.debug()

		const user = userEvent.setup()
		const button = screen.getByText('view')
		const likeButton = screen.getByText('like')
		await user.click(button)
		await user.click(likeButton)
		await user.click(likeButton)

		expect(likeBlog.mock.calls).toHaveLength(2)
	})
})