# Mock Email Files

Add `.eml` files to this directory for testing the email renderer.

## How to get .eml files

1. **From Gmail**: Open email → More (⋮) → Download message
2. **From Outlook**: Open email → File → Save As → Outlook Message Format (.msg) or Email (.eml)
3. **From Thunderbird**: Right-click email → Save As → EML format

## File naming

Use descriptive names:

- `simple-text.eml` - Plain text email
- `html-with-images.eml` - HTML email with embedded images
- `marketing-newsletter.eml` - Complex HTML marketing email
- `reply-thread.eml` - Email with quoted replies

## Testing

The dev server will automatically load these files. Refresh the inbox to see changes.

## Privacy Note

.eml files are gitignored to prevent accidentally committing sensitive email content.
Only this README is tracked in git.
