import React from 'react';
import { Box } from '@mui/material';

const GridLayout = ({ 
  children,
  variant = 'default',
  minWidth,
  maxWidth,
  gap = 2,
  sx = {},
  ...props
}) => {
  // Predefined variants for common use cases
  const variants = {
    default: {
      minWidth: '300px',
      maxWidth: '350px'
    },
    daije: {
      minWidth: '300px',
      maxWidth: '350px'
    },
    lectures: {
      minWidth: '300px',
      maxWidth: '350px'
    },
    organizations: {
      minWidth: '300px',
      maxWidth: '350px'
    },
    compact: {
      minWidth: '280px',
      maxWidth: '320px'
    },
    wide: {
      minWidth: '400px',
      maxWidth: '500px'
    },
    extraWide: {
      minWidth: '500px',
      maxWidth: '600px'
    },
    cards: {
      minWidth: '280px',
      maxWidth: '320px'
    }
  };

  // Use variant settings or custom values
  const config = variants[variant] || variants.default;
  const finalMinWidth = minWidth || config.minWidth;
  const finalMaxWidth = maxWidth || config.maxWidth;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${finalMinWidth}, ${finalMaxWidth}))`,
        gap: { xs: 2, sm: 2.5, md: gap },
        justifyContent: 'center',
        width: '100%',
        ...sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Export predefined variants as separate components for convenience
export const DaijeGrid = ({ children, ...props }) => (
  <GridLayout variant="daije" {...props}>
    {children}
  </GridLayout>
);

export const LecturesGrid = ({ children, ...props }) => (
  <GridLayout variant="lectures" {...props}>
    {children}
  </GridLayout>
);

export const OrganizationsGrid = ({ children, ...props }) => (
  <GridLayout variant="organizations" {...props}>
    {children}
  </GridLayout>
);

export const CompactGrid = ({ children, ...props }) => (
  <GridLayout variant="compact" {...props}>
    {children}
  </GridLayout>
);

export const WideGrid = ({ children, ...props }) => (
  <GridLayout variant="wide" {...props}>
    {children}
  </GridLayout>
);

export const ExtraWideGrid = ({ children, ...props }) => (
  <GridLayout variant="extraWide" {...props}>
    {children}
  </GridLayout>
);

export const CardsGrid = ({ children, ...props }) => (
  <GridLayout variant="cards" {...props}>
    {children}
  </GridLayout>
);

export default GridLayout; 