import { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Analytics from 'analytics-react-native'
import * as ENV from '../../env'
import { selectIsLoggedIn } from '../selectors/authentication'
import { selectAllowsAnalytics, selectAnalyticsId, selectCreatedAt } from '../selectors/profile'

const agent = 'android'
const analytics = new Analytics(ENV.SEGMENT_WRITE_KEY, { flushAt: 1 })

export function addSegment(uid, createdAt) {
  if (uid) {
    analytics.identify({ userId: uid, traits: { agent, createdAt } })
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
    isLoggedIn: selectIsLoggedIn(state),
  }
}

class AnalyticsContainer extends Component {

  static propTypes = {
    allowsAnalytics: PropTypes.bool,
    analyticsId: PropTypes.string,
    createdAt: PropTypes.string,
    isLoggedIn: PropTypes.bool.isRequired,
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
    const { analyticsId, allowsAnalytics, createdAt, isLoggedIn } = this.props
    if (this.hasLoadedTracking) { return }
    if (!isLoggedIn && doesAllowTracking()) {
      this.hasLoadedTracking = true
      addSegment()
    } else if (analyticsId && allowsAnalytics) {
      this.hasLoadedTracking = true
      addSegment(analyticsId, createdAt)
    }
  }

  componentWillReceiveProps(nextProps) {
    const { allowsAnalytics, analyticsId, createdAt } = nextProps
    if (this.hasLoadedTracking) {
      // identify the user if they didn't previously have an id to identify with
      if (!this.props.analyticsId && analyticsId && analytics) {
        analytics.identify({ userId: analyticsId, traits: { agent, createdAt } })
      }
    } else if (this.props.analyticsId && analyticsId && allowsAnalytics) {
      this.hasLoadedTracking = true
      addSegment(analyticsId, createdAt)
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

