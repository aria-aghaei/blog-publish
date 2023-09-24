const fs = require('node:fs');
const showdown = require("showdown");
const converter = new showdown.Converter();

const template = fs.readFileSync("./input/templates/index.template.html", 'utf-8');

const files = fs.readdirSync("./input/posts");
const posts = [];

files.sort((a, b) => {
    const file1 = fs.statSync(`./input/posts/${a}`);
    const file2 = fs.statSync(`./input/posts/${b}`);
    return file2.mtimeMs - file1.mtimeMs;
});

const post = async (file) => {
    const data = fs.readFileSync(file, 'utf-8'); 
    const stat = fs.statSync(file, 'utf-8'); 
    const mdname = file.split("/")[3];
    const name = mdname.replace('md', 'html');
    const filename = mdname.split(".")[0].replaceAll("_", " ");
    const filedate = new Date(stat.mtimeMs).toISOString().split('T')[0];
    const fileURL = encodeURIComponent(`../posts/${name}`);
    const md = `##[${filename}](${fileURL})\n*${filedate}*\n\n` + data;
    const converted = converter.makeHtml(md);
    const out = template.replace("<!-- !INDEX_TEMPLATE -->", converted);
    fs.writeFileSync(`./www/html/posts/${name}`, out);
    posts.push(converted);
    console.log(name);
}

const calls = [];

for(const file of files){
    if(!file.endsWith(".md")) continue;
    calls.push(post(`./input/posts/${file}`));
}

const convertedForIndex = posts.join("<center>- - -</center>");
const outForIndex = template.replace("<!-- !INDEX_TEMPLATE -->", convertedForIndex);
fs.writeFileSync(`./www/html/index.html`, outForIndex);

const imageThumbnail = require('image-thumbnail');
const images = fs.readdirSync("./input/images");

const thumb = async (image) => {
    const out = await imageThumbnail(image);
    const name = image.split("/")[3];
    fs.writeFileSync(`./www/html/thumbs/${name}`, out);
    console.log(name);
}

for(const image of images){
    calls.push(thumb(`./input/images/${image}`));
}

fs.cpSync("./input/images/", "./www/html/images/", {recursive: true} )

Promise.all(calls);
