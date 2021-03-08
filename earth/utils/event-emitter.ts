export class EventEmitter {
  private _events: Record<string, Array<(...args: any) => void>>

  constructor() {
    this._events = {}
  }

  addListener(event: string, callback: (...args: any) => void) {
    this._events = this._events || {}
    this._events[event] = this._events[event] || []
    this._events[event].push(callback)
  }

  removeListener(event: string, callback: (...args: any) => void) {
    this._events = this._events || {}
    if (event in this._events === false) return
    this._events[event].splice(this._events[event].indexOf(callback), 1)
    return this
  }

  emit(event: string, ...args: any) {
    this._events = this._events || {}
    if (event in this._events === false) return false
    for (let i = 0; i < this._events[event].length; i++) {
      this._events[event][i].apply(this, args)
    }
    return true
  }
}
