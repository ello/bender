export default `
<html>
  <head>
    <style>
      *, *:before, *:after {
        box-sizing: border-box;
        -webkit-font-smoothing: subpixel-antialiased;
      }
      html {
        font: normal 400 100%/1.5 "AtlasGrotesk-Regular", "Helvetica Neue", "HelveticaNeue", "Helvetica", "Arial", sans-serif;
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
        text-size-adjust: 100%;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      }
      body {
        position: relative;
        margin: 0;
        background-color: white;
        overflow-x: hidden;
      }
      ::-moz-selection {
        background: black;
        color: white;
        text-shadow: none;
      }
      ::selection {
        background: black;
        color: white;
        text-shadow: none;
      }
      [hidden], .hidden, template, #templates, #tail, #probe {
        display: none !important;
        visibility: hidden;
      }
      .invisible {
        position: absolute;
        visibility: hidden;
        opacity: 0;
      }
      [disabled], .disabled {
        cursor: default;
      }
      .unselectable {
        -webkit-user-select: none;
          -moz-user-select: none;
            -ms-user-select: none;
                user-select: none;
      }
      h1, h2, h3, h4, h5, h6 {
        font-family: "AtlasGrotesk-Bold", bold;
        font-style: normal;
        font-weight: 500;
        font-size: 0.875rem;
        margin: 0;
      }
      p {
        margin: 0.9375rem 0;
      }
      p, ol, ul, dl {
        font-size: 0.875rem;
      }
      p:empty {
        display: none;
      }
      ol, ul, dl, dd {
        margin: 0;
      }
      ol, ul {
        padding: 0;
      }
      ol {
        margin-left: 0;
        list-style-position: inside;
      }
      ul {
        margin-left: 1.2em;
      }
      nav ul,
      nav ol {
        margin-left: 0;
        list-style: none;
      }
      dl {
        line-height: 2.5;
        margin-bottom: 1.875rem;
      }
      dt {
        float: left;
        width: 5.625rem;
        overflow: hidden;
        clear: left;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      dd {
        margin-left: 7.5rem;
      }
      a {
        background: transparent;
        color: inherit;
        text-decoration: none;
      }
      a:focus,
      a:active,
      .no-touch a:hover {
        outline: 0;
      }
      p a,
      p .hashtag-link,
      [contenteditable="true"] a {
        -webkit-transition: color 150ms ease;
                transition: color 150ms ease;
        border-bottom: 1px solid;
      }
      p a:focus,
      p a:active,
      .no-touch p a:hover,
      p .hashtag-link:focus,
      p .hashtag-link:active,
      .no-touch p .hashtag-link:hover {
        color: #aaaaaa;
      }
      em, i {
        font-family: "AtlasGrotesk-Italic", "Atlas Grotesk", "Helvetica Neue", "HelveticaNeue", "Helvetica", "Arial", sans-serif;
        font-style: italic;
        font-weight: 400;
      }
      strong, b {
        font-family: "AtlasGrotesk-Bold", "Atlas Grotesk", "Helvetica Neue", "HelveticaNeue", "Helvetica", "Arial", sans-serif;
        font-style: bold;
        font-weight: 500;
      }
      strong em,
      em strong,
      b i,
      i b,
      b em,
      em b,
      strong i,
      i strong {
        font-family: "AtlasGroteskWeb-Regular", "AtlasGroteskWeb-Regular", "Helvetica Neue-BoldItalic", "HelveticaNeue-BoldItalic", "Helvetica-BoldItalic", "Arial-BoldItalic", bold-italic;
        font-style: bold-italic;
        font-weight: 500;
      }
      [contenteditable="true"] b,
      [contenteditable="true"] b i,
      [contenteditable="true"] i b {
        font-weight: 600;
      }
      small {
        font-size: 0.875em;
      }
      sub, sup {
        position: relative;
        vertical-align: baseline;
        font-size: 0.75em;
        line-height: 0;
      }
      sup {
        top: -0.5em;
      }
      sub {
        bottom: -0.25em;
      }
      mark {
        padding: 0.375rem 0.625rem;
        background-color: #ffffcc;
        color: black;
        font-size: 0.875rem;
      }
      code, pre {
        font-family: "AtlasTypewriter-Regular", monospace;
        background-color: #f1f1f1;
        font-size: 0.75rem;
      }
      code {
        display: inline-block;
        padding: 0.375rem 0.625rem;
      }
      pre {
        margin: 0.9375rem 0;
        padding: 0.9375rem;
        overflow: hidden;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      pre code {
        padding: 0;
        background-color: transparent;
      }
      hr {
        display: block;
        margin: 1em 0;
        padding: 0;
        height: 1px;
        border: 0;
        border-top: 1px solid #f1f1f1;
      }
      .heading {
        font-family: "AtlasGroteskBold", "Helvetica Neue", "HelveticaNeue", "Helvetica", "Arial", sans-serif;
        font-style: normal;
        font-weight: 700;
        text-rendering: optimizeLegibility;
        color: #231f20;
        font-size: 1.5rem;
        line-height: 1.35;
      }
      audio, canvas, img, svg, video {
        vertical-align: middle;
      }
      img {
        font-size: 0.875rem;
        max-width: 100%;
        border: 0;
      }
      img[src*='.'] {
        height: auto;
      }
      img[src*='1x1'] {
        background: transparent url(/assets/loading/scroll-loading.gif) center center no-repeat;
        background-size: 30px 30px;
      }
      audio:not([controls]) {
        display: none;
        height: 0;
      }
      svg:not(:root) {
        overflow: hidden;
      }
      figure {
        margin: 0;
      }
      table {
        font-size: 0.875rem;
        width: 100%;
        border-collapse: collapse;
        border-spacing: 0;
      }
      tr {
        border-bottom: 1px solid #f1f1f1;
      }
      td, th {
        padding: 0.375rem 0 0.3125rem;
        text-align: left;
      }
      th {
        font-family: "AtlasGrotesk-Bold", bold;
        font-style: normal;
        font-weight: 500;
        vertical-align: bottom;
      }
      .post-content img:not(.emoji) {
        display: block;
        margin: 0.9375rem 0;
      }
      .emoji {
        width: 1.25rem;
        height: 1.25rem;
        vertical-align: middle;
      }
      .post-content .embed {
        margin: 0.9375rem 0;
      }
      .post-content .embed img {
        margin: 0;
      }
      .post-content h1, .post-content h2, .post-content h3, .post-content h4, .post-content h5, .post-content h6,
      .post-content ol, .post-content ul {
        padding-top: 0.9375rem;
        margin-bottom: 0.9375rem;
      }
      .post-content li > a {
        border-bottom: 1px solid;
      }
      .post-content li > a:active {
        color: #aaaaaa;
      }
      .post-content > div:last-child > *:last-child,
      .post-content > *:last-child:not(div) {
        margin-bottom: 0.3125rem;
      }
      /* Overrides */
      .post-content {
        -webkit-touch-callout: none;
        touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }
      .post-content > * {
        margin-top: 0;
      }
      /* User Links on Profile */
      .user-links a {
        color: #aaaaaa;
        font-size: 0.875rem;
      }
      /* Make p tags word-wrap */
      p {
        word-wrap: break-word;
      }
    </style>
    <base href="{{base-url}}"></base>
  </head>
  <body>
    <script>
      ;(function() {
      var i = 0;
      function updateHeight() {
          document.title = document.body.scrollHeight;
          window.location.hash = ++i;
      }
      updateHeight();
      window.addEventListener("load", function() {
          updateHeight();
          setTimeout(updateHeight, 1000);
      });
      window.addEventListener("resize", updateHeight);
      }());
    </script>

    <div id="post-container" class="post-content">
      {{post-content}}
    </div>
    <script>
      var postContainer = document.getElementById('post-container');
      postContainer.onclick = function(event) {
          if ( event.target.getAttribute("data-capture") === "hashtagClick" && event.target.getAttribute("data-href") !== null ) {
              document.location = event.target.getAttribute("data-href");
              return false;
          }
          else if ( !isLink(event.target) ) {
              document.location = "default://default";
              return false;
          }
      };

      function isLink(el) {
         if (el.nodeName === "A") return true
          while (el.parentNode) {
              el = el.parentNode;
              if (el.nodeName === "A") return true;
          }
          return false;
      }
    </script>
  </body>
</html>
`

