export type Place = 'THIRUNINRAVUR' | 'AVADI' | 'THIRUVERKADU'
export type Religion =
  | 'HINDU'
  | 'MUSLIM'
  | 'CHRISTIAN'
  | 'SIKH'
  | 'BUDDHIST'
  | 'JAIN'
  | 'OTHER'
export type CasteCategory = 'OC' | 'BC' | 'BCM' | 'MBC_DNC' | 'SC' | 'ST'
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-'

export interface LabeledOption<T extends string> {
  value: T
  en: string
  ta: string
}

/** The three operational areas, each with its ward count. */
export const PLACES: (LabeledOption<Place> & { maxWard: number })[] = [
  { value: 'THIRUNINRAVUR', en: 'Thiruninravur', ta: 'திருநின்றவூர்', maxWard: 27 },
  { value: 'AVADI', en: 'Avadi', ta: 'ஆவடி', maxWard: 48 },
  { value: 'THIRUVERKADU', en: 'Thiruverkadu', ta: 'திருவேற்காடு', maxWard: 18 },
]

export const PLACE_VALUES = PLACES.map((p) => p.value) as [Place, ...Place[]]

/** Major religions practised in India. */
export const RELIGIONS: LabeledOption<Religion>[] = [
  { value: 'HINDU', en: 'Hindu', ta: 'இந்து' },
  { value: 'MUSLIM', en: 'Muslim', ta: 'இஸ்லாம்' },
  { value: 'CHRISTIAN', en: 'Christian', ta: 'கிறிஸ்தவம்' },
  { value: 'SIKH', en: 'Sikh', ta: 'சீக்கியம்' },
  { value: 'BUDDHIST', en: 'Buddhist', ta: 'பௌத்தம்' },
  { value: 'JAIN', en: 'Jain', ta: 'சமணம்' },
  { value: 'OTHER', en: 'Other', ta: 'மற்றவை' },
]

export const RELIGION_VALUES = RELIGIONS.map((r) => r.value) as [Religion, ...Religion[]]

/** Tamil Nadu reservation categories (Govt. of TN classification). */
export const CASTE_CATEGORIES: LabeledOption<CasteCategory>[] = [
  { value: 'OC', en: 'General / OC', ta: 'பொது வகுப்பு (OC)' },
  { value: 'BC', en: 'Backward Class (BC)', ta: 'பிற்படுத்தப்பட்ட வகுப்பு (BC)' },
  { value: 'BCM', en: 'Backward Class Muslim (BCM)', ta: 'பிற்படுத்தப்பட்ட முஸ்லிம் (BCM)' },
  { value: 'MBC_DNC', en: 'Most Backward Class / Denotified Community (MBC/DNC)', ta: 'மிகவும் பிற்படுத்தப்பட்ட வகுப்பு / ஒழிக்கப்பட்ட சாதி (MBC/DNC)' },
  { value: 'SC', en: 'Scheduled Caste (SC)', ta: 'சீர்மரபினர் (SC)' },
  { value: 'ST', en: 'Scheduled Tribe (ST)', ta: 'மலைவாழ் பழங்குடியினர் (ST)' },
]

export const CASTE_CATEGORY_VALUES = CASTE_CATEGORIES.map((c) => c.value) as [
  CasteCategory,
  ...CasteCategory[]
]

export const BLOOD_GROUPS: LabeledOption<BloodGroup>[] = [
  { value: 'A+', en: 'A+', ta: 'A+' },
  { value: 'A-', en: 'A-', ta: 'A-' },
  { value: 'B+', en: 'B+', ta: 'B+' },
  { value: 'B-', en: 'B-', ta: 'B-' },
  { value: 'O+', en: 'O+', ta: 'O+' },
  { value: 'O-', en: 'O-', ta: 'O-' },
  { value: 'AB+', en: 'AB+', ta: 'AB+' },
  { value: 'AB-', en: 'AB-', ta: 'AB-' },
]

export const BLOOD_GROUP_VALUES = BLOOD_GROUPS.map((b) => b.value) as [
  BloodGroup,
  ...BloodGroup[]
]

export function placeOption(place: string): (LabeledOption<Place> & { maxWard: number }) | undefined {
  return PLACES.find((p) => p.value === place)
}

export function maxWardForPlace(place: string): number {
  return placeOption(place)?.maxWard ?? 0
}

export function isValidWardForPlace(place: string, ward: number): boolean {
  const max = maxWardForPlace(place)
  return max > 0 && Number.isInteger(ward) && ward >= 1 && ward <= max
}

export function label(
  lang: 'en' | 'ta',
  options: { value: string; en: string; ta: string }[],
  value: string | null | undefined
): string {
  const found = options.find((o) => o.value === value)
  if (!found) return '—'
  return lang === 'ta' ? found.ta : found.en
}
