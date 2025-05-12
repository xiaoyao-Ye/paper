import { BrowserWindow } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const preload = path.join(__dirname, '../preload/index.mjs')

export function createDesktopWindow(display: Electron.Display) {
  return new BrowserWindow({
    width: display.bounds.width,
    height: display.bounds.height,
    x: display.bounds.x,
    y: display.bounds.y,
    type: 'desktop',
    frame: false,
    transparent: true,
    titleBarStyle: 'hidden',
    roundedCorners: false,
    // Windows 下必须配置，而 MacOS 则不需要（否则会打开一个全屏新桌面）
    fullscreen: process.platform !== 'darwin',
    // 使覆盖全屏幕，包含 MacOS Menu Bar
    enableLargerThanScreen: true,
    webPreferences: {
      contextIsolation: true,
      preload, // 预加载脚本路径
    },
  })
}
