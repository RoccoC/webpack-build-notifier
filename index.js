/**
 * @class WebpackBuildNotifierPlugin
 * @extends Object
 * A Webpack plugin that generates OS notifications for build steps using node-notifier.
 */
var path = require('path');
var os = require('os');
var notifier = require('node-notifier');
var exec = require('child_process').exec;

var WebpackBuildNotifierPlugin = function(cfg) {
    cfg = cfg || {};

    var defaultIconPath = path.resolve(__dirname, 'icons');

    /**
     * @cfg {String} [title='Webpack Build']
     * The notification title prefix.
     */
    this.title = cfg.title || 'Webpack Build';
    /**
     * @cfg {String} logo
     * The absolute path to the project logo to be displayed as a content image in the notification. Optional.
     */
    this.logo = cfg.logo;
    /**
     * @cfg {String} [sound='Submarine']
     * The sound to play for notifications. Set to false to play no sound. Valid sounds are listed
     * in the node-notifier project: https://github.com/mikaelbr/node-notifier
     */
    this.sound = cfg.sound || 'Submarine';
    /**
     * @cfg {Boolean} [suppressSuccess=false]
     * True to suppress the success notifications, otherwise false (default). Note that the success notification will
     * always be shown following a failed compilation regardless of this setting.
     */
    this.suppressSuccess = cfg.suppressSuccess || false;
    /**
     * @cfg {Boolean} [activateTerminalOnError=false]
     * True to activate (focus) the terminal window when a compilation error occurs.
     * Note that this only works on Mac OSX.
     */
    this.activateTerminalOnError = cfg.activateTerminalOnError || false;
    /**
     * @cfg {String} [successIcon='./icons/success.png']
     * The absolute path to the icon to be displayed for success notifications.
     */
    this.successIcon = cfg.successIcon || path.join(defaultIconPath, 'success.png');
    /**
     * @cfg {String} [warningIcon='./icons/warning.png']
     * The absolute path to the icon to be displayed for warning notifications.
     */
    this.warningIcon = cfg.warningIcon || path.join(defaultIconPath, 'warning.png');
    /**
     * @cfg {String} [failureIcon='./icons/failure.png']
     * The absolute path to the icon to be displayed for failure notifications.
     */
    this.failureIcon = cfg.failureIcon || path.join(defaultIconPath, 'failure.png');
    /**
     * @property {Boolean} buildSuccessful
     * Whether or not the last build was successful. Read-only.
     */
    this.buildSuccessful = false;

    // add notification click handler to activate terminal window
    notifier.on('click', function(notifierObject, options) {
        this.activateTerminalWindow();
    }.bind(this));
};

WebpackBuildNotifierPlugin.prototype.activateTerminalWindow = function() {
    if (os.platform() === 'darwin') {
        exec('osascript -e \'tell application "Terminal" to activate\'');
    } else if (os.platform() === 'win32') {
        // TODO: Windows platform
    }
};

WebpackBuildNotifierPlugin.prototype.onCompilationDone = function(results) {
    var notify = !this.suppressSuccess,
        title = this.title + ' - ',
        msg = 'Build successful!',
        icon = this.successIcon;

    if (results.hasErrors()) {
        notify = true;
        title += 'Error';
        msg = results.compilation.errors[0].message;
        icon = this.failureIcon;
        this.buildSuccessful = false;
    } else if (results.hasWarnings()) {
        notify = true;
        title += 'Warning';
        msg = results.compilation.warnings[0].message;
        icon = this.warningIcon;
        this.buildSuccessful = false;
    } else {
        title += 'Success';
        if (!notify && !this.buildSuccessful) {
            notify = true; // previous build failed, let's show a notification even if success notifications are suppressed
        }
        this.buildSuccessful = true;
    }

    if (notify) {
        notifier.notify({
            title: title,
            message: msg,
            sound: this.sound,
            contentImage: this.logo,
            icon: icon,
            wait: true
        });
    }

    if (this.activateTerminalOnError && !this.buildSuccessful) {
        this.activateTerminalWindow();
    }
};

WebpackBuildNotifierPlugin.prototype.apply = function(compiler) {
    compiler.plugin('done', this.onCompilationDone.bind(this));
};

module.exports = WebpackBuildNotifierPlugin;