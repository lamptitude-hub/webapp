import type { Canopy } from '@/types/schema'

import axios from '../axios'
import { tryCatch } from '../catch'

export class CanopyService {
  static async findAll() {
    try {
      const response = await axios.get<Canopy[]>(`/v2/canopies`, { params: { page: 1, limit: 100 } })
      if (response.data) {
        return response.data
      }
    } catch (error) {
      tryCatch('`CanopyService.findAll`', error)
    }
  }

  static async findOne(id: number) {
    try {
      const response = await axios.get<Canopy>(`/v2/canopies/${id}`)
      if (response.data) {
        return response.data
      }
    } catch (error) {
      tryCatch('`CanopyService.findOne`', error)
    }
  }
}
