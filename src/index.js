import tiles from './assets/tiles.png'
import { k } from './init.js'
import { groundLevel, platformGenerator } from './platforms.js'
import { spawnPlayer } from './spawn.js'
import { tileAt, tileset, TILE_SIZE } from './util.js'

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

  player.play('idle')
  k.gravity(100)

  spawnPlatforms()
  k.on('destroy', 'wall', spawnPlatforms)

  k.onClick(() => {
    if (player.isGrounded()) {
      player.jump(100)
    }
  })

  k.onMouseDown(() => {
    player.velocity(100 * Math.log(player.speed + 1))
  })

  k.onCollide('player', 'wall', (player, _, collision) => {
    if (collision.isRight()) {
      player.velocity(0)
    }
  })

  k.onCollide('player', 'gem', (player, gem) => {
    player.speed++
    gem.destroy()
  })

  k.on('leave', 'gem', () => {
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
