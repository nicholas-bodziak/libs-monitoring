import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DonutChartData {
  name: string;
  value: number;
  percentage?: number;
}

interface DonutChartProps {
  data: DonutChartData[];
  total: number;
  centerLabel: string;
  centerValue: number | string;
  className?: string;
}

const COLORS = ['#015C91', '#2C82B5', '#88CDF6'];

export const DonutChart: React.FC<DonutChartProps> = ({ 
  data, 
  total, 
  centerLabel, 
  centerValue, 
  className = "" 
}) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} ({data.percentage || Math.round((data.value / total) * 100)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`flex flex-col items-center justify-start w-[160px] h-[240px] flex-shrink-0 ${className}`}>
      <div className="relative w-[160px] h-[160px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-lg sm:text-xl font-bold text-foreground leading-none">{centerValue}</div>
          <div className="text-xs text-muted-foreground mt-1 text-center">{centerLabel}</div>
        </div>
      </div>
      <div className="mt-3 space-y-1 w-full h-[60px] flex-shrink-0">
        {data
          .sort((a, b) => b.value - a.value)
          .slice(0, 3)
          .map((item, index) => {
            const originalIndex = data.findIndex(d => d.name === item.name);
            return (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: COLORS[originalIndex % COLORS.length] }}
                  />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                </div>
                <span className="font-medium ml-2 flex-shrink-0">{item.percentage || Math.round((item.value / total) * 100)}%</span>
              </div>
            );
          })}
      </div>
    </div>
  );
};