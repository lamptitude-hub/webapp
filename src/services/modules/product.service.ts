import type { Product } from '@/types/schema'

import axios from '../axios'
import { tryCatch } from '../catch'

export class ProductService {
  static async findAll() {
    try {
      const response = await axios.get<IPaginate<Product>>(`/v2/products`, { params: { page: 1, limit: 100 } })
      if (response.data) {
        return response.data
      }
    } catch (error) {
      tryCatch('`ProductService.findAll`', error)
    }
  }

  static async findOne(id: number) {
    try {
      const response = await axios.get<Product>(`/v2/products/${id}`)
      if (response.data) {
        return response.data
      }
    } catch (error) {
      tryCatch('`ProductService.findOne`', error)
    }
  }
}
