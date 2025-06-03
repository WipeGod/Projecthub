import './globals.css'
import { ReactNode } from 'react'
import { AuthProvider } from './auth-context'
import LayoutWrapper from './components/LayoutWrapper'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ProjectHub - Collaborative Project Management',
  description: 'A project management app with React and Flask backend',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-background text-foreground antialiased`}>
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
