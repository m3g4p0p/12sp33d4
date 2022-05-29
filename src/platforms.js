import { TILE_SIZE } from './constants.js'
import { k } from './init.js'
import { spawnGem, spawnPlant, spawnShadow, spawnSword, spawnWall } from './spawn.js'
import { range } from './tilemath.js'

export function groundLevel () {
  return Math.max(...k.get('wall').map(wall => wall.pos.y))
}

function tilePos (pos, delta) {
  return pos.add(delta.scale(TILE_SIZE))
}

function boulderChance (count) {
  return k.chance(0.33 - 0.33 / 1.05 ** count)
}

function addSubsoil (pos, tileX) {
  const spriteName = tileX === 1
    ? 'wall-1-2'
    : `bevel-${tileX / 2}-1`

  return spawnWall(tilePos(pos, k.DOWN), spriteName)
}

function addGround (pos, tileX, tileY) {
  const spriteName = `wall-${tileX}-${tileY}`
  const wall = spawnWall(pos, spriteName)

  addSubsoil(pos, tileX)

  if (k.chance(0.33)) {
    spawnPlant(tilePos(pos, k.UP))
  }

  return tilePos(wall.pos, k.RIGHT)
}

function addGem (start, length) {
  const delta = k.vec2(k.randi(length), k.randi(-3))
  const jumpForce = 60 + k.randi(delta.y * 10)

  return spawnGem('gem-large', tilePos(start, delta), jumpForce)
}

function addSword (start, length) {
  const delta = k.vec2(k.randi(length), -1)
  const sword = spawnSword(tilePos(start, delta))
  const shadow = spawnShadow(sword)
  const timeOffset = k.randi(k.time())

  shadow.onUpdate(() => {
    if (shadow.angle) {
      const t = k.deg2rad(shadow.angle)

      shadow.opacity = 1
      shadow.color.r = k.wave(0, 255, t)
      shadow.color.g = k.wave(255, 0, t)
    } else {
      const t = (k.time() + timeOffset) * 5

      shadow.opacity = k.wave(0.1, 0.5, t)
      shadow.color.r = k.wave(255, 0, t)
      shadow.color.g = 255
    }
  })

  return sword
}

function addBoulder (pos, occupied) {
  if (occupied.includes(pos.x)) {
    return null
  }

  const delta = k.vec2(0, k.randi(-2, -5))
  const boulder = spawnWall(tilePos(pos, delta), 'wall-1-1')

  boulder.use('boulder')
  boulder.use(k.scale())
  boulder.use(k.opacity())
  occupied.push(boulder.pos.x + TILE_SIZE)

  return boulder
}

/**
 * @param {import('kaboom').Vec2} start
 * @param {number} length
 * @param {number} count
 * @returns {import('kaboom').Vec2}
 */
function addPlatform (start, length, count) {
  const gem = count > 0 ? addGem(start, length) : null
  const occupied = gem ? [gem.pos.x] : []

  if (count > 0 && count % 5 === 0) {
    addSword(start, length)
  }

  const pos = range(length - 2).reduce(pos => {
    if (boulderChance(count)) {
      addBoulder(pos, occupied)
    }

    return addGround(pos, 1, 0)
  }, addGround(start, 0, 0))

  const delta = k.vec2(k.randi(2, 3), k.randi(-2, 2))
  return tilePos(addGround(pos, 2, 0), delta)
}

export function platformGenerator (pos, maxLength) {
  let lastPos = pos
  let count = 0

  return function next () {
    if (k.toScreen(pos).x > k.width() * 2) {
      return pos === lastPos ? null : (lastPos = pos)
    }

    const length = k.randi(maxLength)
    pos = addPlatform(pos, length, count++)

    return next()
  }
}

