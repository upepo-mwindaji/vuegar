<template>
  <div style="font-family: Roboto;">

    <header class="bg-primary h-4rem px-4 flex align-items-center">
        <div class="text-2xl"> VUEBAR DEMO </div>
        <div class="flex-grow-1"></div>
        <a href="#">
          <i class="pi pi-github text-white text-2xl"></i>
        </a>
    </header>


    <main class="surface-ground">
      <div class="pt-3 mb-6 mx-auto max-w-30rem text-center">
        <h1 class="text-2xl"> Demo </h1>
        <p class="text-base"> Simple demo of the vuegar library </p>
      </div>

      <Card class="my-4 mx-2 md:mx-auto md:max-w-30rem">
        <template #title> Accounts </template>
        <template #content>
          Use `vuegar.getAccounts()` to get a tree of accounts, properties, views
        </template>
        <template #footer>
            <Button 
            @click="getAccounts" 
            v-if="!accounts"
            :loading="loading.accounts"
            :disabled="!isInitialized"
            >
              RUN
            </Button>
            <Button 
            @click="showAccounts = true" 
            v-if="accounts"
            class="p-button-success"
            >
              SHOW
            </Button>
        </template>
      </Card>
      <Dialog 
      header="Accounts" 
      v-model:visible="showAccounts" 
      class="w-full md:w-6 px-1"
      >
        <pre>{{ accounts }}</pre>
      </Dialog>

      <Card class="my-4 mx-2 md:mx-auto md:max-w-30rem">
        <template #title> Segments </template>
        <template #content>
          Use `vuegar.getSegments()` to get a list of segments of the user
        </template>
        <template #footer>
          <Button 
          @click="getSegments" 
          v-if="!segments"
          :loading="loading.segments"
          :disabled="!isInitialized"
          >
            RUN
          </Button>
          <Button 
          @click="showSegments = true" 
          v-if="segments"
          class="p-button-success"
          >
            SHOW
          </Button>
        </template>
      </Card>
      <Dialog 
      header="Segments" 
      v-model:visible="showSegments" 
      class="w-full md:w-6 px-1"
      >
        <pre>{{ segments }}</pre>
      </Dialog>

      <Card class="my-4 mx-2 md:mx-auto md:max-w-30rem">
        <template #title> Report </template>
        <template #content>
          <p class="mb-3">
          Use `vuegar.getData()` to get data. This will return data, dimensions, metrics
          </p>

          <div 
          v-if="!!accounts && !!segments && !!availableDimensions && !!availableMetrics"
          class="formgrid grid"
          >

            <div class="field col-12">
              <label class="block w-full" for="viewId">View ID</label>
              <TreeSelect 
              :modelValue="{ [selectedView]: true}"
              @change="updateViewId"
              :options="accountTree" 
              selectionMode="single"
              placeholder="Select View" 
              class="w-full">
                <template #value="{value}">
                <div>{{ (!value || !value.length) ? '' : value[0].key }}</div>
                <div class="text-xs">
                  {{ (!value || !value.length) ? '' : `${value[0].data.account.name} > ${value[0].data.property.name} > ${value[0].data.view.name}` }}
                  </div>
                </template>
                <template #empty>
                  <Button
                  @click="getAccounts" 
                  >
                    Get Views
                  </Button>
                </template>
              </TreeSelect>
              <!-- <Breadcrumb v-if="selectedView" :home="home" :model="items" /> -->
            </div>

            <div class="field col-6">
              <label for="startDate">Start Date</label>
              <Calendar id="startDate" type="date" v-model="selectedStartDate" />
            </div>
            <div class="field col-6">
              <label for="endDate">End Date</label>
              <Calendar id="endDate" type="date" v-model="selectedEndDate" />
            </div>

            <span class="field col-12">
              <label class="block w-full" for="dimensions">Dimensions</label>
              <AutoComplete 
              id="dimensions"
              v-model="selectedDimensions" 
              :suggestions="filteredDimensions" 
              @complete="searchDimensions($event)" 
              optionLabel="uiName" 
              optionGroupLabel="name" 
              optionGroupChildren="items"
              :multiple="true"
              :dropdown="true"
              class="w-full"
              />
            </span>

            <span class="field col-12">
              <label class="block w-full" for="metrics">Metrics</label>
              <AutoComplete 
              id="metrics"
              v-model="selectedMetrics" 
              :suggestions="filteredMetrics" 
              @complete="searchMetrics($event)" 
              optionLabel="uiName" 
              optionGroupLabel="name" 
              optionGroupChildren="items"
              :multiple="true"
              :dropdown="true"
              class="w-full"
              />
            </span>

            <span class="field col-12">
              <label class="block w-full" for="metrics">Segments</label>
              <AutoComplete 
              id="segments"
              v-model="selectedSegments" 
              :suggestions="filteredSegments" 
              @complete="searchSegments($event)" 
              optionLabel="name" 
              :dropdown="true"
              class="w-full"
              >
              </AutoComplete>
            </span>

            
          </div>



        </template>
        <template #footer>
          <Button 
          v-if="!accounts || !segments || !availableDimensions || !availableMetrics"
          @click="startReport" 
          :loading="loading.metadata || loading.accounts || loading.segments"
          :disabled="!isInitialized"
          >
            TRY IT
          </Button>
          <Button 
          v-if="!!accounts && !!segments && !!availableDimensions && !!availableMetrics"
          :disabled="!runnableReport"
          @click="getReport" 
          >
            RUN
          </Button>
          <Button 
          @click="showData = true" 
          v-if="data"
          class="p-button-success ml-2"
          >
            SHOW
          </Button>
        </template>
      </Card>
      <Dialog 
      header="Data" 
      v-model:visible="showData" 
      class="w-full md:w-6 px-1"
      >
        <pre>{{ data }}</pre>
      </Dialog>

      <div class="h-3rem"></div>
      
    </main>

  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref, computed } from 'vue'
import { useVuegar } from '../../dist/vuegar.js'
import Menubar from 'primevue/menubar'
import groupBy from 'lodash/groupBy'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import AutoComplete from 'primevue/autocomplete'
import TreeSelect from 'primevue/treeselect'
import Calendar from 'primevue/calendar'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'

const clientId = import.meta.env.VITE_CLIENT_ID
const vuegar = useVuegar(clientId)

const { isInitialized } = vuegar

const accounts = ref(null)
const segments = ref(null)
const availableDimensions = ref(null)
const availableMetrics = ref(null)

const selectedView = ref(null)
const selectedStartDate = ref(null)
const selectedEndDate = ref(null)
const selectedDimensions = ref([])
const selectedMetrics = ref([])
const selectedSegments = ref([])

const filteredDimensions = ref([])
const filteredMetrics = ref([])
const filteredSegments = ref([])

const data = ref(null)

const loading = ref({})
const showAccounts = ref(false)
const showSegments = ref(false)
const showData = ref(false)

const getAccounts = async () => {
  loading.value = { accounts: true }
  accounts.value = await vuegar.getAccounts() 
  loading.value = {}
}

const getSegments = async () => {
  loading.value = { segments: true }
  segments.value = await vuegar.getSegments() 
  loading.value = {}
}

const getReport = async () => {
  loading.value = { report: true }
  try {
    data.value = await vuegar.getData([{
      viewId: selectedView.value,
      dateStart: selectedStartDate.value.toISOString().split('T')[0],
      dateEnd: selectedEndDate.value.toISOString().split('T')[0],
      dimensions: selectedDimensions.value,
      metrics: selectedMetrics.value,
      segments: selectedSegments.value,
      filters: [],
    }])
  } catch(e) {
    console.log(e)
  } finally {
    loading.value = {}
  }
}

const startReport = async () => {
  loading.value = { metadata: true }
  const metadata = await vuegar.getMetadata()
  availableDimensions.value = metadata.filter((item) => item.type === 'DIMENSION')
  availableMetrics.value = metadata.filter((item) => item.type === 'METRIC')
  loading.value = {}
  await getAccounts()
  await getSegments()
}

const runnableReport = computed(() => {
  return !!selectedView.value && !!selectedStartDate.value && !!selectedEndDate.value && !!selectedMetrics.value.length
})

const accountTree = computed(() => {
  if (!accounts.value) return null
  return accounts.value.map((account) => {
    return {
      key: account.id,
      label: account.name,
      data: { account },
      selectable: !account.properties.length,
      children: !account.properties.length ? null : account.properties.map((property) => {
        return {
          key: property.id,
          label: property.name,
          selectable: false,
          children: property.views.map((view) => {
            return {
              key: view.id,
              label: view.name,
              data: { account, property, view },
              selectable: true
            }
          })
        }
      })
    }
  })
})

const updateViewId = (keys) => {
  selectedView.value = Object.keys(keys)[0]
}

const searchDimensions = (event) => {
  const filtered = availableDimensions.value.filter((item) => {
    const uiName = item.uiName.toLowerCase()
    return uiName.indexOf(event.query.toLowerCase()) > -1
  })
  const obj = groupBy(filtered, (dimension) => {
    return dimension.group
  })
  filteredDimensions.value = Object.keys(obj).map((group) => {
    return {
      name: group, 
      items: obj[group]
    }
  })
}

const searchMetrics = (event) => {
  const filtered = availableMetrics.value.filter((item) => {
    const uiName = item.uiName.toLowerCase()
    return uiName.indexOf(event.query.toLowerCase()) > -1
  })
  const obj = groupBy(filtered, (dimension) => {
    return dimension.group
  })
  filteredMetrics.value = Object.keys(obj).map((group) => {
    return {
      name: group, 
      items: obj[group]
    }
  })
}

const searchSegments = (event) => {
  filteredSegments.value = segments.value.filter((item) => {
    const name = item.name.toLowerCase()
    return name.indexOf(event.query.toLowerCase()) > -1
  })
}

onBeforeMount(async()=>{
  if (!vuegar.isInitialized.value) {
    await vuegar.init() // this can be delayed if needed
  }
})

</script>
