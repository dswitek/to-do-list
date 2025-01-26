import Vue from "vue";
import Router from "vue-router";
import Login from "@/components/Login.vue";
import Register from "@/components/Register.vue";
import TodoList from "@/components/TodoList.vue";
import CreateList from '../components/CreateList.vue';
Vue.use(Router);

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: "/todo",
    name: "todo",
    component: TodoList,
    meta: { requiresAuth: true },
  },
  {
    path: "/register",
    name: "register",
    component: Register,
    meta: { requiresAuth: false },
  },
  {
    path: "/create-list",
    name: "create-list",
    component: CreateList,
  },
];

const router = new Router({
  mode: "history",
  routes,
});

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem("loggedInUsername");

  if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
    next({ name: "login" });
  } else if ((to.name === "login" || to.name === "register") && isLoggedIn) {
    if (from.name !== "todo") {
      next({ name: "todo" });
    } else {
      next();
    }
  } else {
    next();
  }
});



export default router;
