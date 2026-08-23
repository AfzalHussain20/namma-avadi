import { CASTE_CATEGORIES, PLACES, RELIGIONS } from '@/lib/constants'

export const EXPORT_COLUMNS = [
  'Member ID',
  'Full Name',
  "Father's Name",
  'Mobile',
  'Place',
  'Ward',
  'Address',
  'Date of Birth',
  'Email',
  'Voter ID',
  'Religion',
  'Community',
  'Caste Category',
  'Occupation',
  'Blood Group',
  'Created Date',
]

function placeLabel(value: string): string {
  return PLACES.find((p) => p.value === value)?.en ?? value
}

function religionLabel(value: string): string {
  return RELIGIONS.find((r) => r.value === value)?.en ?? value
}

function casteCategoryLabel(value: string): string {
  return CASTE_CATEGORIES.find((c) => c.value === value)?.en ?? value
}

export function buildMemberExportRow(m: {
  member_id: string
  full_name: string
  father_name: string
  mobile: string
  place: string
  ward_number: number
  address: string
  date_of_birth: string
  email: string | null
  voter_id: string | null
  religion: string
  community: string
  caste_category: string
  occupation: string
  blood_group: string
  created_at: string
}): (string | number)[] {
  return [
    m.member_id,
    m.full_name,
    m.father_name,
    m.mobile,
    placeLabel(m.place),
    m.ward_number,
    m.address,
    m.date_of_birth,
    m.email ?? '',
    m.voter_id ?? '',
    religionLabel(m.religion),
    m.community,
    casteCategoryLabel(m.caste_category),
    m.occupation,
    m.blood_group,
    new Date(m.created_at).toLocaleDateString('en-IN'),
  ]
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function escapeCsv(value: string | number): string {
  const str = String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers.map(escapeCsv).join(',')]
  for (const row of rows) {
    lines.push(row.map(escapeCsv).join(','))
  }
  // BOM so Excel opens UTF-8 correctly.
  return '\uFEFF' + lines.join('\r\n')
}

export function toSpreadsheetXml(title: string, headers: string[], rows: (string | number)[][]): string {
  const headerRow = headers.map((h) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join('')
  const bodyRows = rows
    .map(
      (row) =>
        '<Row>' +
        row
          .map((cell) => {
            if (typeof cell === 'number') {
              return `<Cell><Data ss:Type="Number">${cell}</Data></Cell>`
            }
            return `<Cell><Data ss:Type="String">${escapeXml(String(cell))}</Data></Cell>`
          })
          .join('') +
        '</Row>'
    )
    .join('')

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXml(title)}">
  <Table>
   <Row>${headerRow}</Row>
   ${bodyRows}
  </Table>
 </Worksheet>
</Workbook>`
}
