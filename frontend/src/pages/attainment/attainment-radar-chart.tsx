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

export function AttainmentRadarChart({ result, threshold = 0.68 }: AttainmentRadarChartProps) {
  const items = result.items
  const dataPolygon = toPoints(items, (item) => item.attainmentVal)
  const thresholdPolygon = toPoints(items, () => threshold)
  const average = items.reduce((sum, item) => sum + item.attainmentVal, 0) / items.length
  const weakItems = items.filter((item) => item.attainmentVal < threshold)

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <svg className="mx-auto block h-auto w-full max-w-[520px]" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="毕业要求达成雷达图">
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
            points={thresholdPolygon}
            stroke="rgba(239, 68, 68, 0.65)"
            strokeDasharray="5 5"
            strokeWidth="2"
          />
          <polygon fill="rgba(29, 78, 216, 0.18)" points={dataPolygon} stroke="#1d4ed8" strokeWidth="3" />

          {items.map((item, index) => {
      const point = getPoint(index, items.length, clampValue(item.attainmentVal))
            const isWeak = item.attainmentVal < threshold

            return (
              <circle
                cx={point.x}
                cy={point.y}
                fill={isWeak ? "#ef4444" : "#1d4ed8"}
                key={item.requirementId}
                r="4.5"
                stroke="white"
                strokeWidth="2"
              />
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
                textAnchor={isRight ? "start" : isLeft ? "end" : "middle"}
                x={label.x}
                y={label.y}
              >
                {item.title}
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
      </div>

      <aside className="grid content-start gap-3">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="m-0 text-sm font-bold text-blue-700">平均达成度</p>
          <strong className="mt-2 block text-3xl leading-none font-extrabold text-blue-800">{average.toFixed(2)}</strong>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="m-0 text-sm font-bold text-red-700">低于阈值</p>
          <strong className="mt-2 block text-3xl leading-none font-extrabold text-red-700">{weakItems.length}</strong>
          <p className="mt-2 text-xs font-bold text-red-600">标准底线 {threshold.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="m-0 text-sm font-extrabold text-slate-800">图例</p>
          <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-0.5 w-6 rounded bg-blue-700" />
              达成度计算值
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-0.5 w-6 border-t-2 border-dashed border-red-400" />
              标准底线
            </span>
          </div>
        </div>
      </aside>
    </div>
  )
}
