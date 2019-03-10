module.exports = {
    builders: {
        withCapabilities: [
            {
                browserName: 'chrome',
                chromeOptions: {
                    args: [
                        'headless',
                        'window-size=1200,800',
                        'disable-dev-shm-usage'
                    ]
                }

            }
        ]
    }
}
