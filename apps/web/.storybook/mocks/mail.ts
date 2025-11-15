import { http, HttpResponse } from "msw"
import { getMockEmailsByFolder, getMockEmailById } from "@/lib/mock-emails"
import type { EmailFolder } from "@/types/email"

export const mailHandlers = [
  http.get("/api/mail/emails", ({ request }) => {
    const url = new URL(request.url)
    const folder = (url.searchParams.get("folder") || "inbox") as EmailFolder
    const page = parseInt(url.searchParams.get("page") || "1")
    const pageSize = parseInt(url.searchParams.get("pageSize") || "50")

    const emails = getMockEmailsByFolder(folder)
    const start = (page - 1) * pageSize
    const paginatedEmails = emails.slice(start, start + pageSize)

    return HttpResponse.json({
      emails: paginatedEmails,
      total: emails.length,
      page,
      pageSize,
      hasMore: start + pageSize < emails.length,
    })
  }),

  http.get("/api/mail/emails/:emailId", ({ params }) => {
    const email = getMockEmailById(params.emailId as string)

    if (!email) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(email)
  }),

  http.post("/api/mail/send", async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({
      success: true,
      id: `email-${Date.now()}`,
      message: "Email sent successfully",
    })
  }),

  http.patch("/api/mail/emails/:emailId/read", async ({ request }) => {
    const { isRead } = await request.json()

    return HttpResponse.json({
      success: true,
      emailId: request.params.emailId,
      isRead,
    })
  }),

  http.patch("/api/mail/emails/:emailId/star", async ({ request }) => {
    const { isStarred } = await request.json()

    return HttpResponse.json({
      success: true,
      emailId: request.params.emailId,
      isStarred,
    })
  }),

  http.delete("/api/mail/emails/:emailId", ({ params }) => {
    return HttpResponse.json({
      success: true,
      emailId: params.emailId,
    })
  }),

  http.post("/api/mail/emails/:emailId/move", async ({ request }) => {
    const { folder } = await request.json()

    return HttpResponse.json({
      success: true,
      emailId: request.params.emailId,
      folder,
    })
  }),
]
