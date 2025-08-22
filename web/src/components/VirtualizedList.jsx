import React from 'react';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Box, Paper, Typography } from '@mui/material';

const VirtualizedList = ({
  data = [],
  renderItem,
  itemHeight = 80,
  overscan = 5,
  emptyComponent = null,
  containerStyle = {}
}) => {
  // Empty state
  if (!data || data.length === 0) {
    return emptyComponent || (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Nema podataka za prikaz
        </Typography>
      </Paper>
    );
  }

  // Row renderer for react-window
  const Row = ({ index, style }) => {
    const item = data[index];
    return (
      <div style={style}>
        {renderItem(item, index)}
      </div>
    );
  };

  return (
    <Box sx={{ height: '100%', minHeight: 400, ...containerStyle }}>
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={height}
            itemCount={data.length}
            itemSize={itemHeight}
            width={width}
            overscanCount={overscan}
          >
            {Row}
          </FixedSizeList>
        )}
      </AutoSizer>
    </Box>
  );
};

export default VirtualizedList;