import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import _ from 'lodash';
import sinon from 'sinon';
import * as Logs from '../../lib/device-log/ios-simulator-log';
import * as CrashLogs from '../../lib/device-log/ios-crash-log';
import log from '../../lib/commands/log';


chai.should();
chai.use(chaiAsPromised);

describe('XCUITestDriver - startLogCapture', function () {
  let startCaptureSpy, crashLogStub, iosLogStub;

  before(function () {
    const spy = {
      startCapture: _.noop,
    };
    startCaptureSpy = sinon.spy(spy, 'startCapture');
    crashLogStub = sinon.stub(CrashLogs, 'IOSCrashLog').callsFake(function () {
      this.startCapture = _.noop;
    });
    iosLogStub = sinon.stub(Logs, 'IOSSimulatorLog').callsFake(function () {
      this.startCapture = spy.startCapture;
    });
  });

  after(function () {
    startCaptureSpy.restore();
    crashLogStub.restore();
    iosLogStub.restore();
  });

  // establish that the basic things work as we imagine
  it('should not spawn more than one instance of idevicesyslog', async function () {
    const fakeInstance = {
      logs: undefined,
      opts: {},
      isRealDevice: _.noop,
    };
    startCaptureSpy.callCount.should.equal(0);
    await log.startLogCapture.call(fakeInstance);
    startCaptureSpy.callCount.should.equal(1);
    fakeInstance.logs.syslog.isCapturing = true;

    await log.startLogCapture.call(fakeInstance);
    startCaptureSpy.callCount.should.equal(1);
  });
});
