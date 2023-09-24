const fs = require('node:fs');
const showdown = require("showdown");
const converter = new showdown.Converter();

const template = fs.readFileSync("./input/templates/index.template.html", 'utf-8');

const files = fs.readdirSync("./input/posts");
const posts = [];

const post = async (file) => {
    const data = fs.readFileSync(file, 'utf-8'); 
    const converted = converter.makeHtml(data);
    const out = template.replace("<!-- !INDEX_TEMPLATE -->", converted);
    const name = file.split("/")[3].replace('md', 'html');
    fs.writeFileSync(`./www/posts/${name}`, out);
    posts.push(converted);
    console.log(name);
}

const calls = [];

for(const file of files){
    if(!file.endsWith(".md")) continue;
    calls.push(post(`./input/posts/${file}`));
}

Promise.all(calls);

const convertedForIndex = posts.join("<center>- - -</center>");
const outForIndex = template.replace("<!-- !INDEX_TEMPLATE -->", convertedForIndex);
fs.writeFileSync(`./www/index.html`, outForIndex);

const imageThumbnail = require('image-thumbnail');
const images = fs.readdirSync("./input/images");

const thumb = async (image) => {
    const out = await imageThumbnail(image);
    const name = image.split("/")[3];
    fs.writeFileSync(`./www/thumbs/${name}`, out);
    console.log(name);
}

const calls2 = [];

for(const image of images){
    calls2.push(thumb(`./input/images/${image}`));
}

fs.cpSync("./input/images/", "./www/images/", {recursive: true} )

Promise.all(calls2);

