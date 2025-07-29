import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({ 
  title = "ProdigiousHub - Gamified Project Collaboration Platform",
  description = "Join ProdigiousHub - The ultimate gamified collaboration platform for developers and teams. Create projects, earn XP, level up, and integrate seamlessly with Discord.",
  keywords = "project collaboration, gamified development, discord integration, coding platform, developer community, team management, XP system, programming projects, hackathon platform",
  image = "/Logo-removebg.png",
  url = "https://prodigioushub.com",
  type = "website"
}) => {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEOHead;
