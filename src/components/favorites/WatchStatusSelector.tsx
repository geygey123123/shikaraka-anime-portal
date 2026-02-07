import React, { useState, useRef, useEffect } from 'react';
import { Play, Clock, Check, X, Pause, ChevronDown, type LucideIcon } from 'lucide-react';
import type { WatchStatus } from '../../hooks/useFavorites';

interface WatchStatusSelectorProps {
  currentStatus: WatchStatus;
  onStatusChange: (status: WatchStatus) => void;
  disabled?: boolean;
}

interface StatusOption {
  value: WatchStatus;
  label: string;
  icon: LucideIcon;
  color: string;
}

const WATCH_STATUSES: StatusOption[] = [
  { value: 'watching', label: 'Смотрю', icon: Play, color: '#ff0055' },
  { value: 'plan_to_watch', label: 'Планирую', icon: Clock, color: '#3b82f6' },
  { value: 'completed', label: 'Завершено', icon: Check, color: '#10b981' },
  { value: 'dropped', label: 'Брошено', icon: X, color: '#ef4444' },
  { value: 'on_hold', label: 'Отложено', icon: Pause, color: '#f59e0b' },
];

/**
 * WatchStatusSelector компонент для выбора статуса просмотра аниме
 * 
 * Требования:
 * - Dropdown с 5 статусами просмотра
 * - Иконки и цвета для каждого статуса
 * - Обработка изменения статуса
 * 
 * @param currentStatus - Текущий статус просмотра
 * @param onStatusChange - Callback при изменении статуса
 * @param disabled - Отключить selector
 */
export const WatchStatusSelector: React.FC<WatchStatusSelectorProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Найти текущий статус
  const currentOption = WATCH_STATUSES.find(s => s.value === currentStatus) || WATCH_STATUSES[1];

  // Закрыть dropdown при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleStatusSelect = (status: WatchStatus) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg
          bg-gray-800 text-white
          hover:bg-gray-700 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-[#ff0055] focus:ring-offset-2 focus:ring-offset-[#0a0a0c]
          min-w-[160px]
        `}
        aria-label="Выбрать статус просмотра"
        aria-expanded={isOpen}
      >
        <CurrentIcon 
          size={18} 
          color={currentOption.color}
        />
        <span className="flex-1 text-left text-sm font-medium">
          {currentOption.label}
        </span>
        <ChevronDown 
          size={16} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
          {WATCH_STATUSES.map((status) => {
            const StatusIcon = status.icon;
            const isSelected = status.value === currentStatus;

            return (
              <button
                key={status.value}
                onClick={() => handleStatusSelect(status.value)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3
                  hover:bg-gray-700 transition-colors
                  ${isSelected ? 'bg-gray-700' : ''}
                  focus:outline-none focus:bg-gray-700
                `}
                aria-label={`Выбрать статус: ${status.label}`}
              >
                <StatusIcon 
                  size={18} 
                  color={status.color}
                />
                <span className="text-sm font-medium text-white">
                  {status.label}
                </span>
                {isSelected && (
                  <Check size={16} className="ml-auto text-[#ff0055]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
