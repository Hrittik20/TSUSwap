// TSU Dormitories list
export const DORMITORIES = [
  { value: 'mayak', label: 'Mayak (Маяк)', labelRu: 'Маяк' },
  { value: 'parus', label: 'Parus (Парус)', labelRu: 'Парус' },
  { value: 'kvartal', label: 'Kvartal (Квартал)', labelRu: 'Квартал' },
  { value: 'sportivny', label: 'Sportivny (Спортивный)', labelRu: 'Спортивный' },
  { value: 'uyutny', label: 'Uyutny (Уютный)', labelRu: 'Уютный' },
  { value: 'other', label: 'Other / Другое', labelRu: 'Другое' },
] as const

export function getDormitoryLabel(value: string, language: 'en' | 'ru' = 'en'): string {
  const dorm = DORMITORIES.find(d => d.value === value)
  return dorm ? (language === 'ru' ? dorm.labelRu : dorm.label) : value
}




