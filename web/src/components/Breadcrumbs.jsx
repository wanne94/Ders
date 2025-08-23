import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Badge } from './ui/badge';
import { useRouter } from 'next/router';

const Breadcrumbs = ({ items = [], current, showHome = true }) => {
  const router = useRouter();

  const handleClick = (path) => {
    if (path) {
      router.push(path);
    }
  };

  return (
    <nav className="mb-4">
      <ol className="flex items-center space-x-2 text-sm">
        {showHome && (
          <>
            <li>
              <button
                onClick={() => handleClick('/')}
                className="flex items-center text-gray-600 hover:text-primary transition-colors"
              >
                <Home className="h-4 w-4 mr-1" />
                Početna
              </button>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </>
        )}
        
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <li>
              <button
                onClick={() => handleClick(item.path)}
                className="flex items-center text-gray-600 hover:text-primary transition-colors"
              >
                {item.icon && (
                  <span className="mr-1 inline-flex">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            </li>
            {(index < items.length - 1 || current) && (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </React.Fragment>
        ))}
        
        {current && (
          <li className="flex items-center text-gray-900 font-medium">
            {current.icon && (
              <span className="mr-1 inline-flex">
                {current.icon}
              </span>
            )}
            {current.label}
            {current.count !== undefined && (
              <Badge className="ml-2" variant="default">
                {current.count}
              </Badge>
            )}
          </li>
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;