<script setup>
import { onMounted, ref, onBeforeUnmount } from "vue";
import { Resources } from "./webgl/core/Resources";
import { Experience } from "./webgl/Experience";
import { ASSETS_MANIFEST } from "./config/assets";

const canvasRef = ref(null);
const loadProgress = ref(0);
const isReady = ref(false);
let experience = null;

onMounted(() => {
  const resources = new Resources(ASSETS_MANIFEST);

  resources.addEventListener("progress", (e) => {
    loadProgress.value = Math.round(e.detail.progress * 100);
  });

  resources.addEventListener("ready", () => {
    isReady.value = true;
    if (canvasRef.value) {
      // Inyectar recursos cargados directamente a la experiencia
      experience = new Experience(canvasRef.value, resources);
    }
  });

  resources.startLoading();
});

onBeforeUnmount(() => {
  experience?.destroy();
});
</script>

<template>
  <main
    class="w-full h-screen relative bg-slate-950 overflow-hidden font-sans select-none"
  >
    <canvas ref="canvasRef" class="w-full h-full block outline-none" />

    <div
      v-if="!isReady"
      class="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 z-50"
    >
      <div class="w-72 space-y-3">
        <div class="flex justify-between text-xs tracking-wide text-slate-400">
          <span class="font-medium text-slate-300"
            >Inicializando entorno 3D</span
          >
          <span>{{ loadProgress }}%</span>
        </div>

        <div class="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            class="h-full bg-slate-400 transition-all duration-150 ease-out"
            :style="{ width: `${loadProgress}%` }"
          ></div>
        </div>
      </div>
    </div>
  </main>
</template>
