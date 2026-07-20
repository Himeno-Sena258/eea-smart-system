  import type { RequirementAttainmentResult, RequirementAttainmentItem } from "@/models"

interface AttainmentRadarChartProps {
  result: RequirementAttainmentResult
  threshold?: number
}

const size = 360
const center = size / 2
const radius = 118
const levels = [0.6, 0.7, 0.8, 0.9, 1]

const clampValue = (value: number) => Math.min(Math.max(value, 0), 1)

const getPoint = (index: number, total: number, value: number) => {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total
  const distance = radius * value

  return {
    x: center + Math.cos(angle) * distance,
    y: center + Math.sin(angle) * distance, 
  }
}

const toPoints = (items: RequirementAttainmentItem[], valueGetter: (item: RequirementAttainmentItem) => number) =>
  items
    .map((item, index) => {
      const point = getPoint(index, items.length, valueGetter(item))
      return `${point.x},${point.y}`
    })
    .join(" ")

const toCenterPoints = (items: RequirementAttainmentItem[]) => items.map(() => `${center},${center}`).join(" ")

export function AttainmentRadarChart({ result, threshold = 0.68 }: AttainmentRadarChartProps) {
  const items = result.items
  const dataPolygon = toPoints(items, (item) => item.attainmentVal)
  const thresholdPolygon = toPoints(items, () => threshold)
  const centerPolygon = toCenterPoints(items)
  const average = items.reduce((sum, item) => sum + item.attainmentVal, 0) / items.length
  const weakItems = items.filter((item) => item.attainmentVal < threshold)

  return (
    <div className="grid gap-4">
      <svg className="mx-auto block h-auto w-full max-w-[440px]" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="毕业要求达成雷达图">
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
                  y1={center}
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
                cy={center}
                fill={isWeak ? "#ef4444" : "#1d4ed8"}
                key={item.requirementId}
                opacity="0"
                r="0"
                stroke="white"
                strokeWidth="2"
              >
                <animate attributeName="cx" begin={begin} dur="420ms" fill="freeze" from={center} to={point.x} />
                <animate attributeName="cy" begin={begin} dur="420ms" fill="freeze" from={center} to={point.y} />
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
                y={center}
              >
                {item.title}
                <animate attributeName="opacity" begin={`${620 + index * 60}ms`} dur="300ms" fill="freeze" from="0" to="1" />
                <animate attributeName="x" begin={`${620 + index * 60}ms`} dur="360ms" fill="freeze" from={center} to={label.x} />
                <animate attributeName="y" begin={`${620 + index * 60}ms`} dur="360ms" fill="freeze" from={center} to={label.y} />
              </text>
            )
          })}

          {levels.map((level) => {
            const point = getPoint(0, items.length, level)
            return (
              <text
                fill="rgb(148 163 184)"
                fontSize="10"
                key={level}
                textAnchor="middle"
                x={center + 14}
                y={point.y + 4}
              >
                {level.toFixed(2)}
              </text>
            )
          })}
      </svg>

      <aside className="grid gap-4 border-t border-slate-200 pt-4 md:grid-cols-[1fr_1fr_auto] md:items-center">
        <div>
          <p className="m-0 text-xs font-extrabold text-slate-400">平均达成度</p>
          <strong className="mt-1 block text-2xl leading-none font-extrabold text-blue-800">{average.toFixed(2)}</strong>
        </div>
        <div>
          <p className="m-0 text-xs font-extrabold text-slate-400">低于阈值</p>
          <strong className="mt-1 block text-2xl leading-none font-extrabold text-red-700">{weakItems.length}</strong>
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
    </div>
  )
}
