module.exports = {
  APP_DEBUG: (process.env.APP_DEBUG === 'true'),
  AUTH_CLIENT_ID: '0610185d1816ca20c8b28426c135e5b7c66bb2edc1f13df12fd4e47be8ffe777',
  AUTH_DOMAIN: 'https://ello.ninja',
  HAS_GUIDE: (process.env.HAS_GUIDE === 'true'),
  LOGO_MARK: process.env.LOGO_MARK,
  NODE_ENV: process.env.NODE_ENV,
  PROMO_HOST: process.env.PROMO_HOST,
  PORT: (process.env.PORT || '6660'),
  SEGMENT_WRITE_KEY: process.env.SEGMENT_WRITE_KEY,
  USE_LOCAL_EMOJI: (process.env.USE_LOCAL_EMOJI === 'true'),
}

