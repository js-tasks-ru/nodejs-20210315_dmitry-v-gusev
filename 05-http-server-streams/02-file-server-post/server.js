const url = require('url');
const http = require('http');
const path = require('path');
const {createWriteStream, unlink} = require('fs');
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

      try {
        if (fs.existsSync(filepath)) {
          res.statusCode = 409;
          return res.end('Conflict.');
        }
      } catch (error) {
        console.error(error);
        res.statusCode = 500;
        return res.end('Internal Server Error');
      }

      const writeStream = createWriteStream(filepath);
      const limitedStream = new LimitSizeStream({limit: 10 ** 6}); // 1mb


      writeStream.on('error', (error) => {
        console.error(error);
        res.statusCode = 500;
        return res.end('Internal Server Error');
      });

      limitedStream.on('error', (error) => {
        console.error(error);
        if (error.code === 'LIMIT_EXCEEDED') {
          res.statusCode = 413;
          return res.end('Payload Too Large. The request body size should be less than 1MB');
        } else {
          res.statusCode = 500;
          return res.end('Internal Server Error');
        }
      });

      req.on('error', (error) => {
        console.error(error);
        res.statusCode = 500;
        return res.end('Internal Server Error');
      });

      req.on('aborted', (error) => {
        console.error(error);
        unlink(filepath, () => {});
        return res.end();
      });

      req.pipe(limitedStream).pipe(writeStream);

      res.end();
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
