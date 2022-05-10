import { k } from './init.js'
import { range, TILE_SIZE } from './util.js'

function addWall (pos, x, y) {
  return k.add([
    'wall',
    k.sprite(`wall-${x}-${y}`),
    k.pos(pos),
    k.area(),
    k.solid()
  ]).pos.add(k.RIGHT.scale(TILE_SIZE))
}

export function groundLevel () {
  return Math.max(...k.get('wall').map(wall => wall.pos.y))
}

export function platform (start, length) {
  const pos = range(length - 2).reduce(pos => {
    return addWall(pos, 0, 1)
  }, addWall(start, 0, 0))

  return addWall(pos, 0, 2).add(
    k.randi(2, 3) * TILE_SIZE,
    k.randi(-2, 2) * TILE_SIZE
  )
}

export function platformGenerator (pos, maxLength) {
  return function next () {
    if (k.toScreen(pos).x > k.width() * 2) {
      return
    }

    pos = platform(pos, k.randi(maxLength))
    next()
  }
}
