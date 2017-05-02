import Immutable from 'immutable'
import { createSelector } from 'reselect'
import get from 'lodash/get'
import startCase from 'lodash/startCase'
import trunc from 'trunc-html'
import { CATEGORIES } from '../constants/mapping_types'
import { META } from '../constants/locales/en'
import { selectAllCategoriesPage } from './pages'
import { selectParamsType } from './params'
import { selectCategoryData } from './promotions'

export function sortCategories(a, b) {
  if (a.get('order') < b.get('order')) {
    return -1
  } else if (a.get('order') > b.get('order')) {
    return 1
  }
  return 0
}

export const selectPropsCategoryId = (state, props) =>
  get(props, 'categoryId')

// state.json.categories.xxx
export const selectCategoryCollection = state => state.json.get(CATEGORIES)

// Requires `categoryId` to be found in props
export const selectCategory = createSelector(
  [selectPropsCategoryId, selectCategoryCollection], (id, categories) =>
    categories.get(id, Immutable.Map()),
)

export const selectCategoryName = createSelector([selectCategory], category => category.get('name'))
export const selectCategorySlug = createSelector([selectCategory], category => category.get('slug'))
export const selectCategoryTileImageUrl = createSelector([selectCategory], category => category.getIn(['tileImage', 'large', 'url']))

export const selectAllCategoriesAsArray = createSelector(
  [selectCategoryCollection, selectAllCategoriesPage],
  (categories, allCategoryPage) => {
    if (!categories || !allCategoryPage) { return Immutable.List() }
    return allCategoryPage.get('ids').map(key => categories.get(key))
  },
)

// Memoized selectors
export const selectCategories = createSelector(
  [selectAllCategoriesAsArray], (allCats) => {
    const cats = {}
    // add cats to the correct arrays
    allCats.forEach((cat) => {
      const level = cat.get('level') ? cat.get('level') : 'other'
      if (!cats[level]) {
        cats[level] = []
      }
      cats[level].push(cat)
    })
    // sort arrays
    Object.keys(cats).forEach((level) => {
      cats[level].sort(sortCategories)
    })
    return cats
  },
)

export const selectOnboardingCategories = createSelector(
  [selectCategories], (categories) => {
    let cats = [];
    ['primary', 'secondary', 'tertiary'].forEach((level) => {
      const levelArr = categories[level]
      if (levelArr) { cats = cats.concat(levelArr) }
    })
    return cats
  },
)

export const selectOnboardingCategoriesFiltered = createSelector(
  [selectOnboardingCategories], categories =>
    categories.filter(category => category.get('allowInOnboarding')),
)

export const selectCategoryTabs = createSelector(
  [selectCategories], (categories) => {
    const { meta, primary, secondary, tertiary } = categories
    const tabs = []
    if (!primary) { return tabs }
    [meta, primary, secondary, tertiary].filter(arr => arr).forEach((level) => {
      level.forEach((category) => {
        const tab = {
          label: category.get('name'),
          source: category.getIn(['tileImage', 'small', 'url']),
          to: category.get('slug') === 'featured' ? '/discover' : `/discover/${category.get('slug')}`,
        }
        if (category.get('slug') === 'featured') {
          tab.activePattern = /^\/(?:discover(\/featured|\/recommended)?)?$/
        }
        tabs.push(tab)
      })
    })
    return tabs
  },
)

export const selectCategoryPageTitle = createSelector(
  [selectParamsType, selectCategoryCollection], (paramsType, categories) => {
    switch (paramsType) {
      case 'all':
        return null
      case undefined:
      case 'recommended':
        return 'Featured'
      default: {
        const cat = categories &&
          categories.find(c => c.get('slug') === paramsType)
        return cat ? cat.get('name') : startCase(paramsType).replace(/\sX\s/, ' x ')
      }
    }
  },
)

export const selectDiscoverMetaData = createSelector(
  [selectParamsType, selectCategoryData, selectCategoryPageTitle],
  (type, categoryData, pageTitle) => {
    const titlePrefix = pageTitle ? `${pageTitle} | ` : ''
    const title = `${titlePrefix}Ello`
    const { category, promotionals } = categoryData
    const image = promotionals.getIn([0, 'image', 'hdpi', 'url'], META.IMAGE)
    let description = ''
    switch (type) {
      case undefined:
      case 'featured':
      case 'recommended':
        description = META.FEATURED_PAGE_DESCRIPTION
        break
      case 'recent':
        description = META.RECENT_PAGE_DESCRIPTION
        break
      case 'trending':
        description = META.TRENDING_PAGE_DESCRIPTION
        break
      case 'all':
        description = META.ALL_PAGE_DESCRIPTION
        break
      default: {
        description = category && category.get('description') ?
          trunc(category.get('description'), 160).text : META.DESCRIPTION
        break
      }
    }
    return { description, image, title }
  },
)

