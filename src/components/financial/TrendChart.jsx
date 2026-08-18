import React, { useMemo, useState } from 'react';
import './TrendChart.scss';

const DEFAULT_SERIES = [
  { key: 'propertyPremiums', label: 'Property Premiums', color: 'var(--color-brand-blue-60)' },
  { key: 'propertyClaims', label: 'Property Claims', color: 'var(--color-brand-blue-40)' },
  { key: 'autoPremiums', label: 'Auto Premiums', color: 'var(--color-success)' },
  { key: 'autoClaims', label: 'Auto Claims', color: 'var(--color-brand-red-60)' },
];

const WIDTH = 720;
const HEIGHT = 260;
const PADDING = { top: 16, right: 16, bottom: 32, left: 56 };

/**
 * TrendChart - dependency-free multi-series line chart used by every
 * Financial Dashboard variant. Series can be toggled on/off via the
 * legend, per the PRD's Expense Visualization interactivity requirement.
 * The `theme` prop only changes visual treatment (line style, glow, area
 * fill) - the scaling/geometry logic is shared.
 */
export default function TrendChart({
  data,
  series = DEFAULT_SERIES,
  theme = 'standard',
  className = '',
}) {
  const [visible, setVisible] = useState(() =>
    Object.fromEntries(series.map((s) => [s.key, true]))
  );

  const maxValue = useMemo(() => {
    let max = 0;
    data.forEach((point) => {
      series.forEach((s) => {
        if (visible[s.key]) max = Math.max(max, point[s.key]);
      });
    });
    return max || 1;
  }, [data, series, visible]);

  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const xFor = (index) =>
    PADDING.left + (index / Math.max(data.length - 1, 1)) * innerWidth;
  const yFor = (value) =>
    PADDING.top + innerHeight - (value / maxValue) * innerHeight;

  const linePath = (key) =>
    data
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index)} ${yFor(point[key])}`)
      .join(' ');

  const areaPath = (key) => {
    const line = data
      .map((point, index) => `${xFor(index)},${yFor(point[key])}`)
      .join(' L ');
    return `M ${xFor(0)},${yFor(0)} L ${line} L ${xFor(data.length - 1)},${yFor(0)} Z`;
  };

  const gridLines = 4;
  const tickIndices = data.length <= 8
    ? data.map((_, i) => i)
    : Array.from({ length: 6 }, (_, i) => Math.round((i * (data.length - 1)) / 5));

  return (
    <div className={`trend-chart trend-chart--${theme} ${className}`}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="trend-chart__svg"
        role="img"
        aria-label="Premiums and claims trend over time"
      >
        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const y = PADDING.top + (i / gridLines) * innerHeight;
          return (
            <line
              key={i}
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={y}
              y2={y}
              className="trend-chart__gridline"
            />
          );
        })}

        {tickIndices.map((index) => (
          <text
            key={index}
            x={xFor(index)}
            y={HEIGHT - 8}
            className="trend-chart__axis-label"
            textAnchor="middle"
          >
            {data[index].label}
          </text>
        ))}

        {series
          .filter((s) => visible[s.key])
          .map((s) => (
            <g key={s.key}>
              {theme !== 'standard' && (
                <path d={areaPath(s.key)} fill={s.color} className="trend-chart__area" />
              )}
              <path
                d={linePath(s.key)}
                stroke={s.color}
                className="trend-chart__line"
                fill="none"
              />
            </g>
          ))}
      </svg>

      <div className="trend-chart__legend">
        {series.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`trend-chart__legend-item ${visible[s.key] ? '' : 'trend-chart__legend-item--off'}`}
            onClick={() => setVisible((v) => ({ ...v, [s.key]: !v[s.key] }))}
            aria-pressed={visible[s.key]}
          >
            <span className="trend-chart__legend-swatch" style={{ background: s.color }} />
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
