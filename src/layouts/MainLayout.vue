<template>
  <q-layout view="hHh LpR lFf">
    <!--Header-->
    <q-header v-if="route.path !== '/' && route.path !== '/register'">
      <q-toolbar class="bg-primary">
        <q-btn flat dense round color="white" icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-white text-bold">
          RepartiX
        </q-toolbar-title>

        <!--Notifications-->
        <q-btn icon="notifications" flat dense rounded color="white" class="q-mr-sm">
          <q-menu transition-show="rotate" transition-hide="rotate" class="border-rounded">
            <NotificationList />
          </q-menu>
          <q-tooltip class="bg-primary">
            {{ t('notification') }}
          </q-tooltip>
        </q-btn>
        <!--End notifications-->

        <!--Perfil-->
        <q-btn icon="person" flat dense rounded color="white">
          <q-tooltip class="bg-primary">
            {{ t('profile') }}
          </q-tooltip>
        </q-btn>
        <!--Perfil-->
      </q-toolbar>
    </q-header>
    <!--end Header-->

    <!--Drawer-->
    <q-drawer :mini="miniMode" :width="240" v-if="route.path !== '/' && route.path !== '/register'"
      v-model="leftDrawerOpen" show-if-above bordered>
      <AsideList />
    </q-drawer>
    <!--End drawer-->

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
// imports
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import AsideList from 'src/components/layout/AsideList.vue';
import NotificationList from 'src/components/layout/NotificationList.vue';
import { useQuasar } from 'quasar';

// references
const q = useQuasar();
const { t } = useI18n();
const route = useRoute();
const miniMode = ref(true);
const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  if (q.screen.lt.md) {
    leftDrawerOpen.value = !leftDrawerOpen.value;
  } else {
    miniMode.value = !miniMode.value;
  }
}
</script>
