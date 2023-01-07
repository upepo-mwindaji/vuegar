<template>
  <div style="font-family: Roboto;">
    <header>
      <Menubar class="bg-primary">
        <template #start> VUEBAR DEMO </template>
        <template #end>
          <i class="pi pi-github"></i>
        </template>
      </Menubar>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script lang="ts" setup>
import Menubar from 'primevue/menubar'
</script>
