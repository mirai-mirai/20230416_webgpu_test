<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-backend-webgpu'

const logRef = ref();
const size = ref(100);
const repeat = ref(10);
const backend = ref('webgl');
const interval = ref(100);

let logTag: HTMLDivElement;
const l = (m: any) => { logTag.innerText += m + '\n' }
const l_ = (m: any) => { logTag.innerText += m }

onMounted(async () => {
  logTag = logRef.value;
})

const calc = async () => {
  const results: number[] = [];
  logTag.innerText = '';
  await tf.ready();
  l("Tensorflow ready.")
  await tf.setBackend(backend.value);
  l("Backend set to " + tf.getBackend() + '.');
  l("Initialization complete.");
  l("============")

  const getRndArray = (size: number) => {
    let arr: Array<number> = [];
    for (let i = 0; i < size; i++) arr[i] = Math.random();
    return arr;
  }

  const s = size.value;
  const getMatrix = () => tf.tensor2d(getRndArray(s * s), [s, s]);

  let rep = 0;
  const loop = async () => {
    const t1 = Date.now();
    const res = tf.tidy(() => {
      const a = getMatrix();
      const b = getMatrix();
      let c;
      for (let i = 0; i < repeat.value; i++) c = tf.matMul(a, b);
      return c;
    });
    const data = await res!.data();
    results[rep] = Date.now() - t1;
    l((rep + 1) + ': ' + results[rep] + 'ms')

    if (rep < 10 - 1) {
      rep++;
      setTimeout(loop, interval.value);
    } else {
      const average = results.reduce((a, b) => a + b, 0) / results.length;
      l("============")
      l("Average: " + average + "ms")
    }

  }
  loop();

  // l(await res!.data());

}
</script>

<template>
  <div>
    <h1>SpeedTest: WebGL vs WebGPU</h1>
    <br>
    <table>
      <tr>
        <td>Backend</td>
        <td>
          <select v-model="backend">
            <option>webgl</option>
            <option>webgpu</option>
          </select>
        </td>
      </tr>
      <tr>
        <td>MatrixSize</td>
        <td>
          <select v-model.number="size">
            <option>100</option>
            <option>300</option>
            <option>500</option>
            <option>1000</option>
            <option>1500</option>
            <option>2000</option>
          </select>
        </td>
      </tr>
      <tr>
        <td>RepeatTimes　</td>
        <td>
          <select v-model.number="repeat">
            <option>10</option>
            <option>30</option>
            <option>100</option>
            <option>200</option>
            <option>300</option>
          </select><br>
        </td>
      </tr>
      <tr>
        <td>Interval(ms) </td>
        <td>
          <select v-model.number="interval">
            <option>0</option>
            <option>100</option>
            <option>200</option>
            <option>500</option>
            <option>1000</option>
          </select><br>
        </td>
      </tr>
    </table>

    <br>
    <button @click="calc()">Calc</button><br>

  </div>
  <div id="log" ref="logRef"></div>
</template>

<style scoped>
h1 {
  text-shadow: 1px 2px 3px rgb(142, 142, 142);
}

div {
  margin: 10px;
}

select {
  width: 80px;
}

button {
  width: 150px;
}

#log {
  padding: 5px;
  margin: 10px;
  height: 50vh;
  background: linear-gradient(to bottom, rgba(80, 80, 80, 255), rgba(0, 0, 0, 0))
}
</style>
