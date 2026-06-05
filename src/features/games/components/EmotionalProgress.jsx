import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import styles from './EmotionalProgress.module.css'

export const FEELINGS = [
  { id: 'hooked', label: '🔥 Enganchado' },
  { id: 'relaxed', label: '😌 Relajado' },
  { id: 'stressed', label: '😤 Agobiado' },
  { id: 'frustrated', label: '💀 Frustrado' },
  { id: 'chaotic', label: '🤯 Caótico' },
  { id: 'tense', label: '🥶 Tenso' },
  { id: 'immersive', label: '🌌 Inmersivo' },
  { id: 'chill', label: '😴 Chill' },
]

export const FEELING_COLORS = {
  hooked: '#22c55e',
  relaxed: '#3b82f6',
  stressed: '#ef4444',
  frustrated: '#dc2626',
  chaotic: '#f59e0b',
  tense: '#06b6d4',
  immersive: '#8b5cf6',
  chill: '#6b7280',
}

const FEELINGS_BY_IDX = ['chill', 'relaxed', 'immersive', 'hooked', 'tense', 'chaotic', 'stressed', 'frustrated']

export default function EmotionalProgress({ sessionHistory, currentFeeling }) {
  const chartData = sessionHistory
    .filter(s => s.feeling)
    .map((s, i) => {
      const [y, m, d] = s.start_date.split('-')
      return {
        date: new Date(+y, +m - 1, +d).toLocaleDateString('es', { day: '2-digit', month: 'short' }),
        feelingIdx: FEELINGS_BY_IDX.indexOf(s.feeling),
        feeling: s.feeling,
        index: i,
      }
    })

  const total = chartData.length
  const feelingCounts = FEELINGS.map(f => ({
    ...f,
    color: FEELING_COLORS[f.id],
    count: sessionHistory.filter(s => s.feeling === f.id).length,
  })).filter(f => f.count > 0)

  const feelingPct = feelingCounts.map(f => ({
    ...f,
    pct: Math.round((f.count / total) * 100),
  }))

  if (total === 0) return (
    <div className={styles.empty}>
      Registra sesiones con estado emocional para ver tu historial aquí.
    </div>
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.charts} style={{ width: '100%' }}>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
          padding: '20px',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 300px', gap: 20, alignItems: 'center', minWidth: 0 }}>

            {/* Gráfico de línea */}
            <div style={{ minWidth: 0 }}>
              <div style={{ height: 250, width: '100%' }}>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                      <XAxis
                        dataKey="index"
                        tickFormatter={(i) => chartData[i]?.date ?? ''}
                        tick={{ fill: 'rgba(232,230,240,0.3)', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[-0.5, 7.5]}
                        ticks={[0, 1, 2, 3, 4, 5, 6, 7]}
                        tick={(props) => {
                          const { x, y, payload } = props
                          const feeling = FEELINGS.find(f => f.id === FEELINGS_BY_IDX[payload.value])
                          return (
                            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={14}>
                              {feeling?.label ? [...feeling.label][0] : ''}
                            </text>
                          )
                        }}
                        axisLine={false}
                        tickLine={false}
                        width={36}
                        interval={0}
                      />
                      <Tooltip content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const p = payload[0]?.payload
                        const feeling = FEELINGS.find(f => f.id === p?.feeling)
                        return (
                          <div style={{
                            background: 'rgba(15,12,25,0.97)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 10, padding: '8px 12px',
                            fontSize: 12, color: '#e8e6f0',
                          }}>
                            <div style={{ color: FEELING_COLORS[p?.feeling] }}>{feeling?.label}</div>
                            <div style={{ color: 'rgba(232,230,240,0.5)', marginTop: 2 }}>{p?.date}</div>
                          </div>
                        )
                      }} />
                      <defs>
                        <linearGradient id="emotionLineComp" x1="0" y1="1" x2="0" y2="0">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                      </defs>
                      <Line
                        type="monotone"
                        dataKey="feelingIdx"
                        stroke="url(#emotionLineComp)"
                        strokeWidth={2.5}
                        dot={(props) => {
                          const feeling = FEELINGS.find(f => f.id === props.payload?.feeling)
                          return (
                            <circle
                              key={props.key}
                              cx={props.cx}
                              cy={props.cy}
                              r={5}
                              fill={FEELING_COLORS[feeling?.id] ?? '#a78bfa'}
                              stroke="rgba(10,10,15,0.8)"
                              strokeWidth={2}
                            />
                          )
                        }}
                        activeDot={{ r: 7, fill: '#a78bfa', stroke: 'rgba(167,139,250,0.3)', strokeWidth: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(232,230,240,0.3)', fontSize: 13 }}>
                    Registra más sesiones para ver tu evolución emocional
                  </div>
                )}
              </div>
            </div>

            {/* Dona */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {feelingCounts.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: 120 }}>
                  <PieChart width={150} height={150}>
                    <Pie data={feelingCounts} cx={70} cy={70} innerRadius={45} outerRadius={55} dataKey="count" strokeWidth={0}>
                      {feelingCounts.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} opacity={0.9} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-bright)' }}>{total}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>sesiones</span>
                  </div>
                </div>
              )}
            </div>

            {/* Barras */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {feelingPct.map(f => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: f.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', minWidth: 80 }}>
                    {f.label.split(' ').slice(1).join(' ')}
                  </span>
                  <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${f.pct}%`, height: '100%', background: f.color, borderRadius: 99, transition: 'width 0.6s ease', opacity: 0.85 }} />
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)', minWidth: 28, textAlign: 'right' }}>{f.pct}%</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}