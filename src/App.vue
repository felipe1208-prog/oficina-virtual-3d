<script setup>
import { onMounted, ref } from "vue";
import { Resources } from "./webgl/core/Resources";
import { ASSETS_MANIFEST } from "./config/assets";

const loadProgress = ref(0);
const isLoaded = ref(false);

onMounted(() => {
  const resources = new Resources(ASSETS_MANIFEST);

  resources.addEventListener("progress", (e) => {
    loadProgress.value = Math.round(e.detail.progress * 100);
    console.log(
      `[Cargando] ${e.detail.name}: ${loadProgress.value}% (${e.detail.loaded}/${e.detail.total})`,
    );
  });

  resources.addEventListener("ready", () => {
    isLoaded.value = true;
    console.log(
      "✅ [Resources] Todos los modelos 3D se cargaron correctamente en memoria.",
    );
  });

  resources.startLoading();
});
</script>

<template>
  <main
    class="w-full h-screen relative bg-slate-950 flex flex-col items-center justify-center text-slate-200 font-mono"
  >
    <div class="w-80 space-y-3">
      <div
        class="flex justify-between text-xs tracking-wider uppercase text-slate-400"
      >
        <span>Cargando modelos 3D</span>
        <span>{{ loadProgress }}%</span>
      </div>

      <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          class="h-full bg-emerald-500 transition-all duration-150 ease-out"
          :style="{ width: `${loadProgress}%` }"
        ></div>
      </div>

      <p
        v-if="isLoaded"
        class="text-xs text-emerald-400 text-center animate-pulse pt-2"
      >
        Assets listos en memoria.
      </p>
    </div>
  </main>
</template>
