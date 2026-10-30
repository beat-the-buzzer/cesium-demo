<template>
  <div>
    <div class="custom-controls">
      <div class="cesium-button custom-btn" title="飞到示例点" @click="flyToExamplePoint">
        飞到示例点(0米)
      </div>
      <div class="cesium-button custom-btn" title="飞到指定坐标和高度" @click="flyToSpecifiedPosition">
        飞到指定坐标和高度(1500000米)
      </div>
      <div class="cesium-button custom-btn" title="瞬间跳转到指定坐标和高度" @click="jumpToSpecifiedPosition">
        瞬间跳转到指定坐标和高度(1000米)
      </div>
    </div>
    <div id="cesiumContainer"></div>
  </div>
</template>

<script setup lang="ts">

import { onMounted, shallowRef } from 'vue';
import * as Cesium from 'cesium';

let myPoint: Cesium.Entity | undefined;
const viewer = shallowRef<Cesium.Viewer | null>(null);

// 飞向该实体位置
function flyToExamplePoint() {
  if (!viewer.value || !myPoint) return;

  viewer.value.flyTo(myPoint, {
    offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-90), 2000)
  });
}

// 飞向指定坐标和高度
function flyToSpecifiedPosition() {
  viewer.value?.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 1500000), // 精度 纬度 高度
    easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT, // 缓动函数
    duration: 3, // 飞行时间（秒），默认自动计算
    complete: function () {
      // 飞行完成后的回调函数
      console.log('飞行完成');
    },
    cancel: function () {
      // 飞行被取消后的回调函数
      console.log('飞行被取消');
    }
  });
}

// 瞬间跳转到指定坐标和高度
function jumpToSpecifiedPosition() {
  viewer.value?.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 1000), // 精度 纬度 高度
    orientation: {
      heading: Cesium.Math.toRadians(0),   // 正北方向
      pitch: Cesium.Math.toRadians(-45),   // 俯视 45 度
      roll: 0                              // 不翻滚
    }
  });
}

onMounted(() => {
  // console.log(Cesium)
  // Cesium.Ion.defaultAccessToken = 'YOUR_TOKEN_HERE';
  const currentViewer = new Cesium.Viewer('cesiumContainer', {
    // terrain: Cesium.Terrain.fromWorldTerrain(), // 使用全球地形
    // baseLayer: Cesium.ImageryLayer.fromWorldImagery({}), // 使用全球影像
    // animation: false,       // 关闭底部动画控件
    // timeline: false,        // 关闭底部时间轴控件
    // fullscreenButton: false, // 关闭底部全屏按钮
    // baseLayerPicker: false, // 关闭右上角图层选择器
    // geocoder: false, // 关闭右上角搜索框
    // homeButton: false, // 关闭右上角主页按钮
    // navigationHelpButton: false, // 关闭右上角问号帮助按钮
    // sceneModePicker: false, // 关闭右上角地球场景切换按钮
  });
  viewer.value = currentViewer;
  // currentViewer.scene.debugShowFramesPerSecond = true; // 展示fps
  (currentViewer.cesiumWidget.creditContainer as HTMLElement).style.display = "none"; // 底部logo 版权等信息隐藏

  // 添加一个实体（详见中文版 API：Entity、Cartesian3、Color）
  myPoint = currentViewer.entities.add({
    name: '示例点(北京)',
    position: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 100),
    point: { pixelSize: 12, color: Cesium.Color.RED },
    label: { text: '北京', font: '16pt sans-serif', pixelOffset: new Cesium.Cartesian2(0, -24) }
  });

  // 示例数据：时间、经度（度）、纬度（度）、高度（米）
  // 这里只演示绘制方式，请替换成真实卫星轨道数据。
  const samples = [
    { time: "2026-10-28T00:00:00Z", lon: 110, lat: 20, height: 500000 },
    { time: "2026-10-28T00:01:00Z", lon: 114, lat: 23, height: 501000 },
    { time: "2026-10-28T00:02:00Z", lon: 118, lat: 26, height: 502000 },
    { time: "2026-10-28T00:03:00Z", lon: 122, lat: 29, height: 501000 },
    { time: "2026-10-28T00:04:00Z", lon: 126, lat: 32, height: 500000 },
  ];

  const position = new Cesium.SampledPositionProperty();

  for (const sample of samples) {
    position.addSample(
      Cesium.JulianDate.fromIso8601(sample.time),
      Cesium.Cartesian3.fromDegrees(
        sample.lon,
        sample.lat,
        sample.height
      )
    );
  }

  const start = Cesium.JulianDate.fromIso8601(samples[0].time);
  const stop = Cesium.JulianDate.fromIso8601(
    samples[samples.length - 1].time
  );
  const duration = Cesium.JulianDate.secondsDifference(stop, start);

  // 配置播放时间
  currentViewer.clock.startTime = start.clone();
  currentViewer.clock.stopTime = stop.clone();
  currentViewer.clock.currentTime = start.clone();
  currentViewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
  currentViewer.clock.multiplier = 10;
  currentViewer.clock.shouldAnimate = true;
  currentViewer.timeline.zoomTo(start, stop);

  console.log(start, stop, duration, position);

  // 创建卫星及其轨迹
  currentViewer.entities.add({
    name: "卫星",
    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({ start, stop }),
    ]),
    position,

    point: {
      pixelSize: 10,
      color: Cesium.Color.YELLOW,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 1,
    },

    path: {
      show: true,
      width: 2,
      material: Cesium.Color.CYAN,
      resolution: 5,       // 轨迹采样时间步长，单位秒
      leadTime: duration,  // 显示前方轨迹
      trailTime: duration, // 显示后方轨迹
    },
  });

  currentViewer.zoomTo(currentViewer.entities);
});



</script>



<style scoped>
#cesiumContainer {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}


/* 自定义控制栏样式 */
.custom-controls {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  display: flex;
  gap: 10px;
}

/* 确保按钮继承 Cesium 风格并增加一些自定义效果 */
.custom-btn {
  padding: 8px 12px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
}

.custom-btn:hover {
  background-color: rgba(30, 30, 30, 0.8);
  transform: translateY(-2px);
}
</style>
