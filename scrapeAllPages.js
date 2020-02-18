var Horseman = require('node-horseman')
var horseman = new Horseman()
var fs = require('fs')

var finalData = []

function getdata() {
  return horseman.evaluate(function () {
    var descNode = document.querySelectorAll('.product--badges')
    var desc = Array.prototype.map.call(descNode, function (t) {
      return t.textContent
    })

    var valueNode = document.querySelectorAll('.product--info')
    var value = Array.prototype.map.call(valueNode, function (t) {
      return t.textContent
    })

    var finalData = []

    for (var i = 0; i < desc.length; i++) {
      var item = {}
      item['desc'] = desc[i]
      item['value'] = value[i]
      finalData.push(item)
    }

    return finalData

  })
}

function hasNextPage() {
  return horseman.exists('.lnkPagNext')
}

function scrape() {
  return new Promise(function (resolve, reject) {
    return getdata()
      .then(function (newData) {
        finalData = finalData.concat(newData)
        console.log(`Got ${finalData.length} items from ${finalData.length/12} pages`)
        return hasNextPage()
          .then(function (hasNext) {
            if (hasNext) {
              return horseman
                .click('.lnkPagNext')
                .wait(3000)
                .then(scrape)
            }
          })
      })
      .then(resolve)
  })
}


horseman
  .on('consoleMessage', function (msg) {
    console.log(msg)
  })
  .open('https://www.sondadelivery.com.br/delivery/categoria/bebidas2s')
  .then(scrape)
  .finally(function () {
    fs.writeFile('Data.txt', JSON.stringify(finalData), (err) => {
      if (err) throw err
      console.log('The file has been saved!')
      horseman.close()
    })
  })
