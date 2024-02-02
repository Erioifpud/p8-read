let bits = []
let ptr = 0

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

// 重复字符串
function repeat (str, length) {
  const times = Math.ceil(length / str.length)
  return str.repeat(times).slice(0, length)
}

// 读取一个 bit
function readBit () {
  const bit = bits[ptr]
  ptr += 1
  return bit
}

// 读取 length 个 bit
function readBits (length) {
  const str = bits.slice(ptr, ptr + length)
    .reverse()
    .join('')
  ptr += length
  return str
}

// 对新格式数据解码
function decompressNewFormat (compressedBytes) {
  // big-endian read 2 bytes
  const decompressedCodeLen = (compressedBytes[0] << 8) | compressedBytes[1]
  // 没用到
  // const compressedCodeLen = (compressedBytes[2] << 8) | compressedBytes[3]

  // 创建 move-to-front 编码表
  const mtfList = []
  for (let i = 0; i < 256; i++) {
    mtfList.push(i)
  }

  // 先将剩余的字节全部转换成二进制字符串形式，然后反转
  // 0xbf 0x45
  // 10111111 01000101
  // 每个字节的 LSB 到 MSB
  // 11111010 10100010
  // ['1', '1'....]，存成这样方便后续以正序遍历每一位
  const data = compressedBytes.slice(4)

  bits = []
  for (let i = 0; i < data.length; i++) {
    const byte = data[i]
    const binaryStr = byte.toString(2).padStart(8, '0')
    const reversedList = binaryStr.split('').reverse()
    bits.push(...reversedList)
  }

  let code = ''
  ptr = 0
  while (code.length < decompressedCodeLen) {
    const header = readBit()

    if (header === '1') {
      let unary = 0
      while (readBit() === '1') {
        unary += 1
      }

      const unaryMask = (1 << unary) - 1
      const str = readBits(unary + 4)
      const index = parseInt(str, 2) + (unaryMask << 4)
      // 到这里正确（我只测了第一次循环，不严谨）

      const chr = String.fromCharCode(mtfList[index])
      code += chr
      // 把 chr 对应的 charCode 移动到 mtfList 的最前面
      const removeds = mtfList.splice(index, 1)
      mtfList.unshift(removeds[0])
    } else {
      let offsetBits
      if (readBit() === '1') {
        if (readBit() === '1') {
          offsetBits = 5
        } else {
          offsetBits = 10
        }
      } else {
        offsetBits = 15
      }

      const offsetStr = readBits(offsetBits)
      const offset = parseInt(offsetStr, 2) + 1

      let length = 3
      while (true) {
        const partStr = readBits(3)
        const part = parseInt(partStr, 2)
        length += part
        if (part !== 7) {
          break
        }
      }

      if (offset > code.length) {
        console.warn('offset 大于 code 长度', offset, code.length, code)
        throw new Error('offset 大于 code 长度')
      }

      let chunk = ''
      if (length >= offset) {
        chunk = code.slice(-offset)
      } else {
        chunk = code.slice(-offset, -offset + length)
      }

      if (length > offset) {
        const repeatedStr = repeat(chunk, length - offset)
        chunk += repeatedStr
      }

      code += chunk
    }
  }
  return code
}

// 读取 P8 文件的 lua 部分
function readLuaPart (pico8Bytes) {
  const codePart = pico8Bytes.slice(0x4300, 0x8000)

  const isNewFormat = isHeaderEqual(codePart, new Uint8Array([0x00, 0x70, 0x78, 0x61]))
  const isOldFormat = isHeaderEqual(codePart, new Uint8Array([0x3a, 0x63, 0x3a, 0x00]))

  const mainPart = codePart.slice(4)

  if (isNewFormat) {
    const code = decompressNewFormat(mainPart)
    console.log('[CODE]', code)
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
