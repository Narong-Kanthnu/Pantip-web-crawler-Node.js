var cheerio = require('cheerio')
var request = require('request')
const createCsvWriter = require('csv-writer')

const roomName = '%E0%B8%97%E0%B8%B3%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%95%E0%B9%88%E0%B8%B2%E0%B8%87%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B9%80%E0%B8%97%E0%B8%A8'
const maxTopic = 3500
var count = 0
var topics = []

const csvWriter = createCsvWriter.createObjectCsvWriter({
  path: 'CSV/pantip_tag_' + 'ทำงานต่างประเทศ' + '.csv',
  header: [
    { id: 'title', title: 'TITLE' },
    { id: 'detail', title: 'DETAIL' },
    { id: 'tags', title: 'TAGS' },
  ]
})

// TODO: Loop fet all topic id for find topic detail.
// allTopicReq = request('https://pantip.com/forum/' + roomName, gotListTopicHTML)
allTopicReq = request('https://pantip.com/tag/' + roomName, gotListTopicHTML)

function gotListTopicHTML(err, resp, html) {
  if (err) return console.error(err)
  var parser = cheerio.load(html)
  var obj = Object.values(parser('a', '.post-item-title'))

  for (let i in obj) {
    if (obj[i].attribs) {
      var topicURL = (obj[i].attribs.href).split('https://pantip.com')
      var url = topicURL[0] ? topicURL[0] : topicURL[1]
      ListTopicReq = request('https://pantip.com' + url.toString(), gotTopicDetailHTML)
    }
  }

  var nextPage = parser('a', '.loadmore-bar').first()
  if (nextPage[0].name == 'a') {
    // var href = nextPage[0].attribs.href
    // allTopicReq = request('https://pantip.com' + href.toString(), gotListTopicHTML)
    var hrefSplit =  (nextPage[0].attribs.href).toString().split('ทำงานต่างประเทศ')
    allTopicReq = request('https://pantip.com/tag/' + roomName + hrefSplit[1].toString(), gotListTopicHTML)
  }
}

// TODO: Get topic detail
function gotTopicDetailHTML(err, resp, html) {
  if (err) return console.error(err)
  var parser = cheerio.load(html)
  var realTag = parser('.display-post-tag-wrapper').text().split('\n').toString().split('\t').toString().split(',,,,,,,,,,,,,,,,,,,').toString().split(',,,,,,,,,,,,,,,,,').toString().split(',,,,,,,,,,,,,,,,').toString()
  topics.push({ title: parser('h2').text(), detail: parser('.display-post-story', '.main-post').text(), tags: realTag })
  if (count == maxTopic) {
    createCSV(topics)
  } else {
    console.log('Processing topic ' + count + '...')
  }
  count += 1
}

// TODO: Create .CSV
function createCSV(topicData) {
  csvWriter.writeRecords(topicData)
    .then(() => {
      console.log('Done...');
      process.exit()
    });
}