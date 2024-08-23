<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps(['selected', 'click', 'item'])

// reactive state
const count = ref(0)

function onClick(event) {
  props.click(event)
}

</script>

<template>
  <v-btn
    block
    variant="text"
    @click="onClick">{{ item.value }}</v-btn>
</template>
