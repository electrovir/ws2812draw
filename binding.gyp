{
    "targets": [
        {
            "target_name": "ws2812draw",
            "sources": [
                "<!@(node -p \"require('fs').readdirSync('src-c').filter(f=>f.match(/\.(cpp|cc|h|c)/)).map(f=>'src-c/'+f).join(' ')\")"
            ],
        }
    ]
}
