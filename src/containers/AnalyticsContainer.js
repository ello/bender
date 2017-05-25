import { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Analytics from 'analytics-react-native'
import * as ENV from '../../env'
import { selectIsLoggedIn } from '../selectors/authentication'
import {
  selectAllowsAnalytics,
  selectAnalyticsId,
  selectCreatedAt,
  selectIsNabaroo,
  selectProfileIsFeatured,
} from '../selectors/profile'

const agent = 'android'
const analytics = new Analytics(ENV.SEGMENT_WRITE_KEY, { flushAt: 1 })

export function addSegment({ createdAt, hasAccount, isFeatured, isNabaroo, uid }) {
  if (uid) {
    const traits = { agent, createdAt, hasAccount, isFeatured, isNabaroo }
    analytics.identify({ userId: uid, traits })
  }
}

export function doesAllowTracking() {
  return true
}

function mapStateToProps(state) {
  return {
    allowsAnalytics: selectAllowsAnalytics(state),
    analyticsId: selectAnalyticsId(state),
    createdAt: selectCreatedAt(state),
    isFeatured: selectProfileIsFeatured(state),
    isLoggedIn: selectIsLoggedIn(state),
    isNabaroo: selectIsNabaroo(state),
  }
}


class AnalyticsContainer extends Component {

  static propTypes = {
    allowsAnalytics: PropTypes.bool,
    analyticsId: PropTypes.string,
    createdAt: PropTypes.string,
    isFeatured: PropTypes.bool.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    isNabaroo: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    allowsAnalytics: null,
    analyticsId: null,
    createdAt: null,
  }

  componentWillMount() {
    this.hasLoadedTracking = false
  }

  componentDidMount() {
    const { analyticsId, allowsAnalytics, createdAt,
      isFeatured, isLoggedIn, isNabaroo } = this.props
    if (this.hasLoadedTracking) { return }
    if (!isLoggedIn && doesAllowTracking()) {
      this.hasLoadedTracking = true
      addSegment()
    } else if (analyticsId && allowsAnalytics) {
      this.hasLoadedTracking = true
      addSegment({ createdAt, hasAccount: isLoggedIn, isFeatured, isNabaroo, uid: analyticsId })
    }
  }

  componentWillReceiveProps(nextProps) {
    const { allowsAnalytics, analyticsId, createdAt, isFeatured, isLoggedIn, isNabaroo } = nextProps
    if (this.hasLoadedTracking) {
      // identify the user if they didn't previously have an id to identify with
      if (!this.props.analyticsId && analyticsId && analytics) {
        const traits = { agent, createdAt, hasAccount: isLoggedIn, isFeatured, isNabaroo }
        analytics.identify({ userId: analyticsId, traits })
      }
    } else if (this.props.analyticsId && analyticsId && allowsAnalytics) {
      this.hasLoadedTracking = true
      addSegment({ createdAt, hasAccount: isLoggedIn, isFeatured, isNabaroo, uid: analyticsId })
    }
  }

  shouldComponentUpdate() {
    return false
  }

  render() {
    return null
  }
}

export default connect(mapStateToProps)(AnalyticsContainer)
export { analytics }

