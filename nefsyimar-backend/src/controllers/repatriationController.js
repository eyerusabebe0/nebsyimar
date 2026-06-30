const path = require('path');
const { RepatriationSubmission, User } = require('../models');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { uploadFiles } = require('../utils/fileUpload');

const createRepatriationSubmission = asyncHandler(async (req, res) => {
  const {
    deceased_full_name,
    date_of_birth,
    date_of_death,
    place_of_death,
    passport_or_id,
    shipping_agency,
    air_waybill_no,
    flight_number,
    departure_date,
    estimated_arrival_time,
    receiver_full_name,
    receiver_phone,
    receiver_email,
    nationality,
    current_location_body,
    applicant_full_name,
    relationship,
    applicant_phone,
    applicant_email,
    receiver_alternative_phone,
  } = req.body;

  // Normalize single-file upload payload from multer
  const filesPayload = req.files || (req.file ? { death_certificate_file: req.file } : {});
  const fileData = await uploadFiles(filesPayload, 'repatriation');

  const submission = await RepatriationSubmission.create({
    user_id: req.user.user_id,
    deceased_full_name,
    date_of_birth,
    date_of_death,
    place_of_death,
    nationality,
    current_location_body,
    passport_or_id,
    applicant_full_name,
    relationship,
    applicant_phone,
    applicant_email,
    shipping_agency,
    air_waybill_no,
    flight_number,
    departure_date,
    estimated_arrival_time,
    receiver_full_name,
    receiver_phone,
    receiver_alternative_phone,
    receiver_email,
    death_certificate_file: fileData.death_certificate_file?.[0] || null,
    embalmment_cert_file: fileData.embalming_cert_file?.[0] || null,
    embassy_permit_file: fileData.embassy_permit_file?.[0] || null,
    submitted_at: new Date(),
  });

  res.status(201).json({
    success: true,
    data: submission,
    message: 'Repatriation submission received successfully',
  });
});

const getRepatriationSubmissions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  const offset = (page - 1) * limit;

  const { count, rows } = await RepatriationSubmission.findAndCountAll({
    order: [['created_at', 'DESC']],
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['user_id', 'name', 'email', 'phone'],
      }
    ],
    limit,
    offset,
  });

  res.json({
    success: true,
    data: {
      submissions: rows,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(count / limit),
        total_records: count,
        per_page: limit,
      }
    }
  });
});

module.exports = {
  createRepatriationSubmission,
  getRepatriationSubmissions,
};
