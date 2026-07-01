const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RepatriationSubmission = sequelize.define('RepatriationSubmission', {
  submission_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id',
    },
  },
  deceased_full_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  date_of_birth: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  date_of_death: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  place_of_death: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  passport_or_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  nationality: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  current_location_body: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  applicant_full_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  relationship: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  applicant_phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  applicant_email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  shipping_agency: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  air_waybill_no: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  flight_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  departure_date: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  estimated_arrival_time: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  receiver_full_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  receiver_phone: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  receiver_alternative_phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  receiver_email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  death_certificate_file: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  embalmment_cert_file: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  embassy_permit_file: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'IN_REVIEW', 'APPROVED', 'DECLINED'),
    defaultValue: 'PENDING',
    allowNull: false,
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  submitted_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'repatriation_submissions',
});

module.exports = RepatriationSubmission;
