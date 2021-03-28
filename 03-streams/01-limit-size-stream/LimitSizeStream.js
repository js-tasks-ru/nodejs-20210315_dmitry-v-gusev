const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {

  /**
   * Максимальный размер передаваемых данных в байтах
   * @type {number}
   */
  #limit = 0;
  #totalSize = 0;

  constructor(options) {
    super(options);

    if (typeof options.limit !== "undefined") {
      this.#limit = options.limit;
    } else {
      throw new Error('Missing options.limit')
    }
  }

  _transform(chunk, encoding, callback) {
    this.#totalSize += chunk.length;

    if (this.#totalSize > this.#limit) {
      callback(new LimitExceededError());
      return;
    }

    callback(null, chunk);
  }
}

module.exports = LimitSizeStream;
