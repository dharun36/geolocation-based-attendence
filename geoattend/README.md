# GeoAttend - Geo-Location Based Attendance Management System

A production-ready SaaS-level attendance management system built with Next.js 15, featuring GPS-based check-in/check-out, geo-fencing, and multi-tenant architecture.

## 🚀 Features

### Core Features
- ✅ **Multi-tenant SaaS Architecture** - Organization-based data isolation
- ✅ **Role-Based Access Control** - Admin, Manager, and Employee roles
- ✅ **GPS-Based Attendance** - Real-time location tracking for check-in/check-out
- ✅ **Geo-fencing** - Configurable location boundaries with radius control
- ✅ **Attendance Rules** - Automatic detection of late, half-day, and absent status
- ✅ **Real-time Dashboard** - KPIs, stats, and attendance overview
- ✅ **Audit Logging** - Comprehensive tracking of all critical actions
- ✅ **Secure Authentication** - NextAuth v5 with bcrypt password hashing

### Technical Features
- Next.js 15 App Router
- TypeScript for type safety
- Prisma ORM with PostgreSQL
- Server Actions for mutations
- Tailwind CSS + Radix UI components
- Middleware for auth & tenant isolation
- Responsive and accessible UI

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher
- **PostgreSQL** 14.x or higher
- **npm** or **yarn** package manager
- **Git** for version control

## 🛠️ Installation & Setup

### Step 1: Navigate to Project

```bash
cd "d:\Project\geolocation based attendence app\geoattend"
```

### Step 2: Install Dependencies

All dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### Step 3: Configure Database

1. **Install PostgreSQL** if not already installed
2. **Create a database:**

```sql
CREATE DATABASE geoattendance;
```

3. **Update the `.env` file** with your database credentials:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/geoattendance?schema=public"
```

### Step 4: Generate Prisma Client & Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### Step 5: Generate NextAuth Secret

Generate a secure secret key:

```bash
openssl rand -base64 32
```

Update `.env`:
```env
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Step 6: Start Development Server

```bash
npm run dev
```

Visit **http://localhost:3000**

## 📖 Complete Usage Guide

### First Time Setup

1. **Navigate to** http://localhost:3000
2. **You'll be redirected to** `/login`
3. **Click "Create organization"** to register
4. **Fill in the registration form**
5. **After registration**, you'll be auto-logged in as Admin

### Admin Workflow - Add Locations (REQUIRED FIRST!)

Before employees can check in, you must add at least one location:

1. Go to **Locations** from sidebar
2. Click **"Add Location"**
3. Get coordinates from Google Maps (right-click → copy coordinates)
4. Set radius: 50-200 meters recommended
5. Click **"Create Location"**

### Employee Workflow - Daily Attendance

1. Login with your credentials
2. Go to **Attendance** from sidebar
3. Click **"Get My Location"** (allow browser permission)
4. Click **"Check In"** or **"Check Out"**

## 🏗️ Project Structure

See full structure in the detailed documentation above.

## 🔒 Security Features

- Multi-tenant data isolation
- Role-based access control
- GPS validation & geo-fencing
- Bcrypt password hashing
- JWT sessions
- Security headers

## 📊 Key Concepts

### Geo-fencing
System calculates distance between user and location using Haversine formula. Check-in allowed only within configured radius.

### Attendance Rules
- On-time (before 9 AM): PRESENT
- Late (9-10 AM): LATE  
- Very late (after 10 AM): HALF_DAY
- No check-in: ABSENT

## 🧪 Testing

1. Create a location with your current coordinates (radius: 500m)
2. Try checking in → Should succeed
3. Create a far location → Check-in should fail

## 🔍 Troubleshooting

**GPS Issues**: Move outdoors, allow browser permissions
**Database Issues**: Run `npx prisma generate` and `npx prisma migrate dev`
**Auth Issues**: Check credentials, verify NEXTAUTH_SECRET is set

## 📝 Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/geoattendance"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

---

**Built with ❤️ using Next.js 15, Prisma, and TypeScript**
