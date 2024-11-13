import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { spawn } from 'child_process';

class internalServerError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        this.stack = (new Error()).stack;
    }
}

const PORT = process.env.PORT || 5000;

const app = express();

const TEMPDIR = './temp';

app.use(express.text());
app.use(cors());


function generateFileName() {
    const time = Date.now();
    const randomValue = Math.floor(Math.random() * 1e6);
    const fileName = `${time}_${randomValue}_input.txt`;
    return fileName;
}

function checkDirExists(dir) {
    fs.access(dir, fs.constants.F_OK, (err)=>{
        if(err) {
            return false;
        }
        else {
            return true;
        }
    })
}

function createFile(dir, fileName, data) {

    if(!checkDirExists(dir)) {
        fs.mkdir(dir, {recursive:true}, (err)=>{
            if(err) {
                console.error("Error creating dir, ", dir);
                throw new internalServerError("Error saving code");
            }
        })
    }

    const fname = `${dir}/${fileName}`
    fs.writeFile(fname, data, (err)=>{
        if(err) {
            console.error("Error creating file", err);
            throw new internalServerError("Error saving code");
        }
    })

}

function deleteFile(dir, fileName) {
    const path = `${dir}/${fileName}`;
    fs.unlink(path, (err)=>{
        if(err) {
            console.error("Error deleting file at", path);
        }
    })
}

function respondWithError(res, err) {
    res.setHeader("Content-Type", "text/plain");
    res.status(500).send(err);
}

async function runToadCode(dir, fileName) {

    const path = `${dir}/${fileName}`;
    const Process = spawn('java' , ["-jar", "./toad.jar" , path]);

    let output = "";

    return new Promise((resolve, request)=>{
        Process.stdout.on("data", (data)=>{
            output += String(data);
        })

        Process.stderr.on("data", (data)=>{
            output += String(data);
        })

        Process.on("close", (code)=>{
            output += `Exited with code ${code}`;
            deleteFile(dir, fileName);
            resolve(output);
        })

        Process.on("error", (err)=>{
            rejects(err);
        })
    })

}

app.post('/', async(req, res)=>{

    const fname = generateFileName();
    try{
        createFile(TEMPDIR, fname, req.body) 
        const out = await runToadCode(TEMPDIR, fname);
        res.setHeader("Content-type", "text/plain");
        res.status(200).send(out);
        return;
    }
    catch(err) {
        if(err instanceof internalServerError) {
            respondWithError(res, err.message);
        }
        else {
            res.status(500).send("Unexpected server error");
        }
    }

})

app.listen(PORT, ()=>{
    console.log(`listening at port ${PORT}`);
})