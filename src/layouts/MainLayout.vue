<template>
  <q-layout view="hHh LpR lFf">
    <!--Header-->
    <q-header v-if="route.path !== '/' && route.path !== '/register'">
      <q-toolbar class="bg-primary">
        <q-btn flat dense round color="white" icon="menu" aria-label="Menu" @click="toggleDrawer" />

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

    <!--Plan dialog-->
    <q-dialog v-model="showPlanModal" persistent>
      <PlansCard />
    </q-dialog>
    <!--End plan dialog-->

    <!--Main content-->
    <q-page-container>
      <router-view />
    </q-page-container>
    <!--End main content-->
  </q-layout>
</template>

<script setup>
// imports
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { computed, onBeforeMount, ref } from 'vue';
import { useAuthStore } from 'src/stores/authStore';
import AsideList from 'src/components/layout/AsideList.vue';
import PlansCard from 'src/components/layout/PlansCard.vue';
import NotificationList from 'src/components/layout/NotificationList.vue';

// references
const q = useQuasar();
const { t } = useI18n();
const route = useRoute();
const miniMode = ref(true);
const authStore = useAuthStore();
const showPlanModal = ref(false);
const leftDrawerOpen = ref(false);

// computed
const user = computed(() => authStore.getUser);


// methods
function toggleDrawer() {
  if (q.screen.lt.md) {
    leftDrawerOpen.value = !leftDrawerOpen.value;
  } else {
    miniMode.value = !miniMode.value;
  }
}

// hook
onBeforeMount(() => {
  if (route.path.includes('/dashboard') && !user.value.subscription) {
    showPlanModal.value = true;
  };
});
</script>
