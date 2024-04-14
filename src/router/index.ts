import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { getToken } from '@/utils/auth';

const Layout = () => import('@/views/Layout/index.vue');
const Login = () => import('@/views/Login/index.vue');
const NotFound = () => import('@/views/Error/404.vue');

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: Login },
  { path: '/404', name: 'notFound', component: NotFound },
  { path: '/:pathMatch(.*)', redirect: '/404' },
  { path: '/', name: 'layout', component: Layout }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach(async (to, from) => {
  NProgress.start();
  if (!getToken() && to.path !== '/login') return { path: '/login' };
  if (to.path === '/login') {
    if (getToken()) return { path: '/' };
    return true;
  }
  return true;
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
