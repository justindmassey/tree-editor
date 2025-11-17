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
      return filename.replace(/\.[^\.]*$/, "");
    });
  } catch (e) {
    return { error: e.message };
  }
});

fastify.get("/trees/:name", async function (req, res) {
  let filename = path.join(__dirname, "trees", req.params.name + ".json");
  try {
    return fs.readFile(filename);
  } catch (e) {
    return { error: e.message };
  }
});

fastify.post("/save/:name", async function (req, res) {
  let filename = path.join(__dirname, "trees", req.params.name + ".json");
  try {
    await fs.writeFile(filename, req.body);
  } catch (e) {
    return { error: e.message };
  }
  return {};
});

fastify.get("/delete/:name", async function (req, res) {
  let filename = path.join(__dirname, "trees", req.params.name + ".json");
  try {
    await fs.unlink(filename);
    return { error: null };
  } catch (e) {
    return { error: e.message };
  }
});

fastify.listen({ port: 3000 }, function (err, addr) {
  console.log("Listening on", addr);
});
