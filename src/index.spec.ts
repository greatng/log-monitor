import { processLogs } from '.';

describe('index', () => {
    it('should pass', () => {
        expect(true).toBe(true);
    });

    describe('processLogs', () => {
        let errorLogSpy: jest.SpyInstance;
        let warnLogSpy: jest.SpyInstance;

        beforeEach(() => {
            errorLogSpy = jest.spyOn(console, 'error').mockImplementation();
            warnLogSpy = jest.spyOn(console, 'warn').mockImplementation();
        });

        afterEach(() => {
            errorLogSpy.mockRestore();
            warnLogSpy.mockRestore();
        });

        it('should process logs without any warning or error', () => {
            const logs = [
                ['00:00:00', 'Task Start', 'START', '1'],
                ['00:01:00', 'Task End', 'END', '1'],
            ];

            processLogs(logs);

            expect(errorLogSpy).not.toHaveBeenCalled();
            expect(warnLogSpy).not.toHaveBeenCalled();
        });

        it('should process logs with warning', () => {
            const logs = [
                ['00:00:00', 'Task Start', 'START', '1'],
                ['00:06:00', 'Task End', 'END', '1'],
            ];

            processLogs(logs);

            expect(errorLogSpy).not.toHaveBeenCalled();
            expect(warnLogSpy).toHaveBeenCalledTimes(1);
        });

        it('should process logs with error', () => {
            const logs = [
                ['00:00:00', 'Job Start', 'START', '1'],
                ['00:20:00', 'Job End', 'END', '1'],
            ];

            processLogs(logs);

            expect(errorLogSpy).toHaveBeenCalledTimes(1);
            expect(warnLogSpy).not.toHaveBeenCalled();
        });
    });

    // need to test prepare log and main fn too
});

