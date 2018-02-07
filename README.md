# multiupload

middleware for express, parse multipart and upload file

```js
const MultiUpload = require('multiupload');
const Express = require('express');
const app = new Express;

app.get('/test1', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<form method="post" action="test1" enctype="multipart/form-data">
    <input type="text" name="key" value="1q2w3e4r">
    <input type="submit" value="test">
    </form>`);
});

app.get('/test2', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<form method="post" action="test2" enctype="multipart/form-data">
    <input type="file" name="file">
    <input type="submit" value="test">
    </form>`);
});

app.get('/test3', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<form method="post" action="test3" enctype="multipart/form-data">
    <input type="file" name="file">
    <input type="submit" value="test">
    </form>`);
});

app.get('/test4', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<form method="post" action="test4" enctype="multipart/form-data">
    <input type="file" name="file1">
    <input type="file" name="file2">
    <input type="submit" value="test">
    </form>`);
});

//parse not file in query type @buffer
app.post('/test1', MultiUpload.middleware, (req, res) => {
    console.log(req.query.key.toString()); //1q2w3e4r
    res.end();
});

//save file in './'
app.post('/test2', MultiUpload.middleware, (req, res) => {
    console.log(req.files[0].path);
    res.end();
});

//save all file in '../upload'
app.post('/test3', new MultiUpload('../uploads'), (req, res) => {
    console.log(req.files[0].path);
    res.end();
});

//filter parse data
//if return filename you save file, else read in query data
app.post('/test4', new MultiUpload('../uploads', (req, headers) => {
    let contentType = headers['Content-Type'];
    if (contentType === 'image/jpeg'
        || contentType === 'image/png'
        || contentType === 'image/pjpeg') {
        return Math.random() + '.' + contentType.split('/')[1];
    }
}), (req, res) => {
    console.log(req.files[0]);
    console.log(req.query.file1);
    console.log(req.query.file2);
    res.end();
});

app.listen(80);
```
