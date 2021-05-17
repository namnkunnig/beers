let searches = []
initialize()

function initialize() {
  let search = document.getElementById('search')
  search.addEventListener('keydown', onSearchChanged)
  search.addEventListener('input', onSearchInput)
  let oldSearches = window.sessionStorage.getItem('searches')
  if (oldSearches) searches = JSON.parse(oldSearches)

  if (window.location.hash) {
    document.getElementById('search').value = window.location.hash.replace('#', '')
  }
  triggerQuery()
}

function onSearchChanged(e) {
  if (e.key !== 'Enter') return
  let query = e.target.value
  window.location.hash = query
  document.getElementById('previous').setAttribute('class', 'hidden')

  if (!searches.includes(query)) {
    if (searches.length > 4) searches.shift()
    searches.push(query)
  }
  window.sessionStorage.setItem('searches', JSON.stringify(searches))
  fetchBeers(query)
}

function onSearchInput() {
  if (searches.length === 0) {
    document.getElementById('previous').setAttribute('class', 'hidden')
  } else {
    document.getElementById('previous').removeAttribute('class')
    showPreviousSearches()
  }
}

function showPreviousSearches() {
  let list = document.getElementById('previous')
  let input = document.getElementById('search')

  removeAllChildren(list)
  let filteredItems = 0
  searches.forEach((query) => {
    if (!query.startsWith(input.value)) {
      filteredItems++
      return
    }
    let item = document.createElement('li')
    item.innerHTML = `${query}`
    item.addEventListener('click', onQueryClicked)
    list.appendChild(item)
  })
  if (searches.length === filteredItems) {
    document.getElementById('previous').setAttribute('class', 'hidden')
  }
}

function onQueryClicked(e) {
  e.preventDefault()
  document.getElementById('search').value = e.target.innerText
  document.getElementById('previous').setAttribute('class', 'hidden')

  triggerQuery()
}

function triggerQuery() {
  let input = document.getElementById('search')
  var event = new KeyboardEvent('keydown', {
    code: '13',
    key: 'Enter'
  })
  input.dispatchEvent(event)
}

function showBeers(data) {
  let list = document.getElementById('list')
  removeAllChildren(list)
  data.forEach((beer) => {
    let item = document.createElement('li')
    item.innerHTML = `<div class="image"><img src="${beer.image_url}"></div><div class="name">${beer.name}</div><div class="tagline">${beer.tagline}</div>`
    list.appendChild(item)
  })
}

function fetchBeers(name) {
  let query = ''
  if (name) {
    query = `?beer_name=${name}`
  }
  fetch('https://api.punkapi.com/v2/beers' + query)
    .then((response) => {
      let limit = response.headers.get('x-ratelimit-remaining')
      showInfo(limit)
      return response.json()
    })
    .then((data) => showBeers(data))
}

function showInfo(limit) {
  let info = document.getElementById('info')
  if (limit < 1) {
    info.setAttribute('class', '')
  } else {
    info.setAttribute('class', 'hidden')
  }
}

function removeAllChildren(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }
}
