// convex/dashboard.ts
import { query } from "./_generated/server";

const sumDownloads = (docs: { downloads?: number }[]) =>
  docs.reduce((total, doc) => total + (doc.downloads ?? 0), 0);

// Lightweight counts for the CMS home dashboard.
export const getOverview = query({
  handler: async (ctx) => {
    const [
      courses,
      news,
      staff,
      alumni,
      pen,
      materials,
      gpc,
      fees,
      contact,
    ] = await Promise.all([
      ctx.db.query("courses").collect(),
      ctx.db.query("news").collect(),
      ctx.db.query("staff").collect(),
      ctx.db.query("alumni").collect(),
      ctx.db.query("postgradPen").collect(),
      ctx.db.query("materials").collect(),
      ctx.db.query("gpc").collect(),
      ctx.db.query("fees").collect(),
      ctx.db.query("contactUs").first(),
    ]);

    const departments = [
      contact?.admissionOffice?.[0],
      contact?.researchOffice?.[0],
      contact?.studentSupport?.[0],
    ];

    return {
      courses: courses.length,
      news: news.length,
      newsViews: news.reduce((total, doc) => total + doc.views, 0),
      staff: staff.length,
      alumni: alumni.length,
      penArticles: pen.length,
      penViews: pen.reduce((total, doc) => total + doc.views, 0),
      downloads: sumDownloads(materials) + sumDownloads(gpc) + sumDownloads(fees),
      files: materials.length + gpc.length + fees.length,
      latestNews: news
        .sort((a, b) => b._creationTime - a._creationTime)
        .slice(0, 5)
        .map(({ _id, title, views, _creationTime }) => ({
          _id,
          title,
          views,
          _creationTime,
        })),
      contact: {
        hasAddress: Boolean(contact?.address?.trim()),
        departmentsConfigured: departments.filter((d) => d?.email || d?.tel)
          .length,
      },
    };
  },
});
