# L2 Platform Backend API Documentation

## Authentication
- POST /api/auth/register
  - Register new user
  - Body: { name, email, password, skillsKnown, skillsToLearn }
- POST /api/auth/login
  - Login user
  - Body: { email, password }
  - Returns: JWT token
- GET /api/auth/profile
  - Get user profile (JWT required)

## Skills
- GET /api/skills/
  - Get user's skills (JWT required)
- PUT /api/skills/
  - Update user's skills (JWT required)
  - Body: { skillsKnown, skillsToLearn }

## Matching
- GET /api/match/
  - Get list of matched users (JWT required)

## Chat (Socket.io)
- join: { userId }
- send_message: { senderId, receiverId, message }
- receive_message: { senderId, message, timestamp }
- fetch_history: { userId, peerId }

## Video (Socket.io)
- join_video_room: { roomId, userId }
- video_offer: { roomId, offer, senderId }
- video_answer: { roomId, answer, senderId }
- ice_candidate: { roomId, candidate, senderId }
- save_video_session: { userA, userB }
- leave_video_room: { roomId, userId }

## Requests
- POST /api/request/send
  - Send connection request
  - Body: { receiverId }
- GET /api/request/received
  - Get received requests (JWT required)
- POST /api/request/respond
  - Respond to request
  - Body: { requestId, action ('accept'|'reject') }

## Setup & Testing
- Add your MongoDB URI and JWT secret to .env
- Start server: npm start
- Use Postman or similar for REST endpoints
- Use Socket.io client for real-time chat/video

## Notes
- All protected routes require Authorization: Bearer <token>
- Socket.io events require userId for identification
- Video signaling is for WebRTC peer connection setup
