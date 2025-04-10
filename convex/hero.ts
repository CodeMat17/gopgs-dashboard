import { query } from './_generated/server'

export const getHero = query({
    handler: async (ctx) => {
        return await ctx.db.query('hero').collect()
    }
})