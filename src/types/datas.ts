export const upperMethods = [
  'GET',
  'POST',
  'PUT',
  'OPTIONS',
  'DELETE',
] as const
export const methods = [
  'get',
  'post',
  'put',
  'options',
  'delete'
] as const
export type Method = typeof methods[number]
