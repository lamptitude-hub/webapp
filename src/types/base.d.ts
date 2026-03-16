interface BaseRecord {
  label: string
  value: string
}

interface BaseDate {
  createdAt?: Date | string
  updatedAt?: Date | string
}

interface BaseQuery {
  page?: number
  limit?: number
}
