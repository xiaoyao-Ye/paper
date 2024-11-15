export const category = {
  ios17Clock: 'ios17Clock',
  star: 'star',
} as const

export type CategoryValue = keyof typeof category
