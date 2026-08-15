import { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { useColorScheme } from 'nativewind';
import type { SalesSummarySeriesPoint } from '@/types';
import { formatPrice } from '@/utils/format';

interface RevenueChartProps {
  series: SalesSummarySeriesPoint[];
}

const CHART_WIDTH = 320;
const CHART_HEIGHT = 120;
const TOP_PADDING = 10;
const BASELINE_Y = 108;
const PLOT_HEIGHT = BASELINE_Y - TOP_PADDING;
const MIN_BAR_HEIGHT = 3;

function shortDayLabel(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
}

/** Rounded-top, square-baseline bar path — data-end is the visual anchor, not the baseline. */
function barPath(x: number, width: number, height: number): string {
  const radius = Math.min(4, width / 2, height);
  const top = BASELINE_Y - height;

  if (height <= radius) {
    return `M ${x} ${BASELINE_Y} L ${x} ${BASELINE_Y} L ${x + width} ${BASELINE_Y} L ${x + width} ${BASELINE_Y} Z`;
  }

  return `
    M ${x} ${top + radius}
    Q ${x} ${top} ${x + radius} ${top}
    L ${x + width - radius} ${top}
    Q ${x + width} ${top} ${x + width} ${top + radius}
    L ${x + width} ${BASELINE_Y}
    L ${x} ${BASELINE_Y}
    Z
  `;
}

export function RevenueChart({ series }: RevenueChartProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedIndex, setSelectedIndex] = useState(series.length - 1);

  const barFill = isDark ? '#42cf84' : '#1db567';
  const baselineColor = isDark ? '#374151' : '#e5e7eb';
  const dimmedOpacity = isDark ? 0.4 : 0.35;

  const maxRevenue = Math.max(...series.map((p) => p.revenue), 1);
  const slot = CHART_WIDTH / series.length;
  const barWidth = slot * 0.55;

  const hasSales = series.some((p) => p.revenue > 0);
  const selected = series[selectedIndex];

  return (
    <View className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-sm font-semibold text-gray-900 dark:text-gray-50">Last 14 Days</Text>
        {selected ? (
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {shortDayLabel(selected.date)} · {formatPrice(selected.revenue)}
          </Text>
        ) : null}
      </View>

      {hasSales ? null : (
        <Text className="mt-1 text-xs text-gray-400 dark:text-gray-500">No sales in the last 14 days.</Text>
      )}

      <View className="mt-3">
        <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
          <Line
            x1={0}
            y1={BASELINE_Y}
            x2={CHART_WIDTH}
            y2={BASELINE_Y}
            stroke={baselineColor}
            strokeWidth={1}
          />
          {series.map((point, i) => {
            const height = Math.max(
              MIN_BAR_HEIGHT,
              maxRevenue > 0 ? (point.revenue / maxRevenue) * PLOT_HEIGHT : 0,
            );
            const x = i * slot + (slot - barWidth) / 2;
            return (
              <Path
                key={point.date}
                d={barPath(x, barWidth, height)}
                fill={barFill}
                opacity={i === selectedIndex ? 1 : dimmedOpacity}
                onPress={() => setSelectedIndex(i)}
              />
            );
          })}
        </Svg>

        <View className="flex-row justify-between px-0.5">
          <Text className="text-[10px] text-gray-400 dark:text-gray-500">{shortDayLabel(series[0].date)}</Text>
          <Text className="text-[10px] text-gray-400 dark:text-gray-500">
            {shortDayLabel(series[Math.floor(series.length / 2)].date)}
          </Text>
          <Text className="text-[10px] text-gray-400 dark:text-gray-500">
            {shortDayLabel(series[series.length - 1].date)}
          </Text>
        </View>
      </View>
    </View>
  );
}
