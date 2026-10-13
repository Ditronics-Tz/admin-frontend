import type { RidePlace } from '../services/ride.service'
import { useShipText } from '@/components/common/ship-text'

// Same Web Mercator/SVG raster approach used by the existing operations map.
function project(lat: number, lng: number) {
  const sin = Math.sin((Math.max(-85.05, Math.min(85.05, lat)) * Math.PI) / 180)
  return {
    x: (lng + 180) / 360,
    y: 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI),
  }
}
export function RideMap({ pickup, dropoff }: { pickup: RidePlace; dropoff: RidePlace }) {
  const t = useShipText()
  const tiles =
    import.meta.env.VITE_MAP_TILE_URL ||
    (import.meta.env.DEV ? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' : '')
  if (![pickup.lat, pickup.lng, dropoff.lat, dropoff.lng].every(Number.isFinite))
    return <p role="status">{t('Map locations unavailable')}</p>
  const a = project(pickup.lat, pickup.lng),
    b = project(dropoff.lat, dropoff.lng)
  const span = Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), 0.0001)
  const zoom = Math.max(2, Math.min(16, Math.floor(Math.log2(512 / (span * 256)))))
  const scale = 256 * 2 ** zoom,
    leftPixel = ((a.x + b.x) / 2) * scale - 384,
    topPixel = ((a.y + b.y) / 2) * scale - 384,
    left = Math.floor(leftPixel / 256),
    top = Math.floor(topPixel / 256)
  const point = (value: { x: number; y: number }) => ({
    x: value.x * scale - leftPixel,
    y: value.y * scale - topPixel,
  })
  const start = point(a),
    end = point(b)
  return (
    <figure className="overflow-hidden rounded-xl border bg-slate-100">
      <svg
        viewBox="0 0 768 768"
        className="max-h-[420px] w-full"
        role="img"
        aria-label={t('Pickup and dropoff map')}
      >
        {tiles &&
          Array.from({ length: 16 }, (_, index) => {
            const x = left + (index % 4),
              y = top + Math.floor(index / 4)
            return (
              <image
                key={index}
                x={(index % 4) * 256 + left * 256 - leftPixel}
                y={Math.floor(index / 4) * 256 + top * 256 - topPixel}
                width="256"
                height="256"
                href={tiles
                  .replace('{z}', String(zoom))
                  .replace('{x}', String(x))
                  .replace('{y}', String(y))}
              />
            )
          })}
        {[
          { ...start, color: '#168447', label: 'Pickup' },
          { ...end, color: '#195b9c', label: 'Dropoff' },
        ].map((place) => (
          <g key={place.label}>
            <circle
              cx={place.x}
              cy={place.y}
              r="12"
              fill={place.color}
              stroke="white"
              strokeWidth="3"
            />
            <text x={place.x + 15} y={place.y} fontSize="20">
              {t(place.label)}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="space-y-1 p-3 text-xs">
        {tiles ? (
          <p>{import.meta.env.VITE_MAP_ATTRIBUTION || '© OpenStreetMap contributors'}</p>
        ) : (
          <p role="status">
            {t(
              'Map background unavailable; pickup and dropoff locations remain visible.'
            )}
          </p>
        )}
        <p>
          {t('Pickup')}: {pickup.lat.toFixed(5)}, {pickup.lng.toFixed(5)} · {t('Dropoff')}
          : {dropoff.lat.toFixed(5)}, {dropoff.lng.toFixed(5)}
        </p>
      </figcaption>
    </figure>
  )
}
