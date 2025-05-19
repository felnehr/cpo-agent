"use server";

import { LinearClient } from "@linear/sdk";
import { z } from "zod";

// Define the ticket payload schema
const TicketPayloadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

type TicketPayload = z.infer<typeof TicketPayloadSchema>;

/**
 * Creates a ticket in Linear using the provided payload
 * @param payload The ticket payload containing title and description
 * @returns The URL of the created Linear issue
 */
export async function createLinearTicket(
  payload: TicketPayload
): Promise<string> {
  try {
    // Validate the payload
    const validatedPayload = TicketPayloadSchema.parse(payload);

    // Check if the required environment variables are set
    if (!process.env.LINEAR_API_KEY) {
      throw new Error("LINEAR_API_KEY environment variable is not set");
    }

    if (!process.env.LINEAR_TEAM_ID) {
      throw new Error("LINEAR_TEAM_ID environment variable is not set");
    }

    // Initialize the Linear client with the API key
    const linearClient = new LinearClient({
      apiKey: process.env.LINEAR_API_KEY,
    });

    // Create the issue using the Linear SDK
    const issuePayload = await linearClient.createIssue({
      teamId: process.env.LINEAR_TEAM_ID,
      title: validatedPayload.title,
      description: validatedPayload.description,
    });

    // Check if the issue was created successfully
    if (!issuePayload.success) {
      throw new Error("Failed to create Linear issue");
    }

    // Ensure the issue exists and get its data
    const issue = issuePayload.issue ? await issuePayload.issue : null;
    if (!issue || !issue.url) {
      throw new Error("Linear API did not return an issue URL");
    }
    // Return the issue URL
    return issue.url;
  } catch (error) {
    console.error("Error creating Linear ticket:", error);
    throw error;
  }
}
