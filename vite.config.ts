import vue from '@vitejs/plugin-vue'
import cesium from 'vite-plugin-cesium'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'

const cesiumPlugin = cesium as unknown as () => Plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), cesiumPlugin()],
})
