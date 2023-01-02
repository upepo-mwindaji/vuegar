<template>
  <v-app>
    <v-app-bar color="primary">
      <v-app-bar-title> VUEGAR DEMO </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>mdi-github</v-icon>
      </v-btn>
    </v-app-bar>
    <default-view />
  </v-app>
</template>

<script lang="ts" setup>
  import DefaultView from './View.vue'
</script>
