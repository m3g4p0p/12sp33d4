import tiles from './assets/tiles.png'
import { deltaPos } from './components.js'
import { k } from './init.js'
import { range, tileAt, tileset, TILE_SIZE } from './util.js'

const playerTile = tileAt(18, 9, 6)
playerTile.y++

k.loadSpriteAtlas(tiles, {
  ...tileset('wall', 18, 0, 3, 3),
  player: {
    ...playerTile,
    anims: {
      idle: 0,
      walk: { from: 1, to: 2 },
      jump: 3,
      fall: 4
    }
  }
})

function addWall (pos, x, y) {
  return k.add([
    'wall',
    k.sprite(`wall-${x}-${y}`),
    k.pos(pos),
    k.area(),
    k.solid()
  ]).pos.add(k.RIGHT.scale(TILE_SIZE))
}

function platform (start, length) {
  const pos = range(length - 2).reduce(pos => {
    return addWall(pos, 0, 1)
  }, addWall(start, 0, 0))

  return addWall(pos, 0, 2).add(
    k.randi(1, 2) * TILE_SIZE,
    k.randi(-2, 2) * TILE_SIZE
  )
}

function setState (obj, state) {
  if (obj.state !== state) {
    obj.enterState(state)
  }
}

k.scene('main', () => {
  const player = k.add([
    'player',
    k.sprite('player'),
    k.state('idle', ['idle', 'walk', 'jump']),
    k.pos(k.vec2(0, k.height() / 2)),
    deltaPos(),
    k.area(),
    k.body()
  ])

  Array.from({ length: 5 }).reduce(pos => {
    return platform(pos, k.randi(10))
  }, player.pos.add(k.DOWN))

  player.play('idle')
  k.gravity(100)

  k.onKeyDown('x', () => {
    setState(player, 'walk')
  })

  k.onKeyDown('y', () => {
    setState(player, 'jump')
  })

  k.onKeyRelease(['x', 'y'], () => {
    setState(player, 'idle')
  })

  player.onStateEnter('walk', () => {
    player.play('walk', { loop: true })
  })

  player.onStateEnter('jump', () => {
    player.jump(100)
    player.play('walk', { loop: true })
  })

  player.onStateEnter('idle', () => {
    player.play('idle')
  })

  player.onStateUpdate('jump', () => {
    player.play(player.deltaPos < 0 ? 'jump' : 'fall')
  })
})

k.go('main')
