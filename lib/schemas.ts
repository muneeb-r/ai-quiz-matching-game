import { z } from "zod";

export const questionSchema = z.object({
  question: z.string(),
  options: z
    .array(z.string())
    .length(4)
    .describe(
      "Four possible answers to the question. Only one should be correct. They should all be of equal lengths."
    ),
  answer: z
    .enum(["A", "B", "C", "D"])
    .describe(
      "The correct answer, where A is the first option, B is the second, and so on."
    ),
});

export type Question = z.infer<typeof questionSchema>;

export const flashcardSchema = z.object({
  term: z.string().describe("The term or key concept."),
  definition: z
    .string()
    .describe("A clear and concise definition of the term."),
  difficulty: z
    .enum(["easy", "medium", "hard"])
    .default("medium")
    .describe("User-assessed difficulty."),
  timesReviewed: z
    .number()
    .int()
    .nonnegative()
    .default(0)
    .describe("How many times the flashcard has been reviewed."),
  lastReviewed: z
    .date()
    .optional()
    .describe("Timestamp of the last time the flashcard was reviewed."),
  confidenceLevel: z
    .enum(["low", "medium", "high"])
    .default("low")
    .describe("How well the user thinks they know this flashcard."),
  status: z.enum(["new", "learning", "reviewing", "mastered"]).default("new"), // Progress status
});

export const matchingPairSchema = z.object({
  leftItem: z.string(), // First item (e.g., term, question, image URL)
  rightItem: z.string(), // Matching item (e.g., definition, answer, corresponding image URL)
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"), // Difficulty level
});

export const questionsSchema = z.array(questionSchema).length(4);
export const flashcardSchemaList = z.array(flashcardSchema).length(10);
export const matchingPairSchemaList = z.array(matchingPairSchema).length(8);
