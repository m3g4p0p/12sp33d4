import { accelerate, bounce, cleanLeft, dynamicJump, fade, flicker, velocity } from './components.js'
import { TILE_SIZE } from './constants.js'
import { k } from './init.js'

export function spawnPlayer () {
  const start = k.vec2(TILE_SIZE, k.height() / 2)

  return k.add([
    'player',
    k.sprite('player'),
    k.origin('center'),
    k.pos(start),
    velocity(5),
    accelerate(),
    dynamicJump(0.5),
    k.area(),
    k.body(),
    k.cleanup()
  ])
}

export function spawnGem (pos, jumpForce) {
  const gem = k.add([
    'gem',
    'booster',
    k.sprite('gem'),
    k.origin('center'),
    k.pos(pos),
    k.area(),
    k.scale(),
    k.opacity(),
    k.body({ solid: false }),
    bounce(jumpForce),
    cleanLeft()
  ])

  const glow = k.add([
    k.circle(TILE_SIZE / 2),
    k.origin('center'),
    k.color(k.YELLOW),
    k.opacity(),
    k.scale(),
    k.layer('effects'),
    k.pos(gem.pos),
    k.follow(gem),
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

export function spawnWall (pos, spriteName) {
  return k.add([
    'wall',
    k.sprite(spriteName),
    k.origin('center'),
    k.pos(pos),
    k.area(),
    k.solid(),
    cleanLeft()
  ])
}

export function spawnPlant (pos) {
  return k.add([
    k.sprite(`plant-${k.randi(4)}-${k.randi(1, 2)}`),
    k.layer('background'),
    k.origin('center'),
    k.pos(pos),
    k.opacity(k.rand(0.5))
  ])
}

export function spawnSword (pos) {
  return k.add([
    'sword',
    k.sprite(`sword-${k.randi(4)}-0`),
    k.origin('center'),
    k.pos(pos),
    k.z(-1),
    k.area(),
    cleanLeft()
  ])
}

export function spawnIndicator (offset) {
  const index = k.get('indicator').length

  return k.add([
    'indicator',
    k.layer('ui'),
    k.fixed(),
    k.rect(8, 8),
    k.pos(k.vec2(10 * index, 1).add(offset)),
    k.color(k.rgb(0, (index + 1) * 32, 0))
  ])
}

export function spawnScore (value, pos) {
  return k.add([
    k.text(value, {
      size: 20 + value,
      font: 'sinko'
    }),
    k.layer('ui'),
    k.origin('center'),
    k.color(k.YELLOW),
    k.pos(pos),
    k.opacity(),
    k.scale(),
    fade(1, 2)
  ])
}
