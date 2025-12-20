import app from './app.js'
import config from './utils/config.js'
import logger from './utils/logger.js'

const { listen } = app
const { PORT } = config
const { info } = logger

listen(PORT, () => {
	info(`Server running on port ${PORT}`)
})