const crypto = require('crypto')

function Text(last_text = undefined, modification = undefined) {
	const _this = this
	if (last_text) {
		this.number = last_text.number + 1
		this.last_hash = last_text.hash
		if (modification == undefined) {
			throw new Error('modification is not specified')
		}
		this.author_id = modification.author_id
		this.modification = modification
		if (modification.first == undefined) {
			throw new Error('modification.first is not specified')
		} else if (modification.last == undefined) {
			throw new Error('modification.last is not specified')
		} else if (modification.content == undefined) {
			throw new Error('modification.content is not specified')
		}
		this.text = [last_text.text.slice(0, modification.first), modification.content, last_text.text.slice(modification.last)].join('')
	} else {
		this.text = ''
		this.number = 0
	}
	this.hash = crypto.createHash('md5').update(this.text + this.number.toString()).digest('hex')
	this.format = {
		replace: () => {
			return {
				type: 'replace',
				hash: _this.hash,
				text: _this.text
			}
		},
		update: () => {
			return {
				last_hash: _this.last_hash,
				type: 'update',
				hash: _this.hash,
				modification: _this.modification,
				author_id: _this.author_id
			}
		}
	}
}

module.exports = Text