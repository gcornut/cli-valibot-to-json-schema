# @gcornut/cli-valibot-to-json-schema

CLI wrapper for [@valibot/to-json-schema](https://github.com/fabian-hiller/valibot/tree/main/packages/to-json-schema) to convert JS/TS files containing Valibot schemas into a JSON schema (draft 07).

```shell
# Convert valibot schemas to JSON schema
npx @gcornut/cli-valibot-to-json-schema ./schemas.js
```

This outputs a conversion of the Valibot schemas into JSON schema. If the default export is a Valibot schemas, it is
used as
the root definition. Other exported Valibot schemas are converted in the JSON schema <code>$defs</code> section.

<details><summary><b>See detailed input and output:</b></summary>

_Input file `./schemas.js`_:

```js
import * as v from "valibot";

export const AString = v.string();
const AnObject = v.object({ aString: AString });
export default AnObject;
```

_Output conversion_:

```json
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$defs": {
        "AString": {
            "type": "string"
        }
    },
    "properties": {
        "aString": {
            "$ref": "#/$defs/AString"
        }
    },
    "required": ["aString"],
    "type": "object"
}
```

`AnObject` is the default export in the source module, so it is converted as the root definition. `AString` is exported
separately, so it is exported to the `definitions` section.

</details>

[See @valibot/to-json-schema README](https://github.com/fabian-hiller/valibot/blob/main/packages/to-json-schema/README.md) for details on the limited compatibility when converting Valibot schema.

## ESM and TypeScript input module

This CLI loads the input JS module using **standard NodeJS CommonJS require**. This means you will
have issues with **ESM or TypeScript modules**.

To remedy that, you will either have to preinstall `ebuild-runner` and `esbuild` (so that the program can use them) or
use a Node-compatible runtime that support these modules (ex: bun, replacing `npx` with `bunx`).

Example:

```shell
# Convert from TS/ESM module using bunx
bunx @gcornut/cli-valibot-to-json-schema ./schemas.ts

# Convert from TS/ESM module with esbuild-runner preinstalled
npm install esbuild esbuild-runner
npx @gcornut/cli-valibot-to-json-schema ./schemas.ts

# Convert from TS/ESM module using `yarn dlx` multi-package feature
yarn dlx -p esbuild -p esbuild-runner -p @gcornut/cli-valibot-to-json-schema valibot-json-schema ./schemas.ts
```

## Parameters

Use `-o <file>` option to output the JSON schema to a file instead of `stdout`.

Use `-t <type>` option to select the root definitions from the module exports (defaults to the "default" export).
Example: `-t foo.bar` will get the property `bar` on the `foo` export of the input module.

Use `-d <type>` option to select the definitions from the module exports (instead of using all non-default export).
Example: `-d foo.bar` will get the property `bar` on the `foo` export of the input module.

Use `--force` to ignore unsupported schemas and validations and still provide an output.
