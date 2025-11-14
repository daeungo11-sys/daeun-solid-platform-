import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import './DropdownMenu.css';

interface DropdownOption {
  path: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownMenuProps {
  label: string;
  icon: React.ReactNode;
  options: DropdownOption[];
  isActive?: boolean;
}

export default function DropdownMenu({ label, icon, options, isActive = false }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className={`dropdown-menu ${isActive ? 'active' : ''}`} ref={dropdownRef}>
      <button
        className="dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon}
        <span>{label}</span>
        <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>
      {isOpen && (
        <div className="dropdown-content">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option.path)}
              className="dropdown-item"
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

