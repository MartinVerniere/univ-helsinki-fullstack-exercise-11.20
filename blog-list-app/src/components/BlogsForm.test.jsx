import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogsForm from './BlogsForm'

describe('when testing a blog form', () => {
	test('renders only title and author at start', async () => {
		const user = userEvent.setup()

		const createBlog = vi.fn()

		render(<BlogsForm createBlog={createBlog} />)

		//screen.debug()

		const titleInput = screen.getByLabelText('title')
		const authorInput = screen.getByLabelText('author')
		const urlInput = screen.getByLabelText('url')
		const createButton = screen.getByText('create')

		await user.type(titleInput, 'testing a blog title...')
		await user.type(authorInput, 'testing a blog author...')
		await user.type(urlInput, 'testing a blog url...')
		await user.click(createButton)

		console.log('blog created:', createBlog.mock.calls[0][0])

		expect(createBlog.mock.calls).toHaveLength(1)
		expect(createBlog.mock.calls[0][0].title).toBe('testing a blog title...')
		expect(createBlog.mock.calls[0][0].author).toBe('testing a blog author...')
		expect(createBlog.mock.calls[0][0].url).toBe('testing a blog url...')
	})
})