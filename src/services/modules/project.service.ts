import { createFormData } from '@/utils'
import type { Disk } from '@/types/schema'
import type { FormCreateProject } from '@/types/form'

import axios from '../axios'
import { tryCatch } from '../catch'

export class ProjectService {
  static async findAll() {
    try {
      const response = await axios.get<IPaginate<Disk>>(`/v2/users/projects`, { params: { page: 1, limit: 100 } })
      if (response.data) {
        return response.data
      }
    } catch (error) {
      tryCatch('`ProjectService.findAll`', error)
    }
  }

  static async findOne(id: number) {
    try {
      const response = await axios.get<Disk>(`/v2/users/projects/${id}`)
      if (response.data) {
        return response.data
      }
    } catch (error) {
      tryCatch('`ProjectService.findOne`', error)
    }
  }

  static async create(data: FormCreateProject) {
    try {
      const response = await axios.post<IResponse<Disk>>(`/v2/users/projects`, data)
      if (response.data) {
        return response.data
      }
    } catch (error) {
      tryCatch('`ProjectService.findOne`', error)
    }
  }

  static async delete(id: number) {
    try {
      const response = await axios.delete<IResponse>(`/v2/users/projects/${id}`)
      if (response.data) {
        return response.data
      }
    } catch (error) {
      tryCatch('`ProjectService.findOne`', error)
    }
  }
}
