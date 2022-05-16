import { accelerate, bounce, cleanLeft, dynamicJump, flicker, velocity } from './components.js'
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
    dynamicJump(0.5),
    k.area(),
    k.body(),
    k.cleanup()
  ])
}

export function spawnGem (pos) {
  const gem = k.add([
    'gem',
    'booster',
    k.sprite('gem'),
    k.pos(pos),
    k.area(),
    k.scale(),
    k.opacity(),
    k.body({ solid: false }),
    bounce(k.randi(40, 50)),
    cleanLeft()
  ])

  const glow = k.add([
    k.circle(TILE_SIZE / 2),
    k.color(k.YELLOW),
    k.opacity(),
    k.scale(),
    k.layer('effects'),
    k.pos(gem.pos),
    k.follow(gem, TILE_SIZE / 2),
    flicker(0.2)
  ])

  gem.on('fade', () => {
    glow.destroy()
  })

  gem.onDestroy(() => {
    glow.destroy()
  })

  return gem
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

export function spawnIndicator () {
  const index = k.get('indicator').length

  return k.add([
    'indicator',
    k.layer('ui'),
    k.fixed(),
    k.rect(5, 5),
    k.pos(k.vec2(10 + 6 * index, k.height() - 10)),
    k.color(k.rgb(0, (index + 1) * 32, 0))
  ])
}

export function spawnPlant (pos) {
  return k.add([
    k.sprite(`plant-${k.randi(4)}-${k.randi(1, 2)}`),
    k.layer('background'),
    k.pos(pos),
    k.opacity(k.rand(0.5))
  ])
}
