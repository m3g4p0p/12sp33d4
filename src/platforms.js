import { cleanLeft } from './components.js'
import { TILE_SIZE } from './constants.js'
import { k } from './init.js'
import { range } from './util.js'

export function groundLevel () {
  return Math.max(...k.get('wall').map(wall => wall.pos.y))
}

function addWall (pos, x, y) {
  return k.add([
    'wall',
    k.sprite(`wall-${x}-${y}`),
    k.pos(pos),
    k.area(),
    k.solid(),
    cleanLeft()
  ]).pos.add(k.RIGHT.scale(TILE_SIZE))
}

function addGem (start, length) {
  k.add([
    'gem',
    k.sprite('gem'),
    k.pos(start.add(k.vec2(
      k.randi(length),
      k.randi(-3)
    ).scale(TILE_SIZE))),
    k.area(),
    k.scale(),
    k.opacity(),
    cleanLeft()
  ])
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
