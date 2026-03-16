import Cookies, { CookieSetOptions } from 'universal-cookie'

/**
 * Cookies Manager.
 */
export class cookie {
  static get(name: string, json?: 0 | 1) {
    const results = new Cookies().get(name)
    return json && results ? JSON.parse(results) : results
  }

  static set(name: string, value: string | object, options?: CookieSetOptions) {
    if (typeof value !== 'string') {
      value = JSON.stringify(value)
    }

    return new Cookies().set(name, value, this.options(options))
  }

  static remove(name: string, options?: CookieSetOptions) {
    return new Cookies().remove(name, this.options(options))
  }

  static options(options?: CookieSetOptions): CookieSetOptions {
    return {
      domain: location.hostname,
      sameSite: 'strict',
      secure: true,
      ...options
    }
  }
}

/**
 * Local Storege Manager.
 */
export class storage {
  static get(name: string, json?: 0 | 1) {
    const results = localStorage.getItem(name)
    return json && results ? JSON.parse(results) : results
  }

  static set(name: string, value: string | object) {
    if (typeof value !== 'string') {
      value = JSON.stringify(value)
    }

    localStorage.setItem(name, value)
  }

  static remove(name: string) {
    localStorage.removeItem(name)
  }
}

/**
 * Session Storege Manager.
 */
export class session {
  static get(name: string, json?: 0 | 1) {
    const results = sessionStorage.getItem(name)
    return json && results ? JSON.parse(results) : results
  }

  static set(name: string, value: string | object) {
    if (typeof value !== 'string') {
      value = JSON.stringify(value)
    }

    sessionStorage.setItem(name, value)
  }

  static remove(name: string) {
    sessionStorage.removeItem(name)
  }
}
