const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':

      if (/\/(.)/.test(pathname)) {
        res.statusCode = 400;
        return res.end('Bad request');
      }

      fs.unlink(filepath, (error) => {
        if (error && error.code === 'ENOENT') {
          console.log(error);
          res.statusCode = 404;
          return res.end('Not found');
        } else if (error) {
          res.statusCode = 500;
          return res.end('Internal Server Error');
        }
        res.statusCode = 200;
        return res.end();
      });


      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
