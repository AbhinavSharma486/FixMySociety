# Fix My Society 🏢

<div align="center">
  <img src="frontend/public/building-icon.svg" alt="Fix My Society Logo" width="80" height="80" />
  <h1>Fix My Society</h1>
  <p><strong>A Comprehensive Complaint Management System for Residential Communities</strong></p>
  <p>Real-time complaint tracking, community engagement, and administrative oversight for modern residential buildings</p>

  ![React](https://img.shields.io/badge/React-19.0.0-blue.svg)
  ![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)
  ![MongoDB](https://img.shields.io/badge/MongoDB-8.5+-green.svg)
  ![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7+-black.svg)
  ![License](https://img.shields.io/badge/License-ISC-blue.svg)
  ![Status](https://img.shields.io/badge/Status-Production--Ready-success.svg)
</div>

## 🌟 Live Demo

[View Live Application](https://fixmysociety.onrender.com/)

## 📋 Table of Contents

- [Fix My Society 🏢](#fix-my-society-)
  - [🌟 Live Demo](#-live-demo)
  - [📋 Table of Contents](#-table-of-contents)
  - [📖 Overview](#-overview)
    - [🎯 Problem Solved](#-problem-solved)
    - [👥 User Roles](#-user-roles)
  - [✨ Key Features](#-key-features)
    - [🏠 Complaint Management](#-complaint-management)
    - [💬 Real-time Communication](#-real-time-communication)
    - [👥 Community Features](#-community-features)
    - [📊 Administrative Dashboard](#-administrative-dashboard)
    - [🎨 User Experience](#-user-experience)
    - [🔒 Security \& Authentication](#-security--authentication)
  - [🛠 Tech Stack](#-tech-stack)
    - [Backend](#backend)
    - [Frontend](#frontend)
  - [📁 Project Structure](#-project-structure)
  - [🏗 Backend Architecture](#-backend-architecture)
    - [Core Components](#core-components)
      - [Authentication System](#authentication-system)
      - [Database Layer](#database-layer)
      - [Real-time Communication](#real-time-communication)
    - [API Design Patterns](#api-design-patterns)
  - [🎨 Frontend Architecture](#-frontend-architecture)
    - [State Management (Redux)](#state-management-redux)
    - [Component Structure](#component-structure)
    - [Performance Optimizations](#performance-optimizations)
    - [State Persistence](#state-persistence)
    - [Actions and Thunks](#actions-and-thunks)
  - [⚙️ Environment Setup](#️-environment-setup)
    - [Required Environment Variables](#required-environment-variables)
    - [Environment Variables Explanation](#environment-variables-explanation)
    - [Contact Information](#contact-information)

## 📖 Overview

**Fix My Society** is a modern, full-stack complaint management system designed specifically for residential communities. It bridges the gap between residents and building administrators by providing a seamless platform for reporting issues, tracking progress, and fostering community engagement.

### 🎯 Problem Solved

Traditional complaint management in residential buildings often involves:
- Lost or forgotten complaints
- Poor communication between residents and management
- Lack of transparency in issue resolution
- Inefficient tracking of maintenance requests

**Fix My Society** addresses these challenges with:
- **Real-time complaint tracking** with live status updates
- **Interactive communication** through comments and replies
- **Comprehensive analytics** for building administrators
- **Mobile-responsive design** accessible anywhere
- **Multi-role authentication** for residents and admins

### 👥 User Roles

1. **Residents (Users)**
   - Report complaints with photos/videos
   - Track complaint status in real-time
   - Participate in community discussions
   - Like and engage with other complaints

2. **Building Administrators**
   - Manage multiple buildings and residents
   - Monitor all complaints across buildings
   - Send broadcast announcements
   - Access detailed analytics and reports

## ✨ Key Features

### 🏠 Complaint Management
- **Multi-category complaints**: Plumbing, Electricity, Security, Waste Management, etc.
- **Media uploads**: Support for images and videos via Cloudinary
- **Status tracking**: Pending → In Progress → Resolved
- **Priority levels**: Emergency, High, Medium, Low classifications
- **Like system**: Community engagement and prioritization

### 💬 Real-time Communication
- **Live comments and replies** on all complaints
- **Socket.IO integration** for instant updates
- **Broadcast announcements** from administrators
- **Push notifications** for important updates

### 👥 Community Features
- **Building-specific communities** with isolated discussions
- **Resident profiles** with contact information
- **Complaint history** and engagement tracking
- **Community analytics** and participation metrics

### 📊 Administrative Dashboard
- **Real-time analytics** across all buildings
- **Complaint distribution** by category and status
- **Building performance metrics** and occupancy rates
- **Resident management** and user administration
- **Broadcast messaging** system for announcements

### 🎨 User Experience
- **Fully responsive design** for mobile and desktop
- **Modern UI** with Tailwind CSS and animations
- **Intuitive navigation** and user flows

### 🔒 Security & Authentication
- **JWT-based authentication** for both users and admins
- **Role-based access control** (RBAC)
- **Secure password hashing** with bcrypt
- **Protected API routes** with middleware
- **Session management** with HTTP-only cookies

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.19+
- **Database**: MongoDB 8.5+ with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) with bcryptjs
- **Real-time**: Socket.IO 4.7+
- **File Uploads**: Cloudinary 2.4+ & express-fileupload
- **CORS**: cors middleware
- **Security**: Cookie-based sessions

### Frontend
- **Framework**: React 19.0+ with Vite
- **State Management**: Redux Toolkit 2.6+ with redux-persist
- **Styling**: Tailwind CSS 4.0+ with DaisyUI
- **Icons**: Lucide React 0.485+
- **Animations**: Framer Motion 12.6+
- **HTTP Client**: Axios 1.8+
- **Real-time**: Socket.IO Client 4.8+
- **Routing**: React Router DOM 7.4+


## 📁 Project Structure

```
FixMySociety/
├── backend/                          # Express.js server
│   ├── controllers/                  # Route controllers
│   │   ├── auth.controller.js        # User authentication
│   │   ├── admin.controller.js       # Admin operations
│   │   ├── complaint.controller.js   # Complaint management
│   │   ├── building.controller.js    # Building operations
│   │   └── notification.controller.js # Notification handling
│   ├── middleware/                   # Express middleware
│   │   ├── user.auth.middleware.js   # User authentication
│   │   ├── admin.auth.middleware.js  # Admin authentication
│   │   └── socketAuth.middleware.js  # Socket authentication
│   ├── models/                       # MongoDB schemas
│   │   ├── user.model.js            # User schema
│   │   ├── admin.model.js           # Admin schema
│   │   ├── complaint.model.js       # Complaint schema
│   │   ├── building.model.js        # Building schema
│   │   ├── notification.model.js    # Notification schema
│   │   └── broadcast.model.js       # Broadcast message schema
│   ├── routes/                      # API route definitions
│   ├── sockets/                     # Socket.IO handlers
│   │   ├── socket.js               # Socket configuration
│   │   └── eventEmitter.js         # Real-time event handlers
│   ├── utils/                       # Utility functions
│   ├── lib/                         # Library configurations
│   └── index.js                     # Server entry point
├── frontend/                         # React application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   ├── pages/                   # Page components
│   │   ├── Admin/                   # Admin-specific components
│   │   │   ├── components/          # Admin UI components
│   │   │   └── pages/              # Admin pages
│   │   ├── redux/                   # State management
│   │   │   ├── store.js            # Redux store config
│   │   │   ├── user/               # User state slice
│   │   │   ├── admin/              # Admin state slice
│   │   │   ├── theme/              # Theme state slice
│   │   │   └── complaint/          # Complaint state slice
│   │   ├── context/                 # React context providers
│   │   ├── lib/                     # Utility libraries
│   │   ├── constants/               # App constants
│   │   └── App.jsx                 # Main app component
│   ├── tailwind.config.js          # Tailwind configuration
│   ├── vite.config.js              # Vite configuration
│   └── index.html                  # HTML template
└── README.md                       # Project documentation
```

## 🏗 Backend Architecture

### Core Components

#### Authentication System
- **JWT-based authentication** with separate tokens for users and admins
- **Cookie-based sessions** with HTTP-only flags for security
- **Role-based middleware** protecting routes by user type
- **Password hashing** using bcryptjs with salt rounds

#### Database Layer
- **MongoDB with Mongoose ODM** for schema validation and relationships
- **Indexed queries** for optimal performance on frequent operations
- **Population** for efficient data fetching across related models
- **Aggregation pipelines** for complex analytics queries

#### Real-time Communication
- **Socket.IO integration** for bi-directional communication
- **Room-based messaging** isolating conversations by building
- **Event-driven architecture** with custom event emitters
- **Authentication middleware** for socket connections

### API Design Patterns
- **RESTful endpoints** with consistent HTTP methods
- **JSON responses** with standardized success/error formats
- **Middleware chains** for authentication, validation, and error handling
- **File upload handling** with Cloudinary integration

## 🎨 Frontend Architecture

### State Management (Redux)
The application uses Redux Toolkit with the following slices:

- **User Slice**: Authentication state, profile data, loading states
- **Admin Slice**: Admin authentication, dashboard data, management state
- **Theme Slice**: Dark/light theme preferences with localStorage persistence
- **Complaint Slice**: Complaint-related state management

### Component Structure
- **Page Components**: Route-level components for different views
- **Reusable Components**: Modular UI elements (cards, modals, forms)
- **Admin Components**: Specialized components for administrative functions
- **Layout Components**: Navigation, headers, and responsive containers

### Performance Optimizations
- **Lazy loading** for route components with React.lazy
- **Memoization** using React.memo for expensive components
- **Debounced operations** for search and API calls
- **GPU-accelerated animations** with transform3d properties

### State Persistence
- **Redux Persist** maintains user sessions across browser refreshes
- **localStorage** stores theme preferences and admin tokens
- **Secure storage** for authentication tokens

### Actions and Thunks
- **Synchronous actions** for immediate state updates
- **Async thunks** for API calls with loading states
- **Error handling** with user-friendly messages
- **Optimistic updates** for better UX

## ⚙️ Environment Setup

### Required Environment Variables

Create `.env` file in the backend root:

```bash
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/fixmysociety

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-here

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

```

### Environment Variables Explanation

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `FRONTEND_URL` | Frontend application URL | Yes |
| `CLOUDINARY_*` | Cloudinary credentials for media uploads | Yes |

### Contact Information

- **Project Lead**: Abhinav Sharma
- **Email**: abhinavparashar486@gmail.com
- **LinkedIn**: https://www.linkedin.com/in/abhinav-sharma-mern/

---

<div align="center">
  <p>Made with ❤️ for better community living</p>
  <p>© 2025 Fix My Society. All rights reserved.</p>
</div>
