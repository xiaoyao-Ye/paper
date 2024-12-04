export function padStart(num: number, len: number = 2, str: string = '0') {
  return num.toString().padStart(len, str)
}

export function getRandom(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min)
}

// 添加页面可见性处理
export function handleVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    const animatedDivs = document.querySelectorAll('div')
    animatedDivs.forEach(div => {
      div.style.animationPlayState = 'paused' // 暂停动画
    })
  } else if (document.visibilityState === 'visible') {
    const animatedDivs = document.querySelectorAll('div')
    animatedDivs.forEach(div => {
      div.style.animationPlayState = 'running' // 恢复动画
    })
  }
}
