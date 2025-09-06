<template>
  <article class="report-card">
    <header>
      <h4>
        {{ title }}
      </h4>
    </header>
    <body class="row">
      <div class="col-12 col-md-6">
        <q-list dense>
          <q-item class="q-pa-none" clickable v-ripple v-for="(item, idx) in reportList" :key="idx" :to="item.to">
            <q-item-section>
              <q-item-label>
                {{ item.label }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </body>
  </article>
</template>

<script setup>
// props
defineProps({
  reportList: Array,
  title: String,
});
</script>

<style scoped lang="scss">
.report-card {
  background: white;
  border-radius: 8px;
  padding: .8rem;

  header {
    h4 {
      font-size: 1rem;
      color: black;
      font-weight: 600;
    }
  }

}

.q-pa-none {
  padding: 0px;
}
</style>
