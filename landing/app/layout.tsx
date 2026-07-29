import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono, IBM_Plex_Sans } from 'next/font/google'
import { Courier_Prime } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _courierPrime = Courier_Prime({ weight: ["400", "700"], subsets: ["latin"] });
const _ibmPlexSans = IBM_Plex_Sans({ weight: ["300", "400", "500", "600"], subsets: ["latin"] });

// O campo `url` do OpenGraph fica de fora ate existir dominio comprado.
// Regra do projeto: nunca declarar URL publica que nao resolve.
const TITULO = 'REPASS AI — Sistema operacional de IA para prospeccao B2B'
const DESCRICAO =
  'Encontre negocios locais sem site, gere a pagina deles em segundos e feche a venda com a abordagem pronta. Leads, CRM, sites e automacao em um painel so.'

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  keywords: ['prospeccao B2B', 'geracao de leads', 'criacao de sites com IA', 'CRM', 'REPASS AI'],
  authors: [{ name: 'REPASS AI' }],
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    type: 'website',
    siteName: 'REPASS AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITULO,
    description: DESCRICAO,
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
