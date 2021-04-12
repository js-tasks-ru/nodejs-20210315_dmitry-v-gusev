const app = require('./app');

app.on('error', (error, ctx) => {
  console.log(error);
})

app.listen(3000, () => {
  console.log('App is running on http://localhost:3000');
});
