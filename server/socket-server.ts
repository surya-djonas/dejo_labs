import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "@prisma/client";

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Socket.IO setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Store active quiz timers
const quizTimers = new Map<string, NodeJS.Timeout>();
const quizStates = new Map<string, {
  startTime: number;
  duration: number;
  isPaused: boolean;
  pausedAt?: number;
  pausedDuration: number;
}>();

// Store active sessions and participants
const sessionParticipants = new Map<string, Set<string>>();

// Middleware for Socket.IO authentication
io.use(async (socket, next) => {
  try {
    const userId = socket.handshake.auth.userId;
    const sessionId = socket.handshake.auth.sessionId;
    
    if (!userId) {
      return next(new Error("Authentication error"));
    }
    
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user || user.isSuspended) {
      return next(new Error("User not found or suspended"));
    }
    
    socket.data.userId = userId;
    socket.data.userName = user.name;
    socket.data.userRole = user.role;
    socket.data.sessionId = sessionId;
    
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.data.userId}`);
  
  // Join user to their personal room
  socket.join(`user:${socket.data.userId}`);
  
  // Session management
  socket.on("session:join", async (data: { sessionId: string }) => {
    const { sessionId } = data;
    const userId = socket.data.userId;
    
    socket.join(`session:${sessionId}`);
    
    // Track participants
    if (!sessionParticipants.has(sessionId)) {
      sessionParticipants.set(sessionId, new Set());
    }
    sessionParticipants.get(sessionId)!.add(userId);
    
    // Record attendance
    try {
      await prisma.attendance.create({
        data: {
          sessionId,
          userId,
          joinedAt: new Date(),
        },
      });
      
      // Broadcast updated participant count
      const participants = Array.from(sessionParticipants.get(sessionId)!);
      const users = await prisma.user.findMany({
        where: { id: { in: participants } },
        select: { id: true, name: true, image: true },
      });
      
      io.to(`session:${sessionId}`).emit("session:participants", {
        count: participants.length,
        users,
      });
    } catch (error) {
      console.error("Error recording attendance:", error);
    }
  });
  
  socket.on("session:leave", async (data: { sessionId: string }) => {
    const { sessionId } = data;
    const userId = socket.data.userId;
    
    socket.leave(`session:${sessionId}`);
    
    // Update attendance
    try {
      const attendance = await prisma.attendance.findFirst({
        where: {
          sessionId,
          userId,
          leftAt: null,
        },
        orderBy: { joinedAt: "desc" },
      });
      
      if (attendance) {
        const duration = Math.floor(
          (new Date().getTime() - attendance.joinedAt.getTime()) / 1000
        );
        
        await prisma.attendance.update({
          where: { id: attendance.id },
          data: {
            leftAt: new Date(),
            duration,
          },
        });
      }
      
      // Update participant count
      sessionParticipants.get(sessionId)?.delete(userId);
      const participants = Array.from(sessionParticipants.get(sessionId) || []);
      const users = await prisma.user.findMany({
        where: { id: { in: participants } },
        select: { id: true, name: true, image: true },
      });
      
      io.to(`session:${sessionId}`).emit("session:participants", {
        count: participants.length,
        users,
      });
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  });
  
  // Quiz management
  socket.on("quiz:start", async (data: { quizId: string; classroomId: string }) => {
    const { quizId, classroomId } = data;
    
    try {
      // Update quiz status
      const quiz = await prisma.quiz.update({
        where: { id: quizId },
        data: {
          status: "ACTIVE",
          isLive: true,
          startedAt: new Date(),
        },
        include: {
          questions: true,
        },
      });
      
      // Initialize timer state
      const duration = quiz.duration || 0;
      quizStates.set(quizId, {
        startTime: Date.now(),
        duration: duration * 1000,
        isPaused: false,
        pausedDuration: 0,
      });
      
      // Broadcast to classroom
      io.to(`classroom:${classroomId}`).emit("quiz:start", {
        quizId,
        duration,
        totalQuestions: quiz.questions.length,
      });
      
      // Start timer
      startQuizTimer(quizId, classroomId, duration);
      
      console.log(`Quiz ${quizId} started in classroom ${classroomId}`);
    } catch (error) {
      console.error("Error starting quiz:", error);
      socket.emit("error", { message: "Failed to start quiz" });
    }
  });
  
  socket.on("quiz:timer:pause", async (data: { quizId: string; classroomId: string }) => {
    const { quizId, classroomId } = data;
    const state = quizStates.get(quizId);
    
    if (state && !state.isPaused) {
      state.isPaused = true;
      state.pausedAt = Date.now();
      
      // Clear existing timer
      const timer = quizTimers.get(quizId);
      if (timer) {
        clearInterval(timer);
        quizTimers.delete(quizId);
      }
      
      io.to(`classroom:${classroomId}`).emit("quiz:timer:pause");
      console.log(`Quiz ${quizId} timer paused`);
    }
  });
  
  socket.on("quiz:timer:resume", async (data: { quizId: string; classroomId: string }) => {
    const { quizId, classroomId } = data;
    const state = quizStates.get(quizId);
    
    if (state && state.isPaused && state.pausedAt) {
      const pauseDuration = Date.now() - state.pausedAt;
      state.pausedDuration += pauseDuration;
      state.isPaused = false;
      state.pausedAt = undefined;
      
      // Calculate remaining time
      const elapsed = Date.now() - state.startTime - state.pausedDuration;
      const remaining = Math.floor((state.duration - elapsed) / 1000);
      
      if (remaining > 0) {
        startQuizTimer(quizId, classroomId, remaining);
      }
      
      io.to(`classroom:${classroomId}`).emit("quiz:timer:resume");
      console.log(`Quiz ${quizId} timer resumed`);
    }
  });
  
  socket.on("quiz:timer:extend", async (data: { quizId: string; classroomId: string; seconds: number }) => {
    const { quizId, classroomId, seconds } = data;
    const state = quizStates.get(quizId);
    
    if (state) {
      state.duration += seconds * 1000;
      
      io.to(`classroom:${classroomId}`).emit("quiz:timer:extended", { seconds });
      console.log(`Quiz ${quizId} timer extended by ${seconds} seconds`);
    }
  });
  
  socket.on("quiz:end", async (data: { quizId: string; classroomId: string }) => {
    const { quizId, classroomId } = data;
    
    try {
      // Clear timer
      const timer = quizTimers.get(quizId);
      if (timer) {
        clearInterval(timer);
        quizTimers.delete(quizId);
      }
      quizStates.delete(quizId);
      
      // Update quiz status
      await prisma.quiz.update({
        where: { id: quizId },
        data: {
          status: "COMPLETED",
          isLive: false,
          endedAt: new Date(),
        },
      });
      
      io.to(`classroom:${classroomId}`).emit("quiz:end", { quizId });
      console.log(`Quiz ${quizId} ended`);
    } catch (error) {
      console.error("Error ending quiz:", error);
    }
  });
  
  socket.on("quiz:answer:submit", async (data: {
    quizId: string;
    questionId: string;
    answer: any;
    timeTaken: number;
  }) => {
    const { quizId, questionId, answer, timeTaken } = data;
    const userId = socket.data.userId;
    
    try {
      // Get question to check correct answer
      const question = await prisma.quizQuestion.findUnique({
        where: { id: questionId },
      });
      
      if (!question) {
        socket.emit("error", { message: "Question not found" });
        return;
      }
      
      // Check if answer is correct
      let isCorrect = false;
      let pointsEarned = 0;
      
      if (question.correctAnswer) {
        isCorrect = checkAnswer(answer, question.correctAnswer, question.questionType);
        pointsEarned = isCorrect ? question.points : 0;
      }
      
      // Save answer
      await prisma.quizAnswer.upsert({
        where: {
          quizId_questionId_userId: {
            quizId,
            questionId,
            userId,
          },
        },
        create: {
          quizId,
          questionId,
          userId,
          answer,
          isCorrect,
          pointsEarned,
          timeTaken,
        },
        update: {
          answer,
          isCorrect,
          pointsEarned,
          timeTaken,
        },
      });
      
      // Get classroom ID
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        select: { classroomId: true },
      });
      
      if (quiz) {
        // Update leaderboard
        const leaderboard = await generateLeaderboard(quizId);
        io.to(`classroom:${quiz.classroomId}`).emit("quiz:leaderboard", leaderboard);
      }
      
      socket.emit("quiz:answer:submitted", { success: true, isCorrect, pointsEarned });
    } catch (error) {
      console.error("Error submitting answer:", error);
      socket.emit("error", { message: "Failed to submit answer" });
    }
  });
  
  // Classroom join
  socket.on("classroom:join", (data: { classroomId: string }) => {
    socket.join(`classroom:${data.classroomId}`);
    console.log(`User ${socket.data.userId} joined classroom ${data.classroomId}`);
  });
  
  socket.on("classroom:leave", (data: { classroomId: string }) => {
    socket.leave(`classroom:${data.classroomId}`);
    console.log(`User ${socket.data.userId} left classroom ${data.classroomId}`);
  });
  
  // Disconnect handler
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.data.userId}`);
  });
});

// Helper function to start quiz timer
function startQuizTimer(quizId: string, classroomId: string, duration: number) {
  let remaining = duration;
  
  const timer = setInterval(() => {
    const state = quizStates.get(quizId);
    
    if (state?.isPaused) {
      return; // Don't update when paused
    }
    
    remaining--;
    
    io.to(`classroom:${classroomId}`).emit("quiz:timer:update", {
      quizId,
      remainingTime: remaining,
    });
    
    if (remaining <= 0) {
      clearInterval(timer);
      quizTimers.delete(quizId);
      quizStates.delete(quizId);
      
      // Auto-end quiz
      prisma.quiz.update({
        where: { id: quizId },
        data: {
          status: "COMPLETED",
          isLive: false,
          endedAt: new Date(),
        },
      }).then(() => {
        io.to(`classroom:${classroomId}`).emit("quiz:end", { quizId });
      });
    }
  }, 1000);
  
  quizTimers.set(quizId, timer);
}

// Helper function to check answer correctness
function checkAnswer(studentAnswer: any, correctAnswer: any, questionType: string): boolean {
  switch (questionType) {
    case "MCQ":
    case "TRUE_FALSE":
      return studentAnswer === correctAnswer;
    case "MULTIPLE_SELECT":
      return JSON.stringify(studentAnswer.sort()) === JSON.stringify(correctAnswer.sort());
    case "SHORT_ANSWER":
      return studentAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    case "NUMERICAL":
      return parseFloat(studentAnswer) === parseFloat(correctAnswer);
    default:
      return false;
  }
}

// Helper function to generate leaderboard
async function generateLeaderboard(quizId: string) {
  const answers = await prisma.quizAnswer.groupBy({
    by: ["userId"],
    where: { quizId },
    _sum: {
      pointsEarned: true,
      timeTaken: true,
    },
    _count: {
      id: true,
    },
  });
  
  const userIds = answers.map(a => a.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true },
  });
  
  const leaderboard = answers
    .map((answer, index) => {
      const user = users.find(u => u.id === answer.userId);
      return {
        userId: answer.userId,
        userName: user?.name || "Unknown",
        userImage: user?.image,
        score: answer._sum.pointsEarned || 0,
        timeTaken: answer._sum.timeTaken || 0,
        totalAnswers: answer._count.id,
        rank: 0,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeTaken - b.timeTaken; // Less time is better
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  
  return leaderboard;
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.SOCKET_SERVER_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing server...");
  httpServer.close(() => {
    console.log("Server closed");
    prisma.$disconnect();
    process.exit(0);
  });
});
