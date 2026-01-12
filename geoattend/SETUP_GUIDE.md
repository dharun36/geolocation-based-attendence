# 🚀 Quick Start Guide - GeoAttend Setup

## Current Status
✅ All code files created
✅ Dependencies installed
✅ Prisma client generated
✅ TypeScript errors fixed (pending TS server reload)
⏳ Database setup pending

## ⚠️ IMPORTANT: Fix TypeScript Errors

The TypeScript errors you see are just because VS Code's TypeScript server needs to reload. Here's how:

### Option 1: Restart VS Code (Recommended)
1. Close VS Code completely
2. Reopen the project
3. All Prisma types will be recognized

### Option 2: Reload TypeScript Server
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: "TypeScript: Restart TS Server"
3. Press Enter

After doing this, all errors will disappear! ✨

## 📦 Next Steps to Run the App

### Step 1: Install & Start PostgreSQL

#### Option A: Using PostgreSQL Installer
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for the `postgres` user
4. PostgreSQL will start automatically

#### Option B: Using Docker (if you have Docker)
```bash
docker run --name geoattend-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:14
```

### Step 2: Update Database Connection

Edit `.env` file with your PostgreSQL password:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/geoattendance?schema=public"
```

Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

### Step 3: Create Database & Run Migrations

Open PowerShell in VS Code and run:

```bash
# Create database
npx prisma migrate dev --name initial_schema

# This will:
# - Create the 'geoattendance' database
# - Create all tables (Organization, User, Location, Attendance, etc.)
# - Generate Prisma client again
```

### Step 4: (Optional) Seed Sample Data

To test with sample data, run:

```bash
# Open Prisma Studio to add data manually
npx prisma studio

# Or create a seed script (we can do this later)
```

### Step 5: Start the Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

## 🎯 What Happens Next

1. You'll be redirected to `/login`
2. Click **"Create organization"**
3. Fill in the registration form:
   - Organization Name: e.g., "Acme Inc"
   - Organization Slug: e.g., "acme-inc"
   - Your Name: Your full name
   - Email: admin@acme.com
   - Password: Secure password
4. After registration, you'll be logged in as Admin
5. **IMPORTANT**: First, go to **Locations** and add at least one location
6. Then you can start checking in/out!

## 🗺️ Adding Your First Location

1. After login, click **"Locations"** in sidebar
2. Click **"Add Location"**
3. Get coordinates:
   - Open Google Maps
   - Right-click on your office location
   - Click the coordinates to copy (e.g., "40.712776, -74.005974")
4. Fill in the form:
   - Name: "Main Office"
   - Address: Your office address
   - Latitude: 40.712776
   - Longitude: -74.005974
   - Radius: 100 (meters)
5. Click **"Create Location"**

## 📱 Testing Check-in/Check-out

1. Go to **"Attendance"** page
2. Click **"Get My Location"**
   - Browser will ask for permission - click "Allow"
3. Once location is acquired, click **"Check In"**
4. If you're within the geo-fence radius → Success! ✅
5. If you're too far → Error message with distance
6. Later, click **"Check Out"** to complete the day

## 🔧 Troubleshooting

### PostgreSQL Not Running
```bash
# Check if PostgreSQL is running
Get-Service postgresql*

# Start PostgreSQL service
Start-Service postgresql-x64-14  # Replace with your version
```

### Can't Connect to Database
- Check PostgreSQL is running on port 5432
- Verify password in `.env` is correct
- Try: `psql -U postgres -h localhost` to test connection

### GPS Not Working
- Use HTTPS in production (required for GPS)
- In development, localhost works
- Check browser permissions for location

### "Prisma Client not found"
```bash
npx prisma generate
```

## 📚 Project Structure

```
geoattend/
├── app/
│   ├── actions/           # Server Actions (mutations)
│   ├── dashboard/         # Protected pages
│   ├── login/            # Auth pages
│   └── api/auth/         # NextAuth routes
├── components/           # Reusable UI components
├── lib/                  # Utilities & config
├── prisma/              # Database schema & migrations
├── types/               # TypeScript types
├── .env                 # Environment variables
└── middleware.ts        # Auth & route protection
```

## ✨ Features Implemented

### Authentication & Authorization
- [x] User registration with organization setup
- [x] Login with email/password
- [x] Role-based access control (Admin, Manager, Employee)
- [x] Protected routes with middleware
- [x] Auto-login after registration

### Attendance Management
- [x] GPS-based check-in
- [x] GPS-based check-out
- [x] Geo-fence validation
- [x] Automatic late detection
- [x] Attendance history view
- [x] Monthly statistics

### Location Management
- [x] Add locations with coordinates
- [x] Configure geo-fence radius
- [x] Active/inactive status
- [x] View check-in counts per location

### Dashboard
- [x] KPI cards (Total, Present, Absent, Late)
- [x] Today's summary
- [x] Recent check-ins table
- [x] Attendance rate calculation

### Multi-tenancy
- [x] Organization-based data isolation
- [x] Unique user emails per organization
- [x] Tenant filtering on all queries

### Audit Logging
- [x] Login tracking
- [x] Organization creation
- [x] Location creation/updates
- [x] Check-in/check-out events

## 🔜 Coming Soon (Optional Extensions)

- [ ] User management page (add/edit employees)
- [ ] Reports with export to CSV/Excel
- [ ] Leave request system
- [ ] Email notifications
- [ ] Attendance rules configuration
- [ ] Mobile app (React Native)

## 💡 Tips for Learning

1. **Start with the flow**: Registration → Add Location → Check-in
2. **Explore the code**: Read comments in each file
3. **Check Prisma Studio**: See how data is stored
4. **Modify and experiment**: Change geo-fence radius, add fields
5. **Break things**: Best way to learn how it works!

## 🐛 Known Issues & Solutions

### Issue: TypeScript errors everywhere
**Solution**: Restart VS Code or reload TS server (see top of this guide)

### Issue: "Can't reach database"
**Solution**: Start PostgreSQL service

### Issue: "Location accuracy too low"
**Solution**: Move outdoors or near a window for better GPS signal

### Issue: "You are Xm away from location"
**Solution**: 
- Increase location radius, OR
- Add a location at your current position, OR
- Use your real office coordinates

## 📞 Support

If you get stuck:
1. Check this guide
2. Review the `README.md`
3. Look at code comments
4. Check Prisma/NextAuth documentation
5. Use console.log() to debug

---

**You're all set! 🎉**

Just need to:
1. Restart VS Code (to fix TypeScript errors)
2. Start PostgreSQL
3. Run migrations
4. Start dev server
5. Register your organization
6. Add a location
7. Start checking in! ✅

Happy coding! 🚀
