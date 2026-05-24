'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove discount fields from products table
    await queryInterface.removeColumn('products', 'discount_price');
    await queryInterface.removeColumn('products', 'discount_percentage');
    
    // Remove discount fields from order_items table
    await queryInterface.removeColumn('order_items', 'discount_applied');
    await queryInterface.removeColumn('order_items', 'discount_reason');
  },

  down: async (queryInterface, Sequelize) => {
    // Add back discount fields to products table
    await queryInterface.addColumn('products', 'discount_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });
    
    await queryInterface.addColumn('products', 'discount_percentage', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true
    });
    
    // Add back discount fields to order_items table
    await queryInterface.addColumn('order_items', 'discount_applied', {
      type: Sequelize.DECIMAL(8, 2),
      defaultValue: 0.00,
      allowNull: false
    });
    
    await queryInterface.addColumn('order_items', 'discount_reason', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
  }
};
