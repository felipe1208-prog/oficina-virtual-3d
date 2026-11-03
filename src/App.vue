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
    // Inicializar el motor 3D una vez los recursos están en caché
    if (canvasRef.value) {
      experience = new Experience(canvasRef.value);
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
    <!-- Canvas 3D -->
    <canvas ref="canvasRef" class="w-full h-full block outline-none" />

    <!-- Pantalla de carga sobria y minimalista -->
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
