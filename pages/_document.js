import React from 'react'
import Document, { Head, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'
import GlobalStyles from '../styles/global'

/**
 * Rendered Server Side
 */
export default class MyDocument extends Document {
  static getInitialProps({ renderPage }) {
    const sheet = new ServerStyleSheet()
    const page = renderPage(App => props => sheet.collectStyles(<App {...props} />))
    const styleTags = sheet.getStyleElement()
    return { ...page, styleTags }
  }

  render = () => (
    <html lang="en">
      <Head>
        <link rel="icon" href="/static/favicon.ico" />
        <meta key="viewport" name="viewport" content="initial-scale=1, minimum-scale=1, width=device-width" />
        <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet" />
        <GlobalStyles />
        {this.props.styleTags}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </html>
  )
}