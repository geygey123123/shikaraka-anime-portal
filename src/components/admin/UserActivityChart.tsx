import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

interface UserActivityChartProps {
  data?: Array<{ date: string; users: number }>;
}

export const UserActivityChart: React.FC<UserActivityChartProps> = ({ data = [] }) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity size={20} className="text-[#ff0055]" />
        <h3 className="text-xl font-bold text-white">Активность пользователей (30 дней)</h3>
      </div>

      {data.length === 0 ? (
        <div className="w-full h-64 flex items-center justify-center">
          <p className="text-gray-400">Нет данных об активности</p>
        </div>
      ) : (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickLine={{ stroke: '#374151' }}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickLine={{ stroke: '#374151' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelStyle={{ color: '#9ca3af' }}
                itemStyle={{ color: '#ff0055' }}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#ff0055"
                strokeWidth={2}
                dot={{ fill: '#ff0055', r: 4 }}
                activeDot={{ r: 6 }}
                name="Активные пользователи"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="text-gray-400 text-sm mt-4 text-center">
        График показывает количество уникальных активных пользователей за последние 30 дней
      </p>
    </div>
  );
};
