import * as fs from 'fs';

const APP_NAME = 'LOG Monitor';

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

function prepareLogs(fullPath: string): void {
    fs.readFile(fullPath, 'utf8', (error, data) => {
        if (error) {
            errorLog('Open file error', error);
            return;
        }

        const lines = splitCSVLine(data);
        const logs = splitCSVcolumns(lines);

        console.log(logs);
    });
}

function main(argv: string[]) {
    if (argv.length === 0) {
        errorLog('Please provide a file name: ex: npm run start "log.log"');
    }

    const fileName = argv[0];

    fs.realpath(fileName, (error, path) => {
        if (error) {
            errorLog('File not found', error);
            return;
        }

        prepareLogs(path);
    });
}

main(process.argv.slice(2));

