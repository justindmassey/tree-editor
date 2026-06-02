const fastify = require("fastify")();
const path = require("path");
const fastifyStatic = require("@fastify/static");
const fs = require("fs/promises");
const fss = require("fs");
const sep = " > ";
const ext = ".json";

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "static"),
  prefix: "/",
});

const treesDir = path.join(__dirname, "trees");
if (!fss.existsSync(treesDir)) {
  fss.mkdirSync(treesDir);
}

fastify.get("/list", async function () {
  try {
    return (await fs.readdir(treesDir)).map((filename) => {
      return filename.replaceAll(sep, path.sep).slice(0, -ext.length);
    });
  } catch (e) {
    console.error("Error listing trees:", e.message);
    return { error: "Internal server error" };
  }
});

fastify.get("/tree", async function (req) {
  try {
    return await fs.readFile(getFilename(req.query.name));
  } catch (e) {
    console.error("Error reading tree:", e.message);
    return { error: "Internal server error" };
  }
});

fastify.post("/save", async function (req) {
  try {
    await fs.writeFile(getFilename(req.query.name), req.body);
    return {};
  } catch (e) {
    console.error("Error saving tree:", e.message);
    return { error: "Internal server error" };
  }
});

fastify.get("/delete", async function (req) {
  try {
    await fs.unlink(getFilename(req.query.name));
    return {};
  } catch (e) {
    console.error("Error deleting tree:", e.message);
    return { error: "Internal server error" };
  }
});

fastify.listen({ port: 7433 }, function (err, addr) {
  if (err) {
    console.error("Startup error:", err.message);
  } else {
    console.log("Server running at http://localhost:7433");
  }
});

function getFilename(treeName) {
  if (typeof treeName !== "string") {
    throw new Error("Invalid tree name");
  }

  const safeTreeName = treeName.replaceAll(path.sep, sep);
  const resolvedPath = path.resolve(treesDir, safeTreeName + ext);

  if (!resolvedPath.startsWith(treesDir)) {
    throw new Error("Access denied");
  }

  return resolvedPath;
}
