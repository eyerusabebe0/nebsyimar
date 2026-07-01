const { sequelize } = require('../src/config/database');

async function createNotificationsTable() {
  try {
    console.log('🔄 Creating notifications table...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN (
          'GIFT_RECEIVED',
          'MEMORIAL_CREATED', 
          'ORDER_STATUS_UPDATE',
          'PAYMENT_RECEIVED',
          'VENDOR_VERIFIED',
          'SYSTEM_ANNOUNCEMENT',
          'MEMORIAL_UPDATE'
        )),
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,
        priority VARCHAR(10) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
        action_url VARCHAR(500),
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
      CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
      CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);
    `);

    // Create trigger for updated_at
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION update_notifications_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trigger_notifications_updated_at ON notifications;
      CREATE TRIGGER trigger_notifications_updated_at
        BEFORE UPDATE ON notifications
        FOR EACH ROW
        EXECUTE FUNCTION update_notifications_updated_at();
    `);

    console.log('✅ Notifications table created successfully');
    
    // Insert some sample notifications for testing
    console.log('🔄 Inserting sample notifications...');
    
    await sequelize.query(`
      INSERT INTO notifications (user_id, type, title, message, priority)
      SELECT 
        u.user_id,
        'SYSTEM_ANNOUNCEMENT',
        'Welcome to Nefsyimar!',
        'Thank you for joining our digital grieving platform. Your account has been successfully created.',
        'HIGH'
      FROM users u
      WHERE u.role = 'User'
      LIMIT 5
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Sample notifications inserted');
    
  } catch (error) {
    console.error('❌ Error creating notifications table:', error);
    throw error;
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  createNotificationsTable()
    .then(() => {
      console.log('🎉 Notifications migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = createNotificationsTable;
