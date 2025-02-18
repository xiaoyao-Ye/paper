import { app, BrowserWindow, ipcMain, screen, WebContentsView } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import qs from 'qs'
import Store from 'electron-store'
import { category, type CategoryValue } from '../config/index'
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

app.whenReady().then(async () => {
  // store.delete(WALLPAPER_CATEGORY_KEY)
  // store.delete(COMPONENT_OPTION_KEY)
  const value = store.get(WALLPAPER_CATEGORY_KEY)
  if (value) await setWallpaper(value)
  const component = store.get(COMPONENT_OPTION_KEY)
  if (component) await setComponent(component.value, component.query)

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

let wallpaperWindow: BrowserWindow | null = null
const WALLPAPER_CATEGORY_KEY = 'wallpaper_category'
let wallpaperCategory: CategoryValue | string = store.get(WALLPAPER_CATEGORY_KEY)

function createWallpaperWindow() {
  // 获取主屏幕
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height, x, y } = primaryDisplay.bounds

  wallpaperWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    type: 'desktop', // 设置为桌面窗口
    frame: false, // 无边框
    transparent: true,
    titleBarStyle: 'hidden',
    roundedCorners: false, // 禁用圆角
    // Windows 下必须配置，而 MacOS 则不需要（否则会打开一个全屏新桌面）
    fullscreen: process.platform !== 'darwin',
    // 使覆盖全屏幕，包含 MacOS Menu Bar
    enableLargerThanScreen: true,
    // Windows 下必须配置，否则会禁用视频播放
    // type: 'toolbar',
    // trafficLightPosition: { x: 999999, y: 999999 }, // 将红绿灯按钮移到看不见的位置
    // show: false,
    // resizable: false,
    // movable: false,
    // focusable: false,
    // useContentSize: true,
    webPreferences: {
      preload,
    },
  })

  wallpaperWindow.on('closed', () => {
    wallpaperWindow = null
  })

  screen.on('display-metrics-changed', () => {
    const { width, height, x, y } = screen.getPrimaryDisplay().bounds
    const { width: w, height: h } = wallpaperWindow.getBounds()
    if (width === w && height === h) return
    wallpaperWindow.setSize(width, height, true)
    wallpaperWindow.setPosition(x, y, true)
  })
}

function isCategoryValue(value: CategoryValue | string, obj: Record<string, string>): value is CategoryValue {
  return Object.values(obj).includes(value)
}

async function setWallpaper(value: CategoryValue | string) {
  if (!wallpaperWindow) createWallpaperWindow()

  if (isCategoryValue(value, category)) {
    await setCategoryWallpaper(value)
  } else {
    await wallpaperWindow.loadURL(value)
  }

  wallpaperCategory = value
  store.set(WALLPAPER_CATEGORY_KEY, value)
}

async function setCategoryWallpaper(value: CategoryValue) {
  if (VITE_DEV_SERVER_URL) {
    await wallpaperWindow.loadURL(`${VITE_DEV_SERVER_URL}#/${value}`)
    wallpaperWindow.webContents.openDevTools()
  } else {
    await wallpaperWindow.loadFile(indexHtml, { hash: value })
  }
}

ipcMain.on('set-wallpaper', (_, value: CategoryValue | string) => {
  if (wallpaperCategory === value) return
  setWallpaper(value)
})

const COMPONENT_OPTION_KEY = 'component_option'
let componentViews: Record<string, WebContentsView> = {}
let componentOption: Option = store.get(COMPONENT_OPTION_KEY)
interface Option {
  value: CategoryValue | string
  query: Record<string, string>
}

async function setComponent(value: CategoryValue | string, query: Record<string, string>) {
  if (!wallpaperWindow) createWallpaperWindow()

  const { width, height } = screen.getPrimaryDisplay().bounds
  const w = width / 3
  const h = height / 3

  let view = componentViews[value]
  // 已存在的组件更新 options, 不存在的组件才创建组件
  if (!view) {
    view = new WebContentsView()
    view.setBackgroundColor('rgba(255,255,255,0)')
    view.setBounds({ x: width - w, y: 0, width: w, height: h })
    wallpaperWindow.contentView.addChildView(view)
    componentViews[value] = view
  }

  if (isCategoryValue(value, category)) {
    const hash = `${value}?${qs.stringify(query)}`
    if (VITE_DEV_SERVER_URL) {
      await view.webContents.loadURL(`${VITE_DEV_SERVER_URL}#/${hash}`)
      view.webContents.openDevTools()
    } else {
      await view.webContents.loadFile(indexHtml, { hash })
    }
    // 更新 options 需要重新加载
    view.webContents.reload()
  } else {
    await view.webContents.loadFile(value)
  }

  componentOption.value = value
  componentOption.query = query
  store.set(COMPONENT_OPTION_KEY, componentOption)
}

ipcMain.on('set-component', (_, value: CategoryValue | string, query: Record<string, string>) => {
  if (componentOption.value === value && qs.stringify(componentOption.query) === qs.stringify(query)) return
  setComponent(value, query)
})

ipcMain.on('event', (_, ...args) => {
  wallpaperWindow.webContents.send('event', ...args)
})
