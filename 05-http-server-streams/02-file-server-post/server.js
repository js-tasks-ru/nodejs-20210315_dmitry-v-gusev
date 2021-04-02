const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', async (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':

      // Simple validation
      if (!/^[a-zA-Z0-9_.-]*$/.test(pathname)) {
        res.statusCode = 400;
        return res.end(
            'Bad request. ' +
            'Check filename. You can use letters, numbers, underscore, dash and point.',
        );
      }

      const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});
      const limitedStream = new LimitSizeStream({limit: 10 ** 6}); // 1mb

      writeStream.on('error', (error) => {
        if (error.code === 'EEXIST') {
          res.statusCode = 409;
          return res.end('Conflict.');
        }
        res.statusCode = 500;
        return res.end('Internal Server Error');
      }).on('close', () => {
        res.statusCode = 201;
        res.end('File created');
      });

      limitedStream.on('error', (error) => {
        if (error.code === 'LIMIT_EXCEEDED') {
          fs.unlink(filepath, (err) => console.dir(err));
          res.statusCode = 413;
          return res.end('Payload Too Large. The request body size should be less than 1MB');
        }
        res.statusCode = 500;
        return res.end('Internal Server Error');
      });

      res.on('close', (error) => {
        if (res.finished) return;
        fs.unlink(filepath, () => {});
        return res.end();
      });

      req.pipe(limitedStream).pipe(writeStream);

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
