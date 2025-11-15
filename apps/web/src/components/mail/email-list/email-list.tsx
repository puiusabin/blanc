"use client"

import { useState, useRef } from "react"
import type { Email } from "@/types/email"
import { EmailListItem } from "./email-list-item"

export interface EmailListProps {
  emails: Email[]
  selectedIds: Set<string>
  onSelect: (id: string, selected: boolean) => void
  onEmailClick: (email: Email) => void
  className?: string
}

export function EmailList({
  emails,
  selectedIds,
  onSelect,
  onEmailClick,
  className,
}: EmailListProps) {
  const [hoveredEmailId, setHoveredEmailId] = useState<string | null>(null)
  const [linePosition, setLinePosition] = useState({ top: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, emailId: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()

    if (containerRect) {
      setLinePosition({
        top: rect.top - containerRect.top,
        height: rect.height,
      })
    }

    setHoveredEmailId(emailId)
  }

  const handleMouseLeave = () => {
    setHoveredEmailId(null)
  }

  if (emails.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>No emails to display</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`flex flex-1 flex-col relative ${className || ""}`}>
      {/* Animated hover line */}
      <div
        className={`absolute left-0 w-0.5 bg-foreground transition-all duration-300 ${
          hoveredEmailId ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transform: `translateY(${linePosition.top}px)`,
          height: `${linePosition.height}px`,
        }}
      />

      {/* Email items */}
      {emails.map((email) => (
        <EmailListItem
          key={email.id}
          email={email}
          isSelected={selectedIds.has(email.id)}
          isHovered={hoveredEmailId === email.id}
          onSelect={(selected) => onSelect(email.id, selected)}
          onClick={() => onEmailClick(email)}
          onMouseEnter={(e) => handleMouseEnter(e, email.id)}
          onMouseLeave={handleMouseLeave}
        />
      ))}
    </div>
  )
}
