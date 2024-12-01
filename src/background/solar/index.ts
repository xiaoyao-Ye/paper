import { reactive, ref } from 'vue'

// 随机生成小行星
function RandomXiaoxingxing(num: number) {
  let xiaoxingxing = ''
  for (let i = num; i >= 0; i--) {
    const j = Math.round(Math.random() * 360) - 180
    const k = Math.round(Math.random() * 360) - 180
    const l = Math.random() * 0.5
    /* 环形 */
    if (j * j + k * k <= 160 * 160) xiaoxingxing += `${j}px ${k}px 0 -139px rgba(255,255,255,${l}),`
  }
  /* 截掉最后多余的逗号 */
  xiaoxingxing = xiaoxingxing.substr(0, xiaoxingxing.length - 1)
  document.getElementsByClassName('xiaoxingxing')[0].style.boxShadow = xiaoxingxing
}

// 随机生成背景星星
function RandomStarBG(num: number = 240) {
  const windowHeight = document.body.clientHeight
  const windowWidth = document.body.clientWidth
  let starBG = ''
  for (let i = num; i >= 0; i--) {
    const j = Math.round(Math.random() * windowWidth)
    const k = Math.round(Math.random() * windowHeight)
    const n = Math.round(Math.random() * 0.52)
    const l = Math.random() * 0.5
    for (let m = 0; m < 2; m++) {
      starBG += `${j}px ${k}px 0 ${n}px rgba(255,255,255,${l}),`
      starBG += `${j}px ${windowHeight + k}px 0 ${n}px rgba(255,255,255,${l}),`
    }
  }
  starBG = starBG + starBG.substr(0, starBG.length - 1)
  document.getElementsByClassName('star-bg')[0].style.boxShadow = starBG
}

const planetStyle = reactive<Record<string, string>>({
  mercury: '',
  venus: '',
  earth: '',
  mars: '',
  jupiter: '',
  saturn: '',
  uranus: '',
  neptune: '',
})
const planets = [
  { className: 'mercury', radius: 45, size: 4 },
  { className: 'venus', radius: 60, size: 8 },
  { className: 'earth', radius: 90, size: 16 },
  { className: 'mars', radius: 120, size: 16 },
  { className: 'jupiter', radius: 190, size: 40 },
  { className: 'saturn', radius: 240, size: 24 },
  { className: 'uranus', radius: 290, size: 20 },
  { className: 'neptune', radius: 340, size: 18 },
]
// 随机位置
function RandomPosition() {
  planets.forEach(({ className, radius, size }) => {
    const num = Math.random() * radius
    const x = (Math.random() > 0.5 ? 1 : -1) * num - size / 2
    const y = (Math.random() > 0.5 ? 1 : -1) * Math.sqrt(radius * radius - num * num) - size / 2

    planetStyle[className] = `margin-top: ${x}px; margin-left: ${y}px; transform-origin: ${-y}px ${-x}px`
  })
}

export { RandomXiaoxingxing, RandomStarBG, RandomPosition, planetStyle }
