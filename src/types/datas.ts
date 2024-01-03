export const methods = [
  'GET',
  'POST',
  'PUT',
  'OPTIONS',
  'DELETE',
] as const
export type Method = typeof methods[number]
