import Immutable from 'immutable'
import React, { Component, PropTypes } from 'react'
import { Image, View } from 'react-native'
import { connect } from 'react-redux'
import { push, replace } from 'react-router-redux'
// import { bindActionCreators } from 'redux'
// import classNames from 'classnames'
import set from 'lodash/set'
import { selectIsLoggedIn } from '../selectors/authentication'
import {
  selectColumnWidth,
  selectCommentOffset,
  selectContentWidth,
  // selectDeviceSize,
  selectInnerHeight,
  selectIsMobile,
} from '../selectors/gui'
import {
  selectPost,
  selectPostAuthor,
  selectPostBody,
  selectPostCategoryName,
  selectPostCategorySlug,
  selectPostCommentsCount,
  selectPostContent,
  selectPostContentWarning,
  selectPostCreatedAt,
  selectPostDetailPath,
  selectPostIsCommentsRequesting,
  selectPostIsEmpty,
  selectPostIsGridMode,
  selectPostIsOwn,
  selectPostIsOwnOriginal,
  selectPostIsRepost,
  selectPostIsReposting,
  selectPostIsWatching,
  selectPostLoved,
  selectPostLovesCount,
  selectPostRepostAuthorWithFallback,
  selectPostRepostContent,
  selectPostReposted,
  selectPostRepostsCount,
  selectPostShowCommentEditor,
  selectPostShowEditor,
  selectPostSummary,
  selectPostViewsCountRounded,
  selectPropsPostId,
} from '../selectors/post'
import { selectIsDiscoverRoot, selectIsPostDetail, selectPathname, selectPreviousPath } from '../selectors/routing'
import { trackEvent } from '../actions/analytics'
// import { openModal, closeModal } from '../actions/modals'
import {
  deletePost,
  flagPost,
  // loadComments,
  loadEditablePost,
  lovePost,
  toggleComments,
  toggleEditing,
  toggleReposting,
  unlovePost,
  unwatchPost,
  watchPost,
} from '../actions/posts'
// import StreamContainer from '../containers/StreamContainer'
// import ConfirmDialog from '../components/dialogs/ConfirmDialog'
// import FlagDialog from '../components/dialogs/FlagDialog'
// import ShareDialog from '../components/dialogs/ShareDialog'
// import Editor from '../components/editor/Editor'
// import {
//   CategoryHeader,
//   PostBody,
//   PostHeader,
//   RepostHeader,
// } from '../components/posts/PostRenderables'
// import { PostTools, WatchTool } from '../components/posts/PostTools'
// import { isLink } from '../lib/jello'
import TextRegion from '../components/regions/TextRegion'

export function makeMapStateToProps() {
  return (state, props) =>
    ({
      author: selectPostAuthor(state, props),
      categoryName: selectPostCategoryName(state, props),
      categoryPath: selectPostCategorySlug(state, props),
      columnWidth: selectColumnWidth(state),
      commentOffset: selectCommentOffset(state),
      content: selectPostContent(state, props),
      contentWarning: selectPostContentWarning(state, props),
      contentWidth: selectContentWidth(state),
      detailPath: selectPostDetailPath(state, props),
      // deviceSize: selectDeviceSize(state),
      innerHeight: selectInnerHeight(state),
      isCommentsRequesting: selectPostIsCommentsRequesting(state, props),
      isDiscoverRoot: selectIsDiscoverRoot(state, props),
      isGridMode: selectPostIsGridMode(state, props),
      isLoggedIn: selectIsLoggedIn(state),
      isMobile: selectIsMobile(state),
      isOwnOriginalPost: selectPostIsOwnOriginal(state, props),
      isOwnPost: selectPostIsOwn(state, props),
      isPostDetail: selectIsPostDetail(state, props),
      isPostEmpty: selectPostIsEmpty(state, props),
      isRepost: selectPostIsRepost(state, props),
      isReposting: selectPostIsReposting(state, props),
      isWatchingPost: selectPostIsWatching(state, props),
      pathname: selectPathname(state),
      post: selectPost(state, props),
      postBody: selectPostBody(state, props),
      postCommentsCount: selectPostCommentsCount(state, props),
      postCreatedAt: selectPostCreatedAt(state, props),
      postId: selectPropsPostId(state, props),
      postLoved: selectPostLoved(state, props),
      postLovesCount: selectPostLovesCount(state, props),
      postReposted: selectPostReposted(state, props),
      postRepostsCount: selectPostRepostsCount(state, props),
      postViewsCountRounded: selectPostViewsCountRounded(state, props),
      previousPath: selectPreviousPath(state),
      repostAuthor: selectPostRepostAuthorWithFallback(state, props),
      repostContent: selectPostRepostContent(state, props),
      showCommentEditor: selectPostShowCommentEditor(state, props),
      showEditor: selectPostShowEditor(state, props),
      summary: selectPostSummary(state, props),
    })
}

class PostContainer extends Component {

  static propTypes = {
    author: PropTypes.object.isRequired,
    // categoryName: PropTypes.string,
    // categoryPath: PropTypes.string,
    // columnWidth: PropTypes.number.isRequired,
    // commentOffset: PropTypes.number.isRequired,
    // content: PropTypes.object,
    // contentWarning: PropTypes.string,
    // contentWidth: PropTypes.number.isRequired,
    detailPath: PropTypes.string.isRequired,
    // deviceSize: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    // innerHeight: PropTypes.number.isRequired,
    // isCommentsRequesting: PropTypes.bool.isRequired,
    // isDiscoverRoot: PropTypes.bool.isRequired,
    // isGridMode: PropTypes.bool.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    // isMobile: PropTypes.bool.isRequired,
    // isOwnOriginalPost: PropTypes.bool.isRequired,
    // isOwnPost: PropTypes.bool.isRequired,
    // isPostDetail: PropTypes.bool.isRequired,
    isPostEmpty: PropTypes.bool.isRequired,
    // isPostHeaderHidden: PropTypes.bool,
    isRelatedPost: PropTypes.bool,
    // isRepost: PropTypes.bool.isRequired,
    // isReposting: PropTypes.bool.isRequired,
    isWatchingPost: PropTypes.bool.isRequired,
    pathname: PropTypes.string.isRequired,
    post: PropTypes.object.isRequired,
    // postBody: PropTypes.object,
    // postCommentsCount: PropTypes.number,
    // postCreatedAt: PropTypes.string,
    // postId: PropTypes.string.isRequired,
    postLoved: PropTypes.bool,
    // postLovesCount: PropTypes.number,
    postReposted: PropTypes.bool,
    // postRepostsCount: PropTypes.number,
    // postViewsCountRounded: PropTypes.string,
    previousPath: PropTypes.string,
    // repostAuthor: PropTypes.object,
    // repostContent: PropTypes.object,
    showCommentEditor: PropTypes.bool.isRequired,
    // showEditor: PropTypes.bool.isRequired,
    // summary: PropTypes.object,
  }

  static defaultProps = {
    categoryName: null,
    categoryPath: null,
    content: null,
    contentWarning: null,
    isPostHeaderHidden: false,
    isRelatedPost: false,
    postBody: null,
    postCommentsCount: null,
    postCreatedAt: null,
    postLoved: false,
    postLovesCount: null,
    postReposted: false,
    postRepostsCount: null,
    postViewsCountRounded: null,
    previousPath: null,
    repostAuthor: null,
    repostContent: null,
    summary: null,
  }

  static childContextTypes = {
    onClickDeletePost: PropTypes.func.isRequired,
    onClickEditPost: PropTypes.func.isRequired,
    onClickFlagPost: PropTypes.func.isRequired,
    onClickLovePost: PropTypes.func.isRequired,
    onClickRegion: PropTypes.func.isRequired,
    onClickRepostPost: PropTypes.func.isRequired,
    onClickSharePost: PropTypes.func.isRequired,
    onClickToggleComments: PropTypes.func.isRequired,
    onClickWatchPost: PropTypes.func.isRequired,
  }

  static contextTypes = {
    onClickOpenRegistrationRequestDialog: PropTypes.func,
  }

  getChildContext() {
    const { isLoggedIn } = this.props
    return {
      onClickDeletePost: this.onClickDeletePost,
      onClickEditPost: this.onClickEditPost,
      onClickFlagPost: this.onClickFlagPost,
      onClickLovePost: isLoggedIn ? this.onClickLovePost : this.onOpenSignupModal,
      onClickRegion: this.onClickRegion,
      onClickRepostPost: isLoggedIn ? this.onClickRepostPost : this.onOpenSignupModal,
      onClickSharePost: this.onClickSharePost,
      onClickToggleComments: this.onClickToggleComments,
      onClickWatchPost: isLoggedIn ? this.onClickWatchPost : this.onOpenSignupModal,
    }
  }

  componentWillMount() {
    this.state = {
      isCommentsActive: false,
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.isPostEmpty) { return false }
    return !Immutable.is(nextProps.post, this.props.post) ||
      ['columnWidth', 'contentWidth', 'innerHeight', 'isGridMode', 'isLoggedIn', 'isMobile'].some(prop =>
        nextProps[prop] !== this.props[prop],
      )
  }

  onClickDeletePost = () => {
    // const { dispatch } = this.props
    // dispatch(openModal(
    //   <ConfirmDialog
    //     title="Delete Post?"
    //     onConfirm={this.onConfirmDeletePost}
    //     onDismiss={this.onCloseModal}
    //   />))
  }

  onConfirmDeletePost = () => {
    const { dispatch, pathname, post, previousPath } = this.props
    this.onCloseModal()
    const action = deletePost(post)
    if (pathname.match(post.get('token'))) {
      set(action, 'meta.successAction', replace(previousPath || '/'))
    }
    dispatch(action)
    dispatch(trackEvent('deleted_post'))
  }

  onClickEditPost = () => {
    const { dispatch, post } = this.props
    dispatch(toggleEditing(post, true))
    dispatch(loadEditablePost(post.get('id')))
  }

  onClickFlagPost = () => {
    // const { deviceSize, dispatch } = this.props
    // dispatch(openModal(
    //   <FlagDialog
    //     deviceSize={deviceSize}
    //     onResponse={this.onPostWasFlagged}
    //     onConfirm={this.onCloseModal}
    //   />))
  }

  onPostWasFlagged = ({ flag }) => {
    const { dispatch, post } = this.props
    dispatch(flagPost(post, flag))
  }

  onClickLovePost = () => {
    const { dispatch, post, postLoved } = this.props
    if (postLoved) {
      dispatch(unlovePost(post))
    } else {
      dispatch(lovePost(post))
      dispatch(trackEvent('web_production.post_actions_love'))
    }
  }

  onClickRepostPost = () => {
    const { detailPath, dispatch, isRelatedPost, post, postReposted } = this.props
    if (!postReposted && !isRelatedPost) {
      dispatch(toggleReposting(post, true))
      dispatch(loadEditablePost(post.get('id')))
    } else {
      dispatch(push(detailPath))
    }
  }

  onClickSharePost = () => {
    // const { author, dispatch, post } = this.props
    // const action = bindActionCreators(trackEvent, dispatch)
    // dispatch(openModal(<ShareDialog author={author} post={post} trackEvent={action} />))
    // dispatch(trackEvent('open-share-dialog'))
  }

  onClickToggleComments = () => {
    const { detailPath, dispatch, isLoggedIn, isRelatedPost, post, showCommentEditor } = this.props
    if (isLoggedIn && !isRelatedPost) {
      const nextShowComments = !showCommentEditor
      this.setState({ isCommentsActive: nextShowComments })
      dispatch(toggleComments(post, nextShowComments))
    } else {
      dispatch(push(detailPath))
    }
  }

  onClickWatchPost = () => {
    const { dispatch, post, isWatchingPost } = this.props
    if (isWatchingPost) {
      dispatch(unwatchPost(post))
      dispatch(trackEvent('unwatched-post'))
    } else {
      dispatch(watchPost(post))
      dispatch(trackEvent('watched-post'))
    }
  }

  onClickRegion = () => {
    // const { dispatch, isGridMode, detailPath } = this.props
    // const { classList, dataset } = e.target
    // // Get the raw value instead of the property value which is always absolute
    // const href = e.target.getAttribute('href')

    // // Relative links get sent to push (usernames, raw links, hashtags)
    // if (href && href[0] === '/') {
    //   e.preventDefault()
    //   dispatch(push(href))

    // // TODO: We have a special `span` based fake link at the moment we have to test
    // // for. Once we change this back to an `<a> element we can rip this out.
    // } else if (classList.contains('hashtag-link')) {
    //   e.preventDefault()
    //   dispatch(push(dataset.href))

    // // Treat non links within grid layouts as a push to it's detail path
    // } else if (isGridMode && detailPath && !isLink(e.target)) {
    //   e.preventDefault()

    //   // if it's a command / control click or middle mouse fake a link and
    //   // click it... I'm serious.
    //   if (e.metaKey || e.ctrlKey || e.which === 2) {
    //     const a = document.createElement('a')
    //     a.href = detailPath
    //     a.target = '_blank'
    //     a.click()
    //     return
    //   }
    //   // ..otherwise just push it through..
    //   dispatch(push(detailPath))
    // }
    // // The alternative is it's either in list and we ignore it or it's an
    // // absolute link and we allow it's default behavior.
  }

  onCloseModal = () => {
    // const { dispatch } = this.props
    // dispatch(closeModal())
  }

  onOpenSignupModal = () => {
    const { onClickOpenRegistrationRequestDialog } = this.context
    onClickOpenRegistrationRequestDialog('post-tools')
  }

  render() {
    const {
      author,
      // categoryName,
      // categoryPath,
      // columnWidth,
      // commentOffset,
      // content,
      // contentWarning,
      // contentWidth,
      // detailPath,
      // innerHeight,
      // isCommentsRequesting,
      // isDiscoverRoot,
      // isGridMode,
      // isLoggedIn,
      // isMobile,
      // isOwnOriginalPost,
      // isOwnPost,
      // isPostDetail,
      isPostEmpty,
      // isPostHeaderHidden,
      // isRelatedPost,
      // isRepost,
      // isReposting,
      // isWatchingPost,
      post,
      // postBody,
      // postCommentsCount,
      // postCreatedAt,
      // postId,
      // postLoved,
      // postLovesCount,
      // postReposted,
      // postRepostsCount,
      // postViewsCountRounded,
      // repostAuthor,
      // repostContent,
      // showCommentEditor,
      // showEditor,
      // summary,
    } = this.props
    if (isPostEmpty || !author || !author.get('id')) { return null }
    // let postHeader
    // const headerProps = { detailPath, postCreatedAt, postId }
    // if (isRepost) {
    //   postHeader = (
    //     <RepostHeader
    //       {...headerProps}
    //       inUserDetail={isPostHeaderHidden}
    //       repostAuthor={repostAuthor}
    //       repostedBy={author}
    //     />
    //   )
    // } else if (isPostHeaderHidden) {
    //   postHeader = null
    // } else if (isDiscoverRoot && categoryName && categoryPath) {
    //   postHeader = (
    //     <CategoryHeader
    //       {...headerProps}
    //       author={author}
    //       categoryName={categoryName}
    //       categoryPath={categoryPath}
    //     />
    //   )
    // } else {
    //   postHeader = (
    //     <PostHeader
    //       {...headerProps}
    //       author={author}
    //       isPostDetail={isPostDetail}
    //     />
    //   )
    // }

    console.log('create post', post.toJS())
    // const isRepostAnimating = isReposting && !postBody
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {post.get('content').map((block, index) => {
          // console.log('block', block)
          switch (block.get('kind')) {
            case 'image':
              return (
                <Image
                  key={`post_${post.get('id')}_${index + 1}`}
                  source={{ uri: block.getIn(['data', 'url']) }}
                  style={{ flex: 1, height: 300, marginTop: 10, marginBottom: 10, backgroundColor: '#aaa' }}
                />
              )
            case 'text':
              return <TextRegion key={`post_${post.get('id')}_${index + 1}`} text={block.get('data')} />
            default:
              return null
          }
        })}
      </View>
    )
  }
}

export default connect(makeMapStateToProps)(PostContainer)

// <div className={classNames('Post', { isPostHeaderHidden: isPostHeaderHidden && !isRepost })}>
//     {postHeader}
//     {showEditor ?
//       <Editor post={post} /> :
//       <PostBody
//         author={author}
//         columnWidth={columnWidth}
//         commentOffset={commentOffset}
//         content={content}
//         contentWarning={contentWarning}
//         contentWidth={contentWidth}
//         detailPath={detailPath}
//         innerHeight={innerHeight}
//         isGridMode={isGridMode}
//         isRepost={isRepost}
//         postId={postId}
//         repostContent={repostContent}
//         summary={summary}
//       />
//     }
//     <PostTools
//       author={author}
//       detailPath={detailPath}
//       isCommentsActive={this.state.isCommentsActive}
//       isCommentsRequesting={isCommentsRequesting}
//       isGridMode={isGridMode}
//       isLoggedIn={isLoggedIn}
//       isMobile={isMobile}
//       isOwnOriginalPost={isOwnOriginalPost}
//       isOwnPost={isOwnPost}
//       isRelatedPost={isRelatedPost}
//       isRepostAnimating={isRepostAnimating}
//       isWatchingPost={isWatchingPost}
//       postCreatedAt={postCreatedAt}
//       postCommentsCount={postCommentsCount}
//       postId={postId}
//       postLoved={postLoved}
//       postLovesCount={postLovesCount}
//       postReposted={postReposted}
//       postRepostsCount={postRepostsCount}
//       postViewsCountRounded={postViewsCountRounded}
//     />
//     {isMobile && !isRelatedPost &&
//       <WatchTool
//         isMobile
//         isWatchingPost={isWatchingPost}
//         onClickWatchPost={this.onClickWatchPost}
//       />
//     }
//     {showCommentEditor && <Editor post={post} isComment />}
//     {showCommentEditor &&
//       <StreamContainer
//         action={loadComments(postId)}
//         className="TabListStreamContainer isFullWidth"
//         paginatorText="See More"
//         paginatorTo={detailPath}
//         postCommentsCount={postCommentsCount}
//         shouldInfiniteScroll={false}
//       />
//     }
//   </div>)

