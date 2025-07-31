import type { Metadata } from 'next'
import './globals.css'
import { DeliveryBanner } from "@/components/DeliveryBanner"

export const metadata: Metadata = {
  title: 'Permay',
  
 
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <DeliveryBanner />
        {children}
      </body>
    </html>
  )
}
