const es = require('event-stream');
const fs = require('fs')

const readStream = fs.createReadStream('sample.txt');
const bufferSize = 2;
const buffer = [];
let batchCount = 0;

const asyncFunc = (arr, batchCount) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(`Finished processing batch ${batchCount} |  data [${arr}]`);
            resolve();
        }, 2000);
    })
}

readStream
    .pipe(es.split())
    .pipe(es.through(
        async function write(data) {
            // console.log(`Item received ${data}`);
            buffer.push(data);
            if (buffer.length === bufferSize) {
                batchCount++;
                console.log(`Buffer size reached | Batchcount: ${batchCount}`);
                this.pause();
                await asyncFunc(buffer, batchCount);
                console.log(`Batch ${batchCount} completed`);
                buffer.length = 0;
                this.resume();
            }
        },
        async function end(){
            if (buffer.length >0 ){
                batchCount+=1
                console.log(`<<<Clearing bufffer residue>>>`);
                await asyncFunc(buffer, batchCount);
                console.log(`Batch ${batchCount} completed`);
            }
            console.log(`<<<Stream ended>>>`);
            this.emit('end');
        }
    ));