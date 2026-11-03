/**
 * Configuración de dimensiones y límites de la oficina.
 */

export const OFFICE_BOUNDS = {
  width: 18,
  depth: 14,
  height: 0.6,
  floorColor: "#1A1E29", // Gris azulado mate
  gridColor: "#2C3446",
};

export const AGENT_STATIONS = {
  backend: {
    id: "backend",
    name: "Backend Dev",
    role: "C# ASP.NET Core & APIs",
    color: "#3B82F6",
    position: { x: -4, y: 0, z: 2 },
    rotation: { y: 0 },
  },
  frontend: {
    id: "frontend",
    name: "Frontend Dev",
    role: "Vue 3 + Tailwind CSS",
    color: "#10B981",
    position: { x: 0, y: 0, z: 2 },
    rotation: { y: 0 },
  },
  devops: {
    id: "devops",
    name: "Database / DevOps",
    role: "Migrations, Docker & CI/CD",
    color: "#F59E0B",
    position: { x: -2, y: 0, z: 5 },
    rotation: { y: Math.PI },
  },
  supervisor: {
    id: "supervisor",
    name: "Supervisor IA",
    role: "Task Reviewer & Orchestrator",
    color: "#8B5CF6",
    position: { x: 5.5, y: 0, z: -3 },
    rotation: { y: -Math.PI / 4 },
  },
};
