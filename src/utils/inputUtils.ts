// Utility function to sanitize log inputs
export function sanitizeLogInput(input: string): string {
  // Remove or replace problematic characters
  return input
    .replace(/[\n\r\t]/g, "_") // Replace newlines and tabs
    .replace(/[^\x20-\x7E]/g, "") // Remove non-printable characters
    .substring(0, 1000); // Limit length to prevent log flooding
}
