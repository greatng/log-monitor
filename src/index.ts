import * as fs from 'fs';

const APP_NAME = 'LOG Monitor';

type pidInfo = {
    pid: string;
    start: string;
    end?: string;
    duration: number; // epoch time
    description: string;
};

enum ProcessType {
    Start,
    Stop,
}

function calculateProcessingTime(start: string, end: string): number {
    return new Date(end).getTime() - new Date(start).getTime();
}

function processLogs(logs: string[][]): void {
    const pidMap: any = {};

    for (let i = 0; i < logs.length; i++) {
        const line = logs[i];

        // skip this line if log is not valid format
        if (line.length !== 3) {
            continue;
        }

        const pid = line[3];

        const processType =
            line[2].toUpperCase() === 'START'
                ? ProcessType.Start
                : ProcessType.Stop;

        if (processType === ProcessType.Start) {
            const start = parseInt(line[0]);
            const description = line[4];

            pidMap[pid] = {
                pid,
                start,
                description,
            };
        } else {
            pidMap[pid].end = parseInt(line[0]);
        }

        // In case logs is just the portion and there is no START or END time
        if (pidMap[pid].start && pidMap[pid].end) {
            pidMap[pid].duration = calculateProcessingTime(
                pidMap[pid].start,
                pidMap[pid].end
            );
        }
    }
}

function warnLog(message: string) {
    console.warn(`[${APP_NAME}][WARN] ${message}`);
}

function errorLog(message: string, error?: Error) {
    console.error(`[${APP_NAME}][ERROR] ${message}`, error);
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

