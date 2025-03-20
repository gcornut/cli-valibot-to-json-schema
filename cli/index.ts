import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import get from "lodash/get";
import stableStringify from "safe-stable-stringify";
import { any, type GenericSchema } from "valibot";

import { toJsonSchema } from "@valibot/to-json-schema";

import { isSchema } from "./utils/isSchema";
import { replaceDefinitionKey } from "./utils/replaceDefinitionKey";
import type { JSON } from "./utils/JSON";

const program = new Command();

program
    .name("cli-valibot-to-json-schema")
    .argument("<path>", "Path to the js or ts module.")
    .description("Convert Valibot schemas exported from a JS or TS module.")
    .option("-o, --out <file>", "Set the output file (default: stdout)")
    .option(
        "-t, --type <object_path>",
        `Object path to the main schema in the module exports (default: 'default' export)`,
    )
    .option(
        "-d, --definitions <object_path>",
        "Object path to additional schema definitions in the module exports (defaults to all but the 'default' export)",
    )
    .option(
        "--force",
        "If true, do not throw an error on validations that cannot be converted to JSON schema.",
    )
    .option(
        "--jsonIndent <nb_spaces>",
        "JSON indent characters (defaults to 2 spaces).",
    )
    .option(
        "--definitionsKey <definitions_key>",
        "JSON schema definitions key (defaults '$defs').",
    )
    .action(
        (
            sourcePath,
            {
                type,
                definitions: definitionsPath,
                out,
                force,
                jsonIndent,
                definitionsKey,
            },
        ) => {
            try {
                // Enable auto transpile of ESM & TS modules required
                require("esbuild-runner/register");
            } catch (err) {
                console.warn(
                    "Could not load module `esbuild-runner`: ESM/TS modules might not load properly.\n",
                );
            }

            // Load the source path module
            const module = require(path.resolve(sourcePath));
            let definitions: Record<string, GenericSchema> = {};
            if (definitionsPath) {
                definitions = get(module, definitionsPath);
                if (!definitions) {
                    throw new Error(
                        `Definitions path '${definitionsPath}' could not be found in ${sourcePath}`,
                    );
                }
            } else {
                // Load all exported schemas
                for (const [name, value] of Object.entries(module)) {
                    if (name === "default" || !isSchema(value)) continue;
                    definitions[name] = value;
                }
            }

            // Main type
            let schema = get(module, type);
            if (type && !schema) {
                throw new Error(
                    `Main type '${type}' could not be found in ${sourcePath}`,
                );
            }
            if (!type && module.default) {
                // Fallback: use default export as the main type
                schema = module.default;
            }

            // Convert
            let jsonSchema = toJsonSchema(schema || any(), {
                definitions,
                errorMode: force ? 'warn' : undefined,
            }) as JSON;

            // Replace definitions keys (if needed)
            if (definitionsKey)
                jsonSchema = replaceDefinitionKey(jsonSchema, definitionsKey);

            // Stringify
            const jsonSchemaString = stableStringify(
                jsonSchema,
                null,
                Number.parseInt(jsonIndent) || jsonIndent || 2,
            );

            // Output
            if (out) {
                // to file
                fs.writeFileSync(out, jsonSchemaString);
            } else {
                // to stdout
                process.stdout.write(`${jsonSchemaString}\n`);
            }
        },
    );

program.parse(process.argv);
