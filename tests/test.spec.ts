import webpack from 'webpack';
import WebpackBuildNotifierPlugin from '../src/index';
import getWebpackConfig from './webpack.config';
import notifier from 'node-notifier';
import child_process from 'child_process';
import os from 'os';

// TODO: test for registerSnoreToast

describe('WebpackBuildNotifierPlugin export initialization test', () => {
  it('WebpackBuildNotifierPlugin should not undefined', () => {
    expect(WebpackBuildNotifierPlugin).not.toBe(undefined);
  });

  it('WebpackBuildNotifierPlugin should not null', () => {
    expect(WebpackBuildNotifierPlugin).not.toBe(null);
  });

  it('WebpackBuildNotifierPlugin should be function', () => {
    expect(typeof WebpackBuildNotifierPlugin).toBe('function');
  });
});

describe('Test Webpack build', () => {
  const platform = process.platform;

  afterAll(() => {
    if (platform !== process.platform) {
      Object.defineProperty(process, 'platform', {
        value: platform
      });
    }
  });

  it('sets the onClick listener', () => {
    const onClick = jest.fn();
    new WebpackBuildNotifierPlugin({
      onClick,
    });
    expect(notifier.on).toHaveBeenCalledWith('click', onClick);
  });

  it('sets the onTimeout listener', () => {
    const onTimeout = jest.fn();
    new WebpackBuildNotifierPlugin({
      onTimeout,
    });
    expect(notifier.on).toHaveBeenCalledWith('timeout', onTimeout);
  });

  describe.each([['Windows', 'win32'], ['Mac OS', 'darwin']])(
    'Platform: %s', (platformName: string, platform: string) => {
      beforeAll(() => {
        Object.defineProperty(process, 'platform', {
          value: platform
        });
        jest.spyOn(child_process, 'execFileSync').mockImplementation(jest.fn());
        jest.spyOn(os, 'release').mockImplementation(() => '10.0.18362');
      });

      it('Should not show an initial success notification when suppressSuccess is "initial"', (done) => {
        expect.assertions(1);
        webpack(getWebpackConfig({ suppressSuccess: 'initial' }), (err, stats) => {
          expect(notifier.notify).not.toHaveBeenCalled();
          done();
        });
      });

      it('Should activate terminal on error (Mac OS only)', (done) => {
        const exec = jest.spyOn(child_process, 'exec').mockImplementation(jest.fn());
        expect.assertions(1);
        webpack(getWebpackConfig({ activateTerminalOnError: true }, 'error'), (err, stats) => {
          if (platformName === 'Windows') {
            expect(exec).not.toHaveBeenCalled();
          } else {
            expect(exec).toHaveBeenCalled();
          }
          done();
        });
      });

      it('Should show a compiling notification when watching', (done) => {
        let buildCount = 0;
        expect.assertions(1);
        const watcher = webpack(getWebpackConfig({}, 'success', true), (err, stats) => {
          buildCount++;
          if (buildCount === 1) {
            (notifier.notify as jest.Mock).mockClear();
            (watcher as webpack.Compiler.Watching).invalidate();
          } else if (buildCount === 2) {
            expect(notifier.notify).toHaveBeenCalledWith({
              appName: platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
              contentImage: undefined,
              icon: require.resolve('../src/icons/compile.png'),
              message: 'Compilation started...',
              sound: 'Submarine',
              title: 'Build Notification Test',
            });
            (watcher as webpack.Compiler.Watching).close(() => { });
            done();
          }
        });
      });

      it('Should show a success notification', (done) => {
        expect.assertions(1);
        webpack(getWebpackConfig(), (err, stats) => {
          expect(notifier.notify).toHaveBeenCalledWith({
            appName: platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
            contentImage: undefined,
            icon: require.resolve('../src/icons/success.png'),
            message: 'Build successful!',
            sound: 'Submarine',
            title: 'Build Notification Test - Success',
            wait: false,
          });
          done();
        });
      });

      it('Should show an error notification', (done) => {
        expect.assertions(1);
        webpack(getWebpackConfig({}, 'error'), (err, stats) => {
          expect(notifier.notify).toHaveBeenCalledWith({
            appName: platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
            contentImage: undefined,
            icon: require.resolve('../src/icons/failure.png'),
            message: expect.stringContaining('Module parse failed: Duplicate export \'default\''),
            sound: 'Submarine',
            title: 'Build Notification Test - Error',
            wait: true,
          });
          done();
        });
      });

      it('Should show a warning notification', (done) => {
        expect.assertions(1);
        webpack(getWebpackConfig({}, 'warning'), (err, stats) => {
          expect(notifier.notify).toHaveBeenCalledWith({
            appName: platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
            contentImage: undefined,
            icon: require.resolve('../src/icons/warning.png'),
            message: expect.stringContaining('entrypoint size limit'),
            sound: 'Submarine',
            title: 'Build Notification Test - Warning',
            wait: true,
          });
          done();
        });
      });

      it('Should show an error notification with a custom message', (done) => {
        const messageFormatter = jest.fn().mockImplementation(() => 'Hello, you have an error!');
        expect.assertions(2);
        webpack(getWebpackConfig({ messageFormatter }, 'error'), (err, stats) => {
          expect(messageFormatter).toHaveBeenCalledWith(expect.any(Object), require.resolve('./error.js'));
          expect(notifier.notify).toHaveBeenCalledWith({
            appName: platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
            contentImage: undefined,
            icon: require.resolve('../src/icons/failure.png'),
            message: 'Hello, you have an error!',
            sound: 'Submarine',
            title: 'Build Notification Test - Error',
            wait: true,
          });
          done();
        });
      });

      it('Should show "Unknown" if message is not defined', (done) => {
        const messageFormatter = jest.fn().mockImplementation(() => undefined);
        expect.assertions(1);
        webpack(getWebpackConfig({ messageFormatter }, 'error'), (err, stats) => {
          expect(notifier.notify).toHaveBeenCalledWith({
            appName: platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
            contentImage: undefined,
            icon: require.resolve('../src/icons/failure.png'),
            message: 'Unknown',
            sound: 'Submarine',
            title: 'Build Notification Test - Error',
            wait: true,
          });
          done();
        });
      });

      it('Should throw if messageFormatter returns invalid type', (done) => {
        const messageFormatter = jest.fn().mockImplementation(() => 99);
        expect.assertions(1);
        webpack(getWebpackConfig({ messageFormatter }, 'error'), (err, stats) => {
          expect(err).toContain('Invalid message type');
          done();
        });
      });
    });
});
