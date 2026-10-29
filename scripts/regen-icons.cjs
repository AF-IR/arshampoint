/* Regenerate raster icons from public/icon.svg with sharp.
 * Outputs: favicon-32.png (32x32), apple-touch-icon.png (180x180), icon-192.png (192x192) */
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const PUB = path.join(__dirname, '..', 'public')
const svg = fs.readFileSync(path.join(PUB, 'icon.svg'))

async function main() {
  await sharp(svg, { density: 300 }).resize(32, 32).png().toFile(path.join(PUB, 'favicon-32.png'))
  await sharp(svg, { density: 300 }).resize(180, 180).png().toFile(path.join(PUB, 'apple-touch-icon.png'))
  await sharp(svg, { density: 300 }).resize(192, 192).png().toFile(path.join(PUB, 'icon-192.png'))
  await sharp(svg, { density: 300 }).resize(512, 512).png().toFile(path.join(PUB, 'icon-512.png'))
  console.log('icons regenerated: favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
