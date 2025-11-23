const fastify = require("fastify")();
const path = require("path");
const fastifyStatic = require("@fastify/static");
const fs = require("fs/promises");
const fss = require("fs");

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "static"),
  prefix: "/",
});

let treesDir = path.join(__dirname, "trees");
if (!fss.existsSync(treesDir)) {
  fss.mkdirSync(treesDir);
}

fastify.get("/list", async function (req, res) {
  try {
    return (await fs.readdir(treesDir)).map((filename) => {
      return filename.replace(/ > /g, "/").replace(/\.[^\.]*$/, "");
    });
  } catch (e) {
    return { error: e.message };
  }
});

fastify.get("/trees/:name", async function (req, res) {
  try {
    return fs.readFile(getFilename(req.params.name));
  } catch (e) {
    return { error: e.message };
  }
});

fastify.post("/save/:name", async function (req, res) {
  try {
    await fs.writeFile(getFilename(req.params.name), req.body);
    return {};
  } catch (e) {
    return { error: e.message };
  }
});

fastify.get("/delete/:name", async function (req, res) {
  try {
    await fs.unlink(getFilename(req.params.name));
    return {};
  } catch (e) {
    return { error: e.message };
  }
});

fastify.listen({ port: 3000 }, function (err, addr) {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Listening on", addr);
  }
});

function getFilename(treeName) {
  return path.join(
    __dirname,
    "trees",
    treeName.replace(/\//g, " > ") + ".json"
  );
}
