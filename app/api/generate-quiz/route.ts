import {
  flashcardSchema,
  matchingPairSchema,
  questionSchema,
} from "@/lib/schemas";
import { google } from "@ai-sdk/google";
import { streamObject } from "ai";

export const maxDuration = 60;

const schemas = {
  flashcards: flashcardSchema,
  quiz: questionSchema,
  matchingGame: matchingPairSchema,
};

export async function POST(req: Request) {
  const { files, type } = await req.json();
  const firstFile = files[0].data;

  const schema = schemas[type as "quiz"];

  let systemPrompt = "You are a teacher. Your job is to create a ";
  switch (type) {
    case "flashcards":
      systemPrompt +=
        "set of flashcards (term and definition) maximum of 10 flashcards ";
      break;
    case "matchingGame":
      systemPrompt += "matching game exercise (8 pair terms with definitions) ";
      break;
    case "quiz":
    default:
      systemPrompt +=
        "multiple choice quiz (4 questions, each with 4 options) ";
  }
  systemPrompt += "based on the content of the document.";

  const result = streamObject({
    model: google("gemini-1.5-pro-latest"),
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Create a ${
              type === "matchingGame" ? "Matching game" : type
            } based on this document.`,
          },
          {
            type: "file",
            data: firstFile,
            mimeType: "application/pdf",
          },
        ],
      },
    ],
    schema: schema,
    output: "array",
    onFinish: ({ object }) => {
      console.log(object);
      const res = schema.safeParse(object);
      if (res.error) {
        throw new Error(res.error.errors.map((e) => e.message).join("\n"));
      }
    },
  });

  return result.toTextStreamResponse();
}
