import { app, BrowserWindow, shell, ipcMain, screen } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

const isAutoLaunch = process.argv.includes('--auto-launch')

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: path.join(process.env.VITE_PUBLIC, 'logo_1024.png'),
    webPreferences: {
      preload,
      // webSecurity: false,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
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

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}

// app.whenReady().then(createWindow)
app.whenReady().then(() => {
  createWindow()

  if (isAutoLaunch) {
    console.log('应用是通过开机自启动打开的')
    win?.hide()
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
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    // 找到非 wallpaperWindow 的窗口
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
})

let wallpaperWindow: BrowserWindow | null = null

// 添加设置壁纸的函数
ipcMain.on('set-wallpaper', async (_, url: string) => {
  // 获取主屏幕
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height, x, y } = primaryDisplay.bounds

  if (!wallpaperWindow) {
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
        // webSecurity: false,
        // nodeIntegration: true,
        // contextIsolation: false,
      },
    })

    // wallpaperWindow.once('ready-to-show', () => {
    //   console.log('ready-to-show')
    //   wallpaperWindow.show()
    // })

    wallpaperWindow.on('closed', () => {
      wallpaperWindow = null
    })

    if (process.platform === 'darwin') {
      wallpaperWindow.setVisibleOnAllWorkspaces(true, {
        // 这种方式没闪烁, 但是 win 窗口无法触发 option + command + h 的 hide 效果,并且关掉 win 窗口后只能重新启动应用才能打开 win.
        visibleOnFullScreen: true,
      })
    }
    // wallpaperWindow.on('hide', e => {
    // 这种方式会有闪烁
    //   wallpaperWindow.showInactive()
    //   // wallpaperWindow.show()
    // })
  }
  // 使覆盖全屏幕，包含 MacOS Menu (!!!没有退出,退出极其困难, 智能option + command + esc +回车)
  // 这些属性能能覆盖 mac 菜单栏: pop-up-menu/status/screen-saver
  // wallpaperWindow.setAlwaysOnTop(true, 'screen-saver')

  await wallpaperWindow.loadURL(url)
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

// 设置开机自动启动
app.setLoginItemSettings({
  openAtLogin: true,
  openAsHidden: false,
  path: process.execPath,
  args: ['--auto-launch'],
})

// 对于 macOS，还可以通过 app.getLoginItemSettings() 来判断
// if (process.platform === 'darwin') {
//   const loginSettings = app.getLoginItemSettings()
//   const wasOpenedAtLogin = loginSettings.wasOpenedAtLogin
//   const wasOpenedAsHidden = loginSettings.wasOpenedAsHidden

//   if (wasOpenedAtLogin) {
//     console.log('应用是通过开机自启动打开的')
//     if (wasOpenedAsHidden) {
//       console.log('并且是以隐藏方式启动的')
//     }
//   }
// }
