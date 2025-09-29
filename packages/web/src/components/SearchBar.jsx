import React, { useState, useCallback, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { debounce } from 'lodash';

const SearchBar = ({ 
  onSearch, 
  placeholder = "Pretraži...",
  fullWidth = true,
  showResultCount = false,
  resultCount = 0,
  className = ""
}) => {
  const [searchValue, setSearchValue] = useState('');

  // Debounced search handler
  const debouncedSearch = useMemo(
    () => debounce((value) => {
      if (onSearch) {
        onSearch(value);
      }
    }, 300),
    [onSearch]
  );

  // Handle search input change
  const handleSearchChange = useCallback((event) => {
    const value = event.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Clear search
  const handleClear = useCallback(() => {
    setSearchValue('');
    if (onSearch) {
      onSearch('');
    }
  }, [onSearch]);

  // Handle key press (Enter key)
  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      debouncedSearch.cancel();
      if (onSearch) {
        onSearch(searchValue);
      }
    }
  }, [searchValue, onSearch, debouncedSearch]);

  return (
    <div className={`flex items-center gap-2 ${fullWidth ? 'w-full' : ''} ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          className="pl-9 pr-9"
        />
        {searchValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
      
      {showResultCount && searchValue && (
        <Badge variant="outline" className="whitespace-nowrap">
          {resultCount} rezultata
        </Badge>
      )}
    </div>
  );
};

export default SearchBar;