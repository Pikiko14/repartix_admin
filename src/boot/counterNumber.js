import AnimatedCounter from 'vue-animated-counter'

import { defineBoot } from '#q-app/wrappers'

export default defineBoot(({ app }) => {
  app.component('AnimatedCounter', AnimatedCounter)
})
