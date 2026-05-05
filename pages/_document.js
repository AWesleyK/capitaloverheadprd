// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

const SITE_URL = "https://dinodoors.net";

const globalSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
      "@id": `${SITE_URL}/#business`,
      "name": "Dino Doors Garage Doors and More",
      "url": SITE_URL,
      "logo": `${SITE_URL}/transparent-icon.png`,
      "image": `${SITE_URL}/transparent-icon.png`,
      "telephone": "+14054560399",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "307 S Main Street",
        "addressLocality": "Elmore City",
        "addressRegion": "OK",
        "postalCode": "73433",
        "addressCountry": "US"
      },
      "priceRange": "$$",
      "areaServed": {
        "@type": "State",
        "name": "Oklahoma"
      }
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      "url": SITE_URL,
      "name": "Dino Doors",
      "publisher": { "@id": `${SITE_URL}/#business` }
    }
  ]
};

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap" rel="stylesheet" />

          {/* Global Site Tag (gtag.js) - Google Analytics */}
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=G-F05L9W4XSD`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-F05L9W4XSD', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />

          {/* Global structured data: LocalBusiness + WebSite */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSchema) }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
