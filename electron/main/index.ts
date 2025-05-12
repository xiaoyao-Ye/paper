import { app, BrowserWindow, ipcMain, screen, WebContentsView } from 'electron'
import Store from 'electron-store'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import qs from 'qs'
import { type CategoryValue } from '../config/index'
import { createDesktopWindow } from './window'
import { useDebounceFn } from '@vueuse/core'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const store = new Store()
// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

async function createWindow() {
  app.dock.show()

  win = new BrowserWindow({
    title: 'wallpaper',
    icon: path.join(process.env.VITE_PUBLIC, 'logo.png'),
    webPreferences: {
      preload,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  win.on('closed', () => {
    app.dock.hide()
    win = null
  })
}

let displays: Electron.Display[] = []
function getDisplayById(displayId: number) {
  return displays.find(d => d.id === displayId)
}
function getDisplayIndex(displayId: number) {
  return displays.findIndex(d => d.id === displayId)
}

app.whenReady().then(async () => {
  displays = screen.getAllDisplays()

  // 启动应用初始化壁纸
  const wallpapers = store.get(WALLPAPER_CATEGORY_KEY) ?? []
  wallpapers.forEach(({ displayId, value }) => {
    const hasDisplay = displays.some(d => d.id === displayId)
    if (!hasDisplay) return
    setWallpaper(displayId, value)
  })

  // 设置壁纸跟随屏幕而不是系统的主副屏
  const handleDisplayMetricsChanged = useDebounceFn(() => {
    const displays = screen.getAllDisplays()
    displays.forEach(d => {
      const win = wallpaperWindows[d.id]
      if (!win) return
      const { width, height, x, y } = d.bounds
      win.setSize(width, height, true)
      win.setPosition(x, y, true)
    })
  }, 200)
  screen.on('display-metrics-changed', handleDisplayMetricsChanged)

  // 开机启动不创建 client
  const isAutoLaunch = app.getLoginItemSettings().wasOpenedAtLogin
  if (isAutoLaunch) {
    app.dock.hide()
  } else {
    createWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  win ? win.focus() : createWindow()
})

if (!VITE_DEV_SERVER_URL) {
  // 设置开机自动启动
  app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true,
    path: process.execPath,
    args: ['--auto-launch'],
  })
}

interface Wallpaper {
  displayId: number
  value: CategoryValue | string
}
const WALLPAPER_CATEGORY_KEY = 'wallpaper_category'
let wallpaperCategory: Array<Wallpaper> = store.get(WALLPAPER_CATEGORY_KEY) ?? []

const wallpaperWindows: Record<number, BrowserWindow> = {}
async function setWallpaper(displayId: number, value: CategoryValue | string) {
  if (!wallpaperWindows[displayId]) {
    const display = getDisplayById(displayId)
    let win = createDesktopWindow(display)
    wallpaperWindows[displayId] = win

    win.on('closed', () => {
      // win = null
      delete wallpaperWindows[displayId]
    })

    const hash = `wallpaper?displayId=${displayId}`
    if (VITE_DEV_SERVER_URL) {
      await win.loadURL(`${VITE_DEV_SERVER_URL}#/${hash}`)
      win.webContents.openDevTools()
    } else {
      await win.loadFile(indexHtml, { hash: hash })
    }
  }

  wallpaperWindows[displayId].webContents.send('wallpaper-data', value)
}

ipcMain.on('set-wallpaper', (_, displayId: number, value: CategoryValue | string) => {
  const index = getDisplayIndex(displayId)
  wallpaperCategory[index] = { displayId, value }
  store.set(WALLPAPER_CATEGORY_KEY, wallpaperCategory)
  setWallpaper(displayId, value)
})

const COMPONENT_OPTION_KEY = 'component_option'
let componentOption: Option = store.get(COMPONENT_OPTION_KEY)
interface Option {
  value: CategoryValue | string
  query: Record<string, string>
}

ipcMain.on('remove-all', (_, displayId: number) => {
  if (!wallpaperWindows[displayId]) return
  wallpaperWindows[displayId].close()
  const index = getDisplayIndex(displayId)
  wallpaperCategory.splice(index, 1)
  store.set(WALLPAPER_CATEGORY_KEY, wallpaperCategory)
})

ipcMain.handle('get-wallpaper-data', (_, displayId: number) => {
  const index = getDisplayIndex(displayId)
  return wallpaperCategory[index].value
})

ipcMain.on('set-component', (_, value: CategoryValue | string, query: Record<string, string>) => {
  if (componentOption.value === value && qs.stringify(componentOption.query) === qs.stringify(query)) return
  // setComponent(value, query)
})

ipcMain.handle('displays', _ => {
  return displays.map(d => ({ id: d.id, name: d.label }))
})

ipcMain.handle('reset-store', _ => {
  store.delete(WALLPAPER_CATEGORY_KEY)
  store.delete(COMPONENT_OPTION_KEY)
})
