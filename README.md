# 🕊️ Nefsyimar Digital Grieving Platform - Backend API

Ethiopia's first professional digital grieving platform backend built with Node.js, Express, and PostgreSQL.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

### Core Features
- **User Authentication**: Email/phone registration with OTP verification, session cookies, and optional JWT Bearer tokens for API clients and impersonation
- **Digital Memorials**: Create and manage memorial pages with 50 ETB creation fee
- **Wallet System**: Secure internal wallet with deposit functionality (no withdrawals)
- **Tribute Gifts**: 4-tier gift system with animations (White Rose, Candle, Dove, Eternal Light)
- **Marketplace**: Food delivery-style vendor marketplace with order tracking
- **File Uploads**: Support for images, documents, and media files

### Business Logic
- **Memorial Creation**: 50 ETB fee deducted from wallet
- **Gift System**: 2.5% platform fee on tribute gifts
- **Marketplace**: 5% commission on vendor sales
- **Payment Integration**: Telebirr, CBE Birr, HelloCash, PayPal support
- **Vendor Verification**: Admin approval system for marketplace vendors

### Security & Compliance
- AES-256 encryption for sensitive data
- Input validation and sanitization
- Rate limiting and CORS protection
- Immutable transaction ledger
- Comprehensive error handling

## 🛠 Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: Hybrid session + JWT (session cookies for browser flows, Bearer tokens for API/impersonation)
- **File Upload**: Multer
- **Validation**: Express Validator
- **Email**: Nodemailer
- **SMS**: Twilio
- **Security**: Helmet, CORS, Rate Limiting

## 📁 Project Structure

```
nefsyimar-backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/             # Route controllers
│   │   ├── authController.js
│   │   ├── walletController.js
│   │   ├── memorialController.js
│   │   ├── giftController.js
│   │   ├── vendorController.js
│   │   ├── productController.js
│   │   └── orderController.js
│   ├── middleware/              # Custom middleware
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── validationMiddleware.js
│   ├── models/                  # Sequelize models
│   │   ├── User.js
│   │   ├── Wallet.js
│   │   ├── WalletTransaction.js
│   │   ├── Memorial.js
│   │   ├── GiftCatalog.js
│   │   ├── GiftTransaction.js
│   │   ├── Vendor.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   └── index.js
│   ├── routes/                  # API routes
│   │   ├── authRoutes.js
│   │   ├── walletRoutes.js
│   │   ├── memorialRoutes.js
│   │   ├── giftRoutes.js
│   │   ├── vendorRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── adminRoutes.js
│   │   └── index.js
│   └── utils/                   # Utility functions
│       ├── fileUpload.js
│       ├── notifications.js
│       └── paymentGateway.js
├── scripts/
│   └── seed.js                  # Database seeding
├── uploads/                     # File upload directory
├── .env.example                 # Environment variables template
├── server.js                    # Application entry point
└── package.json                 # Dependencies and scripts
```

## 🚀 Installation

### Prerequisites
- Node.js 16 or higher
- PostgreSQL 12 or higher
- npm or yarn

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd nefsyimar-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

4. **Configure your .env file** (see Configuration section)

5. **Set up the database** (see Database Setup section)

6. **Seed the database**
```bash
npm run seed
```

7. **Start the development server**
```bash
npm run dev
```

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nefsyimar_db
DB_USER=postgres
DB_PASSWORD=your_password

# Security
BCRYPT_SALT_ROUNDS=12
ENCRYPTION_KEY=your-32-character-encryption-key

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Payment Gateway URLs
TELEBIRR_API_URL=https://api.telebirr.com
CBE_BIRR_API_URL=https://api.cbebirr.com
HELLO_CASH_API_URL=https://api.hellocash.com
PAYPAL_API_URL=https://api.paypal.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads/

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🗄️ Database Setup

### 1. Create PostgreSQL Database
```sql
CREATE DATABASE nefsyimar_db;
CREATE USER nefsyimar_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE nefsyimar_db TO nefsyimar_user;
```

### 2. Run Migrations
The application will automatically sync database models in development mode.

### 3. Seed Data
```bash
npm run seed
```

This will populate the gift catalog with all tribute gifts as specified in the requirements.

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with initial data
- `npm test` - Run tests
- `npm run migrate` - Run database migrations

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
The API supports both session cookies and JWT Bearer tokens:

- Browser flows typically rely on the session cookie issued by `express-session` after login.
- API clients and admin impersonation flows can send a JWT in the `Authorization: Bearer &lt;token&gt;` header.

Both mechanisms resolve to the same authenticated user account via the auth middleware.

### Main Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user
- `POST /auth/verify` - Verify account
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

#### Wallet Management
- `GET /wallet` - Get wallet details
- `GET /wallet/balance` - Get wallet balance
- `GET /wallet/transactions` - Get transaction history
- `POST /wallet/deposit` - Deposit money

#### Memorials
- `GET /memorials` - Get public memorials
- `GET /memorials/:id` - Get memorial details
- `POST /memorials` - Create memorial (50 ETB fee)
- `PUT /memorials/:id` - Update memorial
- `DELETE /memorials/:id` - Archive memorial

#### Tribute Gifts
- `GET /gifts/catalog` - Get gift catalog
- `GET /gifts/catalog/:category` - Get gifts by category
- `POST /gifts/send` - Send tribute gift
- `GET /gifts/memorial/:id` - Get memorial gifts

#### Marketplace
- `GET /vendors` - Get verified vendors
- `GET /products` - Get products
- `POST /orders` - Create order
- `GET /orders` - Get user orders

#### Admin
- `GET /admin/stats/overview` - System statistics
- `GET /admin/vendors/pending` - Pending vendor verifications
- `POST /admin/vendors/:id/verify` - Verify vendor

### Gift Categories & Pricing

#### 🌹 White Rose Collection (5-25 ETB)
- Single White Rose - 5 ETB
- White Rose Bouquet - 10 ETB
- Lily & Rose Harmony - 15 ETB
- Garden of White Roses - 20 ETB
- Field of Roses - 25 ETB

#### 🕯️ Candle of Peace Collection (10-30 ETB)
- Candle of Peace - 10 ETB
- Twin Candles - 15 ETB
- Golden Glow Candle - 20 ETB
- Candle Circle - 25 ETB
- Lantern of Serenity - 30 ETB

#### 🕊️ Dove of Mercy Collection (25-50 ETB)
- Dove of Mercy - 25 ETB
- Olive Dove - 30 ETB
- Pair of Doves - 35 ETB
- Messenger Dove - 40 ETB
- Heavenly Flight - 50 ETB

#### 💫 Eternal Light Collection (100-200 ETB)
- Eternal Light - 100 ETB
- Golden Halo - 125 ETB
- Star of Legacy - 150 ETB
- Heavenly Lamp - 175 ETB
- Sun of Memory - 200 ETB

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up SSL certificates
4. Configure payment gateway credentials
5. Set up email/SMS services

### Docker Deployment
```bash
# Build image
docker build -t nefsyimar-backend .

# Run container
docker run -p 5000:5000 --env-file .env nefsyimar-backend
```

### Health Check
The application provides a health check endpoint:
```
GET /health
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use ESLint configuration
- Follow MVC architecture patterns
- Write comprehensive tests
- Document API changes

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏢 About

Developed by **Syntax Software Solution PLC**  
Supervised by: Mr. Ermiyas · Mr. Leulseged Lemma · Mr. Natnael Teklay  
Location: Addis Ababa, Ethiopia  
Date: October 2025

---

**Nefsyimar** - Ethiopia's trusted digital sanctuary where love, memory, and compassion live forever. 🕊️
