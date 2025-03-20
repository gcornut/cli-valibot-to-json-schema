import { describe, expect, test } from "vitest";
import { readFile, runCLI } from "./test/utils";

function testCase({
    run,
    expectedOutput,
}: {
    run: string;
    expectedOutput: string | RegExp;
}) {
    return async () => {
        const actual = await runCLI(run);
        if (expectedOutput instanceof RegExp)
            expect(actual.toString()).toMatch(expectedOutput);
        else expect(actual).toEqual(expectedOutput);
    };
}

describe("module formats", () => {
    test(
        "Convert named export",
        testCase({
            run: "./single-type-export.valibot.ts",
            expectedOutput: readFile("./single-type-export.schema.json"),
        }),
    );

    test(
        "Convert default export",
        testCase({
            run: "./single-type-export-default.valibot.ts",
            expectedOutput: readFile(
                "./single-type-export-default.schema.json",
            ),
        }),
    );

    test(
        "Convert both default export and named export",
        testCase({
            run: "./single-type-multi-exports.valibot.ts",
            expectedOutput: readFile("./single-type-multi-exports.schema.json"),
        }),
    );

    test(
        "Convert from CJS module",
        testCase({
            run: "./complex-type.valibot.cjs",
            expectedOutput: readFile("./complex-type.schema.json"),
        }),
    );
});

describe("main schema and definitions", () => {
    test(
        "Choose main type",
        testCase({
            run: "./complex-type.valibot.ts -t ListElement",
            expectedOutput: readFile(
                "./complex-type-root-list-element.schema.json",
            ),
        }),
    );

    test(
        "Convert nested main type",
        testCase({
            run: "./single-type-nested.valibot.ts -t schemas.NumberSchema",
            expectedOutput: readFile(
                "./single-type-nested-with-main.schema.json",
            ),
        }),
    );

    test(
        "Convert nested definitions type",
        testCase({
            run: "./single-type-nested.valibot.ts --definitions schemas",
            expectedOutput: readFile(
                "./single-type-nested-with-definitions.schema.json",
            ),
        }),
    );

    test(
        "Convert and replace the definitions key",
        testCase({
            run: "./complex-type.valibot.ts --definitionsKey definitions",
            expectedOutput: readFile("./complex-type-definitions.schema.json"),
        }),
    );
});

describe("Handle conversion error", () => {
    test(
        "Throw error on unknown validation",
        testCase({
            run: "./unknown-validation.valibot.ts",
            expectedOutput:
                /Error: The "check" action cannot be converted to JSON Schema/i,
        }),
    );

    test(
        "Force conversion validation when asked",
        testCase({
            run: "--force ./unknown-validation.valibot.ts",
            expectedOutput: readFile(
                "./unknown-validation-ignored.schema.json",
            ),
        }),
    );
});
