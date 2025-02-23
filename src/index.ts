import * as fs from 'fs';

const APP_NAME = 'LOG Monitor';

type ProcessInfo = {
    pid: string;
    start?: string;
    end?: string;
    duration: number; // epoch time
    description: string;
};

enum LogError {
    WARN = 'WARN',
    ERROR = 'ERROR',
}

function createDateFromTime(time: string): Date {
    const [hh, mm, ss] = time.split(':').map((t) => parseInt(t));

    return new Date(0, 0, 0, hh, mm, ss);
}

function calculateProcessingTime(start: string, end: string): number {
    const startDate = createDateFromTime(start);
    const endDate = createDateFromTime(end);

    return endDate.getTime() - startDate.getTime();
}

function isProcessTypeStart(processType: string): boolean {
    return processType.toUpperCase().trim() === 'START';
}

function triageLogDuration(duration: number): LogError | null {
    const MS_TO_MINUTE = 60 * 1000;

    if (duration > 10 * MS_TO_MINUTE) {
        return LogError.ERROR;
    } else if (duration > 5 * MS_TO_MINUTE) {
        return LogError.WARN;
    }

    return null;
}

function processLogs(logs: string[][]): void {
    const processInfo = {} as ProcessInfo;

    for (let i = 0; i < logs.length; i++) {
        const line = logs[i];

        // skip this line if log is not valid format
        if (line.length !== 4) {
            continue;
        }

        const pid = line[3];

        if (isProcessTypeStart(line[2])) {
            const start = line[0];
            const description = line[1];

            processInfo[pid] = {
                pid,
                start,
                description,
            };
        } else {
            processInfo[pid] = {
                ...processInfo[pid],
                end: line[0],
            };
        }

        // In case logs is just the portion and there is no START or END time
        if (processInfo[pid].start && processInfo[pid].end) {
            processInfo[pid].duration = calculateProcessingTime(
                processInfo[pid].start,
                processInfo[pid].end
            );
        }

        // check if log should show any warning/error
        const error = triageLogDuration(processInfo[pid].duration);

        if (error) {
            switch (error) {
                case LogError.WARN:
                    warnLog(
                        `PID: ${pid} - ${processInfo[pid].description} - Process took longer than 5 minutes`
                    );
                    break;
                case LogError.ERROR:
                    errorLog(
                        `PID: ${pid} - ${processInfo[pid].description} - Process took longer than 10 minutes`
                    );
                    break;
            }
        }
    }
}

function warnLog(message: string) {
    // add color in terminal
    console.warn('\x1b[33m', `[${APP_NAME}][WARN] ${message}`, '\x1b[0m');
}

function errorLog(message: string, error?: Error) {
    // add color in terminal
    console.error(
        '\x1b[31m',
        `[${APP_NAME}][ERROR] ${message}`,
        error ?? '',
        '\x1b[0m'
    );
}

function splitCSVcolumns(lines: string[]): string[][] {
    const columns = lines.map((line) => {
        return line.split(',');
    });

    return columns;
}

function splitCSVLine(data: string): string[] {
    const lines = data.split('\n');

    return lines;
}

function prepareLogs(fullPath: string): Promise<string[][]> {
    const resultPromise = new Promise<string[][]>((resolve, reject) => {
        fs.readFile(fullPath, 'utf8', (error, data) => {
            if (error) {
                errorLog('Error reading file', error);
                reject(error);
                return;
            }

            const lines = splitCSVLine(data);
            const logs = splitCSVcolumns(lines);

            resolve(logs);
        });
    });

    return resultPromise;
}

function main(argv: string[]) {
    if (argv.length === 0) {
        errorLog('Please provide a file name: ex: npm run start "log.log"');
    }

    const fileName = argv[0];

    // incase some user use relative path
    fs.realpath(fileName, async (error, path) => {
        if (error) {
            errorLog('File not found', error);
            return;
        }

        const logs = await prepareLogs(path);

        processLogs(logs);
    });
}

main(process.argv.slice(2));

