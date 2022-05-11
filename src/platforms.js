import { TILE_SIZE } from './constants.js'
import { k } from './init.js'
import { spawnGem, spawnWall } from './spawn.js'
import { range } from './util.js'

export function groundLevel () {
  return Math.max(...k.get('wall').map(wall => wall.pos.y))
}

function addWall (pos, x, y) {
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
    return addWall(pos, 0, 1)
  }, addWall(start, 0, 0))

  return addWall(pos, 0, 2).add(
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
