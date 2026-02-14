import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-lg px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500 shadow-sm border ${error
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
          : 'border-none'
          } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Select({ label, error, options = [], className = '', value, onChange, placeholder = 'Select an option', ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  // Update coordinates when opening the dropdown
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Handle window resize and scroll to close dropdown
  useEffect(() => {
    function handleResizeOrScroll() {
      if (isOpen) setIsOpen(false);
    }
    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);

    return () => {
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]); // Re-bind is okay, or use refs to be stable.

  const handleSelect = (optionValue) => {
    // Mimic the event object that a native select would return
    const syntheticEvent = {
      target: {
        name: props.name,
        value: optionValue
      }
    };
    if (onChange) {
      onChange(syntheticEvent);
    }
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div
        className={`w-full bg-white rounded-lg border px-3 py-2 text-sm shadow-sm cursor-pointer flex justify-between items-center transition-all duration-200 ${error
          ? 'border-red-300 focus:ring-red-500'
          : isOpen
            ? 'border-primary ring-1 ring-primary/20'
            : 'border-gray-300 hover:border-gray-400'
          } ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`${!selectedOption ? 'text-gray-500' : 'text-gray-900'} truncate`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
            }`}
        />
      </div>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: coords.top + 4, // Add a small gap
            left: coords.left,
            width: coords.width,
            zIndex: 9999
          }}
        >
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-lg border border-gray-100 py-1 max-h-60 overflow-auto focus:outline-none"
            >
              {options.length > 0 ? (
                options.map((opt) => (
                  <div
                    key={opt.value}
                    className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors ${value === opt.value
                      ? 'bg-primary/5 text-primary font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    onClick={() => handleSelect(opt.value)}
                  >
                    <span className="truncate">{opt.label}</span>
                    {value === opt.value && (
                      <Check size={14} className="text-primary flex-shrink-0 ml-2" />
                    )}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-400 text-center">
                  No options
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>,
        document.body
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
