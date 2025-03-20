export type JSON =
    | string
    | number
    | boolean
    | null
    | JSON[]
    | { [key: string]: JSON };
