import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  image?: string
  type?: 'website' | 'article' | 'profile'
  url?: string
}

export const SEO = ({ title, description, image, type = 'website', url }: SEOProps) => {
  const siteTitle = 'SanuFlix'
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle
  const siteUrl = url || window.location.href
  const defaultImage = `${window.location.origin}/og-image.jpg` // fallback image

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={siteUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image || defaultImage} />

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Sanuu" />
      <link rel="canonical" href={siteUrl} />
    </Helmet>
  )
}

