const http = require('http');
const fs = require('fs');

let config;

exports.startWebserver = function(){
    config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    http.createServer(handleRequest).listen(config.webserver.port);
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

function handle404(request, response){
    response.writeHead(404, {'Content-Type': 'text/html'});
    response.end("<html><head><body>404 Not Found</body></head></html>");
}