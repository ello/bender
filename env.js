import Config from 'react-native-config'

module.exports = {
  APP_DEBUG: (process.env.APP_DEBUG === 'true'),
  AUTH_CLIENT_ID: Config.AUTH_CLIENT_ID,
  AUTH_DOMAIN: Config.AUTH_DOMAIN,
  HAS_GUIDE: (process.env.HAS_GUIDE === 'true'),
  LOGO_MARK: process.env.LOGO_MARK,
  NODE_ENV: process.env.NODE_ENV,
  PROMO_HOST: process.env.PROMO_HOST,
  PORT: (process.env.PORT || '6660'),
  SEGMENT_WRITE_KEY: Config.SEGMENT_WRITE_KEY || 'my_write_key',
  USE_LOCAL_EMOJI: (process.env.USE_LOCAL_EMOJI === 'true'),
}

