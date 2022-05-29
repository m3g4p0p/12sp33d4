import { k } from './init.js'
import { thresh } from './tilemath.js'

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
      if (k.toScreen(this.pos).x + this.width < 0) {
        this.destroy()
      }
    }
  }
}

/**
 * @param {number} time
 * @returns {import('kaboom').Comp}
 */
export function fade (time = 1, upScale = 1) {
  const start = k.time()

  return {
    id: 'fade',
    require: ['opacity', 'scale'],
    add () {
      this.unuse('solid')
      this.trigger('fade')
    },
    update () {
      const faded = (k.time() - start) / time

      this.opacity = 1 - faded
      this.scale = 1 + faded * upScale

      if (faded > 1) {
        this.destroy()
      }
    }
  }
}

export function dynamicJump (maxTime) {
  let jumpStart = null
  let _jumpForce

  return {
    id: 'dynamicJump',
    require: ['body'],
    update () {
      if (!jumpStart) {
        return
      }

      if (jumpStart + maxTime > k.time()) {
        return this.jump(_jumpForce)
      }

      jumpStart = null
    },
    startJump (jumpForce) {
      jumpStart = k.time()
      _jumpForce = jumpForce
    },
    stopJump () {
      jumpStart = null
    }
  }
}

export function bounce (jumpForce) {
  let pos

  return {
    id: 'bounce',
    require: ['body', 'pos'],
    add () {
      pos = this.pos.clone()
    },
    update () {
      const deltaY = this.pos.y - pos.y

      if (deltaY >= 0) {
        this.jump(jumpForce + deltaY)
      }
    }
  }
}

export function flicker (amount) {
  let currentValue = 0
  let targetValue = 0

  return {
    id: 'flicker',
    require: ['opacity', 'scale', 'pos'],
    update () {
      if (targetValue === currentValue) {
        targetValue = k.rand(-1, 1) * amount
      }

      const remaining = targetValue - currentValue

      currentValue += Math.min(
        k.dt() * 2,
        Math.abs(remaining)
      ) * Math.sign(remaining)

      this.opacity = amount + currentValue
      this.scale = 1 - currentValue
      this.pos = this.pos.sub(currentValue / 2)
    }
  }
}

export function lagBehind (target, maxDist = target.width) {
  return {
    id: 'lagBehind',
    require: ['pos'],
    update () {
      const dist = this.pos.dist(target.pos)
      const lag = target.pos.sub(this.pos)

      this.pos = this.pos.add(
        maxDist > dist
          ? lag.scale(k.dt() * maxDist)
          : lag.unit().scale(dist - maxDist)
      )
    }
  }
}

export function spinning () {
  let _speed = null

  return {
    id: 'spinning',
    require: ['rotate'],
    spin (speed) {
      if (_speed === null) {
        _speed = speed
      }
    },
    update () {
      if (_speed === null) {
        return
      }

      const nextAngle = this.angle + k.dt() * _speed

      if (nextAngle < 360) {
        this.angle = nextAngle
      } else {
        this.angle = 0
        _speed = null
      }
    }
  }
}

export function followSpin (target, offset) {
  return {
    id: 'followSpin',
    require: ['rotate'],
    add () {
      this.use(k.follow(target, offset))
    },
    update () {
      this.angle = target.angle
    }
  }
}

export function dieWith (target, events = ['destroy']) {
  return {
    id: 'dieWith',
    add () {
      events.forEach(event => {
        target.on(event, () => this.destroy())
      })
    }
  }
}

export function glitch (maxOffset) {
  const p1 = k.vec2(-maxOffset)
  const p2 = k.vec2(maxOffset)

  return {
    id: 'glitch',
    require: ['follow'],
    update () {
      this.follow.offset = k.rand(p1, p2)
    }
  }
}