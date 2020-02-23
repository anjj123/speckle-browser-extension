import { extension } from 'extensionizer'
import '../../assets/injection.css'

let obAttmpts = 0
const CLASS_TWEET = 'css-1dbjc4n r-1iusvr4 r-16y2uox r-1777fci r-5f2r5o r-1mi0q7o'
const CLASS_BTNCONTAINER = 'css-1dbjc4n r-18u37iz r-1wtj0ep r-156q2ks r-1mdbhws'
const CLASS_STREAMLIST = 'css-1dbjc4n.r-1jgb5lz.r-1ye8kvj.r-6337vo.r-13qz1uu'
const MAX_ATTEMPT = 100
const DETECTOR = /#(.*?)(vote|tip|stake)(\w*)/

function modifyTweets () {
  let tweets = document.getElementsByClassName(CLASS_TWEET)
  for (let i = 0; i < tweets.length; i++) {
    let tweet: any = tweets[i]
    let matches = DETECTOR.exec(tweet.innerText)
    if (matches !== null) {
      let network: string = matches[1]
      let userAction: string = matches[2]
      let identifier: string = matches[3]
      let userActionButtons = tweet.getElementsByClassName(CLASS_BTNCONTAINER)[0]
      if (userActionButtons !== undefined && !userActionButtons.classList.contains('speckle-button-added')) {
        userActionButtons.classList.add('speckle-button-added')
        const classButtton = `speckle-button-${userAction}`

        let buttonDiv = document.createElement('div')
        buttonDiv.className = 'rn-1oszu61 rn-1efd50x rn-14skgim rn-rull8r rn-mm0ijv rn-13yce4e rn-fnigne rn-ndvcnb rn-gxnn5r rn-deolkf rn-6koalj rn-1qe8dj5 rn-1iusvr4 rn-18u37iz rn-16y2uox rn-1h0z5md rn-1mnahxq rn-61z16t rn-p1pxzi rn-11wrixw rn-ifefl9 rn-bcqeeo rn-wk8lta rn-9aemit rn-1mdbw0j rn-gy4na3 rn-bnwqim rn-1lgpqti'
        let button = document.createElement('button')
        button.className = classButtton
        if (userAction === 'tip') { userAction = 'send' }

        // Add Listener redirecting to url of the extension
        button.addEventListener('click', () => {
          extension.sendMessage({
            action: 'createWindow',
            url: extension.getURL('popup.html') + `#/${userAction}/${network}/${identifier}`
          }, function (createdWindow) {
            console.log(createdWindow)
          })
        })

        buttonDiv.appendChild(button)
        userActionButtons.appendChild(buttonDiv)
      }
    }
  }
}

function addObserver () {
  if (obAttmpts >= MAX_ATTEMPT) {
    return
  }

  obAttmpts++

  let observer = new MutationObserver(mutations => {
    mutations.forEach(() => {
      modifyTweets()
    })
  })

  let target: (Node & ParentNode) | null = document.getElementsByClassName(CLASS_STREAMLIST)[0]
  let possibleTweet = document.getElementsByClassName(CLASS_TWEET)[0]

  if (!possibleTweet) {
    window.setTimeout(addObserver, 500)
    return
  }

  let tweetParent1 = possibleTweet.parentNode
  let tweetParent2 = tweetParent1!.parentNode

  target = tweetParent2

  if (!target) {
    window.setTimeout(addObserver, 500)
    return
  }

  let config = { childList: true }

  observer.observe(target, config)

  window.setTimeout(modifyTweets, 500)
}

document.onreadystatechange = function () {
  if (document.readyState === 'interactive') {
    console.log('twitter getting react tweet')
  } else if (document.readyState === 'complete') {
    console.log('dom content loaded')
    if (document.getElementById('react-root')) {
      addObserver()
      modifyTweets()
    }
  }
}

// Add listener for url change
extension.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg === 'url-update') {
    setTimeout(modifyTweets, 1000)
    addObserver()
  } else if (msg === 'softreload') {
    console.log('Doing soft reload...')

    obAttmpts = 0

    addObserver()
  }
})
