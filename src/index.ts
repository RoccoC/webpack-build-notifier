/**
 * @class WebpackBuildNotifierPlugin
 * @extends Object
 * A Webpack plugin that generates OS notifications for build steps using node-notifier.
 */
import path from 'path';
import process from 'process';
import os from 'os';
import notifier from 'node-notifier';
import stripAnsi from 'strip-ansi';
import { exec, execFileSync } from 'child_process';
import { Notification } from 'node-notifier/notifiers/notificationcenter';
import { CompilationResult, Config } from './types';
import webpack from 'webpack';

const DEFAULT_ICON_PATH = path.resolve(__dirname, 'icons');

export default class WebpackBuildNotifierPlugin {
  private appName: string | undefined = undefined;
  private buildSuccessful: boolean = false;
  private hasRun: boolean = false;

  // config options
  private title: string = 'Webpack Build';
  private logo?: string;
  private sound: string = 'Submarine';
  private successSound: string = this.sound;
  private warningSound: string = this.sound;
  private failureSound: string = this.sound;
  private compilationSound: string = this.sound;
  private suppressSuccess: boolean | 'always' | 'initial' = false;
  private suppressWarning: boolean = false;
  private suppressCompileStart: boolean = true;
  private activateTerminalOnError: boolean = false;
  private successIcon: string = path.join(DEFAULT_ICON_PATH, 'success.png');
  private warningIcon: string = path.join(DEFAULT_ICON_PATH, 'warning.png');
  private failureIcon: string = path.join(DEFAULT_ICON_PATH, 'failure.png');
  private compileIcon: string = path.join(DEFAULT_ICON_PATH, 'compile.png');
  private onClick: (notifier: notifier.NodeNotifier, options: Notification) => void = () => this.activateTerminalWindow;
  private onTimeout?: (notifier: notifier.NodeNotifier, options: Notification) => void;
  private messageFormatter?: (error: CompilationResult, filepath: string) => string;
  private notifyOptions?: Notification;

  constructor(cfg?: Config) {
    Object.apply(this, cfg);

    this.registerSnoreToast();

    notifier.on('click', this.onClick);
    if (this.onTimeout) {
      notifier.on('timeout', this.onTimeout);
    }
  }

  public apply(compiler: webpack.Compiler): void {
    if (compiler.hooks && compiler.hooks.watchRun && compiler.hooks.done) {
      // for webpack >= 4
      if (!this.suppressCompileStart) {
        compiler.hooks.watchRun.tapAsync('webpack-build-notifier', this.onCompilationWatchRun);
      }
      compiler.hooks.done.tap('webpack-build-notifier', this.onCompilationDone);
    } else {
      // for webpack < 4
      if (!this.suppressCompileStart) {
        compiler.plugin('watch-run', this.onCompilationWatchRun);
      }
      compiler.plugin('done', this.onCompilationDone);
    }
  }

  private readonly activateTerminalWindow = (): void => {
    if (os.platform() === 'darwin') {
      // TODO: is there a way to translate $TERM_PROGRAM into the application name
      // to make this more flexible?
      exec('TERM="$TERM_PROGRAM"; ' +
        '[[ "$TERM" == "Apple_Terminal" ]] && TERM="Terminal"; ' +
        '[[ "$TERM" == "vscode" ]] && TERM="Visual Studio Code"; ' +
        'osascript -e "tell application \\"$TERM\\" to activate"');
    } else if (os.platform() === 'win32') {
      // TODO: Windows platform
    }
  };

  private readonly formatMessage = (
    error: CompilationResult,
    filepath: string
  ): string => {
    let message = '';
    if (this.messageFormatter) {
      message = this.messageFormatter(error, filepath);
    } else if (error.message && error.module && error.module.resource) {
      message = `${filepath}${os.EOL}${error.message.replace(error.module.resource, '')}`;
    }

    if (typeof message === 'string') {
      return message.substr(0, 256); // limit message length to 256 characters, fixes #20
    } else {
      throw `Invalid message type '${typeof message}'; messageFormatter must return a string.`;
    }
  };

  private readonly onCompilationDone = (results: webpack.Stats): void => {
    let notify: boolean = false;
    let title = `${this.title} - `;
    let msg = 'Build successful!';
    let icon = this.successIcon;
    let sound = this.successSound;

    if (results.hasErrors()) {
      const error = results.compilation.errors[0];
      notify = true;
      title += 'Error';
      msg = error ?
        this.formatMessage(error, error.module && error.module.rawRequest ? error.module.rawRequest : '') :
        'Unknown';
      icon = this.failureIcon;
      sound = this.failureSound;
      this.buildSuccessful = false;
    } else if (!this.suppressWarning && results.hasWarnings()) {
      const warning = results.compilation.warnings[0];
      notify = true;
      title += 'Warning';
      msg = warning ?
        this.formatMessage(warning, warning.module && warning.module.rawRequest ? warning.module.rawRequest : '') :
        'Unknown';
      icon = this.warningIcon;
      sound = this.warningSound;
      this.buildSuccessful = false;
    } else {
      title += 'Success';
      if (this.suppressSuccess === 'always' || (this.suppressSuccess === 'initial' && !this.hasRun)) {
        notify = false;
      } else if (this.suppressSuccess === false || !this.buildSuccessful) {
        notify = true; // previous build failed, let's show a notification even if success notifications are suppressed
      }
      this.buildSuccessful = true;
    }

    if (notify) {
      notifier.notify(
        Object.assign(this.notifyOptions || {}, {
          title,
          sound,
          icon,
          appName: this.appName,
          message: stripAnsi(msg),
          contentImage: this.logo,
          wait: !this.buildSuccessful
        })
      );
    }

    if (this.activateTerminalOnError && !this.buildSuccessful) {
      this.activateTerminalWindow();
    }

    this.hasRun = true;
  };

  private readonly onCompilationWatchRun = (
    compiler: webpack.compiler.Compiler,
    callback: Function
  ): void => {
    notifier.notify({
      appName: this.appName,
      title: this.title,
      message: 'Compilation started...',
      contentImage: this.logo,
      icon: this.compileIcon,
      sound: this.compilationSound
    } as Notification);
    callback();
  };

  private readonly registerSnoreToast = (): void => {
    // ensure the SnoreToast appId is registered, which is needed for Windows Toast notifications
    // this is necessary in Windows 8 and above, (Windows 10 post build 1709), where all notifications must be generated
    // by a valid application.
    // see: https://github.com/KDE/snoretoast, https://github.com/RoccoC/webpack-build-notifier/issues/20
    if (process.platform === 'win32') {
      const versionParts = os.release().split('.');
      const winVer = +(`${versionParts[0]}.${versionParts[1]}`);
      if (winVer >= 6.2) {
        // Windows version >= 8
        const snoreToast = path.join(require.resolve('node-notifier'), '../vendor/snoreToast/SnoreToast.exe');
        try {
          execFileSync(
            snoreToast,
            [
              '-appID',
              'Snore.DesktopToasts',
              '-install',
              'SnoreToast.lnk',
              snoreToast,
              'Snore.DesktopToasts'
            ]
          );
          this.appName = 'Snore.DesktopToasts';
        } catch (e) {
          console.error('An error occurred while attempting to install the SnoreToast AppID!', e);
        }
      }
    }
  };
}
