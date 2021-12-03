import { Bot, Context, session, SessionFlavor } from 'grammy';

// Define the shape of our session.
export interface SessionData {
  listId: number;
  messageId: number;
}

// Flavor the context type to include sessions.
export type SamometerContext = Context & SessionFlavor<SessionData>;
