require('dotenv').config();

const { createApp, sequelize } = require('./src/app');

// Create Express app (LiteSpeed will attach the HTTP server and listen)
const app = createApp();

// Initialize database connection once at startup
const initApp = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized.');
    }

    console.log(`🚀 Nefsyimar Backend app initialized (env=${process.env.NODE_ENV}).`);
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  initApp()
    .then(() => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🌐 HTTP server listening on port ${PORT} (IPv4: http://127.0.0.1:${PORT})`);
      });
    })
    .catch((error) => {
      console.error('❌ Failed to initialize app:', error);
      process.exit(1);
    });
} else {
  initApp().catch((error) => {
    console.error('❌ Failed to initialize app:', error);
  });
}

// Export the Express app; LiteSpeed/lsnode will handle http.Server.listen()
module.exports = app;
