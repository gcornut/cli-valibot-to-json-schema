import * as v from "valibot";

export const ListItemElement: v.GenericSchema = v.object({
    type: v.literal("li"),
    children: v.array(v.union([v.string(), v.lazy(() => ListElement)])),
});

export const ListElement = v.object({
    type: v.literal("ul"),
    children: v.array(v.lazy(() => ListItemElement)),
});
