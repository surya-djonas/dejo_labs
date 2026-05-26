"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuizSocket } from "@/hooks/use-socket";
import { QuizTimer } from "@/components/quiz/quiz-timer";
import { Leaderboard } from "@/components/quiz/leaderboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle } from "lucide-react";

export default function LiveQuizPage() {
  const params = useParams();
  const quizId = params.id as string;
  const classroomId = params.classroomId as string;
  
  const {
    isConnected,
    remainingTime,
    isPaused,
    leaderboard,
    submitAnswer,
  } = useQuizSocket(quizId, classroomId);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questions, setQuestions] = useState([
    {
      id: "q1",
      questionType: "MCQ",
      questionText: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: "Paris",
      points: 10,
    },
    {
      id: "q2",
      questionType: "MULTIPLE_SELECT",
      questionText: "Which of these are programming languages?",
      options: ["Python", "HTML", "JavaScript", "CSS"],
      correctAnswer: ["Python", "JavaScript"],
      points: 15,
    },
  ]);
  
  const question = questions[currentQuestion];
  
  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    submitAnswer(question.id, selectedAnswer, timeTaken);
    setIsSubmitted(true);
    
    // Move to next question after 2 seconds
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsSubmitted(false);
        setStartTime(Date.now());
      }
    }, 2000);
  };
  
  const handleOptionSelect = (option: string) => {
    if (isSubmitted) return;
    
    if (question.questionType === "MULTIPLE_SELECT") {
      const current = selectedAnswer || [];
      if (current.includes(option)) {
        setSelectedAnswer(current.filter((o: string) => o !== option));
      } else {
        setSelectedAnswer([...current, option]);
      }
    } else {
      setSelectedAnswer(option);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Quiz Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timer and Status */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                    <span className="text-sm text-muted-foreground">
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {questions.length}
                  </div>
                </div>
                <QuizTimer remainingTime={remainingTime} isPaused={isPaused} />
              </CardContent>
            </Card>
            
            {/* Question Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">
                    Question {currentQuestion + 1}
                  </CardTitle>
                  <span className="text-sm font-semibold text-primary">
                    {question.points} points
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg">{question.questionText}</p>
                
                {question.questionType === "MCQ" || question.questionType === "MULTIPLE_SELECT" ? (
                  <div className="space-y-3">
                    {question.options.map((option: string) => (
                      <button
                        key={option}
                        onClick={() => handleOptionSelect(option)}
                        disabled={isSubmitted}
                        className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                          Array.isArray(selectedAnswer)
                            ? selectedAnswer.includes(option)
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                            : selectedAnswer === option
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        } ${isSubmitted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        {Array.isArray(selectedAnswer) ? (
                          selectedAnswer.includes(option) ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )
                        ) : selectedAnswer === option ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                        <span className="text-left flex-1">{option}</span>
                      </button>
                    ))}
                  </div>
                ) : question.questionType === "SHORT_ANSWER" ? (
                  <Input
                    placeholder="Type your answer..."
                    value={selectedAnswer || ""}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    disabled={isSubmitted}
                  />
                ) : null}
                
                <Button
                  onClick={handleAnswerSubmit}
                  disabled={!selectedAnswer || isSubmitted}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitted ? "Submitted ✓" : "Submit Answer"}
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Leaderboard Sidebar */}
          <div className="lg:col-span-1">
            <Leaderboard entries={leaderboard} />
          </div>
        </div>
      </div>
    </div>
  );
}
