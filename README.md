# Job Application & Conditional Chat System

This project is a **full-stack implementation** of the trial assignment: a platform that supports job applications and **conditional real-time chat** between Employers and Job Seekers.

---

## 📽 Demo Video

- [Backend API Testing (Postman)](https://drive.google.com/file/d/1AkyPujvJeffc4GNjgj2dEuTRivjCZO2O/view?usp=sharing)
- [Frontend Walkthrough](https://drive.google.com/file/d/1WknmgA5sfV_Qmb08tkbaxMmuWLfySB2g/view?usp=sharing)

---

## 🏗 Architecture & Tech Stack

### Backend
- **Framework:** Node.js + Express
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (with roles: JobSeeker & Employer)
- **Real-time:** WebSockets using Socket.IO
- **Cache Layer:** Redis (caching last 20 messages per chat)

### Frontend
- **Framework:** React (Vite)
- **Styling:** TailwindCSS
- **Real-time Client:** Socket.IO client
- **HTTP Client:** Axios

---

## ⚙️ Application Flow

1. **Employer** registers/logs in and posts a job.  
2. **JobSeeker** registers/logs in and applies to that job with a cover note.  
3. **Employer** views all applications for their job.  
4. **Employer** accepts/rejects an application.  
   - If accepted → a `Chat` is created between Employer & JobSeeker.  
5. **Employer & JobSeeker** exchange messages in real-time.  
   - Recent messages served from Redis.  
   - Full chat history stored in MongoDB.

---

## 🔌 How WebSockets & Redis Are Integrated

- **WebSockets:**  
  When an application is accepted, both Employer & JobSeeker can join the chat room (`chatId`) via Socket.IO.  
  - `joinChat` event → join a room  
  - `sendMessage` event → save message to MongoDB & broadcast to room  
  - `newMessage` event → all participants receive new message in real time  

- **Redis:**  
  - Stores the last **20 messages per chat** for quick retrieval.  
  - On `joinChat`, server first checks Redis cache:  
    - If found → returns cached messages  
    - Else → fetches from MongoDB and populates cache  

---

## 🗄 Schema Design

### User
```js
{
  name: String,
  email: String,
  password: String (hashed),
  role: "Employer" | "JobSeeker"
}
```

### Job
```js
{
  title: String,
  description: String,
  employer: ObjectId (ref User)
}
```

### Application
```js
{
  job: ObjectId (ref Job),
  seeker: ObjectId (ref User),
  coverNote: String,
  status: "pending" | "accepted" | "rejected"
}
```

### Chat
```js
{
  participants: [ObjectId], // Employer & JobSeeker
  application: ObjectId (ref Application)
}
```

### Message
```js
{
  chat: ObjectId (ref Chat),
  sender: ObjectId (ref User),
  text: String,
  createdAt: Date
}
```

---

## 🚀 Deployment Instructions

### 1. Clone Repo
```bash
git clone <repo-url>
cd Job_App_Assignment
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```ini
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/jobchat
JWT_SECRET=supersecretkey123
JWT_EXPIRES_IN=1d
REDIS_URL=redis://127.0.0.1:6379
CLIENT_URL=http://localhost:5173
```

Run backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `.env` in `/frontend`:

```ini
VITE_API_URL=http://localhost:5000
```

Run frontend:
```bash
npm run dev
```

---

## ✅ Recruiter Demo Flow

1. Login/Register as Employer → Post a job.  
2. Login/Register as JobSeeker → Apply to that job.  
3. Employer → Accept application.  
4. Chat → Both Employer & JobSeeker chat live in real time.  

---

## 📄 Submission Checklist (as per requirements)

- [x] JWT-based authentication with roles (Employer, JobSeeker).  
- [x] Employers can post jobs.  
- [x] Job Seekers can apply with cover note.  
- [x] Employers can view and accept/reject applications.  
- [x] Conditional chat created on acceptance.  
- [x] Real-time chat via WebSockets (Socket.IO).  
- [x] Recent messages cached in Redis, history stored in MongoDB.  
- [x] Demo video linked in README.  
- [x] README includes: architecture, app flow, WebSocket & Redis integration, schema design, setup instructions.  
