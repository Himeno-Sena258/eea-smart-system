import type { CSSProperties } from "react"
import type { RequirementAttainmentItem, RequirementAttainmentResult } from "@/models"

interface AttainmentRadarChartProps {
  result: RequirementAttainmentResult
  threshold?: number
}

const chartWidth = 760
const chartHeight = 460
const center = chartWidth / 2
const centerY = chartHeight / 2
const radius = 125
const levels = [0.6, 0.7, 0.8, 0.9, 1]

const clampValue = (value: number) => Math.min(Math.max(value, 0), 1)

const getPoint = (index: number, total: number, value: number) => {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total
  const distance = radius * value

  return {
    x: center + Math.cos(angle) * distance,
    y: centerY + Math.sin(angle) * distance,
  }
}

const toPoints = (items: RequirementAttainmentItem[], valueGetter: (item: RequirementAttainmentItem) => number) =>
  items
    .map((item, index) => {
      const point = getPoint(index, items.length, valueGetter(item))
      return `${point.x},${point.y}`
    })
    .join(" ")

const toCenterPoints = (items: RequirementAttainmentItem[]) => items.map(() => `${center},${centerY}`).join(" ")

const toAxisLabel = (item: RequirementAttainmentItem) => {
  const title = item.title === item.requirementCode ? "" : item.title
  const summary = title.length > 12 ? `${title.slice(0, 12)}...` : title
  return summary ? `${item.requirementCode} ${summary}` : item.requirementCode
}

function AttainmentMetricList({
  average,
  items,
  threshold,
  weakItems,
}: {
  average: number
  items: RequirementAttainmentItem[]
  threshold: number
  weakItems: RequirementAttainmentItem[]
}) {
  return (
    <div className="grid gap-4">
      <div className="grid min-h-[260px] content-center gap-4 px-2 sm:px-6">
        {items.map((item, index) => {
          const value = clampValue(item.attainmentVal)
          const isWeak = item.attainmentVal < threshold

          return (
            <article className="grid gap-2 rounded-lg border border-slate-200 bg-white p-4" key={item.requirementId}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="m-0 text-base font-extrabold text-slate-950">{toAxisLabel(item)}</h3>
                  {item.title !== item.requirementCode ? (
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.title}</p>
                  ) : null}
                </div>
                <strong className={isWeak ? "text-2xl leading-none text-red-700" : "text-2xl leading-none text-blue-700"}>
                  {item.attainmentVal.toFixed(2)}
                </strong>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
                <span
                  className="absolute top-0 bottom-0 w-px bg-red-400"
                  style={{ left: `${threshold * 100}%` }}
                />
                <span
                  className={isWeak ? "block h-full rounded-full bg-red-500" : "block h-full rounded-full bg-blue-700"}
                  style={{
                    animation: `attainmentBarGrow 520ms ${index * 100}ms ease-out both`,
                    "--bar-width": `${value * 100}%`,
                  } as CSSProperties}
                />
              </div>
            </article>
          )
        })}
      </div>

      <style>
        {`
          @keyframes attainmentBarGrow {
            from { width: 0; }
            to { width: var(--bar-width); }
          }
        `}
      </style>

      <ChartSummary average={average} weakCount={weakItems.length} />
    </div>
  )
}

function ChartSummary({ average, weakCount }: { average: number; weakCount: number }) {
  return (
    <aside className="grid gap-4 border-t border-slate-200 pt-4 md:grid-cols-[1fr_1fr_auto] md:items-center">
      <div>
        <p className="m-0 text-xs font-extrabold text-slate-400">平均达成度</p>
        <strong className="mt-1 block text-2xl leading-none font-extrabold text-blue-800">{average.toFixed(2)}</strong>
      </div>
      <div>
        <p className="m-0 text-xs font-extrabold text-slate-400">低于阈值</p>
        <strong className="mt-1 block text-2xl leading-none font-extrabold text-red-700">{weakCount}</strong>
      </div>
      <div className="grid gap-2 text-sm font-semibold text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-6 rounded bg-blue-700" />
          达成度计算值
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-6 border-t-2 border-dashed border-red-400" />
          标准底线
        </span>
      </div>
    </aside>
  )
}

export function AttainmentRadarChart({ result, threshold = 0.68 }: AttainmentRadarChartProps) {
  const items = result.items

  if (items.length === 0) {
    return (
      <div className="grid min-h-[300px] place-items-center rounded-lg border border-dashed border-slate-200 text-sm font-bold text-slate-400">
        暂无毕业要求达成度数据
      </div>
    )
  }

  const dataPolygon = toPoints(items, (item) => item.attainmentVal)
  const thresholdPolygon = toPoints(items, () => threshold)
  const centerPolygon = toCenterPoints(items)
  const average = items.reduce((sum, item) => sum + item.attainmentVal, 0) / items.length
  const weakItems = items.filter((item) => item.attainmentVal < threshold)

  if (items.length < 3) {
    return <AttainmentMetricList average={average} items={items} threshold={threshold} weakItems={weakItems} />
  }

  return (
    <div className="grid gap-4">
      <svg className="mx-auto block h-auto w-full max-w-[860px]" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="毕业要求达成雷达图">
        <g>
          {levels.map((level) => (
            <polygon
              fill={level === 1 ? "none" : "rgb(248 250 252)"}
              key={level}
              points={toPoints(items, () => level)}
              stroke="rgb(226 232 240)"
              strokeWidth="1"
            />
          ))}
        </g>

        <g>
          {items.map((item, index) => {
            const end = getPoint(index, items.length, 1)
            return (
              <line
                key={item.requirementId}
                stroke="rgb(226 232 240)"
                strokeWidth="1"
                x1={center}
                x2={end.x}
                y1={centerY}
                y2={end.y}
              />
            )
          })}
        </g>

        <polygon
          fill="rgba(239, 68, 68, 0.06)"
          points={centerPolygon}
          stroke="rgba(239, 68, 68, 0.65)"
          strokeDasharray="5 5"
          strokeWidth="2"
        >
          <animate attributeName="points" begin="120ms" dur="520ms" fill="freeze" from={centerPolygon} to={thresholdPolygon} />
        </polygon>
        <polygon fill="rgba(29, 78, 216, 0.18)" points={centerPolygon} stroke="#1d4ed8" strokeWidth="3">
          <animate attributeName="points" begin="220ms" dur="680ms" fill="freeze" from={centerPolygon} to={dataPolygon} />
        </polygon>

        {items.map((item, index) => {
          const point = getPoint(index, items.length, clampValue(item.attainmentVal))
          const isWeak = item.attainmentVal < threshold
          const begin = `${360 + index * 70}ms`

          return (
            <circle
              cx={center}
              cy={centerY}
              fill={isWeak ? "#ef4444" : "#1d4ed8"}
              key={item.requirementId}
              opacity="0"
              r="0"
              stroke="white"
              strokeWidth="2"
            >
              <animate attributeName="cx" begin={begin} dur="420ms" fill="freeze" from={center} to={point.x} />
              <animate attributeName="cy" begin={begin} dur="420ms" fill="freeze" from={centerY} to={point.y} />
              <animate attributeName="r" begin={begin} dur="420ms" fill="freeze" from="0" to="4.5" />
              <animate attributeName="opacity" begin={begin} dur="220ms" fill="freeze" from="0" to="1" />
            </circle>
          )
        })}

        {items.map((item, index) => {
          const label = getPoint(index, items.length, 1.16)
          const isRight = label.x > center + 12
          const isLeft = label.x < center - 12

          return (
            <text
              dominantBaseline="middle"
              fill="rgb(51 65 85)"
              fontSize="12"
              fontWeight="700"
              key={item.requirementId}
              opacity="0"
              textAnchor={isRight ? "start" : isLeft ? "end" : "middle"}
              x={center}
              y={centerY}
            >
              {toAxisLabel(item)}
              <animate attributeName="opacity" begin={`${620 + index * 60}ms`} dur="300ms" fill="freeze" from="0" to="1" />
              <animate attributeName="x" begin={`${620 + index * 60}ms`} dur="360ms" fill="freeze" from={center} to={label.x} />
              <animate attributeName="y" begin={`${620 + index * 60}ms`} dur="360ms" fill="freeze" from={centerY} to={label.y} />
            </text>
          )
        })}

        {levels.map((level) => {
          const point = getPoint(0, items.length, level)
          return (
            <text fill="rgb(148 163 184)" fontSize="10" key={level} textAnchor="middle" x={center + 14} y={point.y + 4}>
              {level.toFixed(2)}
            </text>
          )
        })}
      </svg>

      <ChartSummary average={average} weakCount={weakItems.length} />
    </div>
  )
}
