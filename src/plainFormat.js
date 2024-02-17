export function decompressPlainFormat (plainBytes) {
  let code = ''
  for (let i = 0; i < plainBytes.length; i++) {
    const byte = plainBytes[i]
    if (byte === 0x00) {
      continue
    }
    code += String.fromCharCode(byte)
  }
  return code
}
