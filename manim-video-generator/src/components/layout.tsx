'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 flex flex-col p-4 font-sans relative overflow-hidden">
      {/* SVG Background */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url(${encodeURI('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/svgviewer-output-tXOgea96fcJoUaVYkkvyAp4SJjYg4K.svg')})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />

      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/20 via-transparent to-transparent pointer-events-none" />

      {/* Navigation Tabs */}
      <nav className="relative z-10 mb-12 flex justify-center">
        <div className="bg-gray-900/90 shadow-lg backdrop-blur-sm rounded-lg p-1 flex gap-1 border border-gray-800">
          <Link
            href="ManimVideoGenerator.tsx"
            className={`px-6 py-2 rounded-md transition-colors duration-200 ${
              pathname === '/manimator'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            Manimator
          </Link>
          <Link
            href="presentation-generator.tsx"
            className={`px-6 py-2 rounded-md transition-colors duration-200 ${
              pathname === '/presentation-generator'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            Test P. Gen
          </Link>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-start relative z-10 max-w-4xl mx-auto w-full pt-12">
        {children}
      </main>
    </div>
  )
}