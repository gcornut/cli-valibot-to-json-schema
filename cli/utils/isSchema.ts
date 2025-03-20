import type { GenericSchema } from "valibot";

export function isSchema(schema: unknown): schema is GenericSchema {
    return !!schema && typeof schema === "object" && "type" in schema;
}
