import { ref } from 'vue'
import { Gapi } from './lib/googleApi'
import management from './lib/managementApi'
import { Report } from './lib/reportingApi'


export function useVuegar () {

    const gapi = new Gapi()
    
    const isInitialized = ref(false)

    const init = async (clientId) => {
        await gapi.init(clientId)
        isInitialized.value = true
    }
    
    const getData = async (params) => {
        try {
            const metadata = await management.getMetadata()
            const report = new Report()
            const rawData = await report.getData(params)
            const cleanData = report.parseData(rawData, metadata)
            return cleanData
        } catch (e) {
            if ((e.result?.error?.code == 401 || e.result?.error?.code == 403) &&
            (e.result?.error?.status == "PERMISSION_DENIED" || e.result?.error?.status == "UNAUTHENTICATED")) {
                const tokenResponse = await gapi.getToken()
                return getData(params)
            } else {
                console.log(e)
            }
        }
    }

    const getAccounts = async () => {
        try {
            const accounts = await management.getAccounts()
            return accounts
        } catch (e) {
            if ((e.result?.error?.code == 401 || e.result?.error?.code == 403) &&
            (e.result?.error?.status == "PERMISSION_DENIED" || e.result?.error?.status == "UNAUTHENTICATED")) {
                const tokenResponse = await gapi.getToken()
                return getAccounts()
            } else {
                console.log(e)
            }
        }
    }

    const getSegments = async () => {
        try {
            const segments = await management.getSegments()
            return segments
        } catch (e) {
            if ((e.result?.error?.code == 401 || e.result?.error?.code == 403) &&
            (e.result?.error?.status == "PERMISSION_DENIED" || e.result?.error?.status == "UNAUTHENTICATED")) {
                const tokenResponse = await gapi.getToken()
                return getSegments()
            } else {
                console.log(e)
            }
        }
    }

    const getMetadata = async () => {
        try {
            const metadata = await management.getMetadata()
            return metadata
        } catch (e) {
            console.log(e)
        }
    }

    return {
        init,
        isInitialized,
        getAccounts,
        getSegments,
        getMetadata,
        getData,
    }
}
