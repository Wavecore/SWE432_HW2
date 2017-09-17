var fetch = require('node-fetch');

fetch("http://localhost:5000/record/3650",
{
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: "PUT",
    body: JSON.stringify({
     grads_total: 476,
     grads_men: 270,
     grads_women: 206,
     grads_native: 3,
     grads_native_men: 1,
     grads_native_women: 2,
     grads_asian: 28,
     grads_asian_men: 13,
     grads_asian_women: 15,
     grads_black: 43,
     grads_black_men: 26,
     grads_black_women: 17,
     grads_hispanic: 39,
     grads_hispanic_men: 24,
     grads_hispanic_women: 15,
     grads_hawaiian: 2,
     grads_hawaiian_men: 2,
     grads_hawaiian_women: 0,
     grads_white: 313,
     grads_white_men: 179,
     grads_white_women: 134,
     grads_multi: 14,
     grads_multi_men: 7,
     grads_multi_women: 7,
     grads_unknown: 21,
     grads_unknown_men: 14,
     grads_unknown_women: 7,
     grads_nonresident: 13,
     grads_nonresident_men: 4,
     grads_nonresident_women: 9,
     year: 2015,
     grads_rank: 675,
     cip: '540199',
     name: 'Cold History' })
})
.then(function(res){ console.log(res.status) });