global.ReqError = class ReqError extends Error {
  static #wrapperArgumentError = new Error(
    'DEV: Wrapper needs at least 1 argument'
  )
  static #wrapperInvalidError = new Error(
    'DEV: Wrapper should only contain Function'
  )

  static wrapper() {
    if (arguments.length === 0) throw this.#wrapperArgumentError
    return arguments.length === 1
      ? this.#wrapper(arguments[0])
      : [...arguments].map(input => this.#wrapper(input))
  }

  static #wrapper(input) {
    if (input instanceof Array) {
      return input.map(fn => this.#wrap(fn))
    }

    if (input instanceof Object) {
      const newObj = {}
      for (let key in input) {
        const fn = input[key]
        newObj[key] = this.#wrap(fn)
      }
      return newObj
    }

    return this.#wrap(fn)
  }

  static #wrap(fn) {
    if (!(fn instanceof Function)) throw this.#wrapperInvalidError
    return this.catch(fn)
  }

  static catch = fn => (req, res, next) => {
    try {
      const returnValue = fn(req, res, next)
      if (returnValue instanceof Promise) returnValue.catch(next)
    } catch (err) {
      next(err)
    }
  }

  name = 'RequestError'
  isOperational = true
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}
