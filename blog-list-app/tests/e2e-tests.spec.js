import { test, expect } from '@playwright/test'

let token = ''

test.describe('Blog-list', () => {
	test.beforeEach(async ({ request, page }) => {
		await request.post('http://localhost:3001/api/users', {
			data: {
				username: 'mluukkai',
				name: 'Matti Luukkainen',
				password: 'salainen'
			}
		})

		await page.goto('/')
	})

	test('front page can be opened', async ({ page }) => {
		await expect(page.getByText('blogs')).toBeVisible()
		await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
	})

	test('can login properly', async ({ page }) => {
		await page.getByRole('button', { name: 'login' }).click()
		await page.getByTestId('username').fill('mluukkai')
		await page.getByTestId('password').fill('salainen')
		await page.getByRole('button', { name: 'login' }).click()

		await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
	})

	test.describe('when logged in', () => {
		test.beforeEach(async ({ request }) => {
			const response = await request.post('http://localhost:3001/api/login', {
				data: {
					username: 'mluukkai',
					password: 'salainen',
				}
			})

			const body = await response.json()
			token = body.token
		})

		test('can add a new blog', async ({ page }) => {
			await page.getByRole('button', { name: 'new blog' }).click()
			await page.getByTestId('add-blog-title-field').fill('New title')
			await page.getByTestId('add-blog-author-field').fill('New Author')
			await page.getByTestId('add-blog-url-field').fill('New URL')
			await page.getByRole('button', { name: 'create' }).click()

			await expect(page.getByText('a new blog New title by New author added')).toBeVisible()
		})

		test.describe('when list of blogs exists', () => {
			test.beforeEach(async ({ request }) => {
				await request.post('http://localhost:3001/api/blogs', {
					data: {
						title: 'Testing with Playwright - A',
						author: 'author A',
						url: 'url A',
						likes: 0,
						user: { name: 'Test user A', username: 'TestUserA' }
					},
					headers: {
						Authorization: `Bearer ${token}`
					}
				})

				await request.post('http://localhost:3001/api/blogs', {
					data: {
						title: 'Testing with Playwright - B',
						author: 'author B',
						url: 'url B',
						likes: 0,
						user: { name: 'Test user B', username: 'TestUserB' }
					},
					headers: {
						Authorization: `Bearer ${token}`
					}
				})

				await request.post('http://localhost:3001/api/blogs', {
					data: {
						title: 'Testing with Playwright - C',
						author: 'author C',
						url: 'url C',
						likes: 0,
						user: { name: 'Test user C', username: 'TestUserC' }
					},
					headers: {
						Authorization: `Bearer ${token}`
					}
				})
			})

			test('can view a new blog', async ({ page }) => {
				const blogs = page.locator('.blog-container')
				const lastBlog = blogs.last()
				await lastBlog.getByRole('button', { name: 'view' }).click()

				await lastBlog.getByRole('button', { name: 'hide' }).toBeVisible()
				await lastBlog.getByRole('button', { name: 'like' }).toBeVisible()
				await lastBlog.getByRole('button', { name: 'delete' }).toBeVisible()
			})

			test('can like a blog', async ({ page }) => {
				const blogs = page.locator('.blog-container')
				const lastBlog = blogs.last()
				await lastBlog.getByRole('button', { name: 'view' }).click()

				await lastBlog.getByRole('button', { name: 'like' }).click()
				await expect(lastBlog.getByText('blog Testing with Playwright - C by author C has been liked')).toBeVisible()
			})

			test('can delete a blog', async ({ page }) => {
				page.on('dialog', dialog => dialog.accept())

				const blogs = page.locator('.blog-container')
				const lastBlog = blogs.last()
				await lastBlog.getByRole('button', { name: 'view' }).click()

				await lastBlog.getByRole('button', { name: 'delete' }).click()
				await expect(lastBlog.getByText('blog Testing with Playwright - C by author C has been deleted')).toBeVisible()
			})
		})
	})
})

test.afterAll('delete all blogs', async ({ request }) => {
	await request.post('http://localhost:3001/api/testing/reset')
})