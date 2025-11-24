import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  description: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, icon: Icon, color, description }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 mt-2">{value}</h3>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
  );
};
