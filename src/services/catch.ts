import { notice } from '@/utils/addon'

export function tryCatch(message: string, error: any) {
  console.error(message, error)

  if (error?.response?.data) {
    let { statusCode, error: title, message: content } = error.response.data

    if (content instanceof Array) {
      content = content.map((r) => `<p>- ${r}</p>`).join('')
    } else {
      content = `<p>- ${content}</p>`
    }

    notice.error(content, { title: `${statusCode}: ${title}`, duration: 60 })
  } else {
    notice.error(error.message, { title: error.code, duration: 60 })
  }
}
