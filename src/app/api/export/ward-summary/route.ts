import { NextRequest } from 'next/server'
import { getUser } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import { toCsv, toSpreadsheetXml } from '@/lib/export'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const format = request.nextUrl.searchParams.get('format') === 'xls' ? 'xls' : 'csv'

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_dashboard_stats')

  if (error || !data) {
    return new Response('Unable to generate ward summary', { status: 500 })
  }

  const total = data.reduce((s, r) => s + r.member_count, 0)
  const headers = ['Ward', 'Total Members']
  const rows = [
    ...data.map((r) => [r.ward_name, r.member_count]),
    ['Total', total],
  ]

  const date = new Date().toISOString().slice(0, 10)
  const filename = `namma-avadi-ward-summary-${date}`

  if (format === 'xls') {
    const xml = toSpreadsheetXml('Ward Member Summary', headers, rows)
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/vnd.ms-excel',
        'Content-Disposition': `attachment; filename="${filename}.xls"`,
      },
    })
  }

  const csv = toCsv(headers, rows)
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.csv"`,
    },
  })
}
