import axios from 'axios'
const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api/blogs`

let token = null
const setToken = newToken => { token = `Bearer ${newToken}` }

const getAll = async () => {
	const request = axios.get(baseUrl)
	const response = await request
	return response.data
}

const create = async (newBlog) => {
	const config = { headers: { Authorization: token } }
	const request = axios.post(baseUrl, newBlog, config)
	const response = await request
	console.log(response.data)
	return response.data
}

const update = async (updatedBlog) => {
	const config = { headers: { Authorization: token } }
	const url = `${baseUrl}/${updatedBlog.id}`
	console.log(url, config)
	const request = axios.put(url, updatedBlog, config)
	const response = await request
	return response.data
}

const remove = async (blogToDelete) => {
	const config = { headers: { Authorization: token } }
	const url = `${baseUrl}/${blogToDelete.id}`
	console.log(url, config)
	const request = axios.delete(url, config)
	const response = await request
	return response.data
}

export default { getAll, create, update, remove, setToken }