const v = require("valibot");

const ListItemElement = v.object({
    type: v.literal("li"),
    children: v.array(v.union([v.string(), v.lazy(() => ListElement)])),
});

const ListElement = v.object({
    type: v.literal("ul"),
    children: v.array(v.lazy(() => ListItemElement)),
});

module.exports = { ListElement, ListItemElement };
