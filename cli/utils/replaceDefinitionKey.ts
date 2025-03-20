import type { JSON } from "./JSON";

export function replaceDefinitionKey(json: JSON, definitionsKey: string): JSON {
    if (json && typeof json === "object") {
        if (Array.isArray(json))
            return json.map((v) => replaceDefinitionKey(v, definitionsKey));

        const entries = Object.entries(json).map(([key, value]) => {
            if (key === "$defs")
                return [
                    definitionsKey,
                    replaceDefinitionKey(value, definitionsKey),
                ];
            if (key === "$ref" && typeof value === "string")
                return [key, value.replace("$defs/", `${definitionsKey}/`)];
            return [key, replaceDefinitionKey(value, definitionsKey)];
        });

        return Object.fromEntries(entries);
    }
    return json;
}
