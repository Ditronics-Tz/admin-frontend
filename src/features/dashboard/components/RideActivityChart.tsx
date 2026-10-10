import React, { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

const DATA_7D = [
  { name: 'Mon', rides: 3200, completed: 2950 },
  { name: 'Tue', rides: 3450, completed: 3200 },
  { name: 'Wed', rides: 3700, completed: 3490 },
  { name: 'Thu', rides: 3900, completed: 3680 },
  { name: 'Fri', rides: 4800, completed: 4520 },
  { name: 'Sat', rides: 5200, completed: 4900 },
  { name: 'Sun', rides: 4400, completed: 4180 },
]

const DATA_30D = [
  { name: 'Week 1', rides: 22400, completed: 20900 },
  { name: 'Week 2', rides: 24100, completed: 22600 },
  { name: 'Week 3', rides: 25800, completed: 24100 },
  { name: 'Week 4', rides: 28200, completed: 26500 },
]

export const RideActivityChart: React.FC = () => {
  const [period, setPeriod] = useState<'7d' | '30d'>('7d')
  const chartData = period === '7d' ? DATA_7D : DATA_30D

  return (
    <Card className="shadow-xs rounded-xl border border-slate-200/80 bg-white p-5">
      <CardHeader className="p-0 pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-[#172B36]">
                Ride Activity
              </CardTitle>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                Sample Data
              </span>
            </div>
            <CardDescription className="mt-0.5 text-xs text-[#64748B]">
              Ride request volume across Dar es Salaam zones over the selected period.
            </CardDescription>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setPeriod('7d')}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
                period === '7d'
                  ? 'shadow-xs bg-white text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setPeriod('30d')}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
                period === '30d'
                  ? 'shadow-xs bg-white text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              30 Days
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1C7C70" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1C7C70" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                  fontSize: '12px',
                }}
                formatter={(value) => [`${value} rides`, 'Volume']}
              />
              <Area
                type="monotone"
                dataKey="rides"
                stroke="#1C7C70"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRides)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
