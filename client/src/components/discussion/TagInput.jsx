import React, { useState, useRef } from 'react';
import { X, Tag as TagIcon } from 'lucide-react';

const TagInput = ({ tags, setTags, maxTags = 5 }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setError('');
  };
  
  const handleInputKeyDown = (e) => {
    // Handle Enter or Tab to add tag
    if ((e.key === 'Enter' || e.key === 'Tab') && inputValue.trim()) {
      e.preventDefault();
      addTag();
    }
    
    // Handle Backspace to remove last tag if input is empty
    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };
  
  const addTag = () => {
    const newTag = inputValue.trim().toLowerCase();
    
    if (!newTag) return;
    
    // Validate tag
    if (newTag.length > 20) {
      setError('Tag must be 20 characters or less');
      return;
    }
    
    if (tags.includes(newTag)) {
      setError('Tag already exists');
      return;
    }
    
    if (tags.length >= maxTags) {
      setError(`You can only add up to ${maxTags} tags`);
      return;
    }
    
    // Add tag and clear input
    setTags([...tags, newTag]);
    setInputValue('');
  };
  
  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
    setError('');
    inputRef.current?.focus();
  };
  
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };
  
  return (
    <div>
      <div 
        className={`flex flex-wrap items-center gap-2 p-2 bg-background border ${error ? 'border-destructive' : 'border-border'} rounded-md min-h-[38px] focus-within:ring-1 focus-within:ring-primary cursor-text`}
        onClick={handleContainerClick}
      >
        {/* Render existing tags */}
        {tags.map((tag, index) => (
          <div 
            key={index}
            className="flex items-center gap-1 bg-accent/50 text-accent-foreground px-2 py-1 rounded-full text-sm"
          >
            <TagIcon size={14} />
            <span>{tag}</span>
            <button 
              type="button"
              onClick={() => removeTag(index)}
              className="text-muted-foreground hover:text-foreground rounded-full"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        
        {/* Input for new tags */}
        {tags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={inputValue.trim() ? addTag : undefined}
            placeholder={tags.length === 0 ? "Add tags separated by Enter..." : ""}
            className="flex-1 min-w-[120px] bg-transparent focus:outline-none text-sm py-1"
          />
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <p className="text-destructive text-xs mt-1">{error}</p>
      )}
      
      {/* Help text */}
      {!error && (
        <p className="text-muted-foreground text-xs mt-1">
          Press Enter or Tab to add a tag ({tags.length}/{maxTags})
        </p>
      )}
    </div>
  );
};

export default TagInput; 