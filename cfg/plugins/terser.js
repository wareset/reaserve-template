/*
 * BEGIN TERSER
 */
import { minify } from 'terser'
export const terser = () => ({
  async renderChunk(code) {
    return await minify(code, { safari10: true })
  }
})
/*
 * END TERSER
 */
