import { accelerate, cleanLeft, velocity } from './components.js'
import { TILE_SIZE } from './constants.js'
import { k } from './init.js'

export function spawnPlayer () {
  const start = k.vec2(TILE_SIZE, k.height() / 2)

  return k.add([
    'player',
    k.sprite('player'),
    k.pos(start),
    velocity(5),
    accelerate(),
    k.area(),
    k.body(),
    k.cleanup()
  ])
}

export function spawnGem (pos) {
  k.add([
    'gem',
    k.sprite('gem'),
    k.pos(pos),
    k.area(),
    k.scale(),
    k.opacity(),
    cleanLeft()
  ])
}

export function spawnWall (pos, x, y) {
  return k.add([
    'wall',
    k.sprite(`wall-${x}-${y}`),
    k.pos(pos),
    k.area(),
    k.solid(),
    cleanLeft()
  ])
}
