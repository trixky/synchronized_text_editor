const area = document.querySelector('textarea');
const socket = io()

const my_id = Math.random().toString() + Date.now()

const textarea = {
	last_content: "",
	is_modified_by_client: function (from) {
		const len_last = this.last_content.length
		const len_new = area.value.length
		let first = 0;
		let last_last = len_last - 1;
		let last_new = len_new - 1;

		for (; first < len_last && first < len_new; first++) {
			if (this.last_content[first] != area.value[first]) {
				for (; last_last >= 0 && last_new >= 0; last_last-- , last_new--) {
					if (this.last_content[last_last] != area.value[last_new]) {
						break;
					}
				}
				break;
			}
		}
		last_last++
		last_new++
		this.last_content = area.value;
		socket.emit('update-text', {
			first: first,
			last: last_last,
			content: area.value.slice(first, last_new),
			hash: $('#text-hash').text(),
			author_id: my_id
		})
	},
	is_replaced_by_server: function (data) {
		$('#textarea').val(data.text)
		this.last_content = area.value;
	},
	is_updated_by_server: function (data) {
		if (data.last_hash == $('#text-hash').text()) {
			if (data.author_id != my_id) {
				const actual_text = $('#textarea').val()
				const actual_cursor_position = $('#textarea').prop("selectionStart");
				$('#textarea').val([actual_text.slice(0, data.modification.first), data.modification.content, actual_text.slice(data.modification.last)].join(''))
				if (actual_cursor_position < data.modification.first) {
					$('#textarea').prop('selectionEnd', actual_cursor_position);
				} else if (actual_cursor_position >= data.modification.last) {
					$('#textarea').prop('selectionEnd', actual_cursor_position - (data.modification.last - data.modification.first) + data.modification.content.length);
				} else {
					$('#textarea').prop('selectionEnd', data.modification.first + data.modification.content.length);
					console.log('okok last = ', data.modification.first + data.modification.content.length)
				}
				this.last_content = area.value;
			}
		} else {
			socket.emit('need-replace', {}, (data) => {
				$('#textarea').val(data.text)
				this.last_content = area.value;
			})
		}
	},
}

socket.on('update-text', (data) => {
	if (data.type === 'replace') {
		textarea.is_replaced_by_server(data)
	} else if (data.type === 'update') {
		textarea.is_updated_by_server(data)
	}
	$('#text-hash').text(data.hash)
})

socket.on('synchronized-user', (data) => {
	$('#synchronized-user').text(data)
})

textarea.last_content = area.value

if (area.addEventListener) {
	area.addEventListener('input', function () {
		textarea.is_modified_by_client('input')
	}, false);
} else if (area.attachEvent) {
	area.attachEvent('onpropertychange', function () {
		textarea.is_modified_by_client('onpropertychange')
	});
}
