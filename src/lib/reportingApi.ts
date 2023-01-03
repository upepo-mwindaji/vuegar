import _ from "lodash"

class Report {

  // paramsInput = [
  //   {
  //     viewId: "",
  //     dateStart: "YYYY-MM-DD,
  //     dateEnd: "YYYY-MM-DD,
  //     dimensions: [],
  //     metrics: [],
  //     segments: [],
  //     filters: [],
  //   }
  // ]

  buildRequest(paramsInput) {
    const request = {}
    request.params = paramsInput
    if (!_.isArray(paramsInput)) {
      request.params = [paramsInput]
    }

    request.json = {
      reportRequests: request.params.map(function (paramsItem) {
        return {
          viewId: paramsItem.viewId,
          dateRanges: [
            {
              startDate: paramsItem.dateStart,
              endDate: paramsItem.dateEnd,
            },
          ],
        };
      }),
    };

    request.params.forEach((param, index) => {
      console.log(param)
      request.json.reportRequests[index].dimensions = param.dimensions.map(
        (dimension) => {
          if (_.isObject(dimension)) {
            return { name: dimension.id };
          }
          if (_.isString(dimension)) {
            return { name: dimension };
          }
        }
      );
      request.json.reportRequests[index].metrics = param.metrics.map(
        (metric) => {
          if (_.isObject(metric)) {
            return { expression: metric.id };
          }
          if (_.isString(metric)) {
            return { expression: metric };
          }
        }
      );
      if (!_.isEmpty(param.segments)) {
        request.json.reportRequests[index].dimensions.push({
          name: "ga:segment",
        });
        request.json.reportRequests[index].segments = param.segments.map(
          (segment) => {
            if (_.isObject(segment)) {
              return { segmentId: segment.segmentId };
            }
            if (_.isString(segment)) {
              return { segmentId: segment };
            }
          }
        );
      }
      if (!_.isEmpty(param.filters)) {
        request.json.reportRequests[index].dimensionFilterClauses =
          param.filters.map((filter) => {
            return {
              dimensionName: filter.dimension.id,
              operator: filter.operator.operator,
              expressions:
                filter.operator.operator === "IN_LIST"
                  ? filter.expression.split(",")
                  : filter.expression,
            }
          })
      }
    })
    return request.json
  }

  parseData(rawdata, metametadata) {
    console.log('inputdata',rawdata)
    if (_.isUndefined(rawdata)){
      // check if any reference to parsedData is kept
      return null
    }
    const dataToParse = rawdata || []
    // loop through reports
    const reports =  dataToParse.map((data) => {
      const dimensionHeaders = data.columnHeader.dimensions
      const metricHeaders = data.columnHeader.metricHeader.metricHeaderEntries
      const dimensionNames = {}
      const metricNames = {}
      dimensionHeaders.forEach((dimension) => {
        if (dimension === 'ga:segment'){
          dimensionNames[dimension] = 'Segment'
        } else {
          dimensionNames[dimension] = metametadata.find((measurement) => {
            return (measurement.id === dimension)
          }).uiName
        }
      })
      metricHeaders.forEach((metric) => {
        metricNames[metric.name] = metametadata.find((measurement) => {
          return (measurement.id === metric.name)
        }).uiName
      })
      const rows = data.data.rows
      return {
        data : rows.map((row) => {
          const newRow = {}
          dimensionHeaders.forEach((dimension, index) => {
              newRow[dimensionNames[dimension]] = row.dimensions[index]
          })
          metricHeaders.forEach((metric,index) => {
            newRow[metricNames[metric.name]] = parseInt(row.metrics[0].values[index])
          })
          return newRow
        }),

        // parse dimensions in array
        dimensions : dimensionHeaders.map((dimension) => {
          const items = []
          let metadata = {}
          rows.forEach((row) => {
            if (items.indexOf(row[dimension])===-1){
              items.push(row[dimension])
            }
          })
          if (dimension === 'ga:segment'){
            metadata = {
              'id': 'ga:segment',
              'dataType': 'STRING',
              'description': 'A segment',
              'group': 'Segment',
              'type': 'SEGMENT',
              'uiName': 'Segment'
            }
          } else {
            metadata = metametadata.find((measurement) => {
              return (measurement.id === dimension)
            })
          }
          return {
            name: metadata.uiName,
            metadata: metadata,
            items: items
          }
        }),

        // parse metrics in array
        metrics : metricHeaders.map((metric) => {
          const metadata = metametadata.find((measurement) => {
            return (measurement.id === metric.name)
          })
          return {
            name: metadata.uiName,
            metadata: metadata
          }
        }),

        segments : (() => {
          const items = []
          rows.forEach((row) => {
            if (items.indexOf(row['ga:segment'])===-1){
              items.push(row['ga:segment'])
            }
          })
          return items
        })()

      }
    })
    return reports
  }

  async getData(params) {
      // Call the Analytics Reporting API V4 batchGet method.
      const jsonRequest = this.buildRequest(params)
      console.log('make request')
      const response = await window.gapi.client.analyticsreporting.reports.batchGet(jsonRequest)
      console.log("request successfull")
      return response.result.reports
  }
}

export { Report }
