import Config from 'react-native-config'

module.exports = {
  PROMO_HOST: Config.PROMO_HOST,
  SEGMENT_WRITE_KEY: Config.SEGMENT_WRITE_KEY || 'my_write_key',
  USE_LOCAL_EMOJI: (Config.USE_LOCAL_EMOJI === 'true'),
}
