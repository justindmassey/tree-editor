const fastify = require("fastify")();
const path = require("path");
const fastifyStatic = require("@fastify/static");
const fs = require("fs/promises");
const fss = require("fs");
const ext = ".json";

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "static"),
  prefix: "/",
});

let treesDir = path.join(__dirname, "trees");
if (!fss.existsSync(treesDir)) {
  fss.mkdirSync(treesDir);
}

fastify.get("/list", async function () {
  try {
    return (await fs.readdir(treesDir)).map((filename) => {
      return decodeURIComponent(filename.slice(0, -ext.length));
    });
  } catch (e) {
    return { error: e.message };
  }
});

fastify.get("/tree", async function (req) {
  try {
    return await fs.readFile(getFilename(req.query.name));
  } catch (e) {
    return { error: e.message };
  }
});

fastify.post("/save", async function (req) {
  try {
    await fs.writeFile(getFilename(req.query.name), req.body);
    return {};
  } catch (e) {
    return { error: e.message };
  }
});

fastify.get("/delete", async function (req) {
  try {
    await fs.unlink(getFilename(req.query.name));
    return {};
  } catch (e) {
    return { error: e.message };
  }
});

fastify.listen({ port: 7433 }, function (err, addr) {
  if (err) {
    if (err.code == "EADDRINUSE") {
      console.log("Couldn't start server.");
      console.log("Tree Editor is probably already running.");
    } else {
      console.error(err.message);
    }
    process.exit(1);
  } else {
    console.log("You can now visit http://localhost:7433");
  }
});

function getFilename(treeName) {
  return path.join(__dirname, "trees", encodeURIComponent(treeName) + ext);
}
