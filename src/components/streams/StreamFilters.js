import * as MAPPING_TYPES from '../../constants/mapping_types'

// the export methods need to return an object like:
// { type: posts, ids: [1, 2, 3] }
export function postsFromLoves(loves) {
  const result = { type: MAPPING_TYPES.POSTS, ids: [] }
  loves.forEach((love) => {
    result.ids.push(`${love.postId}`)
  })
  return result
}

export function notificationsFromActivities(activities) {
  return { type: MAPPING_TYPES.NOTIFICATIONS, ids: activities }
}

export function settingsToggles(settings) {
  return { type: MAPPING_TYPES.SETTINGS, ids: settings }
}

function sortCategories(a, b) {
  if (a.order < b.order) {
    return -1
  } else if (a.order > b.order) {
    return 1
  }
  return 0
}

// TODO: move this into a selector?
export function sortedCategories(allCats) {
  const result = { type: MAPPING_TYPES.CATEGORIES, ids: [] }
  const categories = {}
  // add categories to the correct arrays
  allCats.forEach((cat) => {
    const level = cat.level && cat.level.length ? cat.level : 'other'
    if (!categories[level]) {
      categories[level] = []
    }
    categories[level].push(cat)
  })
  // sort arrays
  Object.keys(categories).forEach((level) => {
    categories[level].sort(sortCategories)
  })
  let cats = [];
  ['meta', 'primary', 'secondary', 'tertiary'].forEach((level) => {
    const levelArr = categories[level]
    if (levelArr) { cats = cats.concat(levelArr.map(c => c.id)) }
  })
  result.ids = cats
  return result
}

export function userResults(users) {
  const result = { type: MAPPING_TYPES.USERS, ids: [] }
  users.forEach((user) => {
    result.ids.push(`${user.id}`)
  })
  return result
}

