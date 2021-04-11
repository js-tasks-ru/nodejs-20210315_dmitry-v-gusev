const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

router.get('/subscribe', async (ctx, next) => {
  const newMessage = await new Promise( (resolve) => {
    ctx.app.on('newMessage', (message) => {
      if (message) resolve(message);
    });
    ctx.res.on('close', () => resolve());
  });

  ctx.res.statusCode = 200;
  ctx.res.end(newMessage);
});

router.post('/publish', async (ctx, next) => {

  if (!ctx.accepts('json')) {
    ctx.throw(406, 'json only');
  }
  ctx.body = ctx.request.body;
  const message  = ctx.request.body.message;

  if (message === undefined) {
    ctx.throw(400);
  }

  ctx.app.emit('newMessage', message);

  ctx.status = 200;
  ctx.body = {status: 'Ok'};

});

app.use(router.routes());

module.exports = app;
