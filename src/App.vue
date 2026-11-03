<script setup>
import { onMounted, ref, reactive, onBeforeUnmount } from "vue";
import { Resources } from "./webgl/core/Resources";
import { Experience } from "./webgl/Experience";
import { ASSETS_MANIFEST } from "./config/assets";
import { AGENT_STATIONS } from "./config/officeLayout";

const canvasRef = ref(null);
const loadProgress = ref(0);
const isReady = ref(false);
const selectedAgentId = ref(null);
const timeMode = ref("auto"); // 'day' | 'night' | 'auto'

// Estados reactivos sincronizados con la FSM de cada agente
const agentStates = reactive({
  architect: "WORKING",
  backend: "WORKING",
  frontend: "WORKING",
  qa: "WORKING",
});

let experience = null;

onMounted(() => {
  const resources = new Resources(ASSETS_MANIFEST);

  resources.addEventListener("progress", (e) => {
    loadProgress.value = Math.round(e.detail.progress * 100);
  });

  resources.addEventListener("ready", () => {
    isReady.value = true;
    if (canvasRef.value) {
      experience = new Experience(
        canvasRef.value,
        resources,
        (agentId) => {
          selectedAgentId.value = agentId;
        },
        (agentId, status) => {
          agentStates[agentId] = status;
        },
      );
    }
  });

  resources.startLoading();
});

function setAgentStatus(status) {
  if (!selectedAgentId.value || !experience) return;
  experience.setAgentStatus(selectedAgentId.value, status);
}

function sendSelectedAgentToWater() {
  if (!selectedAgentId.value || !experience) return;
  experience.sendAgentToWater(selectedAgentId.value);
}

function setLightingMode(mode) {
  timeMode.value = mode;
  if (!experience) return;

  if (mode === "day") {
    experience.setDayNightFactor(0.0, false);
  } else if (mode === "night") {
    experience.setDayNightFactor(0.5, false);
  } else if (mode === "auto") {
    experience.setDayNightFactor(0.0, true);
  }
}

onBeforeUnmount(() => {
  experience?.destroy();
});
</script>

<template>
  <main
    class="w-full h-screen relative bg-slate-950 overflow-hidden font-sans select-none text-slate-200"
  >
    <canvas ref="canvasRef" class="w-full h-full block outline-none" />

    <!-- Barra de carga inicial -->
    <div
      v-if="!isReady"
      class="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 z-50"
    >
      <div class="w-72 space-y-3">
        <div class="flex justify-between text-xs tracking-wide text-slate-400">
          <span class="font-medium text-slate-300"
            >Inicializando Oficina 3D</span
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

    <!-- Barra superior de control ambiental (Día / Noche) -->
    <header
      v-if="isReady"
      class="absolute top-6 left-6 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-800 shadow-xl z-20"
    >
      <div class="flex flex-col pr-2 border-r border-slate-800">
        <span
          class="text-[10px] tracking-wider uppercase font-semibold text-slate-400"
          >Ambiente</span
        >
        <span class="text-xs font-medium text-slate-200">Ciclo Solar</span>
      </div>

      <div class="flex items-center gap-1.5">
        <button
          @click="setLightingMode('day')"
          :class="[
            'px-2.5 py-1.5 rounded text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5',
            timeMode === 'day'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50',
          ]"
        >
          <span>☀️</span> Día
        </button>

        <button
          @click="setLightingMode('night')"
          :class="[
            'px-2.5 py-1.5 rounded text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5',
            timeMode === 'night'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50',
          ]"
        >
          <span>🌙</span> Noche
        </button>

        <button
          @click="setLightingMode('auto')"
          :class="[
            'px-2.5 py-1.5 rounded text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5',
            timeMode === 'auto'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50',
          ]"
        >
          <span>🔄</span> Auto
        </button>
      </div>
    </header>

    <!-- Panel lateral interactivo del agente seleccionado -->
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
        class="absolute top-6 right-6 w-96 p-5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl z-20"
      >
        <!-- Cabecera -->
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
            class="text-slate-400 hover:text-slate-200 p-1 text-sm rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- Información y acciones -->
        <div class="mt-4 space-y-4 text-xs">
          <!-- Estado en Vivo -->
          <div>
            <span class="text-slate-400 uppercase tracking-wider text-[10px]"
              >Estado Actual</span
            >
            <div class="flex items-center gap-2 mt-1">
              <span
                class="px-2.5 py-1 rounded font-medium text-xs tracking-wide transition-colors"
                :class="{
                  'bg-emerald-950/80 text-emerald-400 border border-emerald-800':
                    agentStates[selectedAgentId] === 'WORKING',
                  'bg-amber-950/80 text-amber-400 border border-amber-800':
                    agentStates[selectedAgentId] === 'THINKING',
                  'bg-slate-800 text-slate-300 border border-slate-700':
                    agentStates[selectedAgentId] === 'IDLE',
                  'bg-sky-950/80 text-sky-400 border border-sky-800': [
                    'WALKING',
                    'BREAK',
                    'RETURNING',
                    'LEAVING_DESK',
                    'SITTING_DOWN',
                  ].includes(agentStates[selectedAgentId]),
                }"
              >
                ● {{ agentStates[selectedAgentId] }}
              </span>
            </div>
          </div>

          <!-- Modos en Escritorio -->
          <div>
            <span class="text-slate-400 uppercase tracking-wider text-[10px]"
              >Forzar Comportamiento</span
            >
            <div class="grid grid-cols-3 gap-2 mt-1.5">
              <button
                @click="setAgentStatus('WORKING')"
                class="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded text-[11px] font-medium text-slate-200 transition-colors cursor-pointer"
              >
                Working
              </button>
              <button
                @click="setAgentStatus('THINKING')"
                class="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded text-[11px] font-medium text-slate-200 transition-colors cursor-pointer"
              >
                Thinking
              </button>
              <button
                @click="setAgentStatus('IDLE')"
                class="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded text-[11px] font-medium text-slate-200 transition-colors cursor-pointer"
              >
                Idle
              </button>
            </div>
          </div>

          <!-- Movilidad por Pasillos -->
          <div>
            <span class="text-slate-400 uppercase tracking-wider text-[10px]"
              >Movilidad por la Oficina</span
            >
            <button
              @click="sendSelectedAgentToWater"
              class="w-full mt-1.5 px-3 py-2 bg-sky-950/70 hover:bg-sky-900 border border-sky-800 rounded text-xs font-medium text-sky-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>💧</span> Enviar al Dispensador de Agua
            </button>
          </div>

          <!-- Directorio Asignado -->
          <div>
            <span class="text-slate-400 uppercase tracking-wider text-[10px]"
              >Directorio asignado</span
            >
            <p
              class="mt-1 px-2.5 py-1.5 rounded bg-slate-950/70 border border-slate-800 text-slate-300 font-mono text-[11px]"
            >
              agents-workspace/{{
                AGENT_STATIONS[selectedAgentId].name
                  .split(" ")[0]
                  .toLowerCase()
              }}/
            </p>
          </div>
        </div>
      </aside>
    </transition>
  </main>
</template>
