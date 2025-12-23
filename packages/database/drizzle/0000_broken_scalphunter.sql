CREATE TYPE "public"."EmailFolder" AS ENUM('INBOX', 'SENT', 'DRAFTS', 'SPAM', 'TRASH', 'ARCHIVE');--> statement-breakpoint
CREATE TYPE "public"."EmailStatus" AS ENUM('STORED', 'DELETED', 'QUARANTINED');--> statement-breakpoint
CREATE TYPE "public"."PlanType" AS ENUM('FREE', 'PREMIUM');--> statement-breakpoint
CREATE TABLE "Alias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aliasAddress" text NOT NULL,
	"targetUserId" uuid NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Alias_aliasAddress_unique" UNIQUE("aliasAddress")
);
--> statement-breakpoint
CREATE TABLE "Attachment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"emailId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"filename" varchar(255) NOT NULL,
	"mimeType" varchar(100) NOT NULL,
	"sizeBytes" bigint NOT NULL,
	"contentId" text,
	"r2Path" text NOT NULL,
	"isInline" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Email" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"messageId" text,
	"userId" uuid NOT NULL,
	"threadId" uuid,
	"dateReceived" timestamp DEFAULT now() NOT NULL,
	"dateSent" timestamp,
	"sizeBytes" bigint NOT NULL,
	"r2DatagramPath" text NOT NULL,
	"hasHtml" boolean DEFAULT false NOT NULL,
	"hasPlainText" boolean DEFAULT false NOT NULL,
	"hasAttachments" boolean DEFAULT false NOT NULL,
	"attachmentCount" integer DEFAULT 0 NOT NULL,
	"encrypted" boolean DEFAULT false NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"isStarred" boolean DEFAULT false NOT NULL,
	"folder" "EmailFolder" DEFAULT 'INBOX' NOT NULL,
	"status" "EmailStatus" DEFAULT 'STORED' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PGPKey" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"publicKey" text NOT NULL,
	"privateKey" text,
	"fingerprint" text NOT NULL,
	"algorithm" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "Thread" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"subject" varchar(998) NOT NULL,
	"rootMessageId" text,
	"messageCount" integer DEFAULT 1 NOT NULL,
	"unreadCount" integer DEFAULT 1 NOT NULL,
	"folder" "EmailFolder" DEFAULT 'INBOX' NOT NULL,
	"hasAttachments" boolean DEFAULT false NOT NULL,
	"isStarred" boolean DEFAULT false NOT NULL,
	"participants" json DEFAULT '[]'::json NOT NULL,
	"lastMessageAt" timestamp DEFAULT now() NOT NULL,
	"firstMessageAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"planType" "PlanType" DEFAULT 'FREE' NOT NULL,
	"quotaBytes" bigint NOT NULL,
	"usedBytes" bigint DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "Alias" ADD CONSTRAINT "Alias_targetUserId_User_id_fk" FOREIGN KEY ("targetUserId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_emailId_Email_id_fk" FOREIGN KEY ("emailId") REFERENCES "public"."Email"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Email" ADD CONSTRAINT "Email_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Email" ADD CONSTRAINT "Email_threadId_Thread_id_fk" FOREIGN KEY ("threadId") REFERENCES "public"."Thread"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PGPKey" ADD CONSTRAINT "PGPKey_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "Alias_aliasAddress_idx" ON "Alias" USING btree ("aliasAddress");--> statement-breakpoint
CREATE INDEX "Alias_targetUserId_idx" ON "Alias" USING btree ("targetUserId");--> statement-breakpoint
CREATE INDEX "Attachment_emailId_idx" ON "Attachment" USING btree ("emailId");--> statement-breakpoint
CREATE INDEX "Attachment_userId_idx" ON "Attachment" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "Attachment_contentId_idx" ON "Attachment" USING btree ("contentId");--> statement-breakpoint
CREATE INDEX "Email_userId_dateReceived_idx" ON "Email" USING btree ("userId","dateReceived" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "Email_userId_folder_isRead_idx" ON "Email" USING btree ("userId","folder","isRead");--> statement-breakpoint
CREATE INDEX "Email_userId_folder_dateReceived_idx" ON "Email" USING btree ("userId","folder","dateReceived" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "Email_messageId_idx" ON "Email" USING btree ("messageId");--> statement-breakpoint
CREATE INDEX "Email_threadId_dateReceived_idx" ON "Email" USING btree ("threadId","dateReceived" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "PGPKey_userId_active_idx" ON "PGPKey" USING btree ("userId","active");--> statement-breakpoint
CREATE INDEX "PGPKey_fingerprint_idx" ON "PGPKey" USING btree ("fingerprint");--> statement-breakpoint
CREATE INDEX "Thread_userId_folder_lastMessageAt_idx" ON "Thread" USING btree ("userId","folder","lastMessageAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "Thread_rootMessageId_idx" ON "Thread" USING btree ("rootMessageId");--> statement-breakpoint
CREATE INDEX "User_email_idx" ON "User" USING btree ("email");--> statement-breakpoint
CREATE INDEX "User_active_idx" ON "User" USING btree ("active");