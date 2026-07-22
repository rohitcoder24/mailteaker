require('dotenv').config();

const app = require('./app');
const db = require('./models');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Database connection established.');

    app.listen(PORT, () => {
      console.log(`Mail Trac/king System running on http://localhost:${PORT}`);
      console.log(`Dashboard: http://localhost:${PORT}/dashboard`);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
};

startServer();
