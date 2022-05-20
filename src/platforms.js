import { TILE_SIZE } from './constants.js'
import { k } from './init.js'
import { spawnGem, spawnPlant, spawnWall } from './spawn.js'
import { range } from './tilemath.js'

export function groundLevel () {
  return Math.max(...k.get('wall').map(wall => wall.pos.y))
}

function addGround (pos, x, y) {
  if (k.chance(0.33)) {
    spawnPlant(pos.add(k.UP.scale(TILE_SIZE)))
  }

  return spawnWall(pos, x, y).pos.add(k.RIGHT.scale(TILE_SIZE))
}

function addGem (start, length) {
  return spawnGem(start.add(k.vec2(
    k.randi(length),
    k.randi(-3)
  ).scale(TILE_SIZE)))
}

/**
 * @param {import('kaboom').Vec2} start
 * @param {number} length
 * @returns {import('kaboom').Vec2}
 */
function addPlatform (start, length) {
  const pos = range(length - 2).reduce(pos => {
    return addGround(pos, 1, 0)
  }, addGround(start, 0, 0))

  return addGround(pos, 2, 0).add(
    k.randi(2, 3) * TILE_SIZE,
    k.randi(-2, 2) * TILE_SIZE
  )
}

export function platformGenerator (pos, maxLength) {
  let isFirst = true

  return function next () {
    if (k.toScreen(pos).x > k.width() * 2) {
      return
    }

    const length = k.randi(maxLength)

    if (!isFirst) {
      addGem(pos, length)
    }

    pos = addPlatform(pos, length)
    isFirst = false
    next()
  }
}
