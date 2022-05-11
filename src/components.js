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
    id: 'velocity',
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

export function accelerate () {
  return {
    id: 'accelerate',
    require: ['velocity'],
    speed: 1,
    accelerate (value) {
      this.velocity(value * Math.log(this.speed + 1))
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

/**
 * @param {number} time
 * @returns {import('kaboom').Comp}
 */
export function fade (time) {
  const start = k.time()

  return {
    id: 'fade',
    require: ['opacity', 'scale'],
    update () {
      const faded = (k.time() - start) / time

      this.opacity = 1 - faded
      this.scale = 1 + faded

      if (faded > 1) {
        this.destroy()
      }
    }
  }
}
