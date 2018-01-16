# webpack-build-notifier

A [Webpack](https://webpack.github.io/) plugin that uses the [node-notifier](https://github.com/mikaelbr/node-notifier) module to display OS-level notifications for Webpack build errors and warnings.

[![NPM version](https://img.shields.io/npm/v/webpack-build-notifier.svg)](https://www.npmjs.org/package/webpack-build-notifier)

<img width="334" alt="webpack-build-notifier-error" src="https://user-images.githubusercontent.com/1934237/28636873-799c8c54-71f4-11e7-8d0c-be15ca823f6e.png"><img width="334" alt="webpack-build-notifier-success" src="https://user-images.githubusercontent.com/1934237/28636881-7f394dd2-71f4-11e7-9148-4dba316a41a8.png">

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

#### suppressCompileStart
True to suppress the compilation started notifications (default), otherwise false.

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

#### compileIcon
The absolute path to the icon to be displayed for compilation started notifications. Defaults to the included **_./icons/compile.png_**.

![Compile](https://github.com/RoccoC/webpack-build-notifier/blob/master/icons/compile.png?raw=true "Compile")

#### messageFormatter
A function which returns a formatted notification message. The function is passed two parameters:
* {Object} error/warning - The raw error or warning object.
* {String} filepath - The path to the file containing the error/warning (if available).

This function must return a String.
The default messageFormatter will display the filename which contains the error/warning followed by the
error/warning message.
Note that the message will always be limited to 256 characters.

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
#### 0.1.22
###### _January 16, 2018_

- Merged PR to detect terminal application. [#21](/../../issues/21).

#### 0.1.21
###### _December 13, 2017_

- Reworked previous "fix" to use default SnoreToast AppID for Windows toast notifications. [#20](/../../issues/20).

#### 0.1.19
###### _December 13, 2017_

- Added appName parameter to notify config to resolve issue with notifications not being generated in Windows build >=1709 [#20](/../../issues/20).

#### 0.1.18
###### _November 30, 2017_

- Updated `node-notifier` package version to latest; enforced max message length to 256 to fix [#20](/../../issues/20).

#### 0.1.17
###### _November 6, 2017_

- Added notification hook for webpack "watch-run" compilation event to show notifications when the compilation process has started.
Added *suppressCompileStart* and *compileIcon* configuration options to support this. This notification will not be shown by default;
set *suppressCompileStart* to *false* to enable.

#### 0.1.16
###### _July 25, 2017_

- Updated *suppressSuccess* configuration option to support "always" and "initial" values.

#### 0.1.15
###### _July 17, 2017_

- Updated webpack icons.

#### 0.1.14
###### _June 14, 2017_

- Added *warningSound* configuration option.

#### 0.1.13
###### _October 19, 2016_

- Added *messageFormatter* configuration option to allow custom formatting of notification message.


#### 0.1.12
###### _July 25, 2016_

- Bugfix for #6, more null checking.


#### 0.1.11
###### _July 16, 2016_

- Bugfix for #6; added null check for error messages.

#### 0.1.10
###### _July 14, 2016_

- Added reference to *[strip-ansi](https://www.npmjs.com/package/strip-ansi)* NPM package to remove CLI color formatting from notifications.

#### 0.1.9
###### _July 5, 2016_

- Added new *onClick* configuration option to allow for specifying of notification click behavior.

#### 0.1.8
###### _February 17, 2016_

- Added new *successSound* and *failureSound* configuration options to allow different sounds depending upon the notification type. The *sound* configuration is still supported, but these two new options will take precedence.

#### 0.1.7
###### _January 18, 2016_

- Fixed *sound* configuration option to allow "false" value to disable sound.

#### 0.1.6
###### _December 17, 2015_

- Added *suppressWarning* configuration option.
