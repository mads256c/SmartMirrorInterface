const http = require('http');
const fs = require('fs');

let config;
let language;

exports.startWebserver = function(){

    fs.stat('config.json', function(err, stats) {
        if(stats === undefined){
            console.log(err);
        } else {
            console.log("fil eksisterer");
            config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

            fs.stat('languages/' + config.interface.locale.layout + '.json', function(err,stats) {
                if(stats === undefined){
                    console.log("Locale not yet supported, using en-US");
                    language = JSON.parse(fs.readFileSync('languages/en-US.json', 'utf8'));
                } else {
                    language = JSON.parse(fs.readFileSync('languages/' + config.interface.locale.layout + '.json', 'utf8'));
                }
            });

            fs.stat('dev/', function(err,stats) {
                if (stats === undefined){
                    console.log(err);
                } else {
                    console.log("!!!!DEV ENV!!!!")
                    config = JSON.parse(fs.readFileSync('dev/config.json', 'utf8'));
                    language = JSON.parse(fs.readFileSync('languages/' + config.interface.locale.layout + '.json', 'utf8'));
                }});

            http.createServer(handleRequest).listen(config.webserver.port);
        }
    });
};

function handleRequest(request, response){

    console.log(request.url);

    switch (request.url) {
        case "/testpage":
            handleTestPage(request, response);
            break;

        case "/getconfig":
            handleGetConfig(request, response);
            break;

        case "/getlanguage":
            handleGetLanguage(request,response);
            break;

        default:
            handle404(request, response);
            break;
    }
}

function handleTestPage(request, response){
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end("<html><head><body>Hello world!</body></head></html>");
}

function handleGetConfig(request, response){
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(JSON.stringify(config));
}

function handleGetLanguage(request, response){
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(JSON.stringify(language));
}

function handle404(request, response){
    response.writeHead(404, {'Content-Type': 'text/html'});
    response.end("<html><head><body>404 Not Found</body></head></html>");
}

