import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <meta name="description" content="Marketing Automation Platform for managing paid advertising campaigns" />
        {/* Remove favicon reference for now */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}