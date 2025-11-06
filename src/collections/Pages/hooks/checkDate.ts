import type { CollectionBeforeReadHook } from 'payload';

export const checkDate: CollectionBeforeReadHook = async ({ doc, req }) => {
  if (req.user) return doc;

  // Prevent recursion
  if ((req as any)._inCheckDateHook) return doc;
  (req as any)._inCheckDateHook = true;

  if (doc.slug !== 'unopeneddoor') {
    const now = new Date();
    const publishDate = new Date(doc.publishedAt);

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

