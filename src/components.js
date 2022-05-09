import { k } from './init.js'

/**
 * @returns {import("kaboom").Comp}
 */
export function deltaPos () {
  let pos

  return {
    id: 'deltaPos',
    require: ['pos'],
    // deltaPos: k.vec2(),
    add () {
      this.deltaPos = k.vec2()
      pos = this.pos.clone()
    },
    update () {
      this.deltaPos = this.pos.sub(pos)
      pos = this.pos.clone()
    }
  }
}
