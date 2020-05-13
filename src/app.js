const port = process.env.PORT || 3000

const path = require('path')
const express = require('express')

const app = express()

const http = require('http')
const server = http.createServer(app)

const socketio = require('socket.io')
const io = socketio(server)

// const crypto = require('crypto')
const Text = require('./Text.js')

app.use(express.static(path.join(__dirname, '../public')))

// ============================================================

let texts = []
const first_text = new Text().init.from_scratch();
texts.push(first_text)

console.log(texts[0])

io.on('connection', (socket) => {
	console.log('new connection ...')

	socket.on('ask-full-text', (data, callback) => {
		const last_text = texts[texts.length - 1]
		callback(last_text.format.full())
	})

	socket.on('update-text', (data) => {
		console.log(data)
		const last_text = texts[texts.length - 1]
		if (data.last_id === last_text.id) {
			const new_text = new Text().init.from_fresh_update(data, last_text)
			texts.push(new_text)
			socket.broadcast.emit('update-text', data)
		}
	})
})

// ============================================================

server.listen(port, () => {
	console.log('Server up on port ' + port)
})



















// let clients = []
// let texts = []

// texts.push(new Text())

// const last_text = (texts) => {
// 	const len = texts.length
// 	let last_text_finded = texts[0]

// 	for (let i = 0; i < len; i++) {
// 		if (texts[i].number > last_text_finded.number) {
// 			last_text_finded = texts[i]
// 		}
// 	}
// 	return (last_text_finded)
// }

// const find_text_by_hash = (texts, hash) => {
// 	const len = texts.length

// 	for (let i = 0; i < len; i++) {
// 		if (texts[i].hash == hash) {
// 			return texts[i]
// 		}
// 	}
// 	return undefined
// }

// const is_the_same_client = (texts, last_text_finded, modification) => {
// 	let temp_text = last_text_finded
// 	while (temp_text != undefined && temp_text.author_id === modification.author_id) {
// 		if (temp_text.hash = modification.hash) {
// 			return true
// 		}
// 		temp_text = find_text_by_hash(texts, temp_text.last_hash)
// 	}
// 	return (false)
// }

// io.on('connection', (client) => {
// 	clients.push(client)
// 	client.emit('update-text', last_text(texts).format.replace())
// 	io.emit('synchronized-user', clients.length)

// 	client.on('update-text', (data) => {
// 		const last_text_finded = last_text(texts)
// 		if (data.hash === last_text_finded.hash || is_the_same_client(texts, last_text_finded, data)) {
// 			const new_text = new Text(last_text_finded, data)
// 			texts.push(new_text)
// 			io.emit('update-text', new_text.format.update());
// 		} else {
// 			client.emit('update-text', last_text_finded.format.replace())
// 		}
// 	})

// 	client.on('need-replace', (data, callback) => {
// 		callback(last_text(texts).format.replace())
// 	})

// 	client.on('disconnect', () => {
// 		clients.pop(client)
// 		io.emit('synchronized-user', clients.length)
// 	})
// })

// app.post('/create_session', (req, res) => {
// 	const session_hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex')
// 	console.log(session_hash)
// 	res.status(200).send({ success: 'ok', session_hash })
// })