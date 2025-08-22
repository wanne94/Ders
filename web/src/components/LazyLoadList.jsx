import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Button
} from '@mui/material';
import { useInView } from 'react-intersection-observer';

const LazyLoadList = ({
  data = [],
  renderItem,
  itemsPerPage = 20,
  threshold = 0.8,
  loadingComponent = null,
  emptyComponent = null,
  containerStyle = {},
  showLoadMore = true
}) => {
  const [displayedItems, setDisplayedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const { ref: loadMoreRef, inView } = useInView({
    threshold: threshold,
    triggerOnce: false
  });

  // Initialize displayed items
  useEffect(() => {
    if (data && data.length > 0) {
      const initialItems = data.slice(0, itemsPerPage);
      setDisplayedItems(initialItems);
      setHasMore(data.length > itemsPerPage);
    } else {
      setDisplayedItems([]);
      setHasMore(false);
    }
    setCurrentPage(1);
  }, [data, itemsPerPage]);

  // Load more items
  const loadMoreItems = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // Simulate async loading
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = currentPage * itemsPerPage;
      const endIndex = nextPage * itemsPerPage;
      const newItems = data.slice(startIndex, endIndex);
      
      if (newItems.length > 0) {
        setDisplayedItems(prev => [...prev, ...newItems]);
        setCurrentPage(nextPage);
        setHasMore(endIndex < data.length);
      } else {
        setHasMore(false);
      }
      
      setIsLoading(false);
    }, 300);
  }, [currentPage, data, itemsPerPage, isLoading, hasMore]);

  // Auto-load when scrolling to bottom
  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      loadMoreItems();
    }
  }, [inView, loadMoreItems, isLoading, hasMore]);

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

  return (
    <Box sx={{ ...containerStyle }}>
      {/* Rendered items */}
      {displayedItems.map((item, index) => (
        <Box key={item._id || item.id || index}>
          {renderItem(item, index)}
        </Box>
      ))}
      
      {/* Loading indicator */}
      {isLoading && (
        loadingComponent || (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <CircularProgress size={30} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Učitavanje...
            </Typography>
          </Box>
        )
      )}
      
      {/* Load more trigger */}
      {hasMore && !isLoading && (
        <Box ref={loadMoreRef} sx={{ py: 2, textAlign: 'center' }}>
          {showLoadMore && (
            <Button
              variant="outlined"
              onClick={loadMoreItems}
              disabled={isLoading}
            >
              Učitaj još
            </Button>
          )}
        </Box>
      )}
      
      {/* End of list */}
      {!hasMore && displayedItems.length > 0 && (
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Prikazano {displayedItems.length} od {data.length} stavki
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default LazyLoadList;