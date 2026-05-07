import "./globals.css"

export const metadata = {
  title: "Task Manager",
  description: "Team task management app",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
