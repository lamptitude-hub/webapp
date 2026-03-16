import { createFormData } from '@/utils'
import type { Disk } from '@/types/schema'
import type { FormCreateDocs } from '@/types/form'

import axios from '../axios'
import { tryCatch } from '../catch'

export class DocsService {
  static async findAll() {
    try {
      const response = await axios.get<IPaginate<Disk>>(`/v2/users/docs`, { params: { page: 1, limit: 100 } })
      if (response.data) {
        return response.data
      }
    } catch (error) {
      tryCatch('`DocsService.findAll`', error)
    }
  }

  static async findOne(id: number) {
    try {
      const response = await axios.get<Disk>(`/v2/users/docs/${id}`)
      if (response.data) {
        return response.data
      }
    } catch (error) {
      tryCatch('`DocsService.findOne`', error)
    }
  }

  static async create(data: FormCreateDocs) {
    try {
      const [formData, headers] = createFormData(data)
      const response = await axios.post<IResponse<Disk>>(`/v2/users/docs`, formData, { headers })
      if (response.data) {
        return response.data
      }
    } catch (error) {
      tryCatch('`DocsService.findOne`', error)
    }
  }

  static async delete(id: number) {
    try {
      const response = await axios.delete<IResponse>(`/v2/users/docs/${id}`)
      if (response.data) {
        return response.data
      }
    } catch (error) {
      tryCatch('`DocsService.findOne`', error)
    }
  }
}
