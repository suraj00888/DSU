import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const PostFilters = ({ 
  onSearch, 
  onFilterChange, 
  onSortChange, 
  categories,
  initialFilters = { category: '', tag: '' },
  initialSort = 'newest'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState(initialSort);
  
  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'most_liked', label: 'Most Liked' },
    { value: 'most_commented', label: 'Most Commented' }
  ];
  
  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };
  
  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // Handle sort change
  const handleSortChange = (value) => {
    setSortBy(value);
    onSortChange(value);
  };
  
  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = { category: '', tag: '' };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };
  
  return (
    <div className="bg-background border border-border rounded-lg p-4 mb-6">
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="relative mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        </div>
      </form>
      
      {/* Filters toggle */}
      <div className="flex justify-between items-center mb-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <SlidersHorizontal size={16} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        
        {/* Clear filters button */}
        {(filters.category || filters.tag) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
          >
            <X size={14} />
            Clear Filters
          </button>
        )}
      </div>
      
      {/* Expanded filters */}
      {showFilters && (
        <div className="space-y-4 mt-3 border-t border-border pt-3">
          {/* Categories filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          {/* Tags filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Tag</label>
            <input
              type="text"
              value={filters.tag}
              onChange={(e) => handleFilterChange('tag', e.target.value)}
              placeholder="Filter by tag..."
              className="w-full px-3 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm"
            />
          </div>
          
          {/* Sort options */}
          <div>
            <label className="block text-sm font-medium mb-1">Sort By</label>
            <div className="grid grid-cols-2 gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`px-3 py-1.5 text-xs rounded-md border ${
                    sortBy === option.value 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'border-border text-muted-foreground hover:bg-accent/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostFilters; 