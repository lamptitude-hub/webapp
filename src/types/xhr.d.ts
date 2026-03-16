interface IResponse<D = any> {
  statusCode: number
  message: string
  data?: D
}

interface IPaginate<T = any> {
  data: T[]
  total: number
  currentPage: number
  nextPage: number | null
  prevPage: number | null
  lastPage: number
  totalPage: number
}

interface XHRLogin {
  accessToken: string
  refreshKey: string
  expiredAt: Date | string
}
