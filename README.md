# Vue 3 + TypeScript + Vite

演示：https://beat-the-buzzer.github.io/cesium-demo/

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).


实际可以使用的一些方法、开关

```js
viewer.scene.morphTo2D() // ===> 切换成2D 
viewer.scene.morphTo3D()  // ===> 切换成3D
viewer.scene.morphToColumbusView() // ===> 切换成哥伦布视图

viewer.scene.fog.enable = true // false 是否展示雾效果 提升性能
viewer.scene.globe.enableLighting = true // false 是否展示白天黑夜
viewer.scene.highDynamicRange = true // false 高动态范围
viewer.scene.globe.showGroundAtmosphere= true // false 大气层效果

viewer.scene.debugShowFramesPerSecond = true; // false 是否展示FPS面板

```