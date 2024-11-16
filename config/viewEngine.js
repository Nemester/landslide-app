const exphbs = require('express-handlebars');
const dayjs = require('dayjs');

module.exports = (app) => {
  app.engine(
    'handlebars',
    exphbs.engine({
      defaultLayout: 'main',
      extname: '.hbs',
      helpers: {
        formatDate: (date) => dayjs(date).format('YYYY-MM-DD'),
        formatDateTime: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
        add: (a, b) => a + b,
        subtract: (a, b) => a - b,
        gt: (a, b) => a > b,
        lt: (a, b) => a < b,
      },
    })
  );
  app.set('view engine', 'handlebars');
};
