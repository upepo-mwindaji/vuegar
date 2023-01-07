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
    if (!Array.isArray(paramsInput)) {
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
      request.json.reportRequests[index].dimensions = param.dimensions.map(
        (dimension) => {
          if (typeof dimension === 'object' && dimension.hasOwnProperty('id')) {
            return { name: dimension.id };
          }
          if (typeof dimension === 'string') {
            return { name: dimension };
          }
        }
      );
      request.json.reportRequests[index].metrics = param.metrics.map(
        (metric) => {
          if (typeof metric === 'object' && metric.hasOwnProperty('id')) {
            return { expression: metric.id };
          }
          if (typeof metric === 'string') {
            return { expression: metric };
          }
        }
      );
      if (param.segments && Array.isArray(param.segments) && param.segments.length) {
        request.json.reportRequests[index].dimensions.push({
          name: "ga:segment",
        });
        request.json.reportRequests[index].segments = param.segments.map(
          (segment) => {
            if (typeof segment === 'object' && segment.hasOwnProperty('segmentId')) {
              return { segmentId: segment.segmentId };
            }
            if (typeof segment === 'string') {
              return { segmentId: segment };
            }
          }
        );
      }
      if (param.filters && Array.isArray(param.filters) && param.filters.length) {
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
    if (typeof rawdata === 'undefined'){
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
          let metadata = {}
          if (dimension === 'ga:segment'){
            metadata = {
              'id': 'ga:segment',
              'dataType': 'STRING',
              'description': 'segment',
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
        })
      }
    })
    return reports
  }

  async getData(params) {
      // Call the Analytics Reporting API V4 batchGet method.
      const jsonRequest = this.buildRequest(params)
      const response = await window.gapi.client.analyticsreporting.reports.batchGet(jsonRequest)
      return response.result.reports
  }
}

export { Report }
