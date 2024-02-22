# 功能
用于读取 Pico 8 的 cartridge 图片文件，获取里面的代码。

# 用法
```javascript
import { readP8 } from '@erioifpudii/p8-read'

// readP8(imageUrl: string)
readP8('./jelpi.p8.png').then((data) => {
  console.log('[P8]', data) // { code: string }
})
```