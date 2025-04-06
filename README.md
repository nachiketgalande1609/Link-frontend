# Ripple

## Overview
Ripple is a fully scalable, feature-rich social media application that enables real-time interaction and seamless communication. Designed with extensibility in mind, the architecture can be expanded to a microservices-based model as the user base grows. With functionalities like real-time messaging, video calls, expiring stories, media sharing, and live notifications, it provides an immersive and secure social experience.

## Features
- **Real-Time Messaging:** Powered by Socket.io for instant chats.
- **WebRTC Video Calls:** Peer-to-peer video communication directly in the browser.
- **Expiring Stories:** Temporary story posts that disappear after a set time.
- **Push & Live Notifications:** Instant feedback for new messages, likes, comments, and more.
- **Media Sharing:** Upload and share images, videos, and files.
- **Secure Authentication:** Includes JWT-based login and Google OAuth.
- **Infinite Scrolling:** Optimized loading of posts for a smoother UX.
- **End-to-End Encrypted Messaging:** Ensures secure and private conversations.

## Technology Stack

### Frontend
- **React.js:** Component-based UI development.
- **Redux:** Global state management.
- **Socket.io-client:** Real-time updates.
- **WebRTC:** Browser-based video calls.
- **Axios:** For API requests.
- **Nginx:** Frontend served via reverse proxy.

### Backend
- **Node.js & Express.js:** Handles REST API, authentication, and real-time communication.
- **Socket.io:** Real-time bidirectional communication.
- **WebRTC Integration:** Video call signaling.
- **JWT & Google OAuth 2.0:** Authentication and secure login.
- **AWS EC2:** Hosting backend services.
- **Nginx:** Reverse proxy and load balancing.

### Database
- **MongoDB** or **PostgreSQL:** Managed with **AWS RDS** for high availability and scalability.

## Modules

### Real-Time Chat
- **Functionality:** Instant messaging with typing indicators and media support.
- **Technology:** Socket.io and E2E encryption.

### WebRTC Calls
- **Functionality:** High-quality video calls with direct peer-to-peer connections.
- **Technology:** WebRTC for streaming and signaling via Socket.io.

### Expiring Stories
- **Functionality:** Users can post stories that vanish after a defined duration.
- **Technology:** Server-side expiration scheduler and frontend story viewer.

### Media Sharing
- **Functionality:** Share images, videos, and documents within chats and posts.
- **Technology:** File upload handling with secure cloud storage.

### Notifications
- **Functionality:** Real-time in-app alerts for user interactions.
- **Technology:** WebSockets and push API for browser/mobile notifications.

### Authentication
- **Functionality:** Sign up/login with email or Google.
- **Technology:** JWT for session tokens, Google OAuth for third-party login.

## Screenshots

> _Add screenshots of chat interface, story viewer, profile page, etc._

### Chat Interface  
![Chat](./screenshots/chat.png)

### Video Call  
![Video Call](./screenshots/video_call.png)

### Stories Page  
![Stories](./screenshots/stories.png)

### Notifications Panel  
![Notifications](./screenshots/notifications.png)

## Getting Started

### Prerequisites
- Node.js
- npm/yarn
- AWS CLI (optional for deployment)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/social-media-platform.git
   cd social-media-platform
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   # Create a .env file with required config
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../client
   npm install
   npm start
   ```

### Environment Variables

**Example `.env` for backend:**
```env
PORT=5000
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DB_URI=your_database_url
```

## Deployment

- **Frontend & Backend:** Deployed on **AWS EC2** instances.
- **Database:** Hosted on **AWS RDS**.
- **Nginx:** Used as a reverse proxy to manage both frontend and backend.
- **HTTPS:** Enabled with Let’s Encrypt SSL certificates.

## Contributing

We welcome contributions! Please fork the repo and open a pull request with your proposed changes.

