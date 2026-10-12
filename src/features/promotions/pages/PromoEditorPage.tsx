import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { QueryError } from '@/components/feedback/QueryError'
import { formatApiError } from '@/lib/api/errors'
import { promoService } from '../promo.service'
import { usePromoText } from '../i18n'
import { usePromoWriteAccess } from '../access'
import {
  dateInputISO,
  discountLabel,
  generatePromoCode,
  localDateInput,
  lockedPromoPatch,
  money,
  parseAudienceText,
  validatePromo,
} from '../utils'
import type { AudienceResult, Passenger, Promo, PromoInput } from '../types'
import { AudiencePicker, AudienceReport } from '../components/AudiencePicker'
import { AudiencePanel } from '../components/AudiencePanel'
import {
  PromoHeading,
  PromoSkeleton,
  ReadOnlyNotice,
  UnsavedChanges,
} from '../components/shared'
import '../promotions.css'

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string
  id: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
function PromoEditor({ original }: { original?: Promo }) {
  const t = usePromoText(),
    write = usePromoWriteAccess(),
    cache = useQueryClient(),
    navigate = useNavigate()
  const [created, setCreated] = useState<Promo | undefined>(),
    [completed, setCompleted] = useState(false)
  const [picker, setPicker] = useState(false),
    [selected, setSelected] = useState<Passenger[]>([]),
    [paste, setPaste] = useState(''),
    [audienceReport, setAudienceReport] = useState<AudienceResult | null>(null)
  const [defaults] = useState<PromoInput>(() =>
    original
      ? {
          ...original,
          starts_at: localDateInput(original.starts_at),
          expires_at: localDateInput(original.expires_at),
        }
      : {
          code: '',
          title: '',
          description: '',
          discount_type: 'percent',
          discount_value: 20,
          max_discount: null,
          min_fare: 0,
          audience: 'all',
          first_ride_only: false,
          starts_at: localDateInput(new Date().toISOString()),
          expires_at: localDateInput(new Date(Date.now() + 30 * 86400000).toISOString()),
          max_redemptions: null,
          max_per_user: 1,
          status: 'draft',
        }
  )
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<PromoInput>({ defaultValues: defaults })
  const values = useWatch({ control })
  const locked = (original?.redeemed_count || 0) > 0
  const lockMessage = t(
    'Code, discount fields and audience type are locked because this promo has already been used.'
  )
  const save = useMutation({
    mutationFn: async ({ input, activate }: { input: PromoInput; activate: boolean }) => {
      if (!write) throw new Error(t('Read-only access'))
      const payload = {
        ...input,
        code: input.code.trim().toUpperCase(),
        title: input.title.trim(),
      }
      let promo = original || created
      if (promo) {
        promo = await promoService.update(promo.id, lockedPromoPatch(payload, promo))
      } else {
        promo = await promoService.create({
          ...payload,
          status: 'draft',
          audience_user_ids:
            input.audience === 'selected' ? selected.map((u) => u.id) : undefined,
        })
        setCreated(promo)
      }
      let report: AudienceResult | undefined
      const identifiers = parseAudienceText(paste)
      if (
        input.audience === 'selected' &&
        (selected.length || identifiers.phones.length || identifiers.emails.length)
      ) {
        report = await promoService.addAudience(promo.id, {
          ...identifiers,
          user_ids: selected.map((u) => u.id),
        })
        setAudienceReport(report)
      }
      if (activate && promo.status !== 'active')
        promo = await promoService.action(promo.id, 'resume')
      return { promo, report }
    },
    onSuccess: async ({ report }) => {
      setCompleted(true)
      await cache.invalidateQueries({ queryKey: ['promotions'] })
      toast.success(t('Promo saved'))
      if (report && (report.not_found.length || report.not_passengers.length))
        toast.warning(t('Some recipients were not added. Review the audience report.'))
    },
    onError: (error) => {
      const detail = formatApiError(error)
      for (const [field, messages] of Object.entries(detail.validationErrors || {}))
        setError(field as keyof PromoInput, { type: 'server', message: messages[0] })
      if (detail.status === 409)
        setError(
          'code',
          {
            type: 'server',
            message: t('This code already exists. Choose another code.'),
          },
          { shouldFocus: true }
        )
    },
  })
  useEffect(() => {
    if (save.isSuccess && completed)
      navigate(`/promotions/${save.data.promo.id}`, {
        state: { audienceReport: save.data.report },
      })
  }, [save.isSuccess, save.data, completed, navigate])
  const submit = (activate: boolean) =>
    handleSubmit((raw) => {
      clearErrors()
      const input = { ...raw, starts_at: '', expires_at: '' }
      try {
        input.starts_at =
          original && raw.starts_at === defaults.starts_at
            ? original.starts_at
            : dateInputISO(raw.starts_at)
      } catch {
        /* validation reports missing date */
      }
      try {
        input.expires_at =
          original && raw.expires_at === defaults.expires_at
            ? original.expires_at
            : dateInputISO(raw.expires_at)
      } catch {
        /* validation reports missing date */
      }
      const fields = validatePromo(input)
      if (
        input.max_redemptions !== null &&
        input.max_redemptions < (original?.redeemed_count || 0)
      )
        fields.max_redemptions = t('Total limit cannot be below current usage.')
      for (const [field, message] of Object.entries(fields))
        setError(
          field as keyof PromoInput,
          { type: 'validate', message: t(message) },
          { shouldFocus: true }
        )
      if (Object.keys(fields).length === 0 && write) save.mutate({ input, activate })
    })
  const disabled = save.isPending || !write
  const inputProps = (key: keyof PromoInput) => ({
    id: `promo-${key}`,
    'aria-invalid': !!errors[key],
    'aria-describedby': errors[key] ? `promo-${key}-error` : undefined,
  })
  const numeric = (
    key:
      'discount_value' | 'max_discount' | 'min_fare' | 'max_redemptions' | 'max_per_user',
    label: string,
    nullable = false,
    fieldLocked = false
  ) => (
    <Field label={t(label)} id={`promo-${key}`} error={errors[key]?.message}>
      <Input
        {...inputProps(key)}
        type="number"
        step="1"
        min={key === 'min_fare' ? 0 : 1}
        max={
          key === 'discount_value' && values.discount_type === 'percent'
            ? 100
            : Number.MAX_SAFE_INTEGER
        }
        disabled={disabled || fieldLocked}
        {...register(key, {
          setValueAs: (value: string) =>
            value === '' ? (nullable ? null : NaN) : Number(value),
        })}
      />
      {nullable && (
        <p className="text-xs text-muted-foreground">{t('Leave blank for no limit.')}</p>
      )}
    </Field>
  )
  const pendingIdentifiers = parseAudienceText(paste)
  const selectedCount =
    selected.length + pendingIdentifiers.phones.length + pendingIdentifiers.emails.length
  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PromoHeading title={t(original ? 'Edit promo' : 'Create promo')} />
      <ReadOnlyNotice />
      <UnsavedChanges dirty={!completed && (isDirty || selectedCount > 0)} />
      {created && save.isError && (
        <p
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm"
        >
          {t(
            'The promo was saved as a draft. Retry saving to finish the remaining steps.'
          )}
        </p>
      )}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <form
            id="promo-editor"
            onSubmit={submit(false)}
            className="space-y-5"
            noValidate
          >
            <section className="space-y-4 rounded-xl border bg-white p-5">
              <h2 className="text-lg font-semibold">{t('Basics')}</h2>
              {locked && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p
                        tabIndex={0}
                        className="rounded-md bg-amber-50 p-3 text-sm text-amber-950"
                      >
                        {lockMessage}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>{lockMessage}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Field label={t('Code')} id="promo-code" error={errors.code?.message}>
                <div className="flex gap-2">
                  <Input
                    {...inputProps('code')}
                    disabled={disabled || locked}
                    maxLength={20}
                    {...register('code')}
                    className="uppercase"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled || locked}
                    onClick={() =>
                      setValue('code', generatePromoCode(), { shouldDirty: true })
                    }
                  >
                    {t('Generate')}
                  </Button>
                </div>
              </Field>
              <Field label={t('Title')} id="promo-title" error={errors.title?.message}>
                <Input
                  {...inputProps('title')}
                  maxLength={200}
                  disabled={disabled}
                  {...register('title')}
                />
              </Field>
              <Field
                label={t('Description')}
                id="promo-description"
                error={errors.description?.message}
              >
                <Textarea
                  {...inputProps('description')}
                  rows={3}
                  maxLength={4000}
                  disabled={disabled}
                  {...register('description')}
                />
              </Field>
            </section>
            <section className="space-y-4 rounded-xl border bg-white p-5">
              <h2 className="text-lg font-semibold">{t('Discount')}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={t('Discount type')}
                  id="promo-discount_type"
                  error={errors.discount_type?.message}
                >
                  <select
                    {...inputProps('discount_type')}
                    className="promo-select"
                    disabled={disabled || locked}
                    {...register('discount_type', {
                      onChange: (e) => {
                        if (e.target.value === 'fixed')
                          setValue('max_discount', null, { shouldDirty: true })
                      },
                    })}
                  >
                    <option value="percent">{t('Percent')}</option>
                    <option value="fixed">{t('Fixed')}</option>
                  </select>
                </Field>
                {numeric(
                  'discount_value',
                  values.discount_type === 'percent'
                    ? 'Discount value (%)'
                    : 'Discount value (TZS)',
                  false,
                  locked
                )}
                {values.discount_type === 'percent' &&
                  numeric('max_discount', 'Maximum discount', true, locked)}
                {numeric('min_fare', 'Minimum fare')}
              </div>
            </section>
            <section className="space-y-4 rounded-xl border bg-white p-5">
              <h2 className="text-lg font-semibold">{t('Limits and validity')}</h2>
              <p className="text-xs text-muted-foreground">
                {t('Dates are shown in Africa/Dar_es_Salaam (EAT).')}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {(['starts_at', 'expires_at'] as const).map((key) => (
                  <Field
                    key={key}
                    label={t(key === 'starts_at' ? 'Starts' : 'Expires')}
                    id={`promo-${key}`}
                    error={errors[key]?.message}
                  >
                    <Input
                      {...inputProps(key)}
                      type="datetime-local"
                      disabled={disabled}
                      {...register(key)}
                    />
                  </Field>
                ))}
                {numeric('max_redemptions', 'Total redemption limit', true)}
                {numeric('max_per_user', 'Per-passenger limit')}
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  disabled={disabled}
                  {...register('first_ride_only')}
                />
                {t('First completed ride only')}
              </label>
            </section>
            <section className="space-y-4 rounded-xl border bg-white p-5">
              <fieldset disabled={disabled || locked}>
                <legend className="mb-3 text-lg font-semibold">{t('Audience')}</legend>
                <div className="flex flex-wrap gap-4">
                  {(['all', 'selected'] as const).map((value) => (
                    <label key={value} className="flex items-center gap-2 text-sm">
                      <input type="radio" value={value} {...register('audience')} />
                      {t(value === 'all' ? 'All passengers' : 'Selected passengers')}
                    </label>
                  ))}
                </div>
              </fieldset>
              {errors.audience && <p role="alert">{errors.audience.message}</p>}
              {values.audience === 'selected' && (
                <>
                  <p className="text-sm">
                    {t('Selected ({count})', { count: selectedCount })}
                    {original?.audience === 'selected' &&
                      ' ' + t('additional recipients')}
                  </p>
                  {write && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={disabled}
                      onClick={() => setPicker(true)}
                    >
                      {t('Choose passengers')}
                    </Button>
                  )}
                  <ul className="space-y-2 text-sm">
                    {selected.map((u) => (
                      <li key={u.id} className="flex items-center justify-between gap-2">
                        <span>
                          {u.name} — {u.phone || u.email}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={disabled}
                          onClick={() =>
                            setSelected(selected.filter((p) => p.id !== u.id))
                          }
                        >
                          {t('Remove')}
                        </Button>
                      </li>
                    ))}
                    {[...pendingIdentifiers.phones, ...pendingIdentifiers.emails].map(
                      (value) => (
                        <li
                          key={value}
                          className="flex items-center justify-between gap-2"
                        >
                          <span>{value}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={disabled}
                            onClick={() =>
                              setPaste(
                                [
                                  ...pendingIdentifiers.phones,
                                  ...pendingIdentifiers.emails,
                                ]
                                  .filter((v) => v !== value)
                                  .join('\n')
                              )
                            }
                          >
                            {t('Remove')}
                          </Button>
                        </li>
                      )
                    )}
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    {t(
                      'Recipients are checked when saved. Existing audience grants are managed separately below.'
                    )}
                  </p>
                </>
              )}
            </section>
          </form>
          {original?.audience === 'selected' && values.audience === 'selected' && (
            <section className="space-y-3 rounded-xl border bg-white p-5">
              <h2 className="font-semibold">{t('Current audience')}</h2>
              <AudiencePanel id={original.id} />
            </section>
          )}
          {audienceReport && <AudienceReport result={audienceReport} />}
          <div className="space-y-3">
            {save.isError && <QueryError error={save.error} />}
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link to="/promotions">{t('Cancel')}</Link>
              </Button>
              {write && (
                <>
                  <Button type="submit" form="promo-editor" disabled={disabled}>
                    {t(
                      save.isPending
                        ? 'Saving…'
                        : original && original.status !== 'draft'
                          ? 'Save changes'
                          : 'Save as draft'
                    )}
                  </Button>
                  {original?.status !== 'archived' && original?.status !== 'active' && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={disabled}
                      onClick={() => void submit(true)()}
                    >
                      {t('Save and activate')}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <aside className="sticky top-6 space-y-4 rounded-xl border border-teal-200 bg-teal-50/50 p-5">
          <h2 className="text-sm font-semibold text-teal-900">
            {t('Passenger preview')}
          </h2>
          <div className="space-y-3 rounded-lg border border-teal-100 bg-white p-5">
            <p className="break-all font-semibold text-brand-primary-teal">
              {values.code || 'RIDA-…'}
            </p>
            <h3 className="text-xl font-semibold">
              {values.title || t('Your next ride, for less')}
            </h3>
            <p className="text-lg">
              {discountLabel(
                {
                  discount_type: values.discount_type || 'percent',
                  discount_value: Number.isFinite(values.discount_value)
                    ? values.discount_value!
                    : 0,
                  max_discount: values.max_discount || null,
                },
                t
              )}
            </p>
            <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
              {values.description}
            </p>
            <p className="text-xs">
              {t('Minimum fare: {amount}', { amount: money(values.min_fare || 0) })}
            </p>
            {values.first_ride_only && (
              <p className="text-xs">{t('First completed ride only')}</p>
            )}
            {values.expires_at && (
              <p className="text-xs">
                {t('Expires')}: {values.expires_at.replace('T', ' ')} EAT
              </p>
            )}
            <p className="text-xs">
              {t('Up to {count} uses per passenger.', {
                count: values.max_per_user || 1,
              })}
            </p>
            <p className="text-xs">
              {t(
                values.audience === 'selected'
                  ? 'Only selected passengers can use this code.'
                  : 'Available to all passengers.'
              )}
            </p>
          </div>
        </aside>
      </div>
      {picker && write && (
        <AudiencePicker
          initial={selected}
          initialText={paste}
          onClose={() => setPicker(false)}
          onApply={(_, users, text) => {
            setSelected(users)
            setPaste(text)
            setPicker(false)
          }}
        />
      )}
    </main>
  )
}
export default function PromoEditorPage() {
  const { id } = useParams()
  const query = useQuery({
    queryKey: ['promotions', 'detail', id],
    queryFn: () => promoService.detail(id!),
    enabled: !!id,
  })
  if (!id) return <PromoEditor />
  if (query.isPending)
    return (
      <main className="p-6">
        <PromoSkeleton />
      </main>
    )
  if (query.isError)
    return (
      <main className="p-6">
        <QueryError error={query.error} retry={() => void query.refetch()} />
      </main>
    )
  return <PromoEditor key={id} original={query.data} />
}
