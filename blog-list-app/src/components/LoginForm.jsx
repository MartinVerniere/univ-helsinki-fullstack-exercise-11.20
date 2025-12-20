import { useState } from 'react'

const LoginForm = ({ login }) => {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')

	const loginUser = (event) => {
		event.preventDefault()
		login({
			username: username,
			password: password
		})

		setUsername('')
		setPassword('')
	}

	return (
		<form onSubmit={loginUser}>
			<div>
				<label>
					username
					<input
						type="text"
						data-testid="username"
						value={username}
						onChange={({ target }) => setUsername(target.value)}
					/>
				</label>
			</div>
			<div>
				<label>
					password
					<input
						type="password"
						data-testid="password"
						value={password}
						onChange={({ target }) => setPassword(target.value)}
					/>
				</label>
			</div>
			<button type='submit' data-testid="login-button">login</button>
		</form>
	)
}

export default LoginForm