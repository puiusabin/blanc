import { http, HttpResponse } from "msw"

export const authHandlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({
      success: true,
      user: {
        id: "1",
        username: body.username,
        email: `${body.username}@example.com`,
      },
      token: "mock-jwt-token",
    })
  }),

  http.post("/api/auth/logout", () => {
    return HttpResponse.json({ success: true })
  }),

  http.get("/api/auth/session", () => {
    return HttpResponse.json({
      user: {
        id: "1",
        username: "demo",
        email: "demo@example.com",
      },
      isAuthenticated: true,
    })
  }),
]
