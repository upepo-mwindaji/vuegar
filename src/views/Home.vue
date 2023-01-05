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
            <InputText id="viewId" type="text" v-model="viewId" />
          </div>

          <div class="field col-6">
            <label for="startDate">Start Date</label>
            <InputText id="startDate" type="date" v-model="startDate" />
          </div>
          <div class="field col-6">
            <label for="endDate">End Date</label>
            <InputText id="endDate" type="date" v-model="endDate" />
          </div>

          <span class="field col-12">
            <label class="block w-full" for="dimensions">Dimensions</label>
            <AutoComplete 
            id="dimensions"
            v-model="selectedDimensions" 
            :suggestions="filteredDimensions" 
            @complete="searchItem($event)" 
            optionLabel="uiName" 
            />
          </span>

           <span class="field col-12">
            <label class="block w-full" for="metrics">Metrics</label>
            <InputText id="metrics" label="Metrics"></InputText>
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
import { onBeforeMount, ref } from 'vue'
import { useVuegar } from '@/lib'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import AutoComplete from 'primevue/autocomplete'

const clientId = import.meta.env.VITE_CLIENT_ID
const vuegar = useVuegar(clientId)

const data = ref(null)

const selectedDimensions = ref([])
const selectedMetrics = ref([])
let availableDimensions

const availableMetrics = ref([])
const filteredDimensions = ref([])

const searchItem = (event) => {
  filteredDimensions.value = availableDimensions.filter((item) => {
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
  // availableMetrics.value = metadata.filter((item) => item.type === 'METRIC')
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
  const accounts = await vuegar.getAccounts() 
  data.value = accounts   
}

const getSegments = async () => {
  const accounts = await vuegar.getSegments() 
  data.value = accounts   
}


</script>
