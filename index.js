'use strict';

const fs = require('fs');
const path = require('path');

class MultiUpload {
    constructor(dest, fileName) {
        this.dest = dest;
        this.fileName = fileName;
        return MultiUpload.middleware.bind(this);
    }
    static middleware(req, res, next) {

        let contentType = req.headers['content-type'];

        if (contentType === undefined || contentType.indexOf('multipart') === -1) {
            if (typeof next === 'function') {
                next();
            }
            return;
        }

        let fileName, name, value, filds, offset, stream, buffer;
        let indexStart, indexBoundary, indexBoundaryNext;
        let boundary = '--' + contentType.split('boundary=')[1];
        let boundaryLen = boundary.length;
        let tempBuff = [];

        req.on('data', buf => {

            if (tempBuff.length === 0) {
                tempBuff = buf;
            } else {
                tempBuff = Buffer.concat([tempBuff, buf]);
            }

            offset = 0;

            while (offset < tempBuff.length - boundaryLen - 4) {

                if (stream === undefined && buffer === undefined) {
                    indexBoundary = tempBuff.indexOf(boundary, offset);
                    if (indexBoundary === -1) {
                        return;
                    }

                    indexStart = tempBuff.indexOf('\r\n\r\n', indexBoundary + boundaryLen);
                    if (indexStart === -1) {
                        return;
                    }

                    let headers = {};
                    filds = tempBuff.utf8Slice(indexBoundary + boundaryLen + 2, indexStart).split('\r\n');
                    for (value of filds) {
                        value = value.split(': ');
                        headers[value[0]] = value[1];
                    }
                    offset = indexStart + 4;

                    if (this instanceof MultiUpload && typeof this.fileName === 'function') {
                        fileName = this.fileName(req, headers);
                    } else {
                        fileName = headers['Content-Disposition'];

                        if (fileName !== undefined) {
                            fileName = fileName.split('filename="')[1];
                        }

                        if (typeof fileName === 'string') {
                            fileName = fileName.slice(0, -1);
                        }
                    }

                    if (typeof fileName === 'string') {
                        if (this instanceof MultiUpload && typeof this.dest === 'string') {
                            fileName = path.resolve(this.dest, fileName);
                        }
                        stream = fs.createWriteStream(fileName);
                    } else {
                        name = headers['Content-Disposition'];

                        if (name !== undefined) {
                            name = name.split('name="')[1];
                        }

                        if (typeof name === 'string') {
                            name = name.split('"')[0];
                            buffer = [];
                        }
                    }
                }

                indexBoundaryNext = tempBuff.indexOf(boundary, offset);

                if (indexBoundaryNext === -1) {
                    indexBoundary = Math.max(tempBuff.length - boundaryLen, offset);
                } else {
                    indexBoundary = indexBoundaryNext - 2;
                }

                if (stream !== undefined) {
                    stream.write(tempBuff.slice(offset, indexBoundary));
                    if (indexBoundaryNext !== -1) {
                        stream.close();
                        stream = undefined;
                    }
                } else if (buffer !== undefined) {
                    if (buffer.length === 0) {
                        buffer = tempBuff.slice(offset, indexBoundary);
                    } else {
                        buffer = Buffer.concat([buffer, tempBuff.slice(offset, indexBoundary)]);
                    }
                    if (indexBoundaryNext !== -1) {
                        req.query[name] = buffer;
                        buffer = undefined;
                    }
                }

                offset = indexBoundary;
            }

            tempBuff = tempBuff.slice(offset);

        }).on('end', () => {
            if (typeof next === 'function') {
                next();
            }
        });
    }
}

module.exports = MultiUpload;

