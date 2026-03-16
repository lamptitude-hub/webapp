import type { Banner } from '@/types/schema'

import axios from '../axios'
import { tryCatch } from '../catch'

export class BannerService {
  static async findAll() {
    try {
      const response = await axios.get<Banner[]>(`/v2/banners`)
      if (response.data) {
        return response.data
      }
    } catch (error) {
      tryCatch('`BannerService.findAll`', error)
    }
  }
}
