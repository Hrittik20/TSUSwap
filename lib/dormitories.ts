// TSU Dormitories list
export const DORMITORIES = [
  { value: 'mayak', label: 'Mayak (Маяк)', labelRu: 'Маяк' },
  { value: 'parus', label: 'Parus (Парус)', labelRu: 'Парус' },
] as const

export function getDormitoryLabel(value: string, language: 'en' | 'ru' = 'en'): string {
  const dorm = DORMITORIES.find(d => d.value === value)
  return dorm ? (language === 'ru' ? dorm.labelRu : dorm.label) : value
}




