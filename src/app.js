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
let sockets_number = 0;

io.on('connection', (socket) => {
	sockets_number++
	socket.broadcast.emit('synchronized-user', sockets_number)
	socket.emit('synchronized-user', sockets_number)
	
	socket.on('ask-full-text', (data, callback) => {
		const last_text = texts[texts.length - 1]
		callback(last_text.format.full())
	})

	socket.on('update-text', async (data) => {
		console.log('\n\n\n\n\n')
		const last_text = texts[texts.length - 1]
		const old_text = find_text_by_id(texts, data.last_id)
		if (old_text == undefined) {
			return;
		}
		console.log(')))) on donne start')
		console.log(old_text.content)
		console.log(last_text.content)
		console.log(')))) on donne end')
		const new_text = new Text().init.from_old_update(data, old_text, last_text, socket.id)
		if (new_text == undefined) {
			return;
		}
		new_text.last_id = last_text.id
		texts.push(new_text)
		const update_to_emit = new_text.format.update()
		// await sleep(3000)
		socket.emit('update-text', update_to_emit)
		socket.broadcast.emit('update-text', update_to_emit)
	})
	
	socket.on('disconnect', () => {
		sockets_number--
		socket.broadcast.emit('synchronized-user', sockets_number)
	})
})

server.listen(port, () => {
	console.log('Server up on port ' + port)
})
