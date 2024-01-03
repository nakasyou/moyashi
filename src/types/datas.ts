export const methods = ['GET', 'POST', 'PUT'] as const
export type Method = typeof methods[number]
