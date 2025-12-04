import type { CollectionAfterReadHook } from 'payload';

export const checkDate: CollectionAfterReadHook = async ({ doc, req }) => {
  if (req.user) return doc;

  // Prevent recursion
  if ((req as any)._inCheckDateHook) return doc;
  (req as any)._inCheckDateHook = true;

  if (doc.slug !== 'unopeneddoor') {
    const now = new Date();
    const publishDate = new Date(doc.publishedAt);
    
    publishDate.setHours(0)
    publishDate.setMinutes(0)

    now.setHours(now.getHours()+1)

    console.log("now")
    console.log(now.toString())
    console.log(now)
    console.log("publishDate")
    console.log(publishDate.toString())
    console.log(publishDate)

    if (now < publishDate) {
      const redirect = await req.payload.find({
        collection: 'pages',
        where: { slug: { equals: 'unopeneddoor' } },
        limit: 1,
      });

      if (redirect.totalDocs === 0) throw new Error('Redirect page was not available!');
      return redirect.docs[0];
    }
  }

  return doc;
};

