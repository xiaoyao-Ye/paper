<script setup>
import { onMounted, onUnmounted } from 'vue'
import { RandomXiaoxingxing, RandomStarBG, RandomPosition, planetStyle } from './index'

const events = {
  RandomPosition: RandomPosition,
}
ipcRenderer.on('event', (_, fn, ...args) => {
  events[fn](...args)
})

onMounted(() => {
  RandomXiaoxingxing(2400)
  RandomStarBG()
  RandomPosition()

  window.addEventListener('resize', RandomPosition)
})
onUnmounted(() => {
  window.removeEventListener('resize', RandomPosition)
})
</script>

<template>
  <div>
    <!-- 太阳系系统 -->
    <div class="solar">
      <div class="star-bg" />

      <div class="sun" />
      <div class="mercury-orbit" />
      <div class="mercury" :style="planetStyle.mercury"></div>
      <div class="venus-orbit" />
      <div class="venus" :style="planetStyle.venus"></div>
      <div class="earth-orbit" />
      <div class="earth" :style="planetStyle.earth">
        <div class="moon" />
      </div>
      <div class="mars-orbit" />
      <div class="mars" :style="planetStyle.mars"></div>
      <div class="xiaoxingxingdai" />
      <div class="xiaoxingxing" />
      <div class="jupiter-orbit" />
      <div class="jupiter" :style="planetStyle.jupiter"></div>
      <div class="saturn-orbit" />
      <div class="saturn" :style="planetStyle.saturn">
        <div class="circular" />
      </div>
      <div class="uranus-orbit" />
      <div class="uranus" :style="planetStyle.uranus"></div>
      <div class="neptune-orbit" />
      <div class="neptune" :style="planetStyle.neptune"></div>
    </div>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  height: 100%;
  width: 100%;
}

body {
  background-color: rgb(30, 30, 32);
  transition: 1s linear;
}

.solar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  /* position: relative; */
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
  /* background-color: rgb(34, 39, 56); */
  transition: 1s linear;
}

.sun {
  position: absolute;
  top: 50%;
  left: 50%;
  height: calc(70px + 1px);
  width: calc(70px + 1px);
  margin-top: calc(-70px / 2);
  margin-left: calc(-70px / 2);
  background: radial-gradient(goldenrod 0%, goldenrod 64%, transparent 76%, transparent 100%);
  box-shadow: 0 0 36px #da9800;
  border-radius: 50%;
}

[class*='-orbit'] {
  position: absolute;
  border: 1px dashed rgba(128, 128, 128, 0.4);
  border-radius: 50%;
  top: 50%;
  left: 50%;
}

.mercury-orbit {
  height: calc(90px - 1px);
  width: calc(90px - 1px);
  margin-top: -45px;
  margin-left: -45px;
}

.venus-orbit {
  height: calc(120px - 1px);
  width: calc(120px - 1px);
  margin-top: -60px;
  margin-left: -60px;
}

.earth-orbit {
  height: calc(180px - 1px);
  width: calc(180px - 1px);
  margin-top: -90px;
  margin-left: -90px;
}

.mars-orbit {
  height: calc(240px - 1px);
  width: calc(240px - 1px);
  margin-top: -120px;
  margin-left: -120px;
}

.jupiter-orbit {
  height: calc(380px - 1px);
  width: calc(380px - 1px);
  margin-top: -190px;
  margin-left: -190px;
}

.saturn-orbit {
  height: calc(480px - 1px);
  width: calc(480px - 1px);
  margin-top: -240px;
  margin-left: -240px;
}

.uranus-orbit {
  height: calc(580px - 1px);
  width: calc(580px - 1px);
  margin-top: -290px;
  margin-left: -290px;
}

.neptune-orbit {
  height: calc(680px - 1px);
  width: calc(680px - 1px);
  margin-top: -340px;
  margin-left: -340px;
}

/*小行星带*/
.xiaoxingxingdai,
.xiaoxingxing {
  position: absolute;
  top: 50%;
  left: 50%;
}

.xiaoxingxingdai {
  box-sizing: border-box;
  height: calc(330px - 1px);
  width: calc(330px - 1px);
  margin-top: -165px;
  margin-left: -165px;
  border-radius: 50%;
  background: radial-gradient(
    transparent 0%,
    transparent 60%,
    rgba(255, 255, 255, 0.01) 60%,
    rgba(255, 255, 255, 0.05) 65%,
    rgba(255, 255, 255, 0.01) 70%,
    transparent 70%
  );
  animation: rotate 48s infinite linear;
}

.xiaoxingxing {
  border-radius: 50%;
  width: 280px;
  height: 280px;
  margin-left: -140px;
  margin-top: -140px;
  animation: rotate 48s infinite linear;
}

.mercury,
.venus,
.earth,
.mars,
.jupiter,
.saturn,
.uranus,
.neptune {
  position: absolute;
  top: 50%;
  left: 50%;
  transition: 1s;
}

.mercury {
  height: 4px;
  width: 4px;
  margin-top: calc(-4px / 2 + 1px / 2);
  margin-left: calc(-90px / 2 - 4px / 2 + 1px / 2);
  transform-origin: calc(90px / 2 + 4px / 2) calc(4px / 2);
  animation: rotate 4.4s infinite linear;
  background: radial-gradient(deepskyblue 0%, deepskyblue 55%, transparent 70%, transparent 100%);
}

.venus {
  height: 8px;
  width: 8px;
  margin-top: calc(-8px / 2);
  margin-left: calc(-120px / 2 - 8px / 2);
  transform-origin: calc(120px / 2 + 8px / 2) calc(8px / 2);
  animation: rotate 11.235s infinite linear;
  background: radial-gradient(gold 0%, gold 60%, transparent 70%, transparent 100%);
}

.earth {
  height: 16px;
  width: 16px;
  margin-top: calc(-16px / 2);
  margin-left: calc(-180px / 2 - 16px / 2);
  transform-origin: calc(180px / 2 + 16px / 2) calc(16px / 2);
  animation: rotate 18.262s infinite linear;
  background: radial-gradient(royalblue 0%, royalblue 60%, transparent 70%, transparent 100%);
}

.mars {
  height: 16px;
  width: 16px;
  margin-top: calc(-16px / 2);
  margin-left: calc(-240px / 2 - 16px / 2);
  transform-origin: calc(240px / 2 + 16px / 2) calc(16px / 2);
  animation: rotate 34.349s infinite linear;
  background: radial-gradient(orangered 0%, orangered 50%, transparent 70%, transparent 100%);
}

.jupiter {
  height: 40px;
  width: 40px;
  margin-top: calc(-40px / 2);
  margin-left: calc(-380px / 2 - 40px / 2);
  transform-origin: calc(380px / 2 + 40px / 2) calc(40px / 2);
  animation: rotate 216.6215s infinite linear;
  background: radial-gradient(
    #2a2a2a 0%,
    #79694f 20%,
    #7a7467 30%,
    #7f6244 35%,
    #c3d1d1 37%,
    #918e85 40%,
    #585858 54%,
    #a6a6a6 58%,
    transparent 65%,
    transparent 70%
  );
}

.saturn {
  height: 24px;
  width: 24px;
  margin-top: calc(-24px / 2);
  margin-left: calc(-480px / 2 - 24px / 2);
  transform-origin: calc(480px / 2 + 24px / 2) calc(24px / 2);
  animation: rotate 541.616s infinite linear;
  border-radius: 50%;
  background: radial-gradient(palegoldenrod 0%, tan 10%, burlywood 30%, palegoldenrod 60%, darkgray 100%);
}

.uranus {
  height: 20px;
  width: 20px;
  margin-top: calc(-20px / 2);
  margin-left: calc(-580px / 2 - 20px / 2);
  transform-origin: calc(580px / 2 + 20px / 2) calc(20px / 2);
  animation: rotate 1539.95s infinite linear;
  background: radial-gradient(lightblue 0%, lightblue 65%, transparent 70%, transparent 100%);
}

.neptune {
  height: 18px;
  width: 18px;
  margin-top: calc(-18px / 2);
  margin-left: calc(-680px / 2 - 18px / 2);
  transform-origin: calc(680px / 2 + 18px / 2) calc(18px / 2);
  animation: rotate 3009.6s infinite linear;
  background: radial-gradient(steelblue 0%, steelblue 65%, transparent 70%, transparent 100%);
}

.moon {
  position: absolute;
  top: -3px;
  left: -3px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  transform-origin: 11px 11px;
  animation: rotate 1.4765s infinite linear;
  background: radial-gradient(lightgrey 0%, lightgrey 60%, transparent 70%, transparent 100%);
}

.circular {
  position: absolute;
  top: calc((24px - 48px) / 2);
  left: calc((24px - 48px) / 2);
  width: 48px;
  height: 48px;
  /* animation: rotate 0.021s infinite linear; */
  background: radial-gradient(transparent 35%, #bf9b4f 52%, #648d90 58%, transparent 70%);
}

@keyframes rotate {
  100% {
    transform: rotate(-360deg);
  }
}

/*背景星星*/
.star-bg {
  height: 1px;
  width: 1px;
  background-color: transparent;
  z-index: 1000;
  animation: toTop 36s infinite linear;
}

@keyframes toTop {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(-100vh);
  }
}
</style>
