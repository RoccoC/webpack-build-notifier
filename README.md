# webpack-build-notifier

A [Webpack](https://webpack.github.io/) plugin that uses the [node-notifier](https://github.com/mikaelbr/node-notifier) module to display OS-level notifications for Webpack build errors and warnings.

Are you tired of having to constantly switch between your IDE and terminal window to see whether your latest edits resulted in a failed build? Why didn't your latest changes get [hot-loaded](https://github.com/gaearon/react-hot-loader)? Was there a syntax error or failed unit test? With this plugin, you will always be apprised of build problems without having to keep an eye on your terminal window.

To use, install the webpack-build-notifier package `npm install webpack-build-notifier --save-dev` and add the plugin to your [Webpack configuration file](https://webpack.github.io/docs/configuration.html):


```javascript
// webpack.config.js
var WebpackBuildNotifierPlugin = require('webpack-build-notifier');

module.exports = {
  // ... snip ...
  plugins: [
    new WebpackBuildNotifierPlugin()
  ],
  // ... snip ...
}
```

Config Options
--------------

#### title
The notification title. Defaults to _Webpack Build_**.

#### logo
The absolute path to the project logo to be displayed as a content image in the notification. Optional.

#### sound
The sound to play for notifications. Set to false to play no sound. Valid sounds are listedin the node-notifier project, [here](https://github.com/mikaelbr/node-notifier). Defaults to **_Submarine_**.

#### suppressSuccess
True to suppress the success notifications, otherwise false (default). Note that the success notification will always be shown following a failed build regardless of this setting.

#### activateTerminalOnError
True to activate (focus) the terminal window when a compilation error occurs. Note that this only works on Mac OSX. Defaults to **_false_**. Regardless of the value of this config option, he terminal window can always be brought to the front by clicking on the notification.

#### successIcon
The absolute path to the icon to be displayed for success notifications. Defaults to the included **_./icons/success.png_**.

![Success](https://github.com/RoccoC/webpack-build-notifier/blob/master/icons/success.png "Success")

#### warningIcon
The absolute path to the icon to be displayed for warning notifications. Defaults to the included **_./icons/warning.png_**.

![Warning](https://github.com/RoccoC/webpack-build-notifier/blob/master/icons/warning.png "Warning")

#### failureIcon
The absolute path to the icon to be displayed for failure notifications. Defaults to the included **_./icons/failure.png_**.

![Failure](https://github.com/RoccoC/webpack-build-notifier/blob/master/icons/failure.png "Failure")

Future Improvements
-------------------
* Re-work the notification message to display more usefule information. At present, uses the error/warning's "message" text. Not very useful as it contains inline formatting and is quite verbose. Perhaps update to list file(s) with error(s)/warning(s)?

Notes
-----
After publishing this package I discovered a couple other similar plugins that are worth looking into:
* [webpack-notifier](https://github.com/Turbo87/webpack-notifier)
* [webpack-error-notification](https://github.com/vsolovyov/webpack-error-notification)

Given the purpose and similarities, this project probably should have been a fork of one of these.