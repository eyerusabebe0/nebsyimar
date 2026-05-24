'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // First, let's check if the enum already has the new values
    const [results] = await queryInterface.sequelize.query(
      "SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_memorial_comments_visibility');"
    );
    
    const existingValues = results.map(row => row.enumlabel);
    
    // Add PENDING if it doesn't exist
    if (!existingValues.includes('PENDING')) {
      await queryInterface.sequelize.query(
        "ALTER TYPE \"enum_memorial_comments_visibility\" ADD VALUE 'PENDING';"
      );
    }
    
    // Add REJECTED if it doesn't exist
    if (!existingValues.includes('REJECTED')) {
      await queryInterface.sequelize.query(
        "ALTER TYPE \"enum_memorial_comments_visibility\" ADD VALUE 'REJECTED';"
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // Note: PostgreSQL doesn't support removing enum values directly
    // This would require recreating the enum type and updating all references
    // For now, we'll leave the enum values in place
    console.log('Warning: Cannot remove enum values in PostgreSQL. PENDING and REJECTED values will remain.');
  }
};
