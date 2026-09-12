# Devbhoomi Designs 🏔️

A modern, responsive e-commerce website created for a Uttarakhand handicraft business, focused on showcasing and selling handcrafted Aipan and Himalayan-inspired products.

## 🌐 Live Website

**https://devbhoomidesign.vercel.app**

## ✨ Features

### Customer Experience
- Responsive desktop and mobile UI
- Product catalogue
- Product search and categories
- Multi-photo product gallery
- Mobile swipe-friendly product images
- Product customization
- Customer signup and login
- Shopping cart
- Order placement
- Order history
- Order tracking
- Stock availability
- Custom product requests
- WhatsApp support

### Admin Dashboard
- Secure admin access
- Add, edit and delete products
- Product pricing management
- Stock availability management
- Upload up to 5 product photos
- Set a primary product image
- Manage customer orders
- Update order status
- View custom product requests

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Frontend and application framework |
| React | UI components |
| TypeScript | Type-safe development |
| Tailwind CSS | Responsive styling |
| Supabase | Authentication, database and storage |
| PostgreSQL | Application database |
| Vercel | Deployment |

## 🏗️ Architecture

```text
Customer
   ↓
Next.js / React
   ↓
Supabase
 ├── Authentication
 ├── PostgreSQL Database
 └── Storage
   ↓
Admin Dashboard
```

## 📱 Responsive Design

The website is designed for customers using both desktop and mobile devices.

The product details page includes a mobile-friendly image gallery with:
- Swipe navigation
- Previous/Next controls
- Photo counter
- Thumbnail navigation

## 🔐 Security

The application uses Supabase Authentication and Row Level Security policies to control access to customer orders, admin functionality, and custom requests.

Sensitive environment variables are kept outside the repository.

## 🚀 Deployment

The application is deployed with **Vercel** and uses **Supabase** as its backend platform.

## 👨‍💻 Developer

**Vishal Gupta**

PGDM — Business Analytics & Finance  
IBI Greater Noida

GitHub: https://github.com/vishal2131gupta-crypto

---

### Project Purpose

This project combines business requirements, user experience, database design, authentication, responsive development, and deployment into a real-world e-commerce solution for a small business.
