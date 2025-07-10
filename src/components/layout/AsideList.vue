<template>
  <aside>
    <!--Lista principal-->
    <q-list separator class="main-list">
      <q-item clickable v-ripple to="/dashboard">
        <q-item-section>
          <q-item-label class="text-primary">
            {{ t('dashboard') }}
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-icon color="primary" name="dashboard"></q-icon>
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple>
        <q-item-section>
          <q-item-label class="text-primary">
            {{ t('orders') }}
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-icon color="primary" name="local_shipping"></q-icon>
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple>
        <q-item-section>
          <q-item-label class="text-primary">
            {{ t('shippingList') }}
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-icon color="primary" name="receipt_long"></q-icon>
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple>
        <q-item-section>
          <q-item-label class="text-primary">
            {{ t('sender') }}
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-icon color="primary" name="store"></q-icon>
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple>
        <q-item-section>
          <q-item-label class="text-primary">
            {{ t('client') }}
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-icon color="primary" name="groups_2"></q-icon>
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple>
        <q-item-section>
          <q-item-label class="text-primary">
            {{ t('track') }}
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-icon color="primary" name="map"></q-icon>
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple to="/dashboard/users">
        <q-item-section>
          <q-item-label class="text-primary">
            {{ t('user') }}
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-icon color="primary" name="person"></q-icon>
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple>
        <q-item-section>
          <q-item-label class="text-primary">
            {{ t('reports') }}
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-icon color="primary" name="bar_chart"></q-icon>
        </q-item-section>
      </q-item>
    </q-list>
    <!--End lista principal-->


    <!--logout btn-->
    <q-list class="logout-list" @click="handlerLogout">
      <q-item clickable v-ripple>
        <q-item-section>
          <q-item-label class="text-primary">
            {{ t('logout') }}
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-icon color="red" name="logout"></q-icon>
        </q-item-section>
      </q-item>
    </q-list>
    <!--End logout btn-->
  </aside>
</template>

<script setup>
// imports
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/authStore';
import { useQuasar } from 'quasar';

// references
const q = useQuasar();
const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

// methods
const handlerLogout = () => {
  q.dialog({
    title: t('closeSessionTitle'),
    message: t('sureCloseSesion'),
    cancel: true,
  }).onOk(() => {
    authStore.doLogout();
    router.push('/');
  });
}
</script>

<style class="scss" lang="scss">
aside {
  position: relative;
  height: 100%;


  .logout-list {
    position: absolute;
    bottom: 60px;
    left: 0;
    width: 100%;
  }

  .q-item__label {
    font-size: 1rem;
    font-weight: 600;
  }
}
</style>
