import express from "express";
import ejs from "ejs";
import { search } from "./search.mjs";

const rules = await ejs.renderFile("examples/ddar.ejs");

const app = express();

app.use(express.text({ type: "application/x-www-form-urlencoded" }));
app.use(express.json());

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

app.post("/api/v1/searchAll", (req, res) => {
    const rules = req.body.rules;
    const facts = req.body.facts;
    const rulesSeperator = new RegExp(req.body.rulesSeperator || ";|\n");
    const factsSeperator = new RegExp(req.body.factsSeperator || ",|;|\n");
    const termsSeperator = new RegExp(req.body.termsSeperator || ",|=>");
    const bufferLimit = req.body.bufferLimit || 1024;
    const rulesStrings = rules
        .split(rulesSeperator)
        .map((x) => x.trim())
        .filter((x) => x.length > 0);
    const factsStrings = facts
        .split(factsSeperator)
        .map((x) => x.trim())
        .filter((x) => x.length > 0);
    const rulesList = rulesStrings.map((x) =>
        x
            .split(termsSeperator)
            .map((x) => x.trim())
            .filter((x) => x.length > 0)
            .map((x) => {
                const [predicate, ...objects] = x
                    .split(" ")
                    .map((y) => y.trim())
                    .filter((y) => y.length > 0);
                return `(${predicate} ${objects.map((y) => `\`${y}`).join(" ")})`;
            })
            .join("\n"),
    );
    const factsList = factsStrings.map((x) => `(${x})`);
    const data = [...rulesList, ...factsList];
    const result = [];
    const generator = search(data, bufferLimit, (candidate) => {
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
    res.json({
        result,
    });
});

app.listen(3000);
