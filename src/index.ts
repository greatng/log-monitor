import * as fs from 'fs';

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

function main(argv: string[]) {
    if (argv.length === 0) {
        console.error(
            'Please provide a file name: ex: npm run start "log.log"'
        );
    }

    const fileName = argv[0];

    fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        const lines = splitCSVLine(data);
        const logs = splitCSVcolumns(lines);

        console.log(logs);
    });
}

main(process.argv.slice(2));

