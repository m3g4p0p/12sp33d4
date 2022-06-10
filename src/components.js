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
      const pos = this.is('fixed')
        ? this.pos
        : k.toScreen(this.pos)

      if (pos.x + this.width < 0) {
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

export function colorWave () {
  const timeOffset = k.randi(k.time())

  return {
    id: 'colorWave',
    require: ['color', 'opacity'],
    update () {
      if (this.angle) {
        const t = k.deg2rad(this.angle)

        this.opacity = 1
        this.color.r = k.wave(0, 255, t)
      } else {
        const t = (k.time() + timeOffset) * 5

        this.opacity = k.wave(0.1, 0.5, t)
        this.color.r = k.wave(255, 0, t)
      }
    }
  }
}

export function moveTowards (target, speed, angle) {
  let dest = target.pos.clone()
  let dir = 1

  return {
    id: 'moveTowards',
    require: ['pos', 'rotate'],
    reverse () {
      dir = -dir
    },
    update () {
      dest = dest.lerp(target.pos, k.dt() * dir)
      this.angle = this.pos.angle(dest) + angle
      this.moveTo(dest, speed)
    }
  }
}

export function parallax (factor = 0) {
  const initialPos = k.vec2()
  const scale = k.vec2(1).sub(factor)

  return {
    id: 'parallax',
    require: ['pos'],
    add () {
      Object.assign(initialPos, this.pos)
    },
    update () {
      const camPos = k.camPos()
      const delta = initialPos.sub(camPos)

      this.pos = camPos.add(delta.scale(scale))

      // k.drawLine({
      //   p1: this.pos,
      //   p2: initialPos
      // })
    }
  }
}

k.scene('debug', () => {
  for (let i = 0; i < 20; i++) {
    const obj = k.add([
      k.origin('center'),
      k.rect(10, 10),
      k.pos(k.center().add(i * 100, 0))
    ])

    for (let j = 1; j < 10; j++) {
      k.add([
        k.origin('center'),
        k.rect(10 - j, 10 - j),
        k.pos(obj.pos.clone()),
        k.opacity(1 - 0.1 * j),
        parallax(0.1 * j)
      ])
    }

    for (let j = -1; j > -10; j--) {
      k.add([
        k.origin('center'),
        k.rect(10 - j, 10 - j),
        k.pos(obj.pos.clone()),
        k.opacity(1 - 0.1 * j),
        parallax(0.1 * j)
      ])
    }
  }

  const circle = k.add([
    k.origin('center'),
    k.circle(10),
    k.pos(k.center())
  ])

  k.onUpdate(() => {
    k.camPos(circle.pos)
  })

  k.onMouseDown(pos => {
    circle.move(k.toWorld(pos).sub(k.camPos()))
  })
})
