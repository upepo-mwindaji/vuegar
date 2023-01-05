<template>
  <div style="font-family: Roboto;">
    <header>
      <Menubar class="bg-primary" :model="items">
        <template #start> VUEBAR DEMO </template>
        <template #end>
          <i class="pi pi-github"></i>
        </template>
      </Menubar>
    </header>
    <v-main>
      <router-view />
    </v-main>
  </div>
</template>

<script lang="ts" setup>
import Menubar from 'primevue/menubar'
</script>
