const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Email transporter setup
let emailTransporter = null;

const initializeEmailTransporter = () => {
  if (!emailTransporter && process.env.EMAIL_HOST) {
    emailTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  return emailTransporter;
};

// Twilio client setup
let twilioClient = null;

const initializeTwilioClient = () => {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

// Email templates
const emailTemplates = {
  verification: {
    subject: 'Welcome to Nefsyimar - Verify Your Account',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">🕊️ Nefsyimar</h1>
          <p style="color: #666; margin: 5px 0;">Digital Grieving Platform</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333;">Welcome, ${data.name}!</h2>
          
          <p style="color: #555; line-height: 1.6;">
            Thank you for joining Nefsyimar, Ethiopia's first professional digital grieving platform. 
            To complete your registration, please verify your account using the link below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/verify?token=${data.verification_token}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Account
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            ${process.env.FRONTEND_URL}/verify?token=${data.verification_token}
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This verification link will expire in 24 hours for security reasons.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2025 Syntax Software Solution PLC | Addis Ababa, Ethiopia</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      </div>
    `
  },

  'password-reset': {
    subject: 'Nefsyimar - Password Reset Request',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">🕊️ Nefsyimar</h1>
          <p style="color: #666; margin: 5px 0;">Digital Grieving Platform</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          
          <p style="color: #555; line-height: 1.6;">
            Hello ${data.name},<br><br>
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${data.reset_token}" 
               style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            ${process.env.FRONTEND_URL}/reset-password?token=${data.reset_token}
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This reset link will expire in 10 minutes for security reasons.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            If you didn't request a password reset, please ignore this email or contact support if you have concerns.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2025 Syntax Software Solution PLC | Addis Ababa, Ethiopia</p>
        </div>
      </div>
    `
  },

  otp: {
    subject: 'Nefsyimar - Verification Code',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">🕊️ Nefsyimar</h1>
          <p style="color: #666; margin: 5px 0;">Digital Grieving Platform</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333;">Verification Code</h2>
          
          <p style="color: #555; line-height: 1.6;">
            Hello ${data.name},<br><br>
            Your verification code for ${data.type || 'account verification'} is:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #007bff; color: white; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 8px; display: inline-block; font-family: monospace;">
              ${data.otp}
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            This code will expire in <strong>5 minutes</strong> for security reasons.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            If you didn't request this verification code, please ignore this email or contact support if you have concerns.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2025 Syntax Software Solution PLC | Addis Ababa, Ethiopia</p>
        </div>
      </div>
    `
  },

  'gift-notification': {
    subject: 'You received a gift on Nefsyimar',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">🕊️ Nefsyimar</h1>
          <p style="color: #666; margin: 5px 0;">Digital Grieving Platform</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333;">💝 You received a gift</h2>
          
          <p style="color: #555; line-height: 1.6;">
            Hello ${data.recipient_name},<br><br>
            ${data.sender_name} sent a ${data.gift_name} to the memorial of ${data.deceased_name}.
          </p>
          
          ${data.message ? `
            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
              <p style="color: #555; font-style: italic; margin: 0;">"${data.message}"</p>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/memorials/${data.memorial_url}" 
               style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Memorial
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            Gift Amount: ${data.amount} ETB
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2025 Syntax Software Solution PLC | Addis Ababa, Ethiopia</p>
        </div>
      </div>
    `
  },

  'order-confirmation': {
    subject: 'Order Confirmation - Nefsyimar Marketplace',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">🕊️ Nefsyimar</h1>
          <p style="color: #666; margin: 5px 0;">Digital Grieving Platform</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333;">Order Confirmation</h2>
          
          <p style="color: #555; line-height: 1.6;">
            Hello ${data.buyer_name},<br><br>
            Thank you for your order! Your order has been confirmed and is being processed.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> ${data.order_number}</p>
            <p><strong>Vendor:</strong> ${data.vendor_name}</p>
            <p><strong>Total Amount:</strong> ${data.total_amount} ETB</p>
            <p><strong>Status:</strong> ${data.status}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/orders/${data.order_id}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Track Order
            </a>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2025 Syntax Software Solution PLC | Addis Ababa, Ethiopia</p>
        </div>
      </div>
    `
  },

  'order-status-update': {
    subject: 'Order Status Update - Nefsyimar Marketplace',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">🕊️ Nefsyimar</h1>
          <p style="color: #666; margin: 5px 0;">Digital Grieving Platform</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333;">Order Status Update</h2>
          
          <p style="color: #555; line-height: 1.6;">
            Hello ${data.buyer_name || data.user_name || 'Customer'},<br><br>
            The status of your order <strong>${data.order_number}</strong> has been updated to <strong>${data.status}</strong>.
          </p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> ${data.order_number}</p>
            ${data.vendor_name ? `<p><strong>Vendor:</strong> ${data.vendor_name}</p>` : ''}
            ${data.total_amount ? `<p><strong>Total Amount:</strong> ${data.total_amount} ETB</p>` : ''}
            <p><strong>Status:</strong> ${data.status}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/orders/${data.order_id}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Order
            </a>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2025 Syntax Software Solution PLC | Addis Ababa, Ethiopia</p>
        </div>
      </div>
    `
  }
};

// Send email function
const sendEmail = async ({ to, subject, template, data, html, text }) => {
  try {
    const transporter = initializeEmailTransporter();
    
    if (!transporter) {
      console.warn('Email transporter not configured');
      return { success: false, error: 'Email service not configured' };
    }

    let emailHtml = html;
    let emailSubject = subject;

    // Use template if provided
    if (template && emailTemplates[template]) {
      emailHtml = emailTemplates[template].html(data);
      emailSubject = emailTemplates[template].subject;
    }

    const mailOptions = {
      from: `"Nefsyimar" <${process.env.EMAIL_USER}>`,
      to,
      subject: emailSubject,
      html: emailHtml,
      text: text || `Please view this email in HTML format.`
    };

    const result = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send SMS function
// Send SMS function
const sendSMS = async ({ to, message }) => {
  try {
    const client = initializeTwilioClient();
    
    // ADD THIS: Check if the client AND the phone number exist
    if (!client || !process.env.TWILIO_PHONE_NUMBER) {
      console.warn('SMS service not configured (missing client or phone number)');
      return { success: false, error: 'SMS service not configured' };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER, // This will now only run if the ENV is set
      to
    });

    return {
      success: true,
      sid: result.sid,
      status: result.status
    };
  } catch (error) {
    console.error('SMS sending error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send notification (email and/or SMS)
const sendNotification = async ({ 
  user, 
  type, 
  data, 
  channels = ['email'], 
  priority = 'normal' 
}) => {
  const results = {
    email: null,
    sms: null
  };

  try {
    // Send email notification
    if (channels.includes('email') && user.email) {
      results.email = await sendEmail({
        to: user.email,
        template: type,
        data: {
          ...data,
          user_name: user.name
        }
      });
    }

    // Send SMS notification
    if (channels.includes('sms') && user.phone) {
      let smsMessage = '';
      
      switch (type) {
        case 'verification':
          smsMessage = `Welcome to Nefsyimar! Your verification code is: ${data.verification_token.substring(0, 6).toUpperCase()}`;
          break;
        case 'password-reset':
          smsMessage = `Your Nefsyimar password reset code is: ${data.reset_token.substring(0, 6).toUpperCase()}`;
          break;
        case 'gift-notification':
          smsMessage = `You received a ${data.gift_name} gift on Nefsyimar from ${data.sender_name}. View: ${process.env.FRONTEND_URL}/memorials/${data.memorial_url}`;
          break;
        case 'order-confirmation':
          smsMessage = `Order confirmed! Order #${data.order_number} from ${data.vendor_name}. Total: ${data.total_amount} ETB. Track: ${process.env.FRONTEND_URL}/orders/${data.order_id}`;
          break;
        case 'order-status-update':
          smsMessage = `Order ${data.status || 'updated'}! Order #${data.order_number}. Track: ${process.env.FRONTEND_URL}/orders/${data.order_id}`;
          break;
        default:
          smsMessage = data.message || 'You have a new notification from Nefsyimar.';
      }

      results.sms = await sendSMS({
        to: user.phone,
        message: smsMessage
      });
    }

    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('Notification sending error:', error);
    return {
      success: false,
      error: error.message,
      results
    };
  }
};

// Bulk email sending
const sendBulkEmail = async (recipients, { subject, template, data, html }) => {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendEmail({
      to: recipient.email,
      subject,
      template,
      data: {
        ...data,
        ...recipient
      },
      html
    });
    
    results.push({
      recipient: recipient.email,
      ...result
    });
  }
  
  return results;
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = initializeEmailTransporter();
    
    if (!transporter) {
      return { success: false, error: 'Email transporter not configured' };
    }

    await transporter.verify();
    
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Test SMS configuration
const testSMSConfig = async () => {
  try {
    const client = initializeTwilioClient();
    
    if (!client) {
      return { success: false, error: 'SMS client not configured' };
    }

    // Test by fetching account info
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    
    return { 
      success: true, 
      message: 'SMS configuration is valid',
      account_status: account.status
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendSMS,
  sendNotification,
  sendBulkEmail,
  testEmailConfig,
  testSMSConfig,
  emailTemplates
};
