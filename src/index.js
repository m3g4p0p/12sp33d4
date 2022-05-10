import tiles from './assets/tiles.png'
import { fade } from './components.js'
import { PLAYER_SPEED, TILE_SIZE } from './constants.js'
import { k } from './init.js'
import { groundLevel, platformGenerator } from './platforms.js'
import { spawnPlayer } from './spawn.js'
import { tileAt, tileset } from './util.js'

const playerTile = tileAt(18, 9, 6)
playerTile.y++

k.loadSpriteAtlas(tiles, {
  ...tileset('wall', 18, 0, 3, 3),
  gem: tileAt(32, 10),
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

function setAnim (obj, anim, options) {
  if (obj.curAnim() !== anim) {
    obj.play(anim, options)
  }
}

k.scene('main', () => {
  const player = spawnPlayer()

  const spawnPlatforms = platformGenerator(
    player.pos.add(k.DOWN), 10)

  const score = k.add([
    k.text(0, { size: 16 }),
    k.layer('ui'),
    k.pos(10, 10),
    k.fixed()
  ])

  k.layers([
    'background',
    'game',
    'ui'
  ], 'game')

  player.play('idle')
  k.gravity(100)

  spawnPlatforms()
  k.on('destroy', 'wall', spawnPlatforms)

  k.onClick(() => {
    if (player.isGrounded()) {
      player.jump(PLAYER_SPEED)
    }
  })

  k.onMouseDown(() => {
    player.accelerate(PLAYER_SPEED)
  })

  k.onCollide('player', 'wall', (player, _, collision) => {
    if (collision.isRight()) {
      player.velocity(0)
    }
  })

  k.onCollide('player', 'gem', (player, gem) => {
    if (gem.is('fading')) {
      return
    }

    score.text += player.speed
    player.speed++

    gem.use(fade(1))
    player.accelerate(PLAYER_SPEED)
  })

  k.on('leave', 'gem', gem => {
    if (gem.is('fading')) {
      return
    }

    player.speed = 1
  })

  player.onUpdate(() => {
    setAnim(
      player,
      player.isGrounded()
        ? player.velocity() > 0
          ? 'walk'
          : 'idle'
        : player.isFalling()
          ? 'fall'
          : 'jump'
    )

    k.camPos(
      k.center().x + player.pos.x - TILE_SIZE,
      Math.min(player.pos.y, Math.max(
        groundLevel(),
        k.camPos().y
      ))
    )
  })

  player.onDestroy(() => {
    k.go('main')
  })
})

k.go('main')
