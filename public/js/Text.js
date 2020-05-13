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
		from_fresh_update: (data, TOP_text) => {
			_this.id = data.id
			_this.last_id = data.last_id;
			_this.content = [TOP_text.content.slice(0, data.FLC_update.first), data.FLC_update.content, TOP_text.content.slice(data.FLC_update.last)].join('')
			_this.FLC_update = data.FLC_update
			return _this
		}
	}
	this.format = {
		full: () => {
			return {
				id: _this.id,
				last_id: _this.last_id,
				content: _this.content,
				FLC_update: _this.FLC_update
			}
		}
	}
}

export { Text };