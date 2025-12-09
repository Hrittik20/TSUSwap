-- Migration: Add Feedback table
-- Run this in Supabase SQL Editor

-- Create FeedbackType enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE "FeedbackType" AS ENUM ('BUG', 'FEATURE', 'IMPROVEMENT', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create feedbacks table if it doesn't exist
CREATE TABLE IF NOT EXISTS "feedbacks" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "type" "FeedbackType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "userId" TEXT,
  "userEmail" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create index on userId for faster queries
CREATE INDEX IF NOT EXISTS "feedbacks_userId_idx" ON "feedbacks"("userId");

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS "feedbacks_status_idx" ON "feedbacks"("status");

-- Create index on createdAt for sorting
CREATE INDEX IF NOT EXISTS "feedbacks_createdAt_idx" ON "feedbacks"("createdAt");

