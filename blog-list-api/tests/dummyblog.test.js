import { test } from 'node:test'
import { strictEqual } from 'node:assert'
import { dummy } from '../utils/list_helper.js'

test('dummy returns one', () => {
	const blogs = []

	const result = dummy(blogs)
	strictEqual(result, 1)
})