import type { Ping } from './safety.api'
// Web Mercator projection matches the attributed OpenStreetMap raster tiles.
function project(lat: number, lng: number) {
  const safe = Math.max(-85.05, Math.min(85.05, lat)),
    sin = Math.sin((safe * Math.PI) / 180)
  return {
    x: ((lng + 180) / 360) * 8388608,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * 8388608,
  }
}
export function SafetyMap({
  lat,
  lng,
  trail,
  pickup,
  dropoff,
}: {
  lat: number
  lng: number
  trail: Ping[]
  pickup: { lat: number; lng: number }
  dropoff: { lat: number; lng: number }
}) {
  const center = project(lat, lng),
    left = Math.floor(center.x / 256) - 1,
    top = Math.floor(center.y / 256) - 1
  const point = (a: number, b: number) => {
    const p = project(a, b)
    return [p.x - left * 256, p.y - top * 256]
  }
  return (
    <figure className="overflow-hidden rounded-lg border">
      <svg
        viewBox="0 0 768 768"
        className="max-h-[420px] w-full"
        role="img"
        aria-label="SOS location map and recent trail"
      >
        {Array.from({ length: 9 }, (_, i) => {
          const x = left + (i % 3),
            y = top + Math.floor(i / 3)
          return (
            <image
              key={i}
              x={(i % 3) * 256}
              y={Math.floor(i / 3) * 256}
              width="256"
              height="256"
              href={`https://tile.openstreetmap.org/15/${x}/${y}.png`}
            />
          )
        })}
        <polyline
          points={trail.map((p) => point(p.lat, p.lng).join(',')).join(' ')}
          fill="none"
          stroke="#149d94"
          strokeWidth="5"
        />
        {[
          { ...pickup, color: '#168447', label: 'Pickup' },
          { ...dropoff, color: '#195b9c', label: 'Dropoff' },
          { lat, lng, color: '#dc2626', label: 'SOS' },
        ].map((p) => {
          const [x, y] = point(p.lat, p.lng)
          return (
            <g key={p.label}>
              <circle
                cx={x}
                cy={y}
                r="12"
                fill={p.color}
                stroke="white"
                strokeWidth="3"
              />
              <text x={x + 15} y={y} fontSize="20" fill="#172B36">
                {p.label}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption className="p-2 text-xs">
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          © OpenStreetMap contributors
        </a>{' '}
        · {lat.toFixed(5)}, {lng.toFixed(5)}
      </figcaption>
    </figure>
  )
}
