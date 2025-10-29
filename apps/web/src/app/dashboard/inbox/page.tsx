"use client"

import { useState, useRef, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { RotateCw } from "lucide-react"

// Mock email data
const emails = [
  {
    id: 1,
    from: "Alice Johnson",
    subject: "Meeting Tomorrow",
    preview: "Hi, just wanted to confirm our meeting...",
    time: "10:30 AM",
    read: false,
    content: "Hi,\n\nJust wanted to confirm our meeting scheduled for tomorrow at 2 PM. Please let me know if you're still available.\n\nLooking forward to discussing the project details.\n\nBest regards,\nAlice"
  },
  {
    id: 2,
    from: "Bob Smith",
    subject: "Project Update",
    preview: "The latest updates on the project are...",
    time: "9:15 AM",
    read: true,
    content: "Hello,\n\nThe latest updates on the project are looking good. We've completed the initial phase and are moving into testing.\n\nI'll send over the detailed report by end of day.\n\nThanks,\nBob"
  },
  {
    id: 3,
    from: "Carol White",
    subject: "Re: Budget Proposal",
    preview: "I've reviewed the budget and have some...",
    time: "Yesterday",
    read: false,
    content: "Hi there,\n\nI've reviewed the budget proposal and have some suggestions for improvements. Overall it looks solid, but we might need to adjust a few line items.\n\nCan we schedule a call to discuss?\n\nRegards,\nCarol"
  },
  {
    id: 4,
    from: "David Lee",
    subject: "Welcome to the team!",
    preview: "We're excited to have you on board...",
    time: "Yesterday",
    read: true,
    content: "Welcome!\n\nWe're excited to have you on board. Your first day will be next Monday. HR will send over the onboarding schedule shortly.\n\nFeel free to reach out if you have any questions.\n\nBest,\nDavid"
  },
  {
    id: 5,
    from: "Emma Davis",
    subject: "Invoice #1234",
    preview: "Please find attached the invoice for...",
    time: "2 days ago",
    read: false,
    content: "Hello,\n\nPlease find attached the invoice for the services rendered in November. Payment is due within 30 days.\n\nLet me know if you have any questions.\n\nThank you,\nEmma"
  },
]

export default function InboxPage() {
  const [selectedEmails, setSelectedEmails] = useState<number[]>([])
  const [hoveredEmailId, setHoveredEmailId] = useState<number | null>(null)
  const [linePosition, setLinePosition] = useState({ top: 0, height: 0 })
  const [selectedEmail, setSelectedEmail] = useState<typeof emails[0] | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetWidth, setSheetWidth] = useState(600)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggleEmail = (id: number) => {
    setSelectedEmails(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedEmails.length === emails.length) {
      setSelectedEmails([])
    } else {
      setSelectedEmails(emails.map(e => e.id))
    }
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, emailId: number) => {
    if (!containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const emailRect = e.currentTarget.getBoundingClientRect()

    const top = emailRect.top - containerRect.top
    const height = emailRect.height

    setHoveredEmailId(emailId)
    setLinePosition({ top, height })
  }

  const handleMouseLeave = () => {
    setHoveredEmailId(null)
  }

  const handleEmailClick = (email: typeof emails[0]) => {
    if (!sheetOpen) {
      setSheetOpen(true)
    }
    setSelectedEmail(email)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = window.innerWidth - e.clientX
      if (newWidth >= 300 && newWidth <= window.innerWidth * 0.9) {
        setSheetWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isResizing, sheetWidth])

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Checkbox
          checked={selectedEmails.length === emails.length}
          onCheckedChange={toggleAll}
          className="mr-2"
        />
        <h1 className="text-lg font-semibold">Inbox</h1>
        <button
          className="p-2 hover:bg-accent rounded-md transition-colors"
          aria-label="Refresh"
        >
          <RotateCw className="size-4" />
        </button>
      </header>
      <div ref={containerRef} className="flex flex-1 flex-col relative">
        {/* Single moving line */}
        <div
          className={`absolute left-0 w-0.5 bg-foreground transition-all duration-300 ${
            hoveredEmailId ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transform: `translateY(${linePosition.top}px)`,
            height: `${linePosition.height}px`,
          }}
        />
        {emails.map((email) => {
          const isSelected = selectedEmails.includes(email.id)

          return (
            <div
              key={email.id}
              className="flex items-center border-b px-4 py-3 cursor-pointer relative"
              onMouseEnter={(e) => handleMouseEnter(e, email.id)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleEmailClick(email)}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleEmail(email.id)}
              />
              <div className="w-6 shrink-0 flex items-center justify-center">
                {!email.read && (
                  <div className="size-2 rounded-full bg-blue-500" />
                )}
              </div>
              <div className="w-40 shrink-0">
                <span className={`text-sm ${email.read ? '' : 'font-medium'}`}>{email.from}</span>
              </div>
              <div className="flex-1 min-w-0 text-sm truncate ml-4">
                <span className={email.read ? '' : 'font-semibold'}>{email.subject}</span>
                <span className="text-muted-foreground"> {email.preview}</span>
              </div>
              <div className="w-24 shrink-0 text-right ml-4">
                <span className="text-xs text-muted-foreground">{email.time}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div
        className={`fixed inset-y-0 right-0 z-50 flex flex-col gap-4 bg-background border-l shadow-lg transition-transform duration-150 ease-in-out ${
          sheetOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: `${sheetWidth}px`, maxWidth: '90vw' }}
      >
        {/* Close button */}
        <button
          onClick={() => setSheetOpen(false)}
          className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
        >
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="sr-only">Close</span>
        </button>

        {/* Resize handle */}
        <div
          className="absolute left-0 top-0 h-full cursor-ew-resize z-10"
          onMouseDown={handleMouseDown}
          style={{ width: '4px', touchAction: 'none', marginLeft: '-2px' }}
        />

        {selectedEmail && (
          <div key={selectedEmail.id} className="flex flex-col h-full pl-2 animate-in fade-in-0 duration-100">
            <div className="flex flex-col gap-1.5 p-4 pt-4">
              <h2 className="font-semibold">{selectedEmail.subject}</h2>
              <p className="text-muted-foreground text-sm">
                From: {selectedEmail.from} • {selectedEmail.time}
              </p>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="whitespace-pre-wrap text-sm">
                {selectedEmail.content}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
