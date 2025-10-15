"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuestionCardProps {
  question: string;
  options: string[];
  correctAnswer: string;
  onAnswered?: (correct: boolean) => void;
}

export default function QuestionCard({
  question,
  options,
  correctAnswer,
  onAnswered,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    setSelected(option);
    const correct = option === correctAnswer;
    onAnswered?.(correct);
  };

  return (
    <Card className="p-6 shadow-sm">
      <CardContent>
        <h3 className="text-lg font-semibold mb-4 text-green-700">
          {question}
        </h3>
        <div className="grid gap-3">
          {options.map((option) => {
            const isSelected = selected === option;
            const isCorrect = option === correctAnswer;

            return (
              <Button
                key={option}
                variant={isSelected ? (isCorrect ? "default" : "destructive") : "outline"}
                onClick={() => handleSelect(option)}
                disabled={!!selected}
              >
                {option}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
