var path = require('path');
var express = require('express');
var app = express();
module.exports = app;

var publicPath = path.join(__dirname, '../public');
var indexHtmlPath = path.join(__dirname, '../index.html');

app.use(express.static(publicPath));

app.get('/', function (req, res) {
    res.sendFile(indexHtmlPath);
});