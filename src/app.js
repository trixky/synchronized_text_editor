const port = process.env.PORT || 3000

const path = require('path')
const express = require('express')

const app = express()

const http = require('http')
const server = http.createServer(app)

const socketio = require('socket.io')
const io = socketio(server)

const crypto = require('crypto')
const Text = require('./Text.js')

app.use(express.static(path.join(__dirname, '../public')))

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../public/index.html'))
})

let clients = []
let texts = []

texts.push(new Text())

const last_text = function (texts) {
	const len = texts.length
	let last_text_finded = texts[0]

	for (let i = 0; i < len; i++) {
		if (texts[i].number > last_text_finded.number) {
			last_text_finded = texts[i]
		}
	}
	return (last_text_finded)
}

io.on('connection', (client) => {
	clients.push(client)
	client.emit('update-text', last_text(texts).format.replace())
	io.emit('synchronized-user', clients.length)

	client.on('update-text', (data) => {
		const last_text_finded = last_text(texts)
		if (data.hash === last_text_finded.hash) {
			const new_text = new Text(last_text_finded, data)
			texts.push(new_text)
			io.emit('update-text', new_text.format.update());
		} else {
			client.emit('update-text', last_text_finded.format.replace())
		}
	})

	client.on('need-replace', (data, callback) => {
		callback(last_text(texts).format.replace())
	})

	client.on('disconnect', () => {
		clients.pop(client)
		io.emit('synchronized-user', clients.length)
	})
})

server.listen(port, () => {
	console.log('Server up on port ' + port)
})