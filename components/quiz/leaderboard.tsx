"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock, Target } from "lucide-react";

interface LeaderboardProps {
  entries: Array<{
    userId: string;
    userName: string;
    userImage?: string;
    score: number;
    timeTaken: number;
    rank: number;
  }>;
}

export function Leaderboard({ entries }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No submissions yet
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-4 p-3 rounded-lg ${
                index === 0
                  ? "bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300"
                  : index === 1
                  ? "bg-gray-100 dark:bg-gray-800"
                  : index === 2
                  ? "bg-orange-50 dark:bg-orange-900/20"
                  : "bg-background border"
              }`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                {entry.rank}
              </div>
              
              {entry.userImage ? (
                <Image
                  src={entry.userImage}
                  alt={entry.userName}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-semibold">
                  {entry.userName.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className="flex-1">
                <p className="font-semibold">{entry.userName}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {entry.score} pts
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.floor(entry.timeTaken / 60)}m {entry.timeTaken % 60}s
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
