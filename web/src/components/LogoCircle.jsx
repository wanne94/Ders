import React from 'react';
import Image from 'next/image';

const LogoCircle = () => (
  <Image
    src="/uploads/logo.jpg"
    alt="DERS Logo"
    width={50}
    height={50}
    priority
    style={{
      marginTop: '10px',
      marginBottom: '10px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '2px solid #c89b3c',
      background: '#0d2c3b',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}
  />
);

export default LogoCircle; 