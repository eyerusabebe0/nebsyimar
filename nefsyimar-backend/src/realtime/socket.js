const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, Vendor } = require('../models');

let ioInstance;

function initSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? ['https://nefsyimar.com', 'https://www.nefsyimar.com']
          : [
              'http://localhost:3000',
              'http://localhost:4000',
              'http://localhost:3001',
              'http://127.0.0.1:3000',
              'http://127.0.0.1:4000',
            ],
      credentials: true,
    },
  });

  ioInstance.use(async (socket, next) => {
    try {
      const authToken =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization || '').replace('Bearer ', '');

      if (!authToken) {
        return next();
      }

      const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
      if (!decoded?.userId) {
        return next();
      }

      const user = await User.findByPk(decoded.userId);
      if (!user || !user.is_active) {
        return next();
      }

      socket.user = {
        userId: user.user_id,
        role: user.role,
      };

      next();
    } catch (error) {
      console.log('Socket auth failed:', error.message);
      next();
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log('🔌 WebSocket connected:', socket.id);

    socket.on('orders:subscribe', async (payload = {}) => {
      try {
        if (!socket.user?.userId) return;

        const { role, vendorId } = payload;

        if (role === 'buyer') {
          socket.join(`user:${socket.user.userId}`);
          return;
        }

        if (role === 'vendor') {
          if (!vendorId) return;

          const vendor = await Vendor.findOne({
            where: { vendor_id: vendorId, user_id: socket.user.userId },
          });

          if (vendor) {
            socket.join(`vendor:${vendor.vendor_id}`);
          }
        }
      } catch (error) {
        console.log('orders:subscribe error:', error.message);
      }
    });

    socket.on('orders:admin-subscribe', () => {
      try {
        if (!socket.user?.userId || socket.user?.role !== 'Administrator') return;
        socket.join('admin:orders');
      } catch (error) {
        console.log('orders:admin-subscribe error:', error.message);
      }
    });

    socket.on('disputes:admin-subscribe', () => {
      try {
        if (!socket.user?.userId || socket.user?.role !== 'Administrator') return;
        socket.join('admin:disputes');
      } catch (error) {
        console.log('disputes:admin-subscribe error:', error.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected:', socket.id);
    });
  });

  return ioInstance;
}

function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized');
  }
  return ioInstance;
}

module.exports = {
  initSocket,
  getIO,
};
