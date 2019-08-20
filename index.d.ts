import { Plugin } from 'webpack';
import NotificationCenter from 'node-notifier/notifiers/notificationcenter';
import webpack = require("webpack");

export = WebpackBuildNotifierPlugin;

declare class WebpackBuildNotifierPlugin extends Plugin {
  constructor(config?: WebpackBuildNotifierPlugin.Config);
}

declare namespace WebpackBuildNotifierPlugin {
  type CompilationResult = {
    message?: string;
    module?: {
      rawRequest?: string;
      resource?: string;
    };
  };
  /**
   * String to represent valid compilation results.
   */
  enum CompilationStatus {
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error',
  }

  type Config = {
    /**
     * The notification title prefix. Defaults to `Webpack Build`.
     */
    title?: string;
    /**
     * The absolute path to the project logo to be displayed as a content image in the notification. Optional.
     */
    logo?: string;
    /**
     * The sound to play for notifications. Set to false to play no sound. Valid sounds are listed
     * in the node-notifier project: https://github.com/mikaelbr/node-notifier. Defaults to `Submarine`.
     */
    sound?: string | false;
    /**
     * The sound to play for success notifications. Defaults to the value of the *sound* configuration option.
     * Set to false to play no sound for success notifications. Takes precedence over the *sound* configuration option.
     */
    successSound?: string | false;
    /**
     * The sound to play for warning notifications. Defaults to the value of the *sound* configuration option.
     * Set to false to play no sound for warning notifications. Takes precedence over the *sound* configuration option.
     */
    warningSound?: string | false;
    /**
     * The sound to play for failure notifications. Defaults to the value of the *sound* configuration option.
     * Set to false to play no sound for failure notifications. Takes precedence over the *sound* configuration option.
     */
    failureSound?: string | false;
    /**
     * The sound to play for compilation notifications. Defaults to the value of the *sound* configuration option.
     * Set to false to play no sound for compilation notifications. Takes precedence over the *sound* configuration option.
     */
    compilationSound?: string | false;
    /**
     * A function which is invoked when compilation starts. Optional. The function is passed one parameter:
     * 1. {webpack.compilation.Compilation} compilation - The webpack Compilation instance.
     * Note that `suppressCompileStart` must be `false`.
     */
    onCompileStart?: (compilation: webpack.compilation.Compilation) => void;
    /**
     * A function which is invoked when compilation completes. Optional. The function is passed two parameters:
     * 1. {webpack.compilation.Compilation} compilation - The webpack Compilation instance.
     * 2. {CompilationStatus} status - one of 'success', 'warning', or 'error'
     */
    onComplete?: (compilation: webpack.compilation.Compilation, status: CompilationStatus) => void;
    /**
     * Defines when success notifications are shown. Can be one of the following values:
     * 
     *  * `false`     - Show success notification for each successful compilation (default).
     *  * `true`      - Only show success notification for initial successful compilation and after failed compilations.
     *  * `"always"`  - Never show the success notifications.
     *  * `"initial"` - Same as true, but suppresses the initial success notification.
     */
    suppressSuccess?: boolean | string;
    /**
     * True to suppress the warning notifications, otherwise false (default).
     */
    suppressWarning?: boolean
    /**
     * True to suppress the compilation started notifications (default), otherwise false.
     */
    suppressCompileStart?: boolean
    /**
     * True to activate (focus) the terminal window when a compilation error occurs.
     * Note that this only works on Mac OSX. Defaults to `false`.
     */
    activateTerminalOnError?: boolean
    /**
     * The absolute path to the icon to be displayed for success notifications.
     * Defaults to `./icons/success.png`.
     */
    successIcon?: string;
    /**
     * The absolute path to the icon to be displayed for warning notifications.
     * Defaults to `./icons/warning.png`.
     */
    warningIcon?: string;
    /**
     * The absolute path to the icon to be displayed for failure notifications.
     * Defaults to `./icons/failure.png`.
     */
    failureIcon?: string;
    /**
     * The absolute path to the icon to be displayed for compilation started notifications.
     * Defaults to `./icons/compile.png`.
     */
    compileIcon?: string;
    /**
     * A function called when clicking on a warning or error notification. By default, it activates the Terminal application.
     * The function is passed two parameters:
     *
     *  1. {NotificationCenter} notifierObject - The notifier object instance.
     *  2. {NotificationCenter.Notification} options - The notifier object options.
     */
    onClick?: (notifier: NotificationCenter, options: NotificationCenter.Notification) => void;
    /**
     * A function called when the notification times out (closes). Undefined by default. The function is passed
     * two parameters:
     *
     *  1. {NotificationCenter} notifierObject - The notifier object instance.
     *  2. {NotificationCenter.Notification} options - The notifier object options.
     */
    onTimeout?: (notifier: NotificationCenter, options: NotificationCenter.Notification) => void;
    /**
     * A function which returns a formatted notification message. The function is passed two parameters:
     *
     *  1. {CompilationResult} error/warning - The raw error or warning object.
     *  2. {string} filepath - The path to the file containing the error/warning (if available).
     *
     * This function must return a String.
     * 
     * The default messageFormatter will display the filename which contains the error/warning followed by the
     * error/warning message.
     * 
     * Note that the message will always be limited to 256 characters.
     */
    messageFormatter?: (error: CompilationResult, filepath: string) => string;
    /**
     * Any additional node-notifier options as documented in the node-notifer documentation:
     * https://github.com/mikaelbr/node-notifier
     * 
     * Note that options provided here will only be applied to the success/warning/error notifications
     * (not the "compilation started" notification). The `title`, `message`, `sound`, `contentImage` (logo), and `icon`
     * options will be ignored, as they will be set via the corresponding {WebpackBuildNotifierConfig} options
     * (either user-specified or default).
     */
    notifyOptions?: NotificationCenter.Notification;
  }
}
