export class Arrs {
  /**
   * Create array by length.
   *
   * @param {array} payload
   * @param {number} length
   * @param {boolean} shuffle default: true
   */
  static from<P = any>(payload: P[], length: number, shuffle: boolean = true): P[] {
    let result: P[] = []
    let index = 0

    for (let i = 0; i < length; i++) {
      result = [...result, payload[index]]
      index += 1

      if (index >= payload.length) index = 0
    }

    if (shuffle) {
      return this.shuffle(result)
    }

    return result
  }

  /**
   * Shuffle randomly array.
   *
   * @param {array} payload
   */
  static shuffle<P = any>(payload: P[]): P[] {
    return payload.sort(() => 0.5 - Math.random())
  }

  static random<P = any>(payload: P[]): P {
    return payload[Math.floor(Math.random() * payload.length)]
  }

  static findOne<P = any>(payload: P[], prop: keyof P, value: any) {
    return payload.find((record) => record[prop] === value)
  }

  static findAll<P = any>(payload: P[], prop: keyof P, value: any) {
    return payload.filter((record) => record[prop] === value)
  }

  static remove<P = any>(payload: P[], prop: keyof P, value: any) {
    return payload.filter((record) => record[prop] !== value)
  }

  static removeDuplicates<T = any>(payload: T[]): T[] {
    return payload.filter((record, index) => payload.indexOf(record) === index)
  }

  static groupBy<P = any>(payload: P[], prop: keyof P) {
    return payload.reduce((previousValue: any, currentValue) => {
      previousValue[currentValue[prop]] = [...(previousValue[currentValue[prop]] || []), currentValue]

      return previousValue
    }, {})
  }

  static orderBy<P = any>(payload: P[], prop: keyof P, type: 'asc' | 'desc' = 'asc') {
    return payload.sort((a, b) => {
      let propA: any = a[prop]
      propA = typeof propA === 'string' ? propA.toUpperCase() : propA

      let propB: any = b[prop]
      propB = typeof propB === 'string' ? propB.toUpperCase() : propB

      return type === 'desc'
        ? propB < propA
          ? -1
          : propB > propA
            ? 1
            : propB >= propA
              ? 0
              : NaN
        : propA < propB
          ? -1
          : propA > propB
            ? 1
            : propA >= propB
              ? 0
              : NaN
    })
  }
}
