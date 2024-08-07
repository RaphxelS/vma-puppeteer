const { Worker } = require('worker_threads');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const votesPerWorker = parseInt(args[0], 10);
const nbVotes = parseInt(args[1], 10);
const numberOfWorkers = parseInt(args[2], 10);

if (isNaN(votesPerWorker) || votesPerWorker <= 0) {
    console.error('Invalid votes Per Worker. Please provide a positive integer.');
    console.error('node main.js [voter] [nbVotes] [thread]');
    process.exit(1);
}

if (isNaN(nbVotes) || nbVotes <= 0) {
    console.error('Invalid number of votes. Please provide a positive integer.');
    console.error('node main.js [voter] [nbVotes] [thread]');
    process.exit(1);
}

if (isNaN(numberOfWorkers) || numberOfWorkers <= 0) {
    console.error('Invalid number Of Workers. Please provide a positive integer.');
    console.error('node main.js [voter] [nbVotes] [thread]');
    process.exit(1);
}



let emails = [];
let completedWorkers = 0;

const handleWorkerMessages = (worker, workerIndex) => {
    worker.on('message', (mail) => {
        emails.push(mail);
    });

    worker.on('exit', () => {
        completedWorkers++;
        if (completedWorkers === numberOfWorkers) {
            fs.appendFile('emails.txt',  emails.join('\n'), function (err) {
                if (err) throw err;
              });
            console.log('All emails have been saved to emails.txt');
        }
    });

    worker.on('error', (err) => {
        console.error(`Worker ${workerIndex} encountered an error:`, err);
    });
};

for (let i = 0; i < numberOfWorkers; i++) {
    const worker = new Worker(path.resolve(__dirname, 'worker.js'), {
        workerData: { votesPerWorker, workerIndex: i, nbVotes }
    });

    handleWorkerMessages(worker, i);
}
