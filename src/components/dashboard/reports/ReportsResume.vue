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
        <div class="filters__item" v-if="route.query.type && route.query.type === 'courier'">
          <q-select @update:model-value="filterByCourier" :label="t('selectOneOption')" outlined round dense
            v-model="courier" :options="couriersOptions">
          </q-select>
        </div>
        <!--End courier filter-->

        <!--Date filter-->
        <div class="filters__item">
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

        </div>
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
import { useRoute } from 'vue-router';
import { ref, nextTick, onBeforeMount } from 'vue';
import DiaryReport from './components/DiaryReport.vue';
import { couriersContent } from 'src/composables/couriersContent';

// references
const courier = ref('');
const { t } = useI18n();
const render = ref(true);
const route = useRoute();
const dateLabel = ref('');
const dateReference = ref();
const couriersOptions = ref([]);
const courierContent = couriersContent();
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

// hook
onBeforeMount(async () => {
  if (route.query.type && route.query.type === 'courier') {
    const data = await courierContent.doListCourierForSelect();
    if (data && data.success) {
      couriersOptions.value = data.couriers.map((el) => {
        return {
          label: el.name,
          value: el._id,
        }
      });
    }
  };
});
</script>

<style scoped lang="scss">
.filters {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;

  &__item {
    flex: 1;
  }
}
</style>
