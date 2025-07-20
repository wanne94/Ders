import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5003';
  
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/png" sizes="192x192" href="/uploads/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/uploads/android-chrome-192x192.png" />
        <link rel="shortcut icon" href="/uploads/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="192x192" href="/uploads/android-chrome-192x192.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 