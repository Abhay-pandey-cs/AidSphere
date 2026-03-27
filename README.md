# AidSphere Setup Guide 🚀

Follow these steps to get the platform running on your local machine.

## 1. Prerequisites
- **Node.js**: [Download here](https://nodejs.org/)
- **MongoDB**: Local installation or MongoDB Atlas URI.

## 2. Backend Setup
1. Open a terminal in `d:\AidSphere\backend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update your `.env` file (ensure it matches your local MongoDB):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/aidsphere
   JWT_SECRET=your_super_secret_jwt_key_here
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

## 3. Frontend Setup
1. Open a terminal in `d:\AidSphere\frontend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

## 4. Testing the Platform
- **Victim Flow**: Signup as a "Victim" and raise an SOS.
- **Volunteer Flow**: Signup as a "Volunteer", click the **DigiLocker Verification** banner, and get verified.
- **Admin Flow**: Use the Admin dashboard to monitor SOS signals and the **Social Media Feed**.
- **Maps**: View the real-time markers on the `Live Map` page.

## Key Features Implemented:
- [x] **MERN + Socket.io** Real-time backend.
- [x] **AI Sentiment Analysis** for social media distress calls.
- [x] **DigiLocker Mock** for identity verification.
- [x] **Premium Light Theme** UI.
- [x] **Fundraising & Mental Health** portals.
