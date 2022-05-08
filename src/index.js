import tiles from './assets/tiles.png'
import { k } from './init.js'
import { tileAt, tileset } from './util.js'

k.loadSpriteAtlas(tiles, {
  wallTopLeft: tileAt(18, 0),
  ...tileset('wall', 18, 0, 3, 3)
})

k.scene('main', () => {
  k.add([
    k.sprite('wall-0-0'),
    k.pos(k.center())
  ])
})

k.go('main')
