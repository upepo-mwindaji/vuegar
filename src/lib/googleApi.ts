class Gapi {

    constructor (clientId) {
      this.clientId = ''
    }

    async loadGis() {
        await this.loadScript('https://accounts.google.com/gsi/client')
        await this.waitForLib('google')
    }

    async loadGapi() {
      await this.loadScript('https://apis.google.com/js/api.js')
      await this.waitForLib('gapi')
    }

    async loadGar() {
        await new Promise((resolve, reject) => {
            // NOTE: the 'auth2' module is no longer loaded.
            window.gapi.load('client', {callback: resolve, onerror: reject})
        })
        await window.gapi.client.init({})
        await window.gapi.client.load('https://www.googleapis.com/discovery/v1/apis/analytics/v3/rest')
        await window.gapi.client.load('https://analyticsreporting.googleapis.com/$discovery/rest')
    }

    
    loadScript(url) {
        if(window && document) {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`[src="${url}"]`)) return
                const scriptTag = document.createElement('script')
                scriptTag.type = 'text/javascript'
                scriptTag.async = true
                scriptTag.src = url
                scriptTag.onload = resolve()
                scriptTag.onerror = reject()
        
                const s = document.getElementsByTagName('body')[0];
                s.appendChild(scriptTag)
        
            })
        } else {
            console.log('not in browser')
        }
    }

    waitForLib(lib) {
        let maxIterations = 20
        const interval = 100
        return new Promise((resolve, reject) => {
            const waitForIt = setInterval(() => {
              if (window[lib]) {
                clearInterval(waitForIt)
                resolve()
              } else if (maxIterations < 0) {
                clearInterval(waitForIt)
                reject()
              } else {
                maxIterations--
              }
            }, interval)
        })
    }

    async init(clientId) {
      this.clientId = clientId
      await this.loadGapi()
      await this.loadGar()
      await this.loadGis()
    }

    getToken() {
      return new Promise ((resolve, reject) => {
        try {
          if (!this.clientId) throw new Error ('missing client id')
          const tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: this.clientId,
            scope: 'https://www.googleapis.com/auth/analytics.readonly',
            prompt: '',
            callback: (response) => {
              resolve(response)
            },
          })
          tokenClient.requestAccessToken()
        } catch (e) {
          reject(e)
        }
      })
    }

}

export { Gapi }
