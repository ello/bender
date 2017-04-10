import Immutable from 'immutable'
import { createSelector } from 'reselect'
import get from 'lodash/get'
import trunc from 'trunc-html'
import { numberToHuman } from '../lib/number_to_human'
import { selectInvitationUserId } from './invitations'
import { selectParamsUsername } from './params'
import { selectJson } from './store'
import { USERS } from '../constants/mapping_types'
import { getLinkArray } from '../helpers/json_helper'

export const selectPropsUserId = (state, props) =>
  get(props, 'userId') || get(props, 'user', Immutable.Map()).get('id')

export const selectUsers = state => state.json.get(USERS, Immutable.Map())

// Memoized selectors

// Requires `userId`, `user` or `params.username` to be found in props
export const selectUser = createSelector(
  [selectPropsUserId, selectInvitationUserId, selectParamsUsername, selectUsers],
  (id, invitationUserId, username, users) => {
    const userId = id || invitationUserId
    if (userId) {
      return users.get(userId, Immutable.Map())
    } else if (username) {
      return (users.find(user => user.get('username') === username)) || Immutable.Map()
    }
    return Immutable.Map()
  },
)

// Properties on the user reducer
// TODO: Supply defaults where applicable
export const selectUserAvatar = createSelector([selectUser], user => user.get('avatar'))
export const selectUserBadForSeo = createSelector([selectUser], user => user.get('badForSeo'))
export const selectUserCoverImage = createSelector([selectUser], user => user.get('coverImage'))
export const selectUserExperimentalFeatures = createSelector([selectUser], user => user.get('experimentalFeatures'))
export const selectUserExternalLinksList = createSelector([selectUser], user => user.get('externalLinksList'))
export const selectUserFollowersCount = createSelector([selectUser], user => user.get('followersCount', 0))
export const selectUserFollowingCount = createSelector([selectUser], user => user.get('followingCount', 0))
export const selectUserFormattedShortBio = createSelector([selectUser], user => user.get('formattedShortBio', ''))
export const selectUserHasAutoWatchEnabled = createSelector([selectUser], user => user.get('hasAutoWatchEnabled'))
export const selectUserHasCommentingEnabled = createSelector([selectUser], user => user.get('hasCommentingEnabled'))
export const selectUserHasLovesEnabled = createSelector([selectUser], user => user.get('hasLovesEnabled'))
export const selectUserHasRepostingEnabled = createSelector([selectUser], user => user.get('hasRepostingEnabled'))
export const selectUserHasSharingEnabled = createSelector([selectUser], user => user.get('hasSharingEnabled'))
export const selectUserHref = createSelector([selectUser], user => user.get('href'))
export const selectUserId = createSelector([selectUser], user => user.get('id'))
export const selectUserIsCollaborateable = createSelector([selectUser], user => user.get('isCollaborateable', false))
export const selectUserIsHireable = createSelector([selectUser], user => user.get('isHireable', false))
// TODO: Pull properties out of user.get('links')? - i.e. links.categories
export const selectUserLocation = createSelector([selectUser], user => user.get('location'))
export const selectUserLovesCount = createSelector([selectUser], user => user.get('lovesCount', 0))
export const selectUserMetaAttributes = createSelector([selectUser], user => user.get('metaAttributes', Immutable.Map()))
export const selectUserName = createSelector([selectUser], user => user.get('name'))
export const selectUserPostsAdultContent = createSelector([selectUser], user => user.get('postsAdultContent'))
export const selectUserPostsCount = createSelector([selectUser], user => user.get('postsCount', 0))
export const selectUserRelationshipPriority = createSelector([selectUser], user => user.get('relationshipPriority'))
export const selectUserTotalViewsCount = createSelector([selectUser], (user) => {
  const count = user.get('totalViewsCount')
  return count ? numberToHuman(count, false) : undefined
})
export const selectUserUsername = createSelector([selectUser], user => user.get('username'))
export const selectUserViewsAdultContent = createSelector([selectUser], user => user.get('viewsAdultContent'))

// Nested properties on the post reducer
export const selectUserMetaDescription = createSelector(
  [selectUserMetaAttributes], metaAttributes => metaAttributes.get('description'),
)

export const selectUserMetaImage = createSelector(
  [selectUserMetaAttributes], metaAttributes => metaAttributes.get('image'),
)

export const selectUserMetaRobots = createSelector(
  [selectUserMetaAttributes], metaAttributes => metaAttributes.get('robots'),
)

export const selectUserMetaTitle = createSelector(
  [selectUserMetaAttributes], metaAttributes => metaAttributes.get('title'),
)

// Derived or additive properties
export const selectUserCategories = createSelector(
  [selectUser, selectJson], (user, json) =>
    getLinkArray(user, 'categories', json) || Immutable.List(),
)

export const selectUserIsEmpty = createSelector(
  [selectUser], user => user.isEmpty(),
)

export const selectUserIsFeatured = createSelector(
  [selectUserCategories], categories => !categories.isEmpty(),
)

// TODO: Evaluate against profile.id and user.id instead?
export const selectUserIsSelf = createSelector(
  [selectUserRelationshipPriority], relationshipPriority => relationshipPriority === 'self',
)

export const selectUserTruncatedShortBio = createSelector(
  [selectUser], user =>
    trunc(
      user.get('formattedShortBio', ''),
      160,
      { sanitizer: { allowedAttributes: { img: ['align', 'alt', 'class', 'height', 'src', 'width'] } } },
    ),
)

