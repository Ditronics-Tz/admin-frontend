import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { customerService } from '../services/customer.service'
import { UserRoleAction } from '../components/UserRoleAction'
import { AccountSupportPanel } from '../components/AccountSupportPanel'
import { UserSecurityPanel } from '../components/UserSecurityPanel'
import { PassengerPromos } from '@/features/promotions/components/PassengerPromos'
import { UserFraud } from '@/features/operations/FraudPage'
import { UserReports } from '@/features/operations/ReportsPage'
import { RatingsPanel } from '@/features/ratings/RatingsPanel'
import { QueryError } from '@/components/feedback/QueryError'
import { MaskedValue } from '@/components/common/MaskedValue'
import { StatusBadge } from '@/components/common/ReasonDialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useShipText } from '@/components/common/ship-text'
import { ROUTES } from '@/lib/constants'
import { formatDateTime } from '@/lib/utils/formatters'

export default function UserDetailsPage() {
  const { userId } = useParams<{ userId: string }>()
  const id = userId ?? ''
  const t = useShipText()
  const query = useQuery({
    queryKey: ['user', id],
    queryFn: () => customerService.getCustomer(id),
    enabled: Boolean(id),
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <Link
        to={ROUTES.PASSENGERS}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('Back to users')}
      </Link>

      {!id ? (
        <p className="rounded-xl border bg-white p-6">User ID is missing.</p>
      ) : query.isPending ? (
        <p className="rounded-xl border bg-white p-6" role="status">
          Loading profile…
        </p>
      ) : query.isError ? (
        <QueryError error={query.error} retry={() => void query.refetch()} />
      ) : (
        <UserDetailsContent
          id={id}
          detail={query.data}
          onRoleChanged={() => void query.refetch()}
        />
      )}
    </div>
  )
}

function UserDetailsContent({
  id,
  detail,
  onRoleChanged,
}: {
  id: string
  detail: Awaited<ReturnType<typeof customerService.getCustomer>>
  onRoleChanged: () => void
}) {
  const t = useShipText()
  const { user, passenger_profile: passengerProfile } = detail
  const name = user.name?.trim() || passengerProfile?.full_name?.trim() || ''
  const phone = user.phone || passengerProfile?.phone || ''
  const status = user.status || (user.is_active ? 'active' : 'suspended')

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="min-w-0 space-y-1">
          <h1 className="break-words text-2xl font-bold tracking-tight text-[#172B36] sm:text-3xl">
            {name || t('Name not added')}
          </h1>
          <p className="break-all text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={status} />
          <UserRoleAction
            id={id}
            name={name || user.email}
            role={user.role}
            onChanged={onRoleChanged}
          />
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-[#172B36]">
            {t('Profile information')}
          </h2>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-muted-foreground">{t('Name')}</dt>
              <dd className="mt-1 break-words font-medium">
                {name || t('Not added to profile')}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-muted-foreground">{t('Email')}</dt>
              <dd className="mt-1 break-all font-medium">{user.email}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-muted-foreground">{t('Phone')}</dt>
              <dd className="mt-1 font-medium">
                <MaskedValue key={id} value={phone} userId={id} />
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-muted-foreground">{t('Phone verification')}</dt>
              <dd className="mt-1 font-medium">
                {!phone
                  ? t('No phone on account')
                  : user.phone_verified_at
                    ? 'OTP verified'
                    : t('Pending verification')}
              </dd>
            </div>
          </dl>
          {!phone && (
            <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-muted-foreground">
              {t(
                'Phone is optional at signup. It appears after the user adds it in Profile.'
              )}
            </p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-[#172B36]">
            {t('Account information')}
          </h2>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">{t('Role')}</dt>
              <dd className="mt-1 font-medium capitalize">{user.role}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('Status')}</dt>
              <dd className="mt-1 font-medium capitalize">{status}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('Registered (EAT)')}</dt>
              <dd className="mt-1 font-medium">
                {user.created_at ? formatDateTime(user.created_at) : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('User ID')}</dt>
              <dd className="mt-1 break-all font-mono text-xs">{user.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('Ratings')}</dt>
              <dd className="mt-1 font-medium">
                {detail.total_ratings > 0
                  ? `${detail.average_rating.toFixed(2)} / 5 (${detail.total_ratings})`
                  : 'No ratings yet'}
              </dd>
            </div>
          </dl>
          {user.role === 'driver' && (
            <Link
              className="mt-5 inline-block text-sm font-medium text-primary underline underline-offset-2"
              to={ROUTES.DRIVER_DETAILS.replace(':driverId', encodeURIComponent(id))}
            >
              View driver profile
            </Link>
          )}
        </section>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <div className="overflow-x-auto pb-1">
          <TabsList className="w-max min-w-full justify-start">
            <TabsTrigger value="account">{t('Account and support')}</TabsTrigger>
            <TabsTrigger value="security">{t('Security and sessions')}</TabsTrigger>
            <TabsTrigger value="ratings">{t('Ratings')}</TabsTrigger>
            <TabsTrigger value="reports">{t('Reports and fraud')}</TabsTrigger>
            {user.role === 'passenger' && (
              <TabsTrigger value="promos">Promotions</TabsTrigger>
            )}
          </TabsList>
        </div>
        <TabsContent value="account">
          <AccountSupportPanel id={id} />
        </TabsContent>
        <TabsContent value="security">
          <UserSecurityPanel id={id} />
        </TabsContent>
        <TabsContent value="ratings">
          <RatingsPanel userId={id} />
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <UserReports id={id} />
          <UserFraud id={id} />
        </TabsContent>
        {user.role === 'passenger' && (
          <TabsContent value="promos">
            <PassengerPromos id={id} />
          </TabsContent>
        )}
      </Tabs>
    </>
  )
}
