import express from "express";
import ejs from "ejs";
import { search } from "./search.mjs";

const rules = await ejs.renderFile("examples/ddar.ejs");

const app = express();

app.use(express.text({ type: "*/*" }));

app.post("/", (req, res) => {
    const terms = req.body
        .split(/[,;\n]/)
        .map((x) => x.trim())
        .filter((x) => x.length > 0)
        .map((x) => `(${x})`)
        .join("\n\n");
    const data = [rules, terms]
        .join("\n\n")
        .split("\n\n")
        .map((x) => x.trim())
        .filter((x) => x.length > 0);
    const result = [];
    const generator = search(data, req.query.size || 1024, (candidate) => {
        if (candidate.length() === 0) {
            const str = candidate.conclusion().toString();
            const toAppend = str.slice(1, -1);
            result.push(toAppend);
        }
    });
    while (true) {
        if (generator.next().done) {
            break;
        }
    }
    res.type("text/plain").send(`${result.join(req.query.sep || "\n")}\n`);
});

app.listen(3000);
