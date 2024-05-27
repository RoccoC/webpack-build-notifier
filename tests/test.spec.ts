import child_process from 'child_process';
import notifier from 'node-notifier';
import os from 'os';
import webpack from 'webpack';
import WebpackBuildNotifierPlugin from '../src/index';
import { CompilationStatus } from '../src/types';
import getWebpackConfig from './webpack.config';

// TODO: test for registerSnoreToast

describe('Test Webpack build', () => {
  const { arch, platform } = process;

  afterAll(() => {
    if (platform !== process.platform) {
      Object.defineProperty(process, 'platform', {
        value: platform,
      });
      Object.defineProperty(process, 'arch', {
        value: arch,
      });
    }
  });

  it('sets the onClick listener', () => {
    const onClick = jest.fn();
    // eslint-disable-next-line no-new
    new WebpackBuildNotifierPlugin({
      onClick,
    });
    expect(notifier.on).toHaveBeenCalledWith('click', onClick);
  });

  it('sets the onTimeout listener', () => {
    const onTimeout = jest.fn();
    // eslint-disable-next-line no-new
    new WebpackBuildNotifierPlugin({
      onTimeout,
    });
    expect(notifier.on).toHaveBeenCalledWith('timeout', onTimeout);
  });

  describe.each([
    ['Windows', 'win32'],
    ['Mac OS', 'darwin'],
  ])('Platform: %s', (platformName: string, platformKey: string) => {
    beforeAll(() => {
      Object.defineProperty(process, 'platform', {
        value: platformKey,
      });
      Object.defineProperty(process, 'arch', {
        value: 'x64',
      });
      jest.spyOn(child_process, 'execFileSync').mockImplementation(jest.fn());
      jest.spyOn(os, 'release').mockImplementation(() => '10.0.18362');
    });

    it('Should not show an initial success notification when suppressSuccess is "initial"', (done) => {
      expect.assertions(1);
      webpack(getWebpackConfig({ suppressSuccess: 'initial' }), () => {
        expect(notifier.notify).not.toHaveBeenCalled();
        done();
      });
    });

    it('Should activate terminal on error (Mac OS only)', (done) => {
      const exec = jest
        .spyOn(child_process, 'exec')
        .mockImplementation(jest.fn());
      expect.assertions(1);
      webpack(
        getWebpackConfig({ activateTerminalOnError: true }, 'error'),
        () => {
          if (platformName === 'Windows') {
            expect(exec).not.toHaveBeenCalled();
          } else {
            expect(exec).toHaveBeenCalled();
          }
          done();
        },
      );
    });

    it('Should show a compiling notification when watching', (done) => {
      let buildCount = 0;
      const onCompileStart = jest.fn();
      expect.assertions(2);
      const watcher = webpack(
        getWebpackConfig({ onCompileStart }, 'success', true),
        () => {
          buildCount += 1;
          if (buildCount === 1) {
            (notifier.notify as jest.Mock).mockClear();
            watcher.watching?.invalidate();
          } else if (buildCount === 2) {
            expect(notifier.notify).toHaveBeenCalledWith({
              appName:
                platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
              contentImage: undefined,
              icon: require.resolve('../src/icons/compile.png'),
              message: 'Compilation started...',
              sound: 'Submarine',
              title: 'Build Notification Test',
            });
            expect(onCompileStart).toHaveBeenCalled();
            watcher.watching?.close(() => {});
            done();
          }
        },
      );
    });

    it('Should show a success notification', (done) => {
      const onComplete = jest.fn();
      expect.assertions(2);
      webpack(getWebpackConfig({ onComplete }), () => {
        expect(notifier.notify).toHaveBeenCalledWith({
          appName:
            platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
          contentImage: undefined,
          icon: require.resolve('../src/icons/success.png'),
          message: 'Build successful!',
          sound: 'Submarine',
          title: 'Build Notification Test - Success',
          wait: false,
        });
        expect(onComplete).toHaveBeenCalledWith(
          expect.any(Object),
          CompilationStatus.SUCCESS,
        );
        done();
      });
    });

    it('Should show a success notification with no sound', (done) => {
      const onComplete = jest.fn();
      expect.assertions(2);
      webpack(getWebpackConfig({ onComplete, sound: false }), () => {
        expect(notifier.notify).toHaveBeenCalledWith({
          appName:
            platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
          contentImage: undefined,
          icon: require.resolve('../src/icons/success.png'),
          message: 'Build successful!',
          title: 'Build Notification Test - Success',
          wait: false,
        });
        expect(onComplete).toHaveBeenCalledWith(
          expect.any(Object),
          CompilationStatus.SUCCESS,
        );
        done();
      });
    });

    it('Should show a success notification with duration', (done) => {
      expect.assertions(1);
      webpack(getWebpackConfig({ showDuration: true }), () => {
        expect(notifier.notify).toHaveBeenCalledWith({
          appName:
            platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
          contentImage: undefined,
          icon: require.resolve('../src/icons/success.png'),
          message: expect.stringMatching(/^Build successful! \[\d+ ms\]$/),
          sound: 'Submarine',
          title: 'Build Notification Test - Success',
          wait: false,
        });
        done();
      });
    });

    it('Should show an error notification', (done) => {
      const onComplete = jest.fn();
      expect.assertions(2);
      webpack(getWebpackConfig({ onComplete }, 'error'), () => {
        expect(notifier.notify).toHaveBeenCalledWith({
          appName:
            platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
          contentImage: undefined,
          icon: require.resolve('../src/icons/failure.png'),
          message: expect.stringContaining(
            "Module parse failed: Duplicate export 'default'",
          ),
          sound: 'Submarine',
          title: 'Build Notification Test - Error',
          wait: true,
        });
        expect(onComplete).toHaveBeenCalledWith(
          expect.any(Object),
          CompilationStatus.ERROR,
        );
        done();
      });
    });

    it('Should show a warning notification', (done) => {
      const onComplete = jest.fn();
      expect.assertions(2);
      webpack(getWebpackConfig({ onComplete }, 'warning'), () => {
        expect(notifier.notify).toHaveBeenCalledWith({
          appName:
            platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
          contentImage: undefined,
          icon: require.resolve('../src/icons/warning.png'),
          message: expect.stringContaining('entrypoint size limit'),
          sound: 'Submarine',
          title: 'Build Notification Test - Warning',
          wait: true,
        });
        expect(onComplete).toHaveBeenCalledWith(
          expect.any(Object),
          CompilationStatus.WARNING,
        );
        done();
      });
    });

    it('Should show a success notification with a custom message', (done) => {
      const formatSuccess = jest.fn(() => 'Very nice! Great success!');
      expect.assertions(2);
      webpack(getWebpackConfig({ formatSuccess }, 'success'), () => {
        expect(formatSuccess).toHaveBeenCalled();
        expect(notifier.notify).toHaveBeenCalledWith({
          appName:
            platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
          contentImage: undefined,
          icon: require.resolve('../src/icons/success.png'),
          message: 'Very nice! Great success!',
          sound: 'Submarine',
          title: 'Build Notification Test - Success',
          wait: false,
        });
        done();
      });
    });

    it('Should show default success notification message when formatSuccess returns undefined', (done) => {
      const formatSuccess = jest.fn(() => undefined);
      expect.assertions(2);
      webpack(getWebpackConfig({ formatSuccess }, 'success'), () => {
        expect(formatSuccess).toHaveBeenCalled();
        expect(notifier.notify).toHaveBeenCalledWith({
          appName:
            platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
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

    it('Should show an error notification with a custom message', (done) => {
      const messageFormatter = jest
        .fn()
        .mockImplementation(() => 'Hello, you have an error!');
      expect.assertions(2);
      webpack(getWebpackConfig({ messageFormatter }, 'error'), () => {
        expect(messageFormatter).toHaveBeenCalledWith(
          expect.any(Object),
          require.resolve('./error.js'),
          'error',
          1,
        );
        expect(notifier.notify).toHaveBeenCalledWith({
          appName:
            platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
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

    it('Should show a warning notification with a custom message', (done) => {
      const messageFormatter = jest
        .fn()
        .mockImplementation(() => 'Hello, you have a warning!');
      expect.assertions(2);
      webpack(getWebpackConfig({ messageFormatter }, 'warning'), () => {
        expect(messageFormatter).toHaveBeenCalledWith(
          expect.any(Object),
          '',
          'warning',
          2,
        );
        expect(notifier.notify).toHaveBeenCalledWith({
          appName:
            platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
          contentImage: undefined,
          icon: require.resolve('../src/icons/warning.png'),
          message: 'Hello, you have a warning!',
          sound: 'Submarine',
          title: 'Build Notification Test - Warning',
          wait: true,
        });
        done();
      });
    });

    it('Should show "Unknown" if message is not defined', (done) => {
      const messageFormatter = jest.fn().mockImplementation(() => undefined);
      expect.assertions(1);
      webpack(getWebpackConfig({ messageFormatter }, 'error'), () => {
        expect(notifier.notify).toHaveBeenCalledWith({
          appName:
            platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
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
      webpack(getWebpackConfig({ messageFormatter }, 'error'), (err) => {
        expect(err?.message).toContain(
          "Invalid message type 'number'; messageFormatter must return a string.",
        );
        done();
      });
    });

    it('Should pass extra notifyOptions to node-notifier', (done) => {
      expect.assertions(1);
      webpack(
        getWebpackConfig({ notifyOptions: { open: 'https://example.com' } }),
        () => {
          expect(notifier.notify).toHaveBeenCalledWith({
            appName:
              platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
            contentImage: undefined,
            icon: require.resolve('../src/icons/success.png'),
            message: 'Build successful!',
            open: 'https://example.com',
            sound: 'Submarine',
            title: 'Build Notification Test - Success',
            wait: false,
          });
          done();
        },
      );
    });

    it('Should execute the notifyOptions callback on success', (done) => {
      // Override notifyOptions on successful compilation only
      const notifyOptions = jest.fn((status: CompilationStatus) => (status === CompilationStatus.SUCCESS
        ? { open: 'https://example.com' }
        : undefined));

      expect.assertions(2);
      webpack(getWebpackConfig({ notifyOptions }), () => {
        expect(notifyOptions).toHaveBeenCalledWith(CompilationStatus.SUCCESS);
        expect(notifier.notify).toHaveBeenCalledWith({
          appName:
            platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
          contentImage: undefined,
          icon: require.resolve('../src/icons/success.png'),
          message: 'Build successful!',
          open: 'https://example.com',
          sound: 'Submarine',
          title: 'Build Notification Test - Success',
          wait: false,
        });
        done();
      });
    });

    it('Should execute the notifyOptions callback on error', (done) => {
      // Override notifyOptions on successful compilation only
      const notifyOptions = jest.fn((status: CompilationStatus) => (status === CompilationStatus.SUCCESS
        ? { open: 'https://www.example.com' }
        : undefined));

      expect.assertions(2);
      webpack(getWebpackConfig({ notifyOptions }, 'error'), () => {
        expect(notifyOptions).toHaveBeenCalledWith(CompilationStatus.ERROR);
        expect(notifier.notify).toHaveBeenCalledWith({
          appName:
            platformName === 'Windows' ? 'Snore.DesktopToasts' : undefined,
          contentImage: undefined,
          icon: require.resolve('../src/icons/failure.png'),
          message: expect.stringContaining(
            "Module parse failed: Duplicate export 'default'",
          ),
          // `open` should not be set
          sound: 'Submarine',
          title: 'Build Notification Test - Error',
          wait: true,
        });
        done();
      });
    });
  });
});
