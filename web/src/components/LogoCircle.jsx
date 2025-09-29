import React from 'react';
import Image from 'next/image';

const LogoCircle = () => {
  // U development modu koristi lokalni logo
  const logoSrc = process.env.NODE_ENV === 'development'
    ? '/uploads/images/logo.jpg'
    : 'https://ders.ba/uploads/images/logo.jpg';

  return (
    <Image
      src={logoSrc}
      alt="DERS Logo"
      width={50}
      height={50}
      style={{
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid #c89b3c',
        background: '#0d2c3b',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
    />
  );
};

export default LogoCircle;