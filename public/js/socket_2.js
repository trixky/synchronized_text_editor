import { Text } from '/js/Text.js';

const area = document.querySelector('textarea');
const socket = io()

const hash_string = s => s.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0).toString(16)

let texts = []

const textarea = {
	is_modified_by_client: (EventListenerType) => {
		console.log('   222')
		const last_text = texts[texts.length - 1]
		const last_content = last_text.content
		const len_last = last_content.length
		const len_new = area.value.length
		let first = 0;
		let last_last = len_last - 1;
		let last_new = len_new - 1;
		
		for (; first < len_last && first < len_new; first++) {
			if (last_content[first] != area.value[first]) {
				for (; last_last >= 0 && last_new >= 0 && last_last > first && last_new > first; last_last-- , last_new--) {
					if (last_content[last_last] != area.value[last_new]) {
						console.log('different', last_content[last_last], area.value[last_new])
						console.log('different', last_last, last_new)
						break;
					}
				}
				break;
			}
		}
		
		last_last++
		last_new++

		const new_text = {
			id: hash_string(Date.now().toString() + Math.random().toString()),
			last_id: last_text.id,
			content: area.value,
			FLC_update: {
				first: first,
				last: last_last,
				content: area.value.slice(first, last_new),
			}
		}
		
		texts.push(new_text)
		
		socket.emit('update-text', {
			id: new_text.id,
			last_id: new_text.last_id,
			FLC_update: new_text.FLC_update
		})
		console.log('voilia ce que on envoi :')
		console.log(new_text.FLC_update)
		console.log('      333')
	}
}

console.log(hash_string('first text id'))

socket.emit('ask-full-text', {}, (data) => {
	$('#textarea').val(data.content)
	texts.push(data)
	console.log('---------------------')
	console.log(data)
	console.log(texts)
	console.log('---------------------')
})

if (area.addEventListener) {
	area.addEventListener('input', () => {
		console.log('^^^^^^^^^^^^^^^')
		console.log('111')
		textarea.is_modified_by_client('input')
		console.log('         444')
	}, false);
} else if (area.attachEvent) {
	area.attachEvent('onpropertychange', () => {
		textarea.is_modified_by_client('onpropertychange')
	});
}

socket.on('update-text', (data) => {
	const last_text = texts.find(text => text.id === data.last_id)
	
	data.content = [last_text.content.slice(0, data.FLC_update.first), data.FLC_update.content, last_text.content.slice(data.FLC_update.last)].join('')
	texts = [data]
	$('#textarea').val(data.content)
})