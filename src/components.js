import { k } from './init.js'
import { thresh } from './util.js'

/**
 * @returns {import("kaboom").Comp}
 */
export function deltaPos () {
  const pos = k.vec2()

  return {
    id: 'deltaPos',
    require: ['pos'],
    add () {
      this.deltaPos = k.vec2()
      Object.assign(pos, this.pos)
    },
    update () {
      this.deltaPos = this.pos.sub(pos)
      Object.assign(pos, this.pos)
    }
  }
}

/**
 * @param {number} threshold
 * @returns {import('kaboom').Comp}
 */
export function velocity (threshold) {
  const dest = k.vec2()

  return {
    id: 'accelerate',
    require: ['pos'],
    velocity (value) {
      if (value === undefined) {
        return thresh(dest.sub(this.pos).x, threshold)
      }

      Object.assign(dest, this.pos.add(value, 0))
    },
    add () {
      Object.assign(dest, this.pos)
    },
    update () {
      this.move(this.velocity(), 0)
    }
  }
}

/**
 * @returns {import('kaboom').Comp}
 */
export function cleanLeft () {
  return {
    id: 'cleanLeft',
    require: ['pos'],
    update () {
      if (k.toScreen(this.pos).x + this.width > 0) {
        return
      }

      this.destroy()
      this.trigger('leave')
    }
  }
}
