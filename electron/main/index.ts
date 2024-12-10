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
  })
}

app.whenReady().then(async () => {
  // store.delete(WALLPAPER_CATEGORY_KEY)
  // store.delete(COMPONENT_OPTION_KEY)
  const value = store.get(WALLPAPER_CATEGORY_KEY)
  if (value) await setWallpaper(null, value)
  const component = store.get(COMPONENT_OPTION_KEY)
  if (component) await setComponent(null, component.value, component.query)

  const isAutoLaunch = app.getLoginItemSettings().wasOpenedAtLogin
  if (isAutoLaunch) {
    app.dock.hide()
  } else {
    createWindow()
    // 手动显示, 抵消 setVisibleOnAllWorkspaces 的副作用, 首次打开时 opt + cmd + h 还是无法 hide win窗口
    app.dock.show()
  }
})

app.on('window-all-closed', () => {
  win = null
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
  app.dock.show()
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    const mainWindow = allWindows.find(w => w !== wallpaperWindow)
    if (mainWindow) {
      mainWindow.focus()
    } else {
      // 如果没有主窗口，创建一个新的
      createWindow()
    }
  } else {
    createWindow()
  }
  // if (!allWindows.length) return createWindow()
  // win ? win.focus() : createWindow() // 会主进程错误
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
let wallpaperCategory: CategoryValue | string = ''
const WALLPAPER_CATEGORY_KEY = 'wallpaper_category'

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

  if (process.platform === 'darwin') {
    wallpaperWindow.setVisibleOnAllWorkspaces(true, {
      // 这种方式没闪烁, 但是 win 窗口无法触发 option + command + h 的 hide 效果,并且触发了类似 app.dock.hide() 的效果
      visibleOnFullScreen: true,
    })
  }

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

async function setWallpaper(_, value: CategoryValue | string) {
  if (wallpaperCategory === value) return

  if (!wallpaperWindow) createWallpaperWindow()

  if (isCategoryValue(value, category)) {
    await setCategoryWallpaper(value)
  } else {
    await wallpaperWindow.loadURL(value)
  }

  if (!wallpaperCategory) {
    app.dock.show()
    wallpaperWindow.focus()
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

ipcMain.on('set-wallpaper', setWallpaper)

const COMPONENT_OPTION_KEY = 'component_option'
let componentViews: Record<string, WebContentsView> = {}
let componentOption: Option = { value: '', query: {} }
interface Option {
  value: CategoryValue | string
  query: Record<string, string>
}

async function setComponent(_, value: CategoryValue | string, query: Record<string, string>) {
  if (componentOption.value === value && qs.stringify(componentOption.query) === qs.stringify(query)) return

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

  // 抵消 client 无法关闭的副作用
  if (!wallpaperCategory) {
    app.dock.show()
    wallpaperWindow.focus()
  }
  componentOption.value = value
  componentOption.query = query
  store.set(COMPONENT_OPTION_KEY, componentOption)
}

ipcMain.on('set-component', setComponent)

ipcMain.on('event', (_, ...args) => {
  wallpaperWindow.webContents.send('event', ...args)
})
