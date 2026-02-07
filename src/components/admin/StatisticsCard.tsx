import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatisticsCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  iconColor?: string;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  icon: Icon,
  label,
  value,
  iconColor = '#ff0055',
}) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
      <div className="flex items-center gap-4">
        <div
          className="p-3 rounded-lg bg-gray-800"
          style={{ color: iconColor }}
        >
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-white text-2xl font-bold mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
};
