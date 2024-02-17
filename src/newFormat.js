let bits = []
let ptr = 0

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
export function decompressNewFormat (compressedBytes) {
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
