<script setup>
import { onMounted, ref, onBeforeUnmount } from "vue";
import { Resources } from "./webgl/core/Resources";
import { Experience } from "./webgl/Experience";
import { ASSETS_MANIFEST } from "./config/assets";
import { AGENT_STATIONS } from "./config/officeLayout";

const canvasRef = ref(null);
const loadProgress = ref(0);
const isReady = ref(false);
const selectedAgentId = ref(null);
let experience = null;

onMounted(() => {
  const resources = new Resources(ASSETS_MANIFEST);

  resources.addEventListener("progress", (e) => {
    loadProgress.value = Math.round(e.detail.progress * 100);
  });

  resources.addEventListener("ready", () => {
    isReady.value = true;
    if (canvasRef.value) {
      experience = new Experience(canvasRef.value, resources, (agentId) => {
        selectedAgentId.value = agentId;
      });
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
    class="w-full h-screen relative bg-slate-950 overflow-hidden font-sans select-none text-slate-200"
  >
    <!-- Lienzo 3D -->
    <canvas ref="canvasRef" class="w-full h-full block outline-none" />

    <!-- Barra de carga minimalista inicial -->
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

    <!-- Panel lateral informativo (Drawer sobrio al hacer clic en un puesto) -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-x-8"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-8"
    >
      <aside
        v-if="selectedAgentId && AGENT_STATIONS[selectedAgentId]"
        class="absolute top-6 right-6 w-96 p-5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl"
      >
        <div
          class="flex items-start justify-between pb-3 border-b border-slate-800"
        >
          <div>
            <div class="flex items-center gap-2">
              <span
                class="w-2.5 h-2.5 rounded-full"
                :style="{
                  backgroundColor: AGENT_STATIONS[selectedAgentId].color,
                }"
              ></span>
              <h2 class="font-semibold text-base text-slate-100">
                {{ AGENT_STATIONS[selectedAgentId].name }}
              </h2>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">
              {{ AGENT_STATIONS[selectedAgentId].role }}
            </p>
          </div>

          <button
            @click="experience?.handleStationSelect(null)"
            class="text-slate-400 hover:text-slate-200 p-1 text-sm rounded hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <div class="mt-4 space-y-4 text-xs">
          <div>
            <span class="text-slate-400 uppercase tracking-wider text-[10px]"
              >Estado</span
            >
            <div class="flex items-center gap-2 mt-1">
              <span
                class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium"
              >
                IDLE (En espera)
              </span>
            </div>
          </div>

          <div>
            <span class="text-slate-400 uppercase tracking-wider text-[10px]"
              >Directorio asignado</span
            >
            <p
              class="mt-1 px-2.5 py-1.5 rounded bg-slate-950/70 border border-slate-800 text-slate-300"
            >
              agents-workspace/{{
                AGENT_STATIONS[selectedAgentId].name.split(" ")[0]
              }}/
            </p>
          </div>
        </div>
      </aside>
    </transition>
  </main>
</template>
