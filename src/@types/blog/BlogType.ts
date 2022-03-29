import { Static, Type } from '@sinclair/typebox'

const Blog = Type.Object({
    id: Type.Number(),
    title: Type.String(),
    writer: Type.String(),
    text: Type.String(),
    dateTime: Type.String(),
});

export const BlogPost = Type.Object({
    title: Type.String(),
    writer: Type.String(),
    text: Type.String(),
    id: Type.Optional(Type.Number())
});

export const BlogResponse = Type.Object({
    rows: Type.Array(Blog),
    success: Type.Boolean(),
    error: Type.Optional(Type.Object({message:Type.String()}))
});


export type BlogPostType = Static<typeof BlogPost>;

export type BlogRequest = {
    Querystring: { amount: number, id:number }
}

export const BlogQueryString = Type.Object({
    id: Type.Optional(Type.Number({description:'ID of blog to get'})),
    amount: Type.Optional(Type.Number({description:'This is an optional parameter for getting n amount of blogs'}))
})

export const BlogDeleteQueryString = Type.Object({
    id: Type.Number({description:'ID of a blog to be removed'}),
  })




