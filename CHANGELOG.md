
# Change Log

## v2.0.0 (2023/02/14)
- **Change:** the admin cli is no longer available
- **Change:** the admin is now exposed as an Express.js middleware only
- **Change:** config.json `server` key is no longer needed
- **Change:** config.json `app` was renamed to `admin`
- **Change:** config.json new required `admin.settings` config should be set the absolute path to your `settings.json` file
- **New:** config.json new `admin.readonly` flag replacing the `-v` cli argument
- **New:** config.json new `admin.debug` flag replacing the `-l` cli argument
- **New:** config.json new `admin.favicon` key to specify a path to a custom favicon.ico file to use
- **New:** config.json new `admin.footer` text and URL to use for the admin's footer
- **New:** config.json new `admin.locale` path to a custom locale file to use
- **New:** config.json new `admin.session` object to configure the underlying session middleware
- **Change:** users.json each user now contains just a `name` and `pass` fields as clear text

## v1.0.0 (2013/05/26)
- official release
