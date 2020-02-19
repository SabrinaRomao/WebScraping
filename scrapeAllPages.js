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

var itemsvalue = [];
var itemsdesc = []
horseman
  .on('consoleMessage', function (msg) {
    console.log(msg)
  })
  .open('https://www.sondadelivery.com.br/delivery/categoria/bebidas2s')
  .then(scrape)
  .finally(function () {

    console.log(typeof(finalData))
  // /  console.dir(finalData)
    finalData.forEach(function(settings) {
      /* Extraindo os valores e coloca no array */
      b = settings.desc
      settings.desc = b.replace("\\n", "\n"," ");
      settings.desc = settings.desc.replace(/("(?:\\"|[^"])*")|\s/g, "$1")
      console.dir(settings.desc);
      itemsdesc.push(settings.desc)
      // console.dir(settings.value);
      a = settings.value
      settings.announce = a.replace("\\n", "\n"," ");
      // var str   = String(settings.announce)
      // var stringArray = str.split(/(\s+)/);
      settings.value = settings.announce.replace(/("(?:\\"|[^"])*")|\s/g, "$1")
      console.log(settings.value);
      itemsvalue.push(settings.value)
      //## replace \n \n por nada
      // console.log(Object.getOwnPropertyNames(settings));
    })

  }).then(function(){
    // Montar json de saida 
    fs.writeFile('xxxxxData.txt', itemsvalue , (err) => { 
      if (err) throw err
      console.log('Arquivo salvo olhe no txt!')
      horseman.close()
    })
  })
