import { NextRequest } from 'next/server'
import { getUser } from '@/lib/dal'
import { listAllMembers } from '@/lib/members/queries'
import { buildMemberExportRow, EXPORT_COLUMNS, toCsv, toSpreadsheetXml } from '@/lib/export'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const sp = request.nextUrl.searchParams
  const format = sp.get('format') === 'xls' ? 'xls' : 'csv'
  const q = sp.get('q') || ''
  const ward = sp.get('ward') ? parseInt(sp.get('ward')!, 10) : null
  const status = sp.get('status') || null
  const from = sp.get('from') || null
  const to = sp.get('to') || null

  const members = await listAllMembers({ q, ward, status, from, to })
  const rows = members.map(buildMemberExportRow)

  const date = new Date().toISOString().slice(0, 10)
  const filename = `namma-avadi-members-${date}`

  if (format === 'xls') {
    const xml = toSpreadsheetXml('Members', EXPORT_COLUMNS, rows)
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/vnd.ms-excel',
        'Content-Disposition': `attachment; filename="${filename}.xls"`,
      },
    })
  }

  const csv = toCsv(EXPORT_COLUMNS, rows)
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.csv"`,
    },
  })
}
