import Immutable from 'immutable'
import { createSelector } from 'reselect'
import get from 'lodash/get'
import { LOAD_STREAM_REQUEST } from '../constants/action_types'
import { COMMENTS, POSTS } from '../constants/mapping_types'
import { numberToHuman } from '../lib/number_to_human'
import { selectAssets } from './assets'
import { selectIsLoggedIn } from './authentication'
import { selectCategoryCollection } from './categories'
import { selectIsGridMode } from './gui'
import { selectParamsToken } from './params'
import { selectId as selectProfileId } from './profile'
import { selectIsPostDetail } from './routing'
import { selectStreamType, selectStreamMappingType, selectStreamPostIdOrToken } from './stream'
import { selectUsers } from './user'

const countProtector = count => (count < 0 ? 0 : count)

export const selectPropsPost = (state, props) => get(props, 'post')
export const selectPropsPostId = (state, props) =>
  get(props, 'postId') || get(props, 'post', Immutable.Map()).get('id')

export const selectPosts = state => state.json.get(POSTS, Immutable.Map())

// Memoized selectors

// Requires `postId`, `post` or `params.token` to be found in props
export const selectPost = createSelector(
  [selectPropsPost, selectPropsPostId, selectParamsToken, selectPosts],
  (propsPost, id, token, posts) => {
    if (id) {
      return posts.get(id, propsPost || Immutable.Map())
    } else if (token) {
      return (posts.find(post => post.get('token') === token)) || Immutable.Map()
    }
    return Immutable.Map()
  },
)

export const addAssetToRegion = (region, assets) => {
  if (region.get('kind') === 'image') {
    let assetId = region.getIn(['links', 'assets'], -1)
    if (assetId < 0) {
      const assetMatch = region.getIn(['content', 'url'], '').match(/asset\/attachment\/(\d+)\//)
      if (assetMatch) {
        assetId = `${assetMatch[1]}`
      }
    }
    const asset = assets.get(assetId)
    if (asset) {
      return region.set('asset', asset)
    }
  }
  return region
}

// Properties on the post reducer
export const selectPostAuthorId = createSelector([selectPost], post => post.get('authorId'))
export const selectPostBody = createSelector([selectPost], post => post.get('body'))
export const selectPostCommentsCount = createSelector([selectPost], post => countProtector(post.get('commentsCount')))
export const selectPostContent = createSelector(
  [selectPost, selectAssets], (post, assets) =>
    post.get('content', Immutable.Map()).map(region => addAssetToRegion(region, assets)),
)
export const selectPostContentWarning = createSelector([selectPost], post => post.get('contentWarning'))
export const selectPostCreatedAt = createSelector([selectPost], post => post.get('createdAt'))
export const selectPostHref = createSelector([selectPost], post => post.get('href'))
export const selectPostId = createSelector([selectPost], post => post.get('id'))
export const selectPostIsAdultContent = createSelector([selectPost], post => post.get('isAdultContent'))
export const selectPostMetaAttributes = createSelector([selectPost], post => post.get('metaAttributes', Immutable.Map()))
export const selectPostLoved = createSelector([selectPost], post => post.get('loved'))
export const selectPostLovesCount = createSelector([selectPost], post => countProtector(post.get('lovesCount')))
export const selectPostRepostContent = createSelector(
  [selectPost, selectAssets], (post, assets) =>
    post.get('repostContent', Immutable.Map()).map(region => addAssetToRegion(region, assets)),
)
export const selectPostRepostId = createSelector([selectPost], post => post.get('repostId'))
export const selectPostReposted = createSelector([selectPost], post => post.get('reposted'))
export const selectPostRepostsCount = createSelector([selectPost], post => countProtector(post.get('repostsCount')))
export const selectPostShowComments = createSelector([selectPost], post => post.get('showComments', false))
export const selectPostShowLovers = createSelector([selectPost], post => post.get('showLovers', false))
export const selectPostShowReposters = createSelector([selectPost], post => post.get('showReposters', false))
export const selectPostSummary = createSelector(
  [selectPost, selectAssets], (post, assets) =>
    post.get('summary', Immutable.Map()).map(region => addAssetToRegion(region, assets)),
)
export const selectPostToken = createSelector([selectPost], post => post.get('token'))
export const selectPostViewsCount = createSelector([selectPost], post => countProtector(post.get('viewsCount')))
export const selectPostViewsCountRounded = createSelector(
  [selectPostViewsCount], count => numberToHuman(count, false),
)
export const selectPostWatching = createSelector([selectPost], post => post.get('watching'))

// Nested properties on the post reducer
export const selectPostMetaDescription = createSelector(
  [selectPostMetaAttributes], metaAttributes => metaAttributes.get('description'),
)

export const selectPostMetaCanonicalUrl = createSelector(
  [selectPostMetaAttributes], metaAttributes => metaAttributes.get('canonicalUrl'),
)

export const selectPostMetaEmbeds = createSelector(
  [selectPostMetaAttributes], (metaAttributes) => {
    const embeds = (metaAttributes.get('embeds') || Immutable.List()).toArray()
    const openGraphEmbeds = embeds.map(embed => ({ property: 'og:video', content: embed }))
    return { openGraphEmbeds }
  },
)

export const selectPostMetaImages = createSelector(
  [selectPostMetaAttributes], (metaAttributes) => {
    const images = (metaAttributes.get('images') || Immutable.List()).toArray()
    const openGraphImages = images.map(image => ({ property: 'og:image', content: image }))
    const schemaImages = images.map(image => ({ name: 'image', itemprop: 'image', content: image }))
    return { openGraphImages, schemaImages }
  },
)

export const selectPostMetaRobots = createSelector(
  [selectPostMetaAttributes], metaAttributes => metaAttributes.get('robots'),
)

export const selectPostMetaTitle = createSelector(
  [selectPostMetaAttributes], metaAttributes => metaAttributes.get('title'),
)

export const selectPostMetaUrl = createSelector(
  [selectPostMetaAttributes], metaAttributes => metaAttributes.get('url'),
)

// Derived or additive properties
export const selectPostAuthor = createSelector(
  [selectUsers, selectPostAuthorId], (users, authorId) =>
    users.get(authorId, Immutable.Map()),
)

export const selectPostAuthorUsername = createSelector(
  [selectPostAuthor], author => author.get('username'),
)

// TODO: Pull other properties out of post.get('links')?
export const selectPostRepostAuthorId = createSelector([selectPost], post =>
  post.getIn(['links', 'repostAuthor', 'id']),
)

export const selectPostCategories = createSelector(
  [selectPost], post => post.getIn(['links', 'categories'], Immutable.List()),
)

export const selectPostCategory = createSelector(
  [selectCategoryCollection, selectPostCategories], (collection, categories) =>
    (collection && collection.get(categories ? `${categories.first()}` : null)),
)

export const selectPostCategoryName = createSelector(
  [selectPostCategory], category => category && category.get('name', null),
)

export const selectPostCategorySlug = createSelector(
  [selectPostCategory], category => (category ? `/discover/${category.get('slug')}` : null),
)

export const selectPostDetailPath = createSelector(
  [selectPostAuthorUsername, selectPostToken], (username, token) => `/${username}/post/${token}`,
)

export const selectPostIsCommentsRequesting = createSelector(
  [selectStreamType, selectStreamMappingType, selectStreamPostIdOrToken,
    selectPostId, selectPostToken],
  (streamType, streamMappingType, streamPostIdOrToken, postId, postToken) =>
    streamType === LOAD_STREAM_REQUEST && streamMappingType === COMMENTS &&
    (`${streamPostIdOrToken}` === `${postId}` || `${streamPostIdOrToken}` === `${postToken}`),
)

export const selectPostIsEditing = createSelector([selectPost], post =>
  post.get('isEditing', false),
)

export const selectPostIsEmpty = createSelector(
  [selectPost], post => post.isEmpty(),
)

export const selectPostIsGridMode = createSelector(
  [selectIsPostDetail, selectIsGridMode], (isPostDetail, isGridMode) =>
    (isPostDetail ? false : isGridMode),
)

export const selectPostIsOwn = createSelector(
  [selectPostAuthorId, selectProfileId], (authorId, profileId) =>
    `${authorId}` === `${profileId}`,
)

export const selectPostIsOwnOriginal = createSelector(
  [selectPostRepostAuthorId, selectProfileId], (repostAuthorId, profileId) =>
    `${repostAuthorId}` === `${profileId}`,
)

export const selectPostIsRepost = createSelector(
  [selectPostRepostContent], repostContent => !!(repostContent && repostContent.size),
)

export const selectPostIsReposting = createSelector([selectPost], post =>
  post.get('isReposting', false),
)

export const selectPostIsWatching = createSelector(
  [selectIsLoggedIn, selectPostWatching], (isLoggedIn, watching) => isLoggedIn && watching,
)

export const selectPostRepostAuthor = createSelector(
  [selectUsers, selectPostRepostAuthorId], (users, repostAuthorId) =>
    users.get(repostAuthorId, Immutable.Map()),
)

export const selectPostRepostAuthorWithFallback = createSelector(
  [selectPostIsRepost, selectPostRepostAuthor, selectPostAuthor],
  (isRepost, repostAuthor, author) =>
    (isRepost ? ((repostAuthor.get('id') && repostAuthor) || author) : null),
)

// Editor and drawer states for a given post
export const selectPostShowEditor = createSelector(
  [selectPostIsEditing, selectPostIsReposting, selectPostBody],
  (isEditing, isReposting, postBody) =>
    !!((isEditing || isReposting) && postBody),
)

export const selectPostShowCommentEditor = createSelector(
  [selectPostShowEditor, selectPostShowComments, selectIsPostDetail],
  (showEditor, showComments, isPostDetail) =>
    !showEditor && !isPostDetail && showComments,
)

export const selectPostShowLoversDrawer = createSelector(
  [selectPostShowEditor, selectPostIsGridMode, selectPostShowLovers,
    selectPostLovesCount, selectIsPostDetail],
  (showEditor, isGridMode, showLovers, lovesCount, isPostDetail) =>
    (!showEditor && !isGridMode && showLovers && lovesCount > 0) ||
    (!showEditor && !isGridMode && isPostDetail && lovesCount > 0),
)

export const selectPostShowRepostersDrawer = createSelector(
  [selectPostShowEditor, selectPostIsGridMode, selectPostShowReposters,
    selectPostRepostsCount, selectIsPostDetail],
  (showEditor, isGridMode, showReposters, repostsCount, isPostDetail) =>
    (!showEditor && !isGridMode && showReposters && repostsCount > 0) ||
    (!showEditor && !isGridMode && isPostDetail && repostsCount > 0),
)

