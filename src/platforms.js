import { TILE_SIZE } from './constants.js'
import { k } from './init.js'
import { spawnGem, spawnPlant, spawnWall } from './spawn.js'
import { range } from './tilemath.js'

export function groundLevel () {
  return Math.max(...k.get('wall').map(wall => wall.pos.y))
}

function tilePos (pos, delta) {
  return pos.add(delta.scale(TILE_SIZE))
}

function addGround (pos, x, y) {
  if (k.chance(0.33)) {
    spawnPlant(tilePos(pos, k.UP))
  }

  return tilePos(spawnWall(pos, x, y).pos, k.RIGHT)
}

function addGem (start, length) {
  const delta = k.vec2(k.randi(length), k.randi(-3))
  return spawnGem(tilePos(start, delta))
}

function addBoulder (pos) {
  const delta = k.vec2(0, k.randi(-1, -4))
  return spawnWall(tilePos(pos, delta), 1, 1)
}

/**
 * @param {import('kaboom').Vec2} start
 * @param {number} length
 * @param {number} count
 * @returns {import('kaboom').Vec2}
 */
function addPlatform (start, length, count) {
  const gemPosX = count === 0 ? -1 : addGem(start, length).pos.x

  const pos = range(length - 2).reduce(pos => {
    if (pos.x !== gemPosX && k.chance(count / 100)) {
      addBoulder(pos)
    }

    return addGround(pos, 1, 0)
  }, addGround(start, 0, 0))

  const delta = k.vec2(k.randi(2, 3), k.randi(-2, 2))
  return tilePos(addGround(pos, 2, 0), delta)
}

export function platformGenerator (pos, maxLength) {
  let count = 0

  return function next () {
    if (k.toScreen(pos).x > k.width() * 2) {
      return
    }

    const length = k.randi(maxLength)
    pos = addPlatform(pos, length, count++)

    next()
  }
}
