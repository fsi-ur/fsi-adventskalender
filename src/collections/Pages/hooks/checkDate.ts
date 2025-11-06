import type { CollectionBeforeReadHook } from 'payload';

export const checkDate: CollectionBeforeReadHook = async ({
    doc,
    req
}) => {
    if(req.user != null){
        return doc
    }

    if(doc.slug != 'unopeneddoor'){
        const now = new Date()
        const publishDate = new Date(doc.publishedAt)

        if(now >= publishDate){
            return doc
        }

        const redirect = await req.payload.find({
            collection: 'pages',
            where: {
                slug: {
                    equals: 'unopeneddoor',
                },
            },
            limit: 1
        });
        if(redirect.totalDocs == 0){
            throw new Error("Redirect page was not available!")
        }
        return(redirect.docs[0])
    }
    return doc
};
