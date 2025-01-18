import { createRouter, createWebHistory } from "vue-router";

// Importiere deine Komponenten
import StartView from "@/views/StartView.vue";
import GameView from "@/views/GameView.vue";
import InstructionsView from "@/views/InstructionsView.vue";

const routes = [
  {
    path: "/",
    name: "StartView",
    component: StartView,
  },
  {
    path: "/game",
    name: "GameView",
    component: GameView,
  },
  {
    path: "/instructions",
    name: "InstructionsView",
    component: InstructionsView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
