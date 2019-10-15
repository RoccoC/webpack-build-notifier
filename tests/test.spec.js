import webpack from 'webpack';
import WebpackBuildNotifierPlugin from '../index';
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

  describe.each([['Windows', 'win32'], ['Mac OS', 'darwin']])(
    'Platform: %s', (platformName, platform) => {
      beforeAll(() => {
        Object.defineProperty(process, 'platform', {
          value: platform
        });
        jest.spyOn(child_process, 'execFileSync').mockImplementation(jest.fn());
        jest.spyOn(os, 'release').mockImplementation(() => '10.0.18362');
      });

      it('Should show a compiling notification when watching', (done) => {
        let buildCount = 0;
        expect.assertions(1);
        const watcher = webpack(getWebpackConfig({}, 'success', true), (err, stats) => {
          buildCount++;
          if (buildCount === 1) {
            notifier.notify.mockClear();
            watcher.invalidate();
          } else if (buildCount === 2) {
            expect(notifier.notify).toHaveBeenCalledWith({
              appName: platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
              contentImage: undefined,
              icon: require.resolve('../icons/compile.png'),
              message: 'Compilation started...',
              sound: 'Submarine',
              title: 'Build Notification Test',
            });
            watcher.close(() => { });
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
            icon: require.resolve('../icons/success.png'),
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
            icon: require.resolve('../icons/failure.png'),
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
            icon: require.resolve('../icons/warning.png'),
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
            icon: require.resolve('../icons/failure.png'),
            message: 'Hello, you have an error!',
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