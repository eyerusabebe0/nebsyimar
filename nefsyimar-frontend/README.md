# Nefsyimar Digital Grieving Platform

A modern, compassionate digital platform for honoring the deceased and supporting grieving families in Ethiopia. Built with React.js, Next.js, and Tailwind CSS.

## 🌟 Features

### Digital Memorials
- Create beautiful, personalized memorial pages
- Upload photos and share life stories
- Display funeral service information
- Community condolences and memories

### Tribute Gift System
- Send meaningful digital gifts (flowers, candles, doves, crosses)
- Real-time animations on memorial pages
- Financial support for grieving families
- Transparent donation tracking

### Marketplace
- Verified vendors for funeral services
- Mourning attire and traditional items
- Fresh flowers and memorial products
- Secure payment integration

### Cultural Sensitivity
- Designed for Ethiopian traditions
- Multi-language support (Amharic, Afan Oromo, Tigrigna)
- Respectful and dignified interface
- Community-focused approach

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📋 Prerequisites

- Node.js 18+
- Backend API running on http://localhost:5000

## 🏗️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom wrapper

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API route handlers (legacy)
│   ├── dashboard/         # Dashboard pages
│   ├── memorials/         # Memorial pages
│   ├── signin/           # Authentication pages
│   ├── signup/
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/            # Reusable components
│   ├── AuthContext.tsx   # Authentication context
│   ├── MemorialGrid.tsx  # Memorial display components
│   └── ...
├── lib/                  # Utility functions
│   └── mockDatabase.ts   # API configuration
│   ├── Navigation.tsx     # Main navigation
│   ├── Footer.tsx         # Site footer
│   ├── HeroSection.tsx    # Homepage hero
│   ├── MemorialGrid.tsx   # Memorial listings
│   ├── TributeGifts.tsx   # Gift system
│   └── ProductGrid.tsx    # Marketplace products
├── public/               # Static assets
└── README.md            # This file
```

## 🎨 Key Features Implementation

### Memorial System
- Individual memorial pages with unique URLs
- Photo galleries and life story sections
- Funeral service information display
- Community comment system

### Tribute Gifts
- Interactive gift selection interface
- Real-time payment processing
- Animation system for gift displays
- Family wallet management

### Marketplace
- Product categorization and filtering
- Vendor verification system
- Shopping cart functionality
- Order management

## 🔒 Security & Privacy

- Secure payment processing
- Data encryption for sensitive information
- Privacy controls for memorial visibility
- Content moderation system

## 🌍 Localization

- Multi-language support
- Cultural adaptation for Ethiopian traditions
- Right-to-left text support where needed
- Local payment method integration

## 📞 Support

For technical support or questions:
- Email: support@nefsyimar.com
- Phone: +251 911 123 456
- Available 24/7

## 📄 License

© 2025 Syntax Software Solution PLC. All rights reserved.

---

*"Where love, memory, and compassion live forever"*
