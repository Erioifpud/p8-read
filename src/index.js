import { decompressNewFormat } from './newFormat'

// 加载图片并读取像素颜色
function readImagePixels (imagePath) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = image.width
      canvas.height = image.height
      context.drawImage(image, 0, 0)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data
      resolve(pixels)
    }
    image.onerror = () => {
      reject(new Error('无法加载图片'))
    }
    image.src = imagePath
  })
}

// 从颜色数据中分离出 P8 的数据
function readAsP8Bytes (pixels) {
  const bytes = new Uint8Array(pixels.length / 4)
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i] & 0b00000011
    const g = pixels[i + 1] & 0b00000011
    const b = pixels[i + 2] & 0b00000011
    const a = pixels[i + 3] & 0b00000011
    const byte = (a << 6) | (r << 4) | (g << 2) | b
    bytes[i / 4] = byte
  }
  return bytes
}

// 判断 buffer 的前几个字节是否和 headerBuffer 相等
function isHeaderEqual (buffer, headerBuffer) {
  const length = headerBuffer.length
  if (buffer.length < length) {
    return false // 如果长度不够，直接返回 false
  }

  for (let i = 0; i < length; i++) {
    if (buffer[i] !== headerBuffer[i]) {
      return false // 只要有一个字节不匹配，就返回 false
    }
  }

  return true // 所有字节匹配，返回 true
}

// 读取 P8 文件的 asset 部分
function readAssetPart (pico8Bytes) {
  // const assetPart = pico8Bytes.slice(0, 0x4300)
  // TODO: 解析 asset 部分
}

// 读取 P8 文件的 lua 部分
function readLuaPart (pico8Bytes) {
  const codePart = pico8Bytes.slice(0x4300, 0x8000)

  const isNewFormat = isHeaderEqual(codePart, new Uint8Array([0x00, 0x70, 0x78, 0x61]))
  const isOldFormat = isHeaderEqual(codePart, new Uint8Array([0x3a, 0x63, 0x3a, 0x00]))

  const mainPart = codePart.slice(4)

  if (isNewFormat) {
    const code = decompressNewFormat(mainPart)
    return code
  } else if (isOldFormat) {
    // TODO: 解析旧版本格式
  } else {
    // TODO: 解析纯文本格式
  }
}

// 读取 P8 文件
export async function readP8 (imageUrl) {
  // 调用 readImagePixels 函数来读取图片的像素颜色
  const pixels = await readImagePixels(imageUrl)
  const pico8Bytes = readAsP8Bytes(pixels)
  const asset = readAssetPart(pico8Bytes)
  const code = readLuaPart(pico8Bytes)
  return {
    asset,
    code
  }
}
