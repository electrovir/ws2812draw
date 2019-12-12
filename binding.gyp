{
  "targets": [
    {
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "sources": [ 
          "<!@(node -p \"require('fs').readdirSync('src/c').filter(f=>f.match(/\.(cpp|h|c)/)).map(f=>'src/c/'+f).join(' ')\")"
        ],
      "target_name": "ws2812draw",
    }
  ]
}
