// Universities list - currently only TSU, but expandable in the future
export const UNIVERSITIES = [
  { 
    value: 'tsu', 
    label: 'Tomsk State University (ТГУ)', 
    labelRu: 'Томский государственный университет (ТГУ)',
    shortLabel: 'TSU',
    shortLabelRu: 'ТГУ'
  },
] as const

export type UniversityValue = typeof UNIVERSITIES[number]['value']

export function getUniversityLabel(value: string, language: 'en' | 'ru' = 'en'): string {
  const uni = UNIVERSITIES.find(u => u.value === value)
  return uni ? (language === 'ru' ? uni.labelRu : uni.label) : value
}

export function getUniversityShortLabel(value: string, language: 'en' | 'ru' = 'en'): string {
  const uni = UNIVERSITIES.find(u => u.value === value)
  return uni ? (language === 'ru' ? uni.shortLabelRu : uni.shortLabel) : value
}

