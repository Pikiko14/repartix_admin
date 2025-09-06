<template>
  <section class="row">
    <!--header-->
    <div class="col-12 col-md-5">
      <h2 class="text-primary page-title">
        {{ t('diaryOder') }}
      </h2>
    </div>
    <div class="col-md-7">
      <section class="filters">
        <!--Courier filter-->
        <q-input debounce="1500" @update:model-value="filterByCourier" placeholder="Jhon Doe" outlined round dense v-model="courier"
          v-if="route.query.type && route.query.type === 'courier'"></q-input>
        <!--End courier filter-->

        <!--Date filter-->
        <q-input @click="dateReference.toggle()" placeholder="####/##/##" mask="####/##/##" outlined dense
          v-model="dateLabel">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy ref="dateReference" cover transition-show="scale" transition-hide="scale">
                <q-date @update:model-value="filterByDate" v-model="dateNow">
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <!--End date filter-->
      </section>
    </div>
    <!--End header-->

    <!--body-->
    <DiaryReport :courier="courier" :date-now="dateNow"
      v-if="route.path === '/dashboard/reports/diary-order' && render" />
    <!--end body-->
  </section>
</template>

<script setup>
// imports
import { date } from 'quasar';
import { useI18n } from 'vue-i18n';
import { ref, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import DiaryReport from './components/DiaryReport.vue';

// references
const courier = ref('');
const { t } = useI18n();
const render = ref(true);
const route = useRoute();
const dateLabel = ref('');
const dateReference = ref();
const dateNow = ref(date.formatDate(new Date(), 'YYYY/MM/DD'));

// methods
const filterByDate = async (val) => {
  dateNow.value = val;
  dateReference.value?.hide();
  dateLabel.value = `${val}`;
  render.value = false;
  await nextTick();
  render.value = true;
}

const filterByCourier = async (val) => {
  courier.value = val;
  render.value = false;
  await nextTick();
  render.value = true;
}
</script>

<style scoped lang="scss">
.filters {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>
