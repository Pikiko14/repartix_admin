const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/LoginPage.vue') },
      { path: '/register', component: () => import('pages/RegisterPage.vue') }
    ]
  },
  {
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/dashboard/MainRepartix.vue'),
        name: 'dahsboard'
      },
      {
        path: 'users',
        component: () => import('src/pages/dashboard/users/MainPage.vue'),
        name: 'users'
      },
    ],
    meta: {
      auth: true,
    },
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
