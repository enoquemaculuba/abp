import {MySqlErrorHandling} from "./Types";
import {Static, Type} from "@sinclair/typebox";

export interface QueryResult {
    rows:Array<any>,
}

export type QueryResponse = QueryResult & MySqlErrorHandling


export const DatabaseResponse = Type.Object({
    rows: Type.Array(Type.Any()),
    success: Type.Boolean(),
    error: Type.Optional(Type.Object({message:Type.String()}))
});

export const IdQueryString = Type.Object({
    id: Type.Number()
})
export type IdQueryStringType = Static<typeof IdQueryString>