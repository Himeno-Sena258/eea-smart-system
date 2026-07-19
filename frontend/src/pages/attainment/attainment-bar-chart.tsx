import type { CourseObjectiveAttainmentItem, CourseObjectiveAttainmentResult } from "@/models"

interface AttainmentBarChartProps {
  primaryLabel: string
  primaryResult: CourseObjectiveAttainmentResult
  comparisonLabel?: string
  comparisonResult?: CourseObjectiveAttainmentResult
  threshold?: number
}

const chartWidth = 520
const chartHeight = 280
const padding = { top: 24, right: 24, bottom: 44, left: 44 }
const plotWidth = chartWidth - padding.left - padding.right
const plotHeight = chartHeight - padding.top - padding.bottom
const plotBottomY = padding.top + plotHeight
const yTicks = [0, 0.25, 0.5, 0.68, 0.75, 1]

const clampValue = (value: number) => Math.min(Math.max(value, 0), 1)
const getY = (value: number) => padding.top + plotHeight - clampValue(value) * plotHeight

const getComparisonItem = (
  item: CourseObjectiveAttainmentItem,
  comparisonItems: CourseObjectiveAttainmentItem[],
) => comparisonItems.find((comparison) => comparison.courseObjectiveId === item.courseObjectiveId)

export function AttainmentBarChart({
  primaryLabel,
  primaryResult,
  comparisonLabel,
  comparisonResult,
  threshold = 0.68,
}: AttainmentBarChartProps) {
  const items = primaryResult.items
  const comparisonItems = comparisonResult?.items ?? []
  const hasComparison = Boolean(comparisonLabel && comparisonResult)
  const groupWidth = plotWidth / items.length
  const barWidth = hasComparison ? Math.min(groupWidth * 0.28, 28) : Math.min(groupWidth * 0.42, 38)
  const weakCount = items.filter((item) => item.attainmentVal < threshold).length

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-extrabold text-red-700">
          {weakCount} 项低于 {threshold.toFixed(2)}
        </span>
      </div>

      <svg className="block h-auto w-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="课程目标达成度对比柱状图">
        <line stroke="rgb(203 213 225)" strokeWidth="1" x1={padding.left} x2={padding.left} y1={padding.top} y2={padding.top + plotHeight} />
        <line stroke="rgb(203 213 225)" strokeWidth="1" x1={padding.left} x2={padding.left + plotWidth} y1={padding.top + plotHeight} y2={padding.top + plotHeight} />

        {yTicks.map((tick) => {
          const y = getY(tick)
          const isThreshold = tick === threshold

          return (
            <g key={tick}>
              <line
                stroke={isThreshold ? "rgba(239, 68, 68, 0.5)" : "rgb(241 245 249)"}
                strokeDasharray={isThreshold ? "5 5" : undefined}
                strokeWidth={isThreshold ? "2" : "1"}
                x1={padding.left}
                x2={padding.left + plotWidth}
                y1={y}
                y2={y}
              />
              <text fill={isThreshold ? "#ef4444" : "rgb(148 163 184)"} fontSize="10" fontWeight="700" textAnchor="end" x={padding.left - 8} y={y + 4}>
                {tick.toFixed(2)}
              </text>
            </g>
          )
        })}

        {items.map((item, index) => {
          const comparisonItem = getComparisonItem(item, comparisonItems)
          const groupCenter = padding.left + groupWidth * index + groupWidth / 2
          const primaryX = hasComparison ? groupCenter - barWidth - 3 : groupCenter - barWidth / 2
          const comparisonX = groupCenter + 3
          const primaryY = getY(item.attainmentVal)
          const primaryHeight = padding.top + plotHeight - primaryY
          const isWeak = item.attainmentVal < threshold
          const begin = `${index * 80}ms`

          return (
            <g key={item.courseObjectiveId}>
              <rect fill={isWeak ? "#ef4444" : "#1d4ed8"} height="0" rx="4" width={barWidth} x={primaryX} y={plotBottomY}>
                <animate attributeName="y" begin={begin} dur="560ms" fill="freeze" from={plotBottomY} to={primaryY} />
                <animate attributeName="height" begin={begin} dur="560ms" fill="freeze" from="0" to={primaryHeight} />
              </rect>

              {comparisonItem ? (() => {
                const comparisonY = getY(comparisonItem.attainmentVal)
                const comparisonHeight = padding.top + plotHeight - comparisonY

                return (
                  <rect fill="#94a3b8" height="0" rx="4" width={barWidth} x={comparisonX} y={plotBottomY}>
                    <animate attributeName="y" begin={`${index * 80 + 90}ms`} dur="520ms" fill="freeze" from={plotBottomY} to={comparisonY} />
                    <animate attributeName="height" begin={`${index * 80 + 90}ms`} dur="520ms" fill="freeze" from="0" to={comparisonHeight} />
                  </rect>
                )
              })() : null}

              <text fill="rgb(51 65 85)" fontSize="11" fontWeight="800" opacity="0" textAnchor="middle" x={groupCenter} y={chartHeight - 16}>
                {item.objectiveCode}
                <animate attributeName="opacity" begin={`${index * 80 + 220}ms`} dur="280ms" fill="freeze" from="0" to="1" />
              </text>
              <text fill={isWeak ? "#ef4444" : "#1d4ed8"} fontSize="11" fontWeight="800" opacity="0" textAnchor="middle" x={primaryX + barWidth / 2} y={plotBottomY}>
                {item.attainmentVal.toFixed(2)}
                <animate attributeName="opacity" begin={`${index * 80 + 260}ms`} dur="260ms" fill="freeze" from="0" to="1" />
                <animate attributeName="y" begin={`${index * 80 + 260}ms`} dur="360ms" fill="freeze" from={plotBottomY} to={primaryY - 6} />
              </text>
            </g>
          )
        })}
      </svg>

      <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded-sm bg-blue-700" />
          {primaryLabel}
        </span>
        {hasComparison ? (
          <span className="inline-flex items-center gap-2">
            <span className="size-3 rounded-sm bg-slate-400" />
            {comparisonLabel}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-6 border-t-2 border-dashed border-red-400" />
          标准底线
        </span>
      </div>
    </div>
  )
}
