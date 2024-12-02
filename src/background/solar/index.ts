import { reactive, ref } from 'vue'

const meteoriteBelt = ref('')
function CreateMeteoriteBelt(num: number) {
  let shadow = ''
  for (let i = num; i >= 0; i--) {
    const x = Math.round(Math.random() * 360) - 180
    const y = Math.round(Math.random() * 360) - 180
    const o = Math.random() * 0.52
    if (x * x + y * y <= 160 * 160) shadow += `${x}px ${y}px 0 -139px rgba(255,255,255,${o}),`
  }
  meteoriteBelt.value = shadow.slice(0, -1)
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

export { CreateMeteoriteBelt, RandomPosition, planetStyle, meteoriteBelt }
