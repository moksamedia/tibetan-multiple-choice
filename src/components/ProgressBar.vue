<template>
  <v-card flat>
    <v-card-text>
      <v-progress-linear
        :model-value="percentage"
        height="25"
        rounded
        color="primary"
      >
        <template v-slot:default="{ value }">
          <strong>{{ Math.ceil(value) }}% ({{ completedQuestions }} / {{ totalQuestions }})</strong>
        </template>
      </v-progress-linear>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'ProgressBar',
  props: {
    completedQuestions: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    }
  },
  computed: {
    percentage() {
      return (this.completedQuestions / this.totalQuestions) * 100;
    }
  }
};
</script>

<style scoped>
</style>
