"use client";

import { useMemo } from "react";

interface CircleChartProps {
  title: string;
  targetAmount: number;
  usedAmount: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CircleChart = ({ 
  title, 
  targetAmount, 
  usedAmount, 
  size = 'md',
  className = '' 
}: CircleChartProps) => {
  const sizeConfig = {
    sm: { radius: 60, svgSize: 140, strokeWidth: 12 },
    md: { radius: 80, svgSize: 180, strokeWidth: 16 },
    lg: { radius: 100, svgSize: 220, strokeWidth: 20 }
  };

  const config = sizeConfig[size];

  const chartData = useMemo(() => {
    const usageRatio = usedAmount / targetAmount;
    const circumference = 2 * Math.PI * config.radius;

    let primaryColor;
    if (usageRatio <= 0.7) {
      primaryColor = "#10b981";
    } else if (usageRatio <= 1.0) {
      primaryColor = "#f59e0b";
    } else {
      primaryColor = "#ef4444";
    }

    // basic usage
    const baseUsageRatio = Math.min(usageRatio, 1);
    const baseStrokeDasharray = `${baseUsageRatio * circumference} ${circumference}`;

    // over usage
    const overUsageRatio = Math.max(usageRatio - 1, 0);
    const overStrokeDasharray = `${overUsageRatio * circumference} ${circumference}`;

    return {
      primaryColor,
      baseStrokeDasharray,
      overStrokeDasharray,
      usageRatio,
      baseUsageRatio,
      overUsageRatio,
      circumference,
    };
  }, [targetAmount, usedAmount, config.radius]);

  const getStatusText = () => {
    const ratio = usedAmount / targetAmount;
    if (ratio <= 0.7) return "Safe";
    if (ratio <= 1.0) return "Warn";
    return "Over";
  };

  const getStatusColor = () => {
    const ratio = usedAmount / targetAmount;
    if (ratio <= 0.7) return "text-green-600";
    if (ratio <= 1.0) return "text-yellow-600";
    return "text-red-600";
  };

  const center = config.svgSize / 2;
  const textSizeClasses = {
    sm: { percentage: 'text-lg', status: 'text-xs', title: 'text-lg' },
    md: { percentage: 'text-2xl', status: 'text-sm', title: 'text-2xl' },
    lg: { percentage: 'text-3xl', status: 'text-base', title: 'text-3xl' }
  };

  return (
    <div className={`w-full max-w-sm mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-sm ${className}`}>
      <h2 className={`${textSizeClasses[size].title} font-bold text-center mb-4 text-gray-800 truncate`}>
        {title}
      </h2>
      <div className="flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <svg 
            width={config.svgSize} 
            height={config.svgSize} 
            className="transform -rotate-90"
            viewBox={`0 0 ${config.svgSize} ${config.svgSize}`}
          >
            <circle
              cx={center}
              cy={center}
              r={config.radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={config.strokeWidth}
            />

            <circle
              cx={center}
              cy={center}
              r={config.radius}
              fill="none"
              stroke={chartData.primaryColor}
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
              strokeDasharray={chartData.baseStrokeDasharray}
              strokeDashoffset={0}
              className="transition-all duration-500 ease-in-out"
            />

            {chartData.overUsageRatio > 0 && (
              <circle
                cx={center}
                cy={center}
                r={config.radius}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth={config.strokeWidth}
                strokeLinecap="round"
                strokeDasharray={chartData.overStrokeDasharray}
                strokeDashoffset={0}
                className="transition-all duration-500 ease-in-out"
              />
            )}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
            <div className={`${textSizeClasses[size].percentage} font-bold text-gray-800`}>
              {Math.round((usedAmount / targetAmount) * 100)}%
            </div>
            <div className={`${textSizeClasses[size].status} font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircleChart;
