const area = document.querySelector('textarea');
const socket = io()

const hash_string = s => Math.abs(s.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)).toString(16)

let texts = []

const find_last_text_by_server_id = (texts) => {
	let i = texts.length - 1
	for (; i >= 0; i--) {
		if (texts[i].from === 'server') {
			break;
		}
	}
	return texts[i].id
}

const textarea = {
	is_modified_by_client: (EventListenerType) => {
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
			from: 'client',
			last_id: find_last_text_by_server_id(texts),
			content: area.value,
			FLC_update: {
				first: first,
				last: last_last,
				content: area.value.slice(first, last_new),
			}
		}

		texts.push(new_text)
		const update = {
			id: new_text.id,
			last_id: new_text.last_id,
			FLC_update: new_text.FLC_update
		}
		$('#text-hash').text(update.id)
		socket.emit('update-text', update)
	}
}

socket.emit('ask-full-text', {}, (data) => {
	$('#textarea').val(data.content)
	texts.push(data)
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
	const data_text = texts.find(text => text.id === data.last_id)
	data.content = [data_text.content.slice(0, data.FLC_update.first), data.FLC_update.content, data_text.content.slice(data.FLC_update.last)].join('')
	const double_id = texts.findIndex(text => text.id === data.id)

	if (double_id < 0) {
		texts.push(data)
		const actual_cursor_position = $('#textarea').prop("selectionStart");
		$('#textarea').val(data.content)
		$('#text-hash').text(data.id)
		if (actual_cursor_position < data.FLC_update.first) {
			$('#textarea').prop('selectionEnd', actual_cursor_position);
		} else if (actual_cursor_position >= data.FLC_update.last) {
			$('#textarea').prop('selectionEnd', actual_cursor_position - (data.FLC_update.last - data.FLC_update.first) + data.FLC_update.content.length);
		} else {
			$('#textarea').prop('selectionEnd', data.FLC_update.first + data.FLC_update.content.length);
			console.log('okok last = ', data.FLC_update.first + data.FLC_update.content.length)
		}
	} else {
		texts[double_id] = data
	}
})

socket.on('synchronized-user', (data) => {
	$('#synchronized-user').text(data)
})