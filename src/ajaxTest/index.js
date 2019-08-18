
const baseURL = 'http://tbljw.isshw.cn'

function ajax(method, url, p = {}, otherOption = {}) {
  let params = method === 'get' ? p : {}
  let data = method === 'post' ? p : {}
  return new Promise(resolve => {
    let options = {
      url,
      method,
      baseURL,
      headers: {
        'Content-Type': "application/x-www-form-urlencoded"
      },
      params,
      data,
      timeout: 15000,
      withCredentials: true,
      ...otherOption
    }
    console.log(options, 'options')
    axios.request(options).then(res => {
      console.log(res, 'res')
    }).catch(err => {
      console.error(err, 'err')
    })
  })

}