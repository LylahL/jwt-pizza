import { sleep, check, group, fail } from 'k6'
import http from 'k6/http'
import jsonpath from 'https://jslib.k6.io/jsonpath/1.0.2/index.js'

export const options = {
  cloud: {
    distribution: { 'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 } },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 5, duration: '30s' },
        { target: 15, duration: '1m' },
        { target: 10, duration: '30s' },
        { target: 0, duration: '30s' },
      ],
      gracefulRampDown: '30s',
      exec: 'scenario_1',
    },
  },
}

export function scenario_1() {
  let response

  const vars = {}
// login
  response = http.put(
    'https://pizza-service.cs329.click/api/auth',
    '{"email":"a@jwt.com","password":"admin"}',
    {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en,zh;q=0.9',
        'content-type': 'application/json',
        origin: 'https://pizza.cs329.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    }
  )
  if (!check(response, { 'status equals 200': response => response.status.toString() === '200' })) {
    console.log(response.body);
    fail('Login was *not* 200');
  }

  vars['token'] = jsonpath.query(response.json(), '$.token')[0]

  sleep(37.2)
//get menu
  response = http.get('https://pizza-service.cs329.click/api/order/menu', {
    headers: {
      accept: '*/*',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'en,zh;q=0.9',
      authorization: `Bearer ${vars['token ']}`,
      'content-type': 'application/json',
      origin: 'https://pizza.cs329.click',
      priority: 'u=1, i',
      'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
    },
  })

  response = http.options('https://pizza-service.cs329.click/api/order/menu', null, {
    headers: {
      accept: '*/*',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'en,zh;q=0.9',
      'access-control-request-headers': 'authorization,content-type',
      'access-control-request-method': 'GET',
      origin: 'https://pizza.cs329.click',
      priority: 'u=1, i',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
    },
  })

  response = http.get('https://pizza-service.cs329.click/api/franchise', {
    headers: {
      accept: '*/*',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'en,zh;q=0.9',
      authorization: `Bearer ${vars['token']}`,
      'content-type': 'application/json',
      origin: 'https://pizza.cs329.click',
      priority: 'u=1, i',
      'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
    },
  })
  sleep(11.8)

  response = http.post(
    'https://pizza-service.cs329.click/api/order',
    '{"items":[{"menuId":1,"description":"Veggie","price":0.0038}],"storeId":"1","franchiseId":1}',
    {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en,zh;q=0.9',
        authorization: `Bearer ${vars['token']}`,
        'content-type': 'application/json',
        origin: 'https://pizza.cs329.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    }
  )
  sleep(1.9)

  response = http.post(
    'https://pizza-factory.cs329.click/api/order/verify',
    '{"jwt":"eyJpYXQiOjE3NDM1NDIzODEsImV4cCI6MTc0MzYyODc4MSwiaXNzIjoiY3MzMjkuY2xpY2siLCJhbGciOiJSUzI1NiIsImtpZCI6IjE0bk5YT21jaWt6emlWZWNIcWE1UmMzOENPM1BVSmJuT2MzazJJdEtDZlEifQ.eyJ2ZW5kb3IiOnsiaWQiOiJqd3QtaGVhZHF1YXJ0ZXJzIiwibmFtZSI6IkpXVCBIZWFkcXVhcnRlcnMifSwiZGluZXIiOnsiaWQiOjEsIm5hbWUiOiLluLjnlKjlkI3lrZciLCJlbWFpbCI6ImFAand0LmNvbSJ9LCJvcmRlciI6eyJpdGVtcyI6W3sibWVudUlkIjoxLCJkZXNjcmlwdGlvbiI6IlZlZ2dpZSIsInByaWNlIjowLjAwMzh9XSwic3RvcmVJZCI6IjEiLCJmcmFuY2hpc2VJZCI6MSwiaWQiOjc3M319.FFfYt6U7epIIAyuRW__BaTc1LK7FtB3jn6jabM8OTWG0erOnsKuxIqmsxbdeMDBoL43CoAiJ60HpI3RN8ABf61EXrxaBkOuVcQqcN27TavG3f44tPKFpnl7BV002xGuVPIgXAXyqKFU2D0o7WKGqxdpivuevtcDs8jCoysYA2kTtQ_ZKtayre7p3d5GK3seGWDKvQdA7OhqT5tL28VkkfOO_vsx5Gwqk9RMcVMDzkkW9PxPZ__L8GORTnm2cnoHAw4bB0udoqH39RtMCHCGAF8K7qOZed_uKQmVHhx-J-iqpRMDk-OCOVsMUFvl7coGIOHh8dASimQ7e_UOz1sX-06wI4zzHLOYWqeTRtpU5o1pBqCq4NJarnIYr9QKE7x3vXXU_ccAYf1gNLQ-Wklv4hNhEZ0mONBAzD-RDQYTI5MXcHpf72ynR5vyIGuE-3UAcPK8CW66e-vaVA7xinlnUF7727qkc_-G0iW1HNBA1UwAoB3uqQWjdy1g9F4t1EpTrxqBciOZQSNmVGGDpploMmYbmqXCuM88A2idv8w6XhoG_q0PT_AEh_GeTorjqdxnIZ5pCanyXPe8kltcGP6q6KKcMNQymFYUv6lnLMQ5eCtoz-CDvgmNFV0a5Dl4mxK9EPlVX7jh3SlvFKKUlcDWOls2lkDVqJahjtKUFF9nrB9w"}',
    {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en,zh;q=0.9',
        authorization: `Bearer ${vars['token']}`,
        'content-type': 'application/json',
        origin: 'https://pizza.cs329.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    }
  )
}