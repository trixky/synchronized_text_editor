const port = process.env.PORT || 3000

const path = require('path')
const express = require('express')

const app = express()

const http = require('http')
const server = http.createServer(app)

const socketio = require('socket.io')
const io = socketio(server)

const Text = require('./Text.js')

app.use(express.static(path.join(__dirname, '../public')))

const sleep = (ms) => {
	return new Promise((resolve, refect) => {
		setTimeout(() => {
			resolve('sleep' + ms.toString())
		}, ms)
	})
}

const find_text_by_id = (texts, id) => {
	len = texts.length
	for (let i = 0; i < len; i++) {
		if (texts[i].id === id) {
			return texts[i]
		}
	}
	return undefined
}

let texts = [new Text().init.from_scratch()]

io.on('connection', (socket) => {

	socket.on('ask-full-text', (data, callback) => {
		const last_text = texts[texts.length - 1]
		callback(last_text.format.full())
	})

	socket.on('update-text', async (data) => {
		const last_text = texts[texts.length - 1]
		const old_text = find_text_by_id(texts, data.last_id)
		if (old_text == undefined) {
			return;
		}
		const new_text = new Text().init.from_old_update(data, old_text, last_text)
		if (new_text == undefined) {
			return;
		}
		new_text.last_id = last_text.id
		texts.push(new_text)
		const update_to_emit = new_text.format.update()
		socket.emit('update-text', update_to_emit)
		socket.broadcast.emit('update-text', update_to_emit)
	})
})

server.listen(port, () => {
	console.log('Server up on port ' + port)
})
