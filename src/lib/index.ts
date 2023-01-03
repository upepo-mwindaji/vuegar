import { ref } from 'vue'
import { Gapi } from './googleApi'
import management from './managementApi'
import { Report } from './reportingApi'


export function useVuegar (clientId) {

    const gapi = new Gapi(clientId)
    
    const showButton = ref(false)

    const init = async () => {
        await gapi.init()
    }
    
    const getData = async (params) => {
        try {
            const metadata = await management.getMetadata()
            // console.log(metadata)
            const report = new Report()
            // console.log('getting raw data')
            const rawData = await report.getData(params)
            const cleanData = report.parseData(rawData, metadata)
            return cleanData
        } catch (e) {
            // console.log(e)
            if ((e.result?.error?.code == 401 || e.result?.error?.code == 403) &&
            (e.result?.error?.status == "PERMISSION_DENIED" || e.result?.error?.status == "UNAUTHENTICATED")) {
                const tokenResponse = await gapi.getToken()
                // console.log('tokenresponse', tokenResponse)
                return getData(params)
            } else {
                console.log('other error')
                console.log(e)
            }
        }
    }

    const getAccounts = async () => {
        try {
            const accounts = await management.getAccounts()
            return accounts
        } catch (e) {
            // console.log(e)
            if ((e.result?.error?.code == 401 || e.result?.error?.code == 403) &&
            (e.result?.error?.status == "PERMISSION_DENIED" || e.result?.error?.status == "UNAUTHENTICATED")) {
                const tokenResponse = await gapi.getToken()
                // console.log('tokenresponse', tokenResponse)
                // console.log(accounts)
                return getAccounts()
            } else {
                console.log('other error')
                console.log(e)
            }
        }
    }

    const getSegments = async () => {
        try {
            const segments = await management.getSegments()
            return segments
        } catch (e) {
            // console.log(e)
            if ((e.result?.error?.code == 401 || e.result?.error?.code == 403) &&
            (e.result?.error?.status == "PERMISSION_DENIED" || e.result?.error?.status == "UNAUTHENTICATED")) {
                const tokenResponse = await gapi.getToken()
                // console.log('tokenresponse', tokenResponse)
                // console.log(accounts)
                return getSegments()
            } else {
                console.log('other error')
                console.log(e)
            }
        }
    }

    const getMetadata = async () => {
        try {
            const metadata = await management.getMetadata()
            return metadata
        } catch (e) {
            console.log('other error')
            console.log(e)
        }
    }

    return {
        init,
        showButton,
        getAccounts,
        getSegments,
        getMetadata,
        getData,
    }
}
