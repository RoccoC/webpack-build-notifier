# webpack-build-notifier

A [Webpack](https://webpack.github.io/) plugin that uses the [node-notifier](https://github.com/mikaelbr/node-notifier) module to display OS-level notifications for Webpack build errors and warnings.

[![NPM version](https://img.shields.io/npm/v/webpack-build-notifier.svg)](https://www.npmjs.org/package/webpack-build-notifier)

Are you tired of having to constantly switch between your IDE and terminal window to see whether your latest edits resulted in a failed build? Why didn't your latest changes get [hot-loaded](https://github.com/gaearon/react-hot-loader)? Was there a syntax error or failed unit test? With this plugin, you will always be apprised of build problems without having to keep an eye on your terminal window.

To use, install the webpack-build-notifier package `npm install webpack-build-notifier --save-dev` and add the plugin to your [Webpack configuration file](https://webpack.github.io/docs/configuration.html):


```javascript
// webpack.config.js
var WebpackBuildNotifierPlugin = require('webpack-build-notifier');

module.exports = {
  // ... snip ...
  plugins: [
    new WebpackBuildNotifierPlugin({
      title: "My Project Webpack Build",
      logo: path.resolve("./img/favicon.png"),
      suppressSuccess: true
    })
  ],
  // ... snip ...
}
```

Config Options
--------------

#### title
The notification title. Defaults to **_Webpack Build_**.

#### logo
The absolute path to the project logo to be displayed as a content image in the notification. Optional.

#### sound
The sound to play for notifications. Set to false to play no sound. Valid sounds are listedin the node-notifier project, [here](https://github.com/mikaelbr/node-notifier). Defaults to **_Submarine_**.

#### successSound
The sound to play for success notifications. Defaults to the value of the *sound* configuration option. Set to false to play no sound for success notifications. Takes precedence over the *sound* configuration option.

#### warningSound
The sound to play for warning notifications. Defaults to the value of the *sound* configuration option. Set to false to play no sound for warning notifications. Takes precedence over the *sound* configuration option.

#### failureSound
The sound to play for failure notifications. Defaults to the value of the *sound* configuration option. Set to false to play no sound for failure notifications. Takes precedence over the *sound* configuration option.

#### suppressSuccess
Defines when success notifications are shown. Can be one of the following values:
*  false     - Show success notification for each successful compilation (default).
*  true      - Only show success notification for initial successful compilation and after failed compilations.
*  "always"  - Never show the success notifications.
*  "initial" - Same as true, but suppresses the initial success notification.

#### suppressWarning
True to suppress the warning notifications, otherwise false (default).

#### activateTerminalOnError
True to activate (focus) the terminal window when a compilation error occurs. Note that this only works on Mac OSX (for now). Defaults to **_false_**. Regardless of the value of this config option, the terminal window can always be brought to the front by clicking on the notification.

#### successIcon
The absolute path to the icon to be displayed for success notifications. Defaults to the included **_./icons/success.png_**.

![Success](https://github.com/RoccoC/webpack-build-notifier/blob/master/icons/success.png?raw=true "Success")

#### warningIcon
The absolute path to the icon to be displayed for warning notifications. Defaults to the included **_./icons/warning.png_**.

![Warning](https://github.com/RoccoC/webpack-build-notifier/blob/master/icons/warning.png?raw=true "Warning")

#### failureIcon
The absolute path to the icon to be displayed for failure notifications. Defaults to the included **_./icons/failure.png_**.

![Failure](https://github.com/RoccoC/webpack-build-notifier/blob/master/icons/failure.png?raw=true "Failure")

#### messageFormatter
A function which returns a formatted notification message. The function is passed two parameters:
* {Object} error/warning - The raw error or warning object.
* {String} filepath - The path to the file containing the error/warning (if available).

#### onClick
A function called when the notification is clicked. By default it activates the Terminal application.

Future Improvements
-------------------
* TBD

Notes
-----
After publishing this package I discovered a couple other similar plugins that are worth looking into:
* [webpack-notifier](https://github.com/Turbo87/webpack-notifier)
* [webpack-error-notification](https://github.com/vsolovyov/webpack-error-notification)

Given the purpose and similarities, this project probably should have been a fork of one of these.

Changelog
---------
#### 1.0.16
###### _July 25, 2017_

- Updated *suppressSuccess* configuration option to support "always" and "initial" values.

#### 1.0.15
###### _July 17, 2017_

- Updated webpack icons.

#### 1.0.14
###### _June 14, 2017_

- Added *warningSound* configuration option.

#### 1.0.13
###### _October 19, 2016_

- Added *messageFormatter* configuration option to allow custom formatting of notification message.


#### 1.0.12
###### _July 25, 2016_

- Bugfix for #6, more null checking.


#### 1.0.11
###### _July 16, 2016_

- Bugfix for #6; added null check for error messages.

#### 1.0.10
###### _July 14, 2016_

- Added reference to *[strip-ansi](https://www.npmjs.com/package/strip-ansi)* NPM package to remove CLI color formatting from notifications.

#### 1.0.9
###### _July 5, 2016_

- Added new *onClick* configuration option to allow for specifying of notification click behavior.

#### 1.0.8
###### _February 17, 2016_

- Added new *successSound* and *failureSound* configuration options to allow different sounds depending upon the notification type. The *sound* configuration is still supported, but these two new options will take precedence.

#### 1.0.7
###### _January 18, 2016_

- Fixed *sound* configuration option to allow "false" value to disable sound.

#### 1.0.6
###### _December 17, 2015_

- Added *suppressWarning* configuration option.
