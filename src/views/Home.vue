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
          v-if="!accounts"
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
        v-if="!!accounts && !!segments"
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
        v-if="!accounts || !segments"
        @click="startReport" 
        >
          TRY IT
        </Button>
        <Button 
        v-if="!!accounts && !!segments"
        @click="getReport" 
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
import groupBy from 'lodash/groupBy'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import AutoComplete from 'primevue/autocomplete'
import TreeSelect from 'primevue/treeselect'
import Calendar from 'primevue/calendar'
import Dialog from 'primevue/dialog'

const clientId = import.meta.env.VITE_CLIENT_ID
const vuegar = useVuegar(clientId)

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

const showAccounts = ref(false)
const showSegments = ref(false)

const getAccounts = async () => {
  accounts.value = await vuegar.getAccounts() 
}

const getSegments = async () => {
  segments.value = await vuegar.getSegments() 
}

const groupDimensions = computed(() => {
  const obj = groupBy(availableDimensions.value, (dimension) => {
    return dimension.group
  })
  return Object.keys(obj).map((group) => {
    return {
      name: group, 
      items: obj[group]
    }
  })
})

const getReport = async () => {
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
  }
}

const startReport = async () => {
  const metadata = await vuegar.getMetadata()
  availableDimensions.value = metadata.filter((item) => item.type === 'DIMENSION')
  availableMetrics.value = metadata.filter((item) => item.type === 'METRIC')
  await getAccounts()
  await getSegments()
}

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
  await vuegar.init() // this can be delayed if needed
})

</script>
