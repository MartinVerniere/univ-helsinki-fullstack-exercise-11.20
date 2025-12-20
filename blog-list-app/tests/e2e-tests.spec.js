import { test, expect } from '@playwright/test'

test.describe('Blog-list', () => {
	test.beforeEach(async ({ request, page }) => {
		await request.post('http://localhost:3001/api/testing/reset')

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
		await expect(page.getByText('login')).toBeVisible()
	})

	test('can login properly', async ({ page }) => {
		await page.getByTestId('show-login-form').click()
		await page.getByTestId('username').fill('mluukkai')
		await page.getByTestId('password').fill('salainen')
		await page.getByTestId('login-button').click()

		await expect(
			page.getByText('Matti Luukkainen logged in')
		).toBeVisible()
	})
})