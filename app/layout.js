export const dynamic = "force-dynamic";
import './globals.css'

export const metadata = {
  title: 'Cycloan',
  description: 'A cycle rental system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
