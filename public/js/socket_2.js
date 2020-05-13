import { Text } from '/js/Text.js';

const area = document.querySelector('textarea');
const socket = io()

const hash_string = s => s.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0).toString(16)

let texts = []

const textarea = {
	is_modified_by_client: (EventListenerType) => {
		console.log('is_modified_by_client:', EventListenerType)
		const last_text = texts[texts.length - 1]
		const last_content = last_text.content
		const len_last = last_content.length
		const len_new = area.value.length
		let first = 0;
		let last_last = len_last - 1;
		let last_new = len_new - 1;

		for (; first < len_last && first < len_new; first++) {
			if (last_content[first] != area.value[first]) {
				for (; last_last >= 0 && last_new >= 0; last_last-- , last_new--) {
					if (last_content[last_last] != area.value[last_new]) {
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

		console.log(texts)

		socket.emit('update-text', {
			id: new_text.id,
			last_id: new_text.last_id,
			FLC_update: new_text.FLC_update
		})
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
		textarea.is_modified_by_client('input')
	}, false);
} else if (area.attachEvent) {
	area.attachEvent('onpropertychange', () => {
		textarea.is_modified_by_client('onpropertychange')
	});
}

socket.on('update-text', (data) => {
	console.log('on a recu une nouvell info')
	const last_text = texts.find(text => text.id === data.last_id)

	// const actual_cursor_position = $('#textarea').prop("selectionStart");
	data.content = [last_text.content.slice(0, data.FLC_update.first), data.FLC_update.content, last_text.content.slice(data.FLC_update.last)].join('')
	texts = [data]
	$('#textarea').val(data.content)
	// if (actual_cursor_position < data.FLC_update.first) {
	// 	$('#textarea').prop('selectionEnd', actual_cursor_position);
	// } else if (actual_cursor_position >= data.FLC_update.last) {
	// 	$('#textarea').prop('selectionEnd', actual_cursor_position - (data.FLC_update.last - data.FLC_update.first) + data.FLC_update.content.length);
	// } else {
	// 	$('#textarea').prop('selectionEnd', data.FLC_update.first + data.FLC_update.content.length);
	// 	console.log('okok last = ', data.FLC_update.first + data.FLC_update.content.length)
	// }
	console.log(data)
	console.log(texts)
})