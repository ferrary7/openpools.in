import './globals.css'

export const metadata = {
  title: 'OpenPools.in - Professional Matchmaking Platform',
  description: 'Find your People. Build what Matters. Connect with peers, collaborators, and mentors who share your exact skill patterns. Powered by AI-driven keyword matching.',
  keywords: 'professional networking, matchmaking, mentorship, collaboration, skills, career',
  authors: [{ name: 'OpenPools' }],
  creator: 'OpenPools',
  metadataBase: new URL('https://www.openpools.in'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.openpools.in',
    siteName: 'OpenPools.in',
    title: 'OpenPools.in - Professional Matchmaking Platform',
    description: 'Find your People. Build what Matters. Connect with peers, collaborators, and mentors who share your exact skill patterns.',
  },
  twitter: {
    card: 'summary',
    title: 'OpenPools.in - Professional Matchmaking Platform',
    description: 'Find your People. Build what Matters.',
  },
  icons: {
    icon: '/favicon.ico',
  },
  robots: 'index, follow',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
