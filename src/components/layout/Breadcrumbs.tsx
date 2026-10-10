import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { getBreadcrumbsForPath } from '@/config/navigation'

export const Breadcrumbs: React.FC = () => {
  const location = useLocation()
  const segments = getBreadcrumbsForPath(location.pathname)

  return (
    <nav aria-label="Breadcrumbs" className="flex items-center space-x-1.5 text-xs">
      <span className="font-medium text-muted-foreground/70">Rida</span>
      <ChevronRight className="h-3 w-3 text-muted-foreground/40" aria-hidden="true" />

      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1

        if (isLast) {
          return (
            <span
              key={segment.label}
              aria-current="page"
              className="font-semibold tracking-tight text-foreground"
            >
              {segment.label}
            </span>
          )
        }

        return (
          <React.Fragment key={segment.label}>
            {segment.path ? (
              <Link
                to={segment.path}
                className="font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {segment.label}
              </Link>
            ) : (
              <span className="font-medium text-muted-foreground">{segment.label}</span>
            )}
            <ChevronRight
              className="h-3 w-3 text-muted-foreground/40"
              aria-hidden="true"
            />
          </React.Fragment>
        )
      })}
    </nav>
  )
}
