import { error } from 'console';
import type { CollectionAfterReadHook } from 'payload';

//export const checkDate: CollectionBeforeOperationHook = async ({
//    args,
//    operation,
//    req: {payload}
//}) => {
//    console.log(operation)
//    if(operation == 'read'){
//        if(args?.where?.slug?.equals == '1'){
//            const a = await payload.find({
//              collection: 'pages',
//              where: {
//                slug: {
//                  equals: '1',
//                },
//              },
//            });
//            console.log(a)
//            args.where.slug.equals = 'no'
//        }
//    }
//    return args
//};

export const checkDate: CollectionAfterReadHook = async ({
    doc,
    collection,
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