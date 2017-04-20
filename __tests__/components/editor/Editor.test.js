import { ACTIVE_SERVICE_REGEXES } from '../../../src/components/editor/Editor';

describe('Editor', () => {
  describe('embeds', () => {
    it('has active services', () => {
      expect(ACTIVE_SERVICE_REGEXES.length).toBe(8)
    })

    it('properly identifies embeds', () => {
      const expectations = [
        { name: 'youtube',
          links: [
            { text: 'h?v=gUGda7GdZPQ', hasMatch: true },
            { text: 'gUGda7GdZPQ', hasMatch: false },
            { text: 'https://www.youtube.com/watch?v=WU7-8C93raI', hasMatch: true },
            { text: 'https://www.youtube.com/', hasMatch: false },
            { text: 'https://www.youtube.com/asdf', hasMatch: false },
          ],
        },
        { name: 'vimeo',
          links: [
            { text: 'https://vimeo.com/211794682', hasMatch: true },
            { text: 'https://vimeoooo.com/211794682', hasMatch: false },
            { text: 'https://vimeo.com', hasMatch: false },
          ],
        },
        { name: 'soundcloud',
          links: [
            { text: 'https://soundcloud.com/a-tribe-called-quest-official/the-donald', hasMatch: true },
            { text: 'https://soundcloud.com/', hasMatch: false },
            { text: 'https://soundcloud.com/not-real', hasMatch: false },
          ],
        },
        { name: 'dailymotion',
          links: [
            { text: 'http://www.dailymotion.com/video/x5j1ex2_the-road-is-alive-with-sloths-iguanas-crocodiles_travel', hasMatch: true },
            { text: 'http://www.dailymotion.com/', hasMatch: false },
            { text: 'http://www.dailymotion.com/nothing-here', hasMatch: false },
          ],
        },
        { name: 'mixcloud',
          links: [
            { text: 'https://www.mixcloud.com/motellacast/dj-mocity-motellacast-e101-19-04-2017-now-on-boxoutfm/', hasMatch: true },
            { text: 'https://www.mixcloud.com/', hasMatch: false },
            { text: 'https://www.mixcloud.com/not-real', hasMatch: false },
          ],
        },
        { name: 'codepen',
          links: [
            { text: 'http://codepen.io/angelolucas/pen/evojyW', hasMatch: true },
            { text: 'http://codepen.io/', hasMatch: false },
            { text: 'http://codepen.io/not-real', hasMatch: false },
          ],
        },
        { name: 'bandcamp',
          links: [
            { text: 'https://juanamolina.bandcamp.com/track/lenti-simo-halo', hasMatch: true },
            { text: 'https://juanamolina.bandcamp.com/', hasMatch: false },
            { text: 'https://juanamolina.bandcamp.com/not-real', hasMatch: false },
          ],
        },
        { name: 'ustream',
          links: [
            { text: 'http://www.ustream.tv/channel/11378037', hasMatch: true },
            { text: 'http://ustre.am/channel/11378037', hasMatch: true },
            { text: 'http://www.ustream.tv', hasMatch: false },
          ],
        },
      ]

      ACTIVE_SERVICE_REGEXES.forEach((service, index) => {
        expectations[index].links.forEach((link) => {
          if (link.hasMatch) {
            expect(link.text.match(service).length).toBeGreaterThan(0)
          } else {
            expect(link.text.match(service)).toBeNull()
          }
        })
      })
    })
  })
})
