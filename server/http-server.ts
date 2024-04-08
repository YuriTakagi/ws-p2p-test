import * as http from "http";
import * as fs from "fs";
import * as path from "path";

const port = 8080;

// HTTPサーバー
const createHttpServer = () => {
  return http.createServer((request, response) => {
    switch (request.url) {
      case "/":
      case "/index.html":
        serveFile("../client/index.html", "text/html", response);
        break;
      case "/client.js":
        serveFile("../client/client.js", "application/javascript", response);
        break;
      default:
        response.writeHead(404);
        response.end();
    }
  });
};


const serveFile = (
  filePath: string,
  contentType: string,
  response: http.ServerResponse
) => {
  const fullPath = path.join(__dirname, filePath);
  const readStream = fs.createReadStream(fullPath);
  response.writeHead(200, { "Content-Type": contentType });
  readStream.pipe(response);
};

const server = createHttpServer();

server.listen(port, () => {
  console.log(`HTTP Server is running on http://localhost:${port}`);
});
