{
    "targets": [
        {
            "target_name": "addon",
            "sources": [
                "<!@(node -p \"require('fs').readdirSync('src/c-addon-testing').filter(f=>f.match(/\.(cpp|h|c)/)).map(f=>'src/c-addon-testing/'+f).join(' ')\")"
            ],
        }
    ]
}
