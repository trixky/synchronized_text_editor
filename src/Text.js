function Text() {
	const _this = this;

	this.id = '';
	this.last_id = '';
	this.content = '';
	this.FLC_update = {
		first: 0,
		last: 0,
		content: ''
	}
	this.init = {
		from_scratch: () => {
			_this.content = 'a enlever'; // ------------ a enlever
			_this.id = '118b537e'
			return _this
		},
		from_fresh_update: (data, TOP_text) => {
			_this.id = data.id
			_this.last_id = TOP_text.id;
			_this.content = [TOP_text.content.slice(0, data.FLC_update.first), data.FLC_update.content, TOP_text.content.slice(data.FLC_update.last)].join('')
			_this.FLC_update = data.FLC_update
			return _this
		},
		from_old_update: (data, OLD_text, TOP_text) => {
			const len_old = OLD_text.content.length
			const len_top = TOP_text.content.length

			let first = 0;
			let last = 0;

			for (; first < len_old && first < len_top; first++) {
				if (OLD_text.content[first] != TOP_text.content[first]) {
					break;
				}
			}
			for (; len_old - last >= 0 && len_top - last >= 0; last++) {
				if (OLD_text.content[last] != TOP_text.content[last]) {
					break;
				}
			}
			let new_text_left = undefined
			let new_text_right = undefined
			if (data.FLC_update.first > (first + data.FLC_update.content.length)) {
				const shift = (len_top - first - last) - (len_old - first - last)
				data.FLC_update.first += shift
				data.FLC_update.last += shift
				new_text_right = _this.init.from_fresh_update(data, TOP_text)
				return new_text_right
			}
			else {
				new_text_left = _this.init.from_fresh_update(data, TOP_text)
				return new_text_left
			}
		}
	}
	this.format = {
			full: () => {
				return {
					id: _this.id,
					from: 'server',
					last_id: _this.last_id,
					content: _this.content,
					FLC_update: _this.FLC_update
				}
			},
			update: () => {
				return {
					id: _this.id,
					from: 'server',
					last_id: _this.last_id,
					FLC_update: _this.FLC_update
				}
			}
		}
	}

	module.exports = Text