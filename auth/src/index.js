"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var body_parser_1 = require("body-parser");
var app = express_1.default();
app.use(body_parser_1.json());
app.get('/api/users/currentuser', function (req, res) {
    res.send('Hi there!');
});
app.listen(3000, function () {
    console.log('Listening on port 3000!');
});
