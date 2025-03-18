<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated v-if="route.path !== '/' && route.path !== '/register'">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Quasar App
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="route.path !== '/' && route.path !== '/register'"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
// imports
import { ref } from 'vue'
import { useRoute } from 'vue-router'

// references
const route = useRoute()
const leftDrawerOpen = ref(false)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
