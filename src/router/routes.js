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
        name: 'dahsboard',
      },
      {
        path: 'orders',
        component: () => import('src/pages/dashboard/orders/OrdersPage.vue'),
        name: 'orders',
      },
      {
        path: 'show/:id/orders',
        component: () => import('src/pages/dashboard/orders/ShowOrderPage.vue'),
        name: 'showOrder',
      },
      {
        path: 'users',
        component: () => import('src/pages/dashboard/users/MainPage.vue'),
        name: 'users',
      },
      {
        path: 'couriers',
        component: () => import('src/pages/dashboard/couriers/MainPage.vue'),
        name: 'couriers',
      },
      {
        path: 'senders',
        component: () => import('src/pages/dashboard/senders/SendersPage.vue'),
        name: 'senders',
      },
      {
        path: 'cities-and-zones',
        component: () => import('src/pages/dashboard/cities/CitiesPage.vue'),
        name: 'city',
      },
      {
        path: 'clients',
        component: () => import('src/pages/dashboard/clients/ClientsPage.vue'),
        name: 'clients',
      },
      {
        path: 'shipping-list',
        component: () => import('src/pages/dashboard/shipping-list/ShippingListPage.vue'),
        name: 'shipping-list',
      },
      {
        path: 'shipping-list/:id/show',
        component: () => import('src/pages/dashboard/shipping-list/ShippingListPage.vue'),
        name: 'shipping-list-show',
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
