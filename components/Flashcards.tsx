"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shuffle, RotateCcw, Check, X, RefreshCw } from "lucide-react";
import { flashcardSchemaList } from "@/lib/schemas";
import { z } from "zod";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";

export default function Flashcards({
  data,
  handleReset,
  title,
}: {
  data: z.infer<typeof flashcardSchemaList>;
  handleReset: () => void;
  title: string;
}) {
  const [cards, setCards] = useState(data);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState<{ known: number; learning: number }>(
    {
      known: 0,
      learning: 0,
    }
  );

  const handleFlip = () => setFlipped(!flipped);

  // Update score when a card is marked as known
  const handleNext = (status: "known" | "learning") => {
    setProgress((prev) => ({
      ...prev,
      [status]: prev[status] + 1,
    }));
    setFlipped(false);
    setIndex((prev) => {
      const nextIndex = (prev + 1) % cards.length;

      return nextIndex;
    });
  };

  const shuffleCards = () => {
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setIndex(0);
    setFlipped(false);
    setProgress({ known: 0, learning: 0 });
  };

  const isDone = cards.length === progress.known + progress.learning;
  const totalProgress =
    ((progress.known + progress.learning) / cards.length) * 100;

  return (
    <div className='flex flex-col items-center justify-center w-full h-screen bg-black text-white p-6'>
      <h1 className='mb-8 text-3xl font-bold'>{title}</h1>
      {!isDone && (
        <Progress value={totalProgress} className='h-1 max-w-md w-full mb-6' />
      )}

      {!isDone ? (
        <>
          <div className='flex justify-between w-full max-w-md mb-4'>
            <span className='text-base font-bold'>
              Still learning: {progress.learning}
            </span>

            <span className='text-base font-bold'>
              {progress.known + progress.learning}/{cards.length}
            </span>

            <span className='text-base font-bold'>Know: {progress.known}</span>
          </div>
          {/* Flashcard */}
          <motion.div
            className='relative'
            initial={{ rotateY: 0 }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5 }}
            onClick={handleFlip}
          >
            <Card>
              <CardContent className='sm:min-w-[450px] w-full h-64 rounded-lg shadow-lg flex items-center justify-center p-6 cursor-pointer select-none'>
                {!flipped && (
                  <div className='absolute inset-0 flex items-center justify-center text-lg font-medium'>
                    {cards[index].term}
                  </div>
                )}

                {/* Back (Answer) - Prevent Mirrored Text */}
                {flipped && (
                  <motion.div
                    initial={{ rotateY: 180 }}
                    animate={{ rotateY: 180 }}
                    className='absolute inset-0 flex break-words max-w-[90%] mx-auto text-center items-center justify-center text-lg font-medium'
                  >
                    {cards[index].definition}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Controls */}
          <div className='flex space-x-4 mt-6'>
            <Button variant='outline' onClick={() => handleNext("learning")}>
              <X className='h-5 w-5' />
            </Button>
            <Button variant='default' onClick={() => handleNext("known")}>
              <Check className='h-5 w-5' />
            </Button>
          </div>
        </>
      ) : (
        <div className='flex justify-between w-full max-w-md mb-4'>
          <span className='text-xl font-bold text-red-500'>
            Still learning: {progress.learning}
          </span>
          <span className='text-xl font-bold text-green-500'>
            Know: {progress.known}
          </span>
        </div>
      )}

      {/* Shuffle & Restart & Reset */}
      <div className='flex space-x-4 mt-4'>
        <Button variant='outline' onClick={shuffleCards}>
          <Shuffle className='h-5 w-5 mr-2' /> Shuffle
        </Button>
        <Button
          variant='ghost'
          onClick={() => {
            setIndex(0);
            setProgress({ known: 0, learning: 0 });
          }}
        >
          <RotateCcw className='h-5 w-5 mr-2' /> Restart
        </Button>
        <Button
          onClick={handleReset}
          variant='outline'
          className='bg-muted hover:bg-muted/80 w-full'
        >
          <RefreshCw className='mr-2 h-4 w-4' /> Try another PDF
        </Button>
      </div>
    </div>
  );
}
