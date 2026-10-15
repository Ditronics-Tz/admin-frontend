interface RecoveryCodesPanelProps {
  codes: string[]
}

export function RecoveryCodesPanel({ codes }: RecoveryCodesPanelProps) {
  async function copy() {
    await navigator.clipboard.writeText(codes.join('\n'))
  }
  function download() {
    const blob = new Blob([`${codes.join('\n')}\n`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'rida-recovery-codes.txt'
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#64748B]">
        Save these recovery codes somewhere private. Each code works once if you lose your authenticator.
      </p>
      <ul className="grid gap-2 rounded-xl bg-white p-4 font-mono text-sm text-[#172B36]">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <div className="flex gap-3">
        <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={() => void copy()}>
          Copy codes
        </button>
        <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={download}>
          Download
        </button>
      </div>
    </div>
  )
}
