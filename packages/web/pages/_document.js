import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5003';
  
  return (
    <Html lang="bs-BA">
      <Head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Hreflang for language */}
        <link rel="alternate" hrefLang="bs-BA" href="https://ders.ba" />
        
        {/* Sitemap reference */}
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="xfbGol4QS19s3Gfr16AGiBw48UU1od4nD-gD9jxUtx8" />
        
        {/* SEO Meta Tags */}
        <meta name="description" content="Ders - Platforma za praćenje predavanja, daija i udruženja. Pronađite najnovija predavanja, pratite omiljene daije i organizacije." />
        <meta name="keywords" content="predavanja, daije, udruženja, islamska predavanja, vjera, edukacija, Bosna i Hercegovina" />
        <meta name="author" content="Ders" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Ders" />
        <meta property="og:title" content="Ders - Platforma za praćenje predavanja" />
        <meta property="og:description" content="Pronađite najnovija predavanja, pratite omiljene daije i organizacije na jednom mjestu." />
        <meta property="og:image" content="https://ders.ba/uploads/android-chrome-512x512.png" />
        <meta property="og:locale" content="bs_BA" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ders - Platforma za praćenje predavanja" />
        <meta name="twitter:description" content="Pronađite najnovija predavanja, pratite omiljene daije i organizacije na jednom mjestu." />
        <meta name="twitter:image" content="https://ders.ba/uploads/android-chrome-512x512.png" />

        <link rel="icon" type="image/png" sizes="192x192" href="https://ders.ba/uploads/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="https://ders.ba/uploads/android-chrome-512x512.png" />
        <link rel="shortcut icon" href="https://ders.ba/uploads/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="192x192" href="https://ders.ba/uploads/android-chrome-192x192.png" />
        
        {/* Structured Data - JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Ders",
              "description": "Platforma za praćenje islamskih predavanja, daija i udruženja",
              "url": "https://ders.ba",
              "logo": "https://ders.ba/uploads/android-chrome-512x512.png",
              "sameAs": [
                "https://www.facebook.com/profile.php?id=61561889404089",
                "https://www.instagram.com/ders_ba/"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": ["bs", "hr", "sr"]
              }
            })
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 