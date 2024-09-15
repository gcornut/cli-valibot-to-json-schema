import childProcess from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import util from "node:util";

const root = path.resolve(__dirname, "../../");
const readJSON = (file: string) => JSON.parse(fs.readFileSync(file).toString());
const packageJson = readJSON(path.join(root, "package.json"));

const exec = util.promisify(childProcess.exec);
let cliBuiltPromise: Promise<unknown> | undefined;

// Build it once
async function buildOnce() {
    if (cliBuiltPromise) return cliBuiltPromise;
    const command = "bun run build";
    cliBuiltPromise = exec(command) as Promise<unknown>;
    await cliBuiltPromise;
}

/** Run CLI with args */
export async function runCLI(args: string) {
    await buildOnce();
    const cli = path.join(root, packageJson.bin);
    try {
        const nodeCmd = os.platform() === "win32" ? "node " : "";
        const { stdout } = await exec(`${nodeCmd}${cli} ${args}`, {
            cwd: __dirname,
        });
        return JSON.parse(stdout);
    } catch (error) {
        return error;
    }
}

/** Read test resource */
export const readFile = (file: string) =>
    readJSON(path.resolve(__dirname, file));
