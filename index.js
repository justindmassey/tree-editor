const fastify = require("fastify")();
const path = require("path");
const fastifyStatic = require("@fastify/static");
const fs = require("fs/promises");
const fss = require("fs");
const sep = " > ";

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
      return filename.replaceAll(sep, path.sep).replace(/\.[^\.]*$/, "");
    });
  } catch (e) {
    return { error: e.message };
  }
});

fastify.get("/trees", async function (req) {
  try {
    return fs.readFile(getFilename(req.query.name));
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
    treeName.replaceAll(path.sep, sep) + ".json",
  );
}
