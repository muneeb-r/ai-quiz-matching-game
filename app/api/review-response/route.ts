import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    // Parse query params from the request URL
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const name = searchParams.get("name");
    const rating = searchParams.get("rating");
    const comment = searchParams.get("comment");

    // Parse system prompt from request body
    const body = await req.json();
    const systemPrompt =
      body.prompt ||
      "You are a helpful assistant reviewing customer feedback. Provide a thoughtful response to the review.";

    // Generate AI response for the review
    const result = await generateObject({
      model: google("gemini-1.5-flash"),
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Please respond to this review:
          Customer: ${name}
          Rating: ${rating}
          Comment: ${comment}
          ID: ${id}`,
        },
      ],
      schema: z.object({
        response: z
          .string()
          .describe("A thoughtful response to the customer review"),
      }),
    });

    return new Response(result.object.response, {
      status: 200,
      headers: { "Content-Type": "plain/text" },
    });
  } catch (error) {
    console.error("Error processing review:", error);
    return new Response(`Error processing review: ${error}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
