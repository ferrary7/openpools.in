import './globals.css'

export const metadata = {
  title: 'OpenPools.in - Professional Matchmaking Platform',
  description: 'Find peers, collaborators, and mentors with similar skill patterns',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
