let ptr = 0

export function decompressOldFormat (compressedBytes) {
  // big-endian read 2 bytes
  const decompressedCodeLen = (compressedBytes[0] << 8) | compressedBytes[1]
  // 接下来的 2 个字节都是 0x00

  const table = '\n 0123456789abcdefghijklmnopqrstuvwxyz!#%(){}[]<>+=/*:;.,~_'
  const data = compressedBytes.slice(4)

  let code = ''
  ptr = 0
  while (code.length < decompressedCodeLen) {
    const byte = data[ptr]
    if (byte === 0x00) {
      code += String.fromCharCode(data[ptr + 1])
      ptr += 2
    } else if (byte <= 0x3b) {
      // 0x01-0x3b
      const index = byte - 1
      code += table[index]
      ptr++
    } else {
      // 0x3c-0xff
      const nextByte = data[ptr + 1]
      const offset = (byte - 0x3c) * 16 + (nextByte & 0x0f)
      const length = (nextByte >> 4) + 2
      const index = code.length - offset
      const paragraph = code.slice(index, index + length)
      code += paragraph

      ptr += 2
    }
  }
  return code
}
