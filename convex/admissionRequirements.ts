import { query } from './_generated/server'

export const getAdmissionRequirements = query({
    handler: async (ctx) => {
        return await ctx.db.query('admissionRequirements').collect()
    }
})