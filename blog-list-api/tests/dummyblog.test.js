import { test } from 'node:test'
import { strictEqual } from 'node:assert'
import listHelper from '../utils/list_helper.js'

const { dummy } = listHelper

test('dummy returns one', () => {
	const blogs = []

	const result = dummy(blogs)
	strictEqual(result, 1)
})