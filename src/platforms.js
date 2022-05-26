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
  const jumpForce = 60 + k.randi(delta.y * 10)

  return spawnGem(tilePos(start, delta), jumpForce)
}

function addBoulder (pos, exclude) {
  if (exclude.includes(pos.x)) {
    return
  }

  const delta = k.vec2(0, k.randi(-2, -5))
  const boulder = spawnWall(tilePos(pos, delta), 1, 1)

  exclude.push(boulder.pos.x + TILE_SIZE)
}

function boulderChance (count) {
  return k.chance(0.33 - 0.33 / 1.05 ** count)
}

/**
 * @param {import('kaboom').Vec2} start
 * @param {number} length
 * @param {number} count
 * @returns {import('kaboom').Vec2}
 */
function addPlatform (start, length, count) {
  const gem = count > 0 ? addGem(start, length) : null
  const noBoulder = gem ? [gem.pos.x] : []

  const pos = range(length - 2).reduce(pos => {
    if (boulderChance(count)) {
      addBoulder(pos, noBoulder)
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
