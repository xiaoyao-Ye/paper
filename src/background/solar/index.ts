import { reactive, ref } from 'vue'

const meteoriteBelt = ref('box-shadow: ')
function CreateMeteoriteBelt(num: number) {
  for (let i = num; i >= 0; i--) {
    const j = Math.round(Math.random() * 360) - 180
    const k = Math.round(Math.random() * 360) - 180
    const l = Math.random() * 0.52
    if (j * j + k * k <= 160 * 160) meteoriteBelt.value += `${j}px ${k}px 0 -139px rgba(255,255,255,${l}),`
  }
  meteoriteBelt.value = meteoriteBelt.value.substring(0, meteoriteBelt.value.length - 1)
}

const starBG = ref('box-shadow: ')
function CreateStarBG(num: number = 240) {
  const windowHeight = document.body.clientHeight
  const windowWidth = document.body.clientWidth
  for (let i = num; i >= 0; i--) {
    const j = Math.round(Math.random() * windowWidth)
    const k = Math.round(Math.random() * windowHeight)
    const n = Math.round(Math.random() * 0.52)
    const l = Math.random() * 0.5
    for (let m = 0; m < 2; m++) {
      starBG.value += `${j}px ${k}px 0 ${n}px rgba(255,255,255,${l}),`
      starBG.value += `${j}px ${windowHeight + k}px 0 ${n}px rgba(255,255,255,${l}),`
    }
  }
  starBG.value = starBG.value.substring(0, starBG.value.length - 1)
}

const planetStyle = reactive<Record<string, string>>({})
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
function RandomPosition() {
  planets.forEach(({ className, radius, size }) => {
    const num = Math.random() * radius
    const x = (Math.random() > 0.5 ? 1 : -1) * num - size / 2
    const y = (Math.random() > 0.5 ? 1 : -1) * Math.sqrt(radius * radius - num * num) - size / 2

    planetStyle[className] = `margin-top: ${x}px; margin-left: ${y}px; transform-origin: ${-y}px ${-x}px`
  })
}

export { CreateMeteoriteBelt, CreateStarBG, RandomPosition, planetStyle, starBG, meteoriteBelt }
