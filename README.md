# FlowSync - Menstrual Health Tracker

![FlowSync Logo](public/logo.png)

## Overview

FlowSync is a comprehensive menstrual health tracking application designed to help users monitor, understand, and take control of their menstrual health. With a user-friendly interface and secure data storage options, FlowSync provides a seamless way to track periods, symptoms, and take notes about your menstrual health journey.

## Features

- **Secure Authentication**: Sign up with email or use Google authentication
- **Cloud Sync**: Automatically sync your data across devices using Google Drive
- **Offline Functionality**: Works offline with local storage when no internet connection is available
- **Period Tracking**: Log and predict your menstrual cycles
- **Symptom Monitoring**: Track symptoms throughout your cycle
- **Notes & Observations**: Record important health observations
- **Data Privacy**: Your data stays private, with optional Google Drive integration
- **Responsive Design**: Works on mobile, tablet, and desktop devices

## Technologies Used

- React.js
- Firebase Authentication
- Google Drive API
- React Router
- CSS3 with responsive design
- Local Storage API
- Modern JavaScript (ES6+)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Google Cloud Platform account (for Google Drive integration)
- Firebase project (for authentication)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/AmanCrafts/Menstrual-Health-Tracker.git
   cd Menstrual-Health-Tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Firebase and Google API credentials:
   ```
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Usage

### Creating an Account

1. Navigate to the Sign Up page
2. Create an account using email/password or Google authentication
3. Complete your profile information including cycle details

### Tracking Your Cycle

1. Use the Dashboard to see your current cycle status
2. Add period start/end dates from the Trackers page
3. Log symptoms and notes throughout your cycle

### Data Storage Options

FlowSync offers two storage options:

- **Google Drive**: Your data is securely stored in your personal Google Drive account
- **Local Storage**: Data is stored only in your browser (limited to one device)

You can switch between these options from your Profile page.

## Screenshots

![Login Screen](public/screenshots/login.png)
![Dashboard](public/screenshots/dashboard.png)
![Cycle Tracking](public/screenshots/tracking.png)
![Profile Settings](public/screenshots/profile.png)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [Google Drive API](https://developers.google.com/drive)
- [Font Awesome](https://fontawesome.com/)
- All contributors who have helped shape this project

---

Crafted with ❤️ for better menstrual health tracking
