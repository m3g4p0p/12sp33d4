import { TILE_SIZE } from './constants.js'
import { k } from './init.js'
import { spawnGem, spawnPlant, spawnSword, spawnWall } from './spawn.js'
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
  if (k.get('sword').length > 0 || !k.chance(0.33)) {
    return null
  }

  const delta = k.vec2(k.randi(length), -1)
  return spawnSword(tilePos(start, delta))
}

function addBoulder (pos, exclude) {
  if (exclude.includes(pos.x)) {
    return null
  }

  const delta = k.vec2(0, k.randi(-2, -5))
  const boulder = spawnWall(tilePos(pos, delta), 'wall-1-1')

  boulder.use('boulder')
  boulder.use(k.scale())
  boulder.use(k.opacity())
  exclude.push(boulder.pos.x + TILE_SIZE)

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
  const noBoulder = gem ? [gem.pos.x] : []

  if (gem) {
    addSword(start, length)
  }

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
