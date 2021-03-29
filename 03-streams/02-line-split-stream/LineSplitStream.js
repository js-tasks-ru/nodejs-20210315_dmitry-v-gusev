const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {

  /**
   * Свойство для хранения строки до разделителя
   * @type {string}
   */
  #cachedString = '';

  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    const chunkAsString = chunk.toString();
    const [firstElement, ...restString] = chunkAsString.split(os.EOL);

    if (restString.length === 0) {
      this.#cachedString += firstElement;
      callback();
      return;
    }

    this.push(this.#cachedString + firstElement);
    this.#cachedString = restString.pop();
    restString.forEach((string) => this.push(string));

    callback();
  }

  _flush(callback) {
    if (this.#cachedString) {
      this.push(this.#cachedString)
    }
    callback();
  }

}

module.exports = LineSplitStream;
