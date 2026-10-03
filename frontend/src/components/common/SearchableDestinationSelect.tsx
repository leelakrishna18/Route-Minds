import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, Check, X } from 'lucide-react';
import { Stop } from '../../types';

interface SearchableDestinationSelectProps {
  stops: Stop[];
  selectedStopId: string;
  onSelectStop: (stop: Stop | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string | null;
  className?: string;
}

export const SearchableDestinationSelect: React.FC<SearchableDestinationSelectProps> = ({
  stops,
  selectedStopId,
  onSelectStop,
  label,
  placeholder = 'Type to search destination...',
  required = false,
  error,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync display text when selectedStopId changes externally
  useEffect(() => {
    if (selectedStopId) {
      const match = stops.find(s => s.id === selectedStopId);
      if (match) {
        setQuery(match.name);
      }
    } else {
      setQuery('');
    }
  }, [selectedStopId, stops]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        // If current query text does not match any valid stop exactly, revert or validate
        const exactMatch = stops.find(
          s => s.name.toLowerCase() === query.trim().toLowerCase()
        );
        if (exactMatch) {
          onSelectStop(exactMatch);
          setQuery(exactMatch.name);
        } else if (!selectedStopId) {
          // No valid stop selected
          onSelectStop(null);
        } else {
          // Revert to previously valid selected stop
          const prev = stops.find(s => s.id === selectedStopId);
          if (prev) setQuery(prev.name);
        }
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [query, stops, selectedStopId, onSelectStop]);

  // Filter and sort suggestions dynamically
  const trimmed = query.trim().toLowerCase();
  const suggestions = stops
    .filter(s => {
      if (!trimmed) return true;
      const nameEn = s.name.toLowerCase();
      const nameTe = (s.name_te || '').toLowerCase();
      const code = (s.code || '').toLowerCase();
      return (
        nameEn.includes(trimmed) ||
        nameTe.includes(trimmed) ||
        code.includes(trimmed)
      );
    })
    .sort((a, b) => {
      if (!trimmed) return a.name.localeCompare(b.name);
      const aStarts = a.name.toLowerCase().startsWith(trimmed);
      const bStarts = b.name.toLowerCase().startsWith(trimmed);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.name.localeCompare(b.name);
    });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    setHighlightedIndex(-1);

    // If query matches a stop exactly, select it; otherwise mark as pending/unselected
    const exact = stops.find(s => s.name.toLowerCase() === val.trim().toLowerCase());
    if (exact) {
      onSelectStop(exact);
    } else {
      // Clear selected stop ID until user selects a valid destination
      onSelectStop(null);
    }
  };

  const handleSelectOption = (stop: Stop) => {
    setQuery(stop.name);
    onSelectStop(stop);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelectOption(suggestions[highlightedIndex]);
      } else if (suggestions.length === 1) {
        handleSelectOption(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery('');
    onSelectStop(null);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full bg-slate-50 border rounded-lg pl-3 pr-16 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition ${
            error ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
          }`}
          required={required}
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
              title="Clear destination"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsOpen(prev => !prev);
              inputRef.current?.focus();
            }}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
            tabIndex={-1}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute z-40 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto py-1 text-sm divide-y divide-slate-100 animate-fadeIn">
          {suggestions.length > 0 ? (
            suggestions.map((stop, idx) => {
              const isSelected = stop.id === selectedStopId;
              const isHighlighted = idx === highlightedIndex;

              return (
                <div
                  key={stop.id}
                  onClick={() => handleSelectOption(stop)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 text-blue-900 font-semibold'
                      : isHighlighted
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>
                      <span className="font-medium">{stop.name}</span>
                      {stop.name_te && (
                        <span className="ml-1.5 text-xs text-slate-500 font-normal">
                          ({stop.name_te})
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {stop.code && (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {stop.code}
                      </span>
                    )}
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-3 text-xs text-slate-500 text-center">
              No matching destinations found for &quot;<span className="font-semibold text-slate-700">{query}</span>&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
};
