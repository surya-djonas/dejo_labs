"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

interface UseSocketOptions {
  autoConnect?: boolean;
  sessionId?: string;
  classroomId?: string;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  
  const { autoConnect = true, sessionId, classroomId } = options;
  
  useEffect(() => {
    if (!session?.user?.id || !autoConnect) return;
    
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3001";
    
    const newSocket = io(socketUrl, {
      auth: {
        userId: session.user.id,
        sessionId,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
    
    newSocket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      
      // Auto-join classroom if provided
      if (classroomId) {
        newSocket.emit("classroom:join", { classroomId });
      }
    });
    
    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });
    
    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });
    
    socketRef.current = newSocket;
    setSocket(newSocket);
    
    return () => {
      if (classroomId) {
        newSocket.emit("classroom:leave", { classroomId });
      }
      newSocket.disconnect();
    };
  }, [session?.user?.id, autoConnect, sessionId, classroomId]);
  
  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);
  
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    socketRef.current?.on(event, callback);
  }, []);
  
  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    socketRef.current?.off(event, callback);
  }, []);
  
  return {
    socket,
    isConnected,
    emit,
    on,
    off,
  };
}

// Quiz-specific hook
export function useQuizSocket(quizId: string, classroomId: string) {
  const { socket, isConnected, emit, on, off } = useSocket({ classroomId });
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  
  useEffect(() => {
    if (!socket) return;
    
    const handleTimerUpdate = (data: { remainingTime: number }) => {
      setRemainingTime(data.remainingTime);
    };
    
    const handleTimerPause = () => {
      setIsPaused(true);
    };
    
    const handleTimerResume = () => {
      setIsPaused(false);
    };
    
    const handleLeaderboard = (data: any[]) => {
      setLeaderboard(data);
    };
    
    on("quiz:timer:update", handleTimerUpdate);
    on("quiz:timer:pause", handleTimerPause);
    on("quiz:timer:resume", handleTimerResume);
    on("quiz:leaderboard", handleLeaderboard);
    
    return () => {
      off("quiz:timer:update", handleTimerUpdate);
      off("quiz:timer:pause", handleTimerPause);
      off("quiz:timer:resume", handleTimerResume);
      off("quiz:leaderboard", handleLeaderboard);
    };
  }, [socket, on, off]);
  
  const startQuiz = useCallback((duration: number) => {
    emit("quiz:start", { quizId, classroomId, duration });
  }, [emit, quizId, classroomId]);
  
  const pauseTimer = useCallback(() => {
    emit("quiz:timer:pause", { quizId, classroomId });
  }, [emit, quizId, classroomId]);
  
  const resumeTimer = useCallback(() => {
    emit("quiz:timer:resume", { quizId, classroomId });
  }, [emit, quizId, classroomId]);
  
  const extendTimer = useCallback((seconds: number) => {
    emit("quiz:timer:extend", { quizId, classroomId, seconds });
  }, [emit, quizId, classroomId]);
  
  const endQuiz = useCallback(() => {
    emit("quiz:end", { quizId, classroomId });
  }, [emit, quizId, classroomId]);
  
  const submitAnswer = useCallback((questionId: string, answer: any, timeTaken: number) => {
    emit("quiz:answer:submit", { quizId, questionId, answer, timeTaken });
  }, [emit, quizId]);
  
  return {
    isConnected,
    remainingTime,
    isPaused,
    leaderboard,
    startQuiz,
    pauseTimer,
    resumeTimer,
    extendTimer,
    endQuiz,
    submitAnswer,
  };
}

// Session-specific hook
export function useSessionSocket(sessionId: string) {
  const { socket, isConnected, emit, on, off } = useSocket({ sessionId });
  const [participants, setParticipants] = useState<{ count: number; users: any[] }>({
    count: 0,
    users: [],
  });
  
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    // Join session
    emit("session:join", { sessionId });
    
    const handleParticipants = (data: { count: number; users: any[] }) => {
      setParticipants(data);
    };
    
    on("session:participants", handleParticipants);
    
    return () => {
      emit("session:leave", { sessionId });
      off("session:participants", handleParticipants);
    };
  }, [socket, isConnected, sessionId, emit, on, off]);
  
  return {
    isConnected,
    participants,
  };
}
