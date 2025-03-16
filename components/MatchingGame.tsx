import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { matchingPairSchemaList } from "@/lib/schemas";
import { z } from "zod";
import { Button } from "./ui/button";
import { RefreshCw, RotateCcw } from "lucide-react";
import { Progress } from "./ui/progress";

type Pairs = z.infer<typeof matchingPairSchemaList>;
export default function MatchingGame({
  pairs,
  handleReset,
}: {
  pairs: Pairs;
  handleReset: () => void;
}) {
  const [shuffledItems, setShuffledItems] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [time, setTime] = useState(0);
  const [mismatch, setMismatch] = useState(false);

  const isDone = shuffledItems.length === matched.length;
  const totalProgress = (matched.length / shuffledItems.length) * 100;

  useEffect(() => {
    const shuffled = [
      ...pairs.flatMap((pair) => [pair.leftItem, pair.rightItem]),
    ].sort(() => Math.random() - 0.5);
    setShuffledItems(shuffled);
  }, [pairs]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isDone) {
      timer = setInterval(() => setTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isDone]);

  const handleSelect = (item: string) => {
    if (selected.length === 1) {
      const firstItem = selected[0];
      const isMatch = pairs.some(
        (pair) =>
          (pair.leftItem === firstItem && pair.rightItem === item) ||
          (pair.rightItem === firstItem && pair.leftItem === item)
      );

      if (isMatch) {
        setMatched([...matched, firstItem, item]);
      } else {
        setMismatch(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setMismatch(false);
        }, 500);
      }
      setTimeout(() => setSelected([]), 500);
    } else {
      setSelected([item]);
    }
  };

  const getClassesState = (item: string) => {
    return matched.includes(item)
      ? "bg-green-500 text-white"
      : mismatch && selected.includes(item)
      ? "bg-red-500 text-white"
      : selected.includes(item)
      ? "bg-orange-500 text-white"
      : "bg-black text-white";
  };

  return (
    <div className='flex flex-col max-w-2xl mx-auto my-6 gap-6'>
      <h1 className='text-3xl font-bold'>Matching Game</h1>
      {!isDone && <span>{time}s</span>}
      {<Progress value={totalProgress} className='h-1 w-full mb-3' />}
      {isDone ? (
        <div className='text-2xl text-center my-12'>
          {time}s to Complete the Game!
        </div>
      ) : (
        <div className='grid grid-cols-4 gap-4 mx-auto'>
          {shuffledItems.map((item, index) => (
            <motion.div
              key={index}
              className={`p-4 text-base border text-center flex items-center justify-center col-span-1 h-full line-clamp-2 break-words aspect-square rounded-lg transition-all ${getClassesState(
                item
              )}`}
              onClick={() => {
                if (matched.includes(item)) return;
                handleSelect(item);
              }}
              animate={
                shake && selected.includes(item)
                  ? { x: [-75, 75, -75, 75, 0] }
                  : {}
              }
              transition={{ duration: 0.3, easing: "ease" }}
            >
              {item}
            </motion.div>
          ))}
        </div>
      )}
      <div className='flex space-x-4 mt-4'>
        <Button
          variant='ghost'
          onClick={() => {
            setSelected([]);
            setMatched([]);
            setTime(0);
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
