import { useState, useId } from 'react';

interface ChartPoint {
  time: string;
  price: number;
}

interface MarketChartProps {
  data: ChartPoint[];
  entryZoneMin?: number;
  entryZoneMax?: number;
  takeProfitPrice?: number;
  stopLossPrice?: number;
  currency?: string;
  height?: number;
  color?: string;
  showLevels?: boolean;
}

export function MarketChart({
  data,
  entryZoneMin,
  entryZoneMax,
  takeProfitPrice,
  stopLossPrice,
  currency = '€',
  height = 180,
  color = '#10B981',
  showLevels = true,
}: MarketChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const gradientId = useId();

  if (!data || data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-slate-500 text-xs">
        Données graphiques indisponibles
      </div>
    );
  }

  // Calculate scales
  const prices = data.map((d) => d.price);
  let allMin = Math.min(...prices);
  let allMax = Math.max(...prices);

  if (showLevels) {
    if (stopLossPrice) allMin = Math.min(allMin, stopLossPrice * 0.98);
    if (entryZoneMin) allMin = Math.min(allMin, entryZoneMin * 0.98);
    if (takeProfitPrice) allMax = Math.max(allMax, takeProfitPrice * 1.02);
  }

  const range = allMax - allMin || 1;
  const paddingX = 40;
  const paddingY = 24;
  const width = 600;

  const getX = (index: number) => paddingX + (index / (data.length - 1)) * (width - 2 * paddingX);
  const getY = (price: number) => height - paddingY - ((price - allMin) / range) * (height - 2 * paddingY);

  const points = data.map((d, i) => `${getX(i)},${getY(d.price)}`).join(' ');
  const areaPoints = `${getX(0)},${height - paddingY} ${points} ${getX(data.length - 1)},${height - paddingY}`;

  const hoveredPoint = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        <line
          x1={paddingX}
          y1={paddingY}
          x2={width - paddingX}
          y2={paddingY}
          stroke="#1E293B"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <line
          x1={paddingX}
          y1={height / 2}
          x2={width - paddingX}
          y2={height / 2}
          stroke="#1E293B"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <line
          x1={paddingX}
          y1={height - paddingY}
          x2={width - paddingX}
          y2={height - paddingY}
          stroke="#1E293B"
          strokeWidth="1"
        />

        {/* Levels lines (Take-profit, Entry, Stop-loss) */}
        {showLevels && takeProfitPrice && (
          <g>
            <line
              x1={paddingX}
              y1={getY(takeProfitPrice)}
              x2={width - paddingX}
              y2={getY(takeProfitPrice)}
              stroke="#10B981"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <text
              x={width - paddingX + 6}
              y={getY(takeProfitPrice) + 3}
              fill="#10B981"
              fontSize="9"
              fontFamily="JetBrains Mono, monospace"
              textAnchor="start"
            >
              TP: {takeProfitPrice}
            </text>
          </g>
        )}

        {showLevels && entryZoneMin && (
          <g>
            <line
              x1={paddingX}
              y1={getY(entryZoneMin)}
              x2={width - paddingX}
              y2={getY(entryZoneMin)}
              stroke="#38BDF8"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <text
              x={width - paddingX + 6}
              y={getY(entryZoneMin) + 3}
              fill="#38BDF8"
              fontSize="9"
              fontFamily="JetBrains Mono, monospace"
              textAnchor="start"
            >
              Entrée: {entryZoneMin}
            </text>
          </g>
        )}

        {showLevels && stopLossPrice && (
          <g>
            <line
              x1={paddingX}
              y1={getY(stopLossPrice)}
              x2={width - paddingX}
              y2={getY(stopLossPrice)}
              stroke="#EF4444"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <text
              x={width - paddingX + 6}
              y={getY(stopLossPrice) + 3}
              fill="#EF4444"
              fontSize="9"
              fontFamily="JetBrains Mono, monospace"
              textAnchor="start"
            >
              SL: {stopLossPrice}
            </text>
          </g>
        )}

        {/* Area fill */}
        <polygon points={areaPoints} fill={`url(#${gradientId})`} />

        {/* Main trend line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {/* Data points & hover triggers */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.price);
          const isHovered = hoverIndex === i;

          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 5 : 2.5}
                fill={isHovered ? '#FFFFFF' : color}
                stroke={color}
                strokeWidth={isHovered ? 2 : 1}
                className="transition-all duration-150"
              />
              {/* Invisible wider hit target for mouse hover */}
              <rect
                x={cx - (width - 2 * paddingX) / (data.length * 2)}
                y={0}
                width={(width - 2 * paddingX) / data.length}
                height={height}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
                className="cursor-crosshair"
              />
            </g>
          );
        })}

        {/* Hover vertical crosshair */}
        {hoverIndex !== null && (
          <line
            x1={getX(hoverIndex)}
            y1={paddingY}
            x2={getX(hoverIndex)}
            y2={height - paddingY}
            stroke="#94A3B8"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        )}
      </svg>

      {/* Interactive Tooltip Card */}
      {hoveredPoint && hoverIndex !== null && (
        <div
          className="absolute pointer-events-none z-10 px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 shadow-xl text-xs backdrop-blur-sm transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(getX(hoverIndex) / width) * 100}%`,
            top: `${(getY(hoveredPoint.price) / height) * 100}%`,
          }}
        >
          <div className="text-slate-400 font-mono text-[10px]">{hoveredPoint.time}</div>
          <div className="font-mono font-semibold text-white tabular-nums">
            {hoveredPoint.price.toLocaleString('fr-FR')} {currency}
          </div>
        </div>
      )}
    </div>
  );
}
