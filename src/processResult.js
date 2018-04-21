module.exports = result =>
  result
    .reduce((accum, item) => {
      const date = new Date(item.date)
      const count = item.report.reduce((sum, report) =>
        sum + report.row.reduce((counts, row) =>
          counts + parseInt(row.count[0], 10), 0), 0)

      const authResult = {
        domains: item.report[0].auth_results.reduce(
          (domains, reportAuthResult) => {
            const spfDomain = reportAuthResult.spf[0].domain[0]
            const spfResult = reportAuthResult.spf[0].result[0]
            if (domains[spfDomain] === undefined) {
              domains[spfDomain] = {// eslint-disable-line no-param-reassign
                results: {
                  spf: {}, // Codes at : rfc7489#page-70
                  dkim: {}, // Codes at : rfc7489#page-69
                }
              }
            }
            if (domains[spfDomain].results.spf[spfResult] === undefined) {
              domains[spfDomain].results.spf[spfResult] = 0// eslint-disable-line no-param-reassign
            }


            domains[spfDomain].results.spf[spfResult] += 1// eslint-disable-line no-param-reassign

            if (reportAuthResult.dkim !== undefined) { // According to rfc7489#page-70
              const dkimDomain = reportAuthResult.dkim[0].domain[0]
              const dkimResult = reportAuthResult.dkim[0].result[0]
              if (domains[dkimDomain] === undefined) {
                domains[dkimDomain] = {}// eslint-disable-line no-param-reassign
              }
              if (domains[spfDomain].results.dkim[dkimResult] === undefined) {
                domains[spfDomain].results.dkim[dkimResult] = 0// eslint-disable-line no-param-reassign
              }

              domains[spfDomain].results.dkim[dkimResult] += 1// eslint-disable-line no-param-reassign
            }

            return domains
          },
          {}
        )
      }


      accum.push({
        Org: item.org, Data: date, Msgs: count, AuthResult: authResult
      })

      return accum
    }, [])
    .sort((a, b) => {
      if (a.Data < b.Data) return -1
      if (a.Data > b.Data) return 1
      return 0
    })
