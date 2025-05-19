"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createLinearTicket } from "@/app/actions/linear";
import { MessageSquare, Send, Loader2, CheckCircle } from "lucide-react";

export default function Chat() {
  const [ticketUrl, setTicketUrl] = useState<string | null>(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
    });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Check for TICKET_PAYLOAD in the latest assistant message
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant" && !isCreatingTicket && !ticketUrl) {
      const ticketPayloadMatch = lastMessage.content.match(
        /TICKET_PAYLOAD\s*```json\s*({[\s\S]*?})\s*```/
      );

      if (ticketPayloadMatch) {
        try {
          const payloadString = ticketPayloadMatch[1];
          const payload = JSON.parse(payloadString);

          if (payload.title && payload.description) {
            setIsCreatingTicket(true);

            createLinearTicket(payload)
              .then((url) => {
                setTicketUrl(url);
              })
              .catch((error) => {
                console.error("Error creating Linear ticket:", error);
              })
              .finally(() => {
                setIsCreatingTicket(false);
              });
          }
        } catch (error) {
          console.error("Error parsing TICKET_PAYLOAD:", error);
        }
      }
    }
  }, [messages, isCreatingTicket, ticketUrl]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          CPO Assistant (OpenAI)
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[60vh] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            Start a conversation to describe your feature request
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {/* Replace TICKET_PAYLOAD blocks with a nicer message */}
                  {message.role === "assistant" &&
                  message.content.includes("TICKET_PAYLOAD") ? (
                    <div>
                      {message.content.split("TICKET_PAYLOAD")[0]}
                      <div className="mt-2 p-2 bg-green-100 dark:bg-green-900 rounded">
                        <p className="font-medium">
                          Ticket information prepared!
                        </p>
                      </div>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}
            {isCreatingTicket && (
              <div className="flex justify-center">
                <div className="flex items-center gap-2 p-2 bg-amber-100 dark:bg-amber-900 rounded">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Linear ticket...</span>
                </div>
              </div>
            )}
            {ticketUrl && (
              <div className="flex justify-center">
                <div className="flex flex-col items-center gap-2 p-3 bg-green-100 dark:bg-green-900 rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span>Ticket created successfully!</span>
                  </div>
                  <a
                    href={ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View ticket in Linear
                  </a>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Describe your feature request..."
            disabled={isLoading || isCreatingTicket}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || isCreatingTicket || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
