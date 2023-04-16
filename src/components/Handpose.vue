<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl'
// import '@tensorflow/tfjs-backend-webgpu'
import * as handpose from '@tensorflow-models/handpose'
import Stats from 'stats.js';

const videoRef = ref();
const canvasRef = ref();
let videoTag: HTMLVideoElement;
let canvasTag: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null;
let vw: number, vh: number;
const stats = new Stats();

const l = (m: any) => { console.log(m) }

const fingerIndices = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20]
};

function drawKeypoints(keypoints: any) {
  for (let i = 0; i < keypoints.length; i++) {
    const y = keypoints[i][0];
    const x = keypoints[i][1];
    ctx!.fillRect(y - 2, x - 2, 4, 4);
  }

  const fingers = Object.keys(fingerIndices);
  for (let i = 0; i < fingers.length; i++) {
    const points = fingerIndices[fingers[i] as keyof typeof fingerIndices].map((idx: number) => keypoints[idx]);
    drawPath(points, false);
  }
}

function drawPath(points: any, closePath: boolean) {
  const region = new Path2D();
  region.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    region.lineTo(point[0], point[1]);
  }
  if (closePath) { region.closePath(); }
  ctx!.stroke(region);
}

const setupCamera = async () => {
  const camCfg = { video: true, audio: false };
  videoTag.srcObject = await navigator.mediaDevices.getUserMedia(camCfg);
}

onMounted(async () => {
  await tf.ready();
  // await tf.setBackend('webgpu')
  l(tf.getBackend());

  stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom)
  stats.dom.style.position = 'absolute'
  stats.dom.style.top = '0px'
  stats.dom.style.left = '100px'

  videoTag = videoRef.value;
  canvasTag = canvasRef.value;
  ctx = canvasTag.getContext('2d');
  ctx!.strokeStyle = 'red';
  ctx!.fillStyle = 'red';

  setupCamera();
  const model = await handpose.load();
  l('handpose is loaded');

  const loop = async () => {
    l('loop');
    stats.begin();
    const predictions = await model.estimateHands(videoTag);
    stats.end();
    if (predictions.length > 0) {
      const result = predictions[0].landmarks;
      ctx?.clearRect(0, 0, vw, vh);
      drawKeypoints(result);
    }

    if (!videoTag.paused) setTimeout(loop, 10);
  }
  loop();

  videoTag.onplay = () => {
    [vw, vh] = [videoTag.videoWidth, videoTag.videoHeight];
    [canvasTag.width, canvasTag.height] = [vw, vh]
    loop();
  }

})

</script>

<template>
  <video ref="videoRef" autoplay></video>
  <canvas ref="canvasRef"></canvas>
  <button @click="videoTag.pause">Stop</button>
  <button @click="videoTag.play">Play</button>
</template>

<style scoped>
video,
canvas {
  position: absolute;
  top: 50px;
  left: 0px;
  width: 640px;
  height: 480px;
}
</style>
