Build a Full Live Classroom Platform with Timed Quiz System

Build a production-grade web application for live online classes with integrated real-time quizzes, countdown timers, analytics, attendance tracking, and teacher/student dashboards.

The platform should function similar to:

* Google Classroom + Live Quiz System
* Google Meet integration
* Real-time timed assessments during live classes

The application must be scalable, secure, responsive, modern, and optimized for 1000+ concurrent students.

⸻

Core Requirements

Main Features

1. Authentication System

Implement secure authentication using:

* Google OAuth Login
* Email/password login
* JWT session handling
* Role-based access control

Roles:

* Super Admin
* Teacher
* Student

Requirements:

* Session persistence
* Secure token refresh
* Multi-device login support
* Password reset
* Email verification
* Account suspension
* Classroom invite codes

Tech:

* NextAuth.js or Clerk
* Google OAuth API
* JWT

⸻

2. Live Classroom System

The platform must support live classes using Google Meet integration.

Requirements:

* Teacher can create live class
* Generate Google Meet link automatically
* Students join from dashboard
* Embedded live session page
* Attendance tracking
* Join/leave timestamps
* Session duration tracking

Features:

* Start/end class
* Class scheduling
* Live student count
* Active participants list

Google APIs:

* Google Meet API
* Google Calendar API

⸻

3. Real-Time Quiz System

This is the MOST IMPORTANT module.

Teachers must be able to:

* Create quizzes during live classes
* Send instant questions to all students
* Set countdown timer (e.g. 5 minutes)
* Auto-submit after timer ends
* Show live leaderboard
* View answer statistics in realtime

Question types:

* MCQ
* Multiple-select
* True/False
* Short answer
* Numerical answer
* Polls

Realtime Requirements:

* Questions appear instantly
* Timer synchronized for all users
* WebSocket-based communication
* No page refresh needed

Student Features:

* Answer submission
* Live countdown
* Auto-save answers
* Auto-submit on timeout
* Reconnect recovery
* Mobile responsive UI

Teacher Features:

* Broadcast question
* Pause timer
* Extend timer
* End quiz early
* Live response count
* View answers in realtime

Realtime Tech:

* Socket.IO
    OR
* Liveblocks
    OR
* Firebase Realtime Database

Timer Requirements:

* Server-authoritative timer
* Anti-cheat synchronization
* Handle reconnects correctly
* Accurate countdown across all devices

⸻

4. Analytics Dashboard

Build a complete analytics system.

Teacher Analytics:

* Student participation rate
* Accuracy percentage
* Average response time
* Question-wise performance
* Class performance trends
* Attendance analytics
* Engagement score
* Top performers
* Weak students detection

Student Analytics:

* Personal performance history
* Quiz scores
* Accuracy trends
* Time spent
* Attendance percentage

Charts:

* Bar charts
* Pie charts
* Line graphs
* Heatmaps

Tech:

* Chart.js
    OR
* Apache ECharts

Analytics Backend:

* PostgreSQL analytics tables
* Optimized aggregation queries

⸻

5. Classroom Management

Teachers can:

* Create classrooms
* Add/remove students
* Generate invite codes
* Upload study materials
* Create assignments
* Schedule quizzes
* Manage permissions

Students can:

* Join classrooms
* View materials
* Submit assignments
* View grades

⸻

6. Notifications System

Realtime notifications:

* Quiz started
* Timer ending
* Assignment posted
* Class reminder
* Student joined
* Teacher announcements

Channels:

* In-app notifications
* Email notifications
* Push notifications

Tech:

* Firebase Cloud Messaging
* Nodemailer

⸻

7. Attendance System

Automatic attendance tracking:

* Join timestamp
* Leave timestamp
* Total session duration
* Late join detection

Analytics:

* Attendance percentage
* Attendance reports
* CSV export

⸻

8. Admin Panel

Admin Features:

* User management
* Classroom management
* Ban/suspend users
* System analytics
* Platform statistics
* Error monitoring
* Activity logs

⸻

9. Security Requirements

Implement enterprise-grade security.

Requirements:

* JWT auth
* CSRF protection
* Rate limiting
* SQL injection prevention
* XSS protection
* Input validation
* Secure API routes
* Role-based authorization
* Environment variable protection
* Audit logs

Use:

* Zod validation
* Helmet.js
* bcrypt
* Prisma ORM

⸻

10. Performance Requirements

The app must support:

* 1000+ concurrent students
* Real-time updates
* Low latency quiz delivery

Optimizations:

* Redis caching
* Lazy loading
* Pagination
* CDN optimization
* Database indexing
* Query optimization
* Debounced realtime updates

⸻

Recommended Tech Stack

Frontend

* Next.js 15
* React 19
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion

Backend

* Node.js
* Express.js
* Socket.IO

Database

* PostgreSQL

ORM:

* Prisma ORM

Realtime

* Socket.IO

Cache

* Redis

Authentication

* NextAuth.js

File Storage

* AWS S3
    OR
* Cloudinary

Deployment

* Vercel (Frontend)
* Railway / Render / AWS ECS (Backend)

⸻

Database Design

Create proper relational schema for:

* users
* classrooms
* classroom_members
* quizzes
* quiz_questions
* quiz_answers
* live_sessions
* attendance
* analytics
* notifications
* assignments

Requirements:

* Foreign key constraints
* Optimized indexes
* Soft delete support
* Audit timestamps

⸻

UI/UX Requirements

Design must be:

* Modern
* Minimal
* Professional
* Responsive
* Mobile-first

Include:

* Dark mode
* Smooth animations
* Skeleton loaders
* Empty states
* Error boundaries
* Toast notifications

⸻

API Requirements

Build REST + WebSocket APIs.

REST APIs:

* Auth APIs
* Classroom APIs
* Quiz APIs
* Analytics APIs
* Attendance APIs

Realtime Events:

* quiz:start
* quiz:update
* quiz:end
* timer:update
* student:joined
* answer:submitted

⸻

Development Standards

Code Quality:

* Strict TypeScript
* ESLint
* Prettier
* Modular architecture
* Reusable components
* Clean folder structure

Testing:

* Unit tests
* Integration tests
* E2E tests

Use:

* Jest
* Playwright

⸻

Folder Structure

Use scalable architecture:

/app
/components
/features
/lib
/hooks
/services
/server
/socket
/prisma
/types
/utils

⸻

Required Pages

Public:

* Landing page
* Login/Register
* Pricing
* About

Teacher:

* Dashboard
* Live classroom
* Quiz builder
* Analytics
* Attendance reports

Student:

* Dashboard
* Join classroom
* Live session
* Quiz page
* Results page

Admin:

* Admin dashboard
* User management
* Platform analytics

⸻

Important Engineering Requirements

The application must:

* Avoid memory leaks
* Avoid race conditions
* Handle socket reconnects
* Handle network failures gracefully
* Prevent duplicate submissions
* Prevent timer desynchronization
* Be optimized for low bandwidth
* Support mobile devices
* Be production-ready

⸻

Deliverables

Generate:

1. Complete production-ready architecture
2. Database schema
3. API design
4. Frontend pages
5. Realtime socket architecture
6. Timer synchronization logic
7. Authentication flow
8. Deployment strategy
9. Security implementation
10. Scalable folder structure
11. Full TypeScript types
12. Error handling strategy
13. State management strategy
14. Testing strategy

Provide:

* Clean code
* Scalable architecture
* Detailed comments
* Bug-free implementation
* Best practices
* Production optimizations
* Complete setup instructions

The final application must be deployable immediately and suitable for real-world educational institutions.