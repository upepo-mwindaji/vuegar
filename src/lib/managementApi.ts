interface view {
  name: string;
  id: string;
}

interface property {
  name: string;
  id: string;
  views: view[];
}

interface account {
  name: string;
  id: string;
  properties: property[];
}

interface segment {
  name: string;
  segmentId: string;
  type: string;
  definition: string;
}

interface metadata {
  id: string;
  allowedInSegments: boolean;
  dataType: 'METRIC' | 'DIMENSION';
  description: string;
  group: string;
  type: string;
  uiName: string;
  calculation: boolean;
}

class Management {
  // get all accessible accounts then parse in a tree (json)
  // [
  //   {
  //     name: myaccount,
  //     id: UA-123456,
  //     properties:[
  //       {
  //         name: myproperty,
  //         id: 12345678,
  //         views: [
  //           {
  //             name: myview,
  //             id: 12345678
  //           }
  //         ]
  //       }
  //     ]
  //   }
  // ]
  parseAccountTree(accounts): account[] {
    const accountsTree = accounts.result.items.map((account) => {
      const accountObj = {} as account;
      accountObj.name = account.name;
      accountObj.id = account.id;
      accountObj.properties = account.webProperties.map((property) => {
        const propertyObj = {} as property;
        propertyObj.name = property.name;
        propertyObj.id = property.id;
        propertyObj.views = property.profiles.map((view) => {
          const viewObj = {} as view;
          viewObj.name = view.name;
          viewObj.id = view.id;
          return viewObj;
        });
        return propertyObj;
      });
      return accountObj;
    });
    return accountsTree;
  }

  async getAccounts(): Promise<account[]> {
    const accounts =
      await window.gapi.client.analytics.management.accountSummaries.list();
    return this.parseAccountTree(accounts);
  }

  parseSegments(rawSegments): segment[] {
    const segments = rawSegments.result.items.map(
      ({ name, segmentId, type, definition }) => {
        return { name, segmentId, type, definition };
      }
    );
    return segments;
  }

  async getSegments(): Promise<segment[]> {
    const segments = await window.gapi.client.analytics.management.segments.list();
    return this.parseSegments(segments);
  }

  // get metadata of the google analytics API
  // parsed into json
  // [
  //   {
  //     id,
  //     allowedInSegments,
  //     dataType,
  //     description,
  //     group,
  //     type,
  //     uiName,
  //     calculation
  //   }
  // ]
  parseMetadata(rawMetadata) {
    const metadata = rawMetadata.result.items
      .filter(function (item) {
        return item.attributes.status === "PUBLIC";
      })
      .map(function (item) {
        const obj = {
          id: item.id,
          allowedInSegments: item.attributes.allowedInSegments,
          dataType: item.attributes.dataType,
          description: item.attributes.description,
          group: item.attributes.group,
          type: item.attributes.type,
          uiName: item.attributes.uiName,
          calculation: "none",
        };
        if (item.attributes.calculation) {
          obj.calculation = item.attributes.calculation;
        }
        return obj;
      });
    return metadata;
  }

  async getMetadata() {
    const metadata = await window.gapi.client.analytics.metadata.columns.list({
      reportType: "ga",
    });
    return this.parseMetadata(metadata);
  }

  //gapi uses batch requests. Promise.all would not work
  async getAll() {
    const batch = window.gapi.client.newBatch();
    batch.add(window.gapi.client.analytics.management.accountSummaries.list(), {
      id: "accounts",
    });
    batch.add(window.gapi.client.analytics.management.segments.list(), {
      id: "segments",
    });
    batch.add(
      window.gapi.client.analytics.metadata.columns.list({ reportType: "ga" }),
      { id: "metadata" }
    );
    const runbatch = () => {
      return new Promise((resolve, reject) => {
        batch.then(resolve, reject);
      });
    };
    const response = await runbatch();
    return {
      accountsTree: this.parseAccountTree(response.result.accounts),
      segments: this.parseSegments(response.result.segments),
      metdata: this.parseMetadata(response.result.metadata),
    };
  }
}

const instance = new Management();
Object.freeze(instance);

export default instance;
