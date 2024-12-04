export const category = {
  ios17Clock: 'ios17Clock',
  star: 'star',
  solar: 'solar',
  calendar: 'calendar',
} as const

export type CategoryValue = keyof typeof category
