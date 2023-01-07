<template>
  <div class="surface-ground">
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
        color="primary"
        outlined
        rounded 
        >
          RUN
        </Button>
      </template>
    </Card>

    <Card class="my-4 mx-2 md:mx-auto md:max-w-30rem">
      <template #title> Segments </template>
      <template #content>
        Use `vuegar.getSegments()` to get a list of segments of the user
      </template>
      <template #footer>
        <Button 
        @click="getSegments" 
        color="primary"
        outlined
        rounded 
        >
          RUN
        </Button>
      </template>
    </Card>

    <Card class="my-4 mx-2 md:mx-auto md:max-w-30rem">
      <template #title> Report </template>
      <template #content>
        <p class="mb-3">
        Use `vuegar.getData()` to get data. This will return data, dimensions, metrics
        </p>

        <div class="formgrid grid">

          <div class="field col-12">
            <label class="block w-full" for="viewId">View ID</label>
            <TreeSelect 
            v-model="selectedView" 
            :options="accountTree" 
            placeholder="Select View" 
            class="w-full">
              <template #empty>
                <Button
                @click="getAccounts" 
                color="primary"
                outlined
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
            :dropdown="true"
            class="w-full"
            />
          </span>

          
        </div>



      </template>
      <template #footer>
        <Button 
        @click="getReport" 
        color="primary"
        outlined
        rounded 
        >
          RUN
        </Button>
      </template>
    </Card>
    
    <pre> {{ data }} </pre>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref, computed } from 'vue'
import { useVuegar } from '@/lib'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import AutoComplete from 'primevue/autocomplete'
import TreeSelect from 'primevue/treeselect'
import Calendar from 'primevue/calendar'
import Breadcrumb from 'primevue/breadcrumb'

const clientId = import.meta.env.VITE_CLIENT_ID
const vuegar = useVuegar(clientId)

const data = ref(null)
const accounts = ref(null)
const segments = ref(null)
const formEntries = ref(null)

const selectedView = ref(null)
const selectedStartDate = ref(null)
const selectedEndDate = ref(null)
const selectedDimensions = ref([])
const selectedMetrics = ref([])
let availableDimensions
let availableMetrics

const filteredDimensions = ref([])
const filteredMetrics = ref([])

const searchDimensions = (event) => {
  filteredDimensions.value = availableDimensions.filter((item) => {
    const uiName = item.uiName.toLowerCase()
    return uiName.indexOf(event.query.toLowerCase()) > -1
  })
}

const searchMetrics = (event) => {
  filteredMetrics.value = availableMetrics.filter((item) => {
    const uiName = item.uiName.toLowerCase()
    return uiName.indexOf(event.query.toLowerCase()) > -1
  })
}

const customFilter = (value, query, item) => {
  const textOne = value.toLowerCase()
  const searchText = query.toLowerCase()

  return textOne.indexOf(searchText) > -1
}

onBeforeMount(async()=>{
  await vuegar.init() // this can be delayed if needed
  const metadata = await vuegar.getMetadata()
  availableDimensions = metadata.filter((item) => item.type === 'DIMENSION')
  availableMetrics = metadata.filter((item) => item.type === 'METRIC')
  // console.log(metadata)
})

const getReport = async () => {
  try {
    data.value = await vuegar.getData([{
      viewId: "172634282",
      dateStart: '2022-01-01',
      dateEnd: '2022-12-31',
      dimensions: ['ga:pagePath'],
      metrics: ['ga:sessions'],
      segments: [],
      filters: [],
    }])
  } catch(e) {
    console.log(e)
  }
}

const getAccounts = async () => {
  accounts.value = await vuegar.getAccounts() 
}

const getSegments = async () => {
  segments.value = await vuegar.getSegments() 
}


const accountTree = computed(() => {
  if (!accounts.value) return null
  return accounts.value.map((account) => {
    return {
      key: account.id,
      label: account.name,
      data: account.id,
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
              data: view.id,
              selectable: true
            }
          })
        }
      })
    }
  })
})


</script>
