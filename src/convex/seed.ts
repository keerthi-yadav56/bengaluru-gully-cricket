import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Adds sample data for quick testing:
 * - Ensures an admin user exists (creates one if missing)
 * - Ensures a sample player user exists (creates one if missing)
 * - Seeds a couple of tournaments if none exist for the admin
 */
export const addSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    // 1) Ensure an admin user exists
    let admin = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .first();

    if (!admin) {
      const adminId = await ctx.db.insert("users", {
        name: "BGC Admin",
        email: "admin@bgc.local",
        role: "admin",
        fullName: "BGC Admin",
        phoneNumber: "+91 00000 00000",
        uniqueId: "BGC999",
        isPhoneVerified: true,
      } as any);
      admin = await ctx.db.get(adminId);
    }

    if (!admin) {
      throw new Error("Failed to create or fetch admin user for seeding.");
    }

    // 2) Ensure at least one regular player user exists
    let playerUser = await ctx.db
      .query("users")
      .withIndex("by_unique_id", (q) => q.eq("uniqueId", "BGC001"))
      .first();

    if (!playerUser) {
      const playerId = await ctx.db.insert("users", {
        name: "Sample Player",
        email: "player@bgc.local",
        role: "player",
        fullName: "Sample Player",
        phoneNumber: "+91 11111 11111",
        uniqueId: "BGC001",
        isPhoneVerified: true,
      } as any);
      playerUser = await ctx.db.get(playerId);
    }

    // 3) Seed tournaments if none exist for this admin
    const existingForAdmin = await ctx.db
      .query("tournaments")
      .withIndex("by_created_by", (q) => q.eq("createdBy", admin._id))
      .collect();

    if (existingForAdmin.length === 0) {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");

      // T1
      await ctx.db.insert("tournaments", {
        name: "BGC Open Cup",
        description: "Open-format gully cricket tournament for all levels",
        maxTeams: 16,
        entryFeePerPerson: 200,
        rewards: "Trophies + Medals + Goodies",
        groundPhotos: [
          "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=1200&auto=format&fit=crop",
        ],
        trophyPhotos: [
          "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?q=80&w=1200&auto=format&fit=crop",
        ],
        date: `${yyyy}-${mm}-${dd}`,
        location: "Indiranagar, Bengaluru",
        mapLink: "https://maps.google.com",
        oversPerMatch: 8,
        upiId: "bgc@upi",
        status: "upcoming",
        registrationDeadline: `${yyyy}-${mm}-${String(Number(dd) + 7).padStart(2, "0")}`,
        createdBy: admin._id,
      });

      // T2
      await ctx.db.insert("tournaments", {
        name: "BGC Night Bash",
        description: "Under lights, fast-paced cricket action",
        maxTeams: 12,
        entryFeePerPerson: 250,
        rewards: "Cash Prize + Trophy",
        groundPhotos: [
          "https://images.unsplash.com/photo-1605296867753-61f1672b2b51?q=80&w=1200&auto=format&fit=crop",
        ],
        trophyPhotos: [
          "https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=1200&auto=format&fit=crop",
        ],
        date: `${yyyy}-${mm}-${String(Number(dd) + 10).padStart(2, "0")}`,
        location: "Koramangala, Bengaluru",
        mapLink: "https://maps.google.com",
        oversPerMatch: 6,
        upiId: "bgc@upi",
        status: "upcoming",
        registrationDeadline: `${yyyy}-${mm}-${String(Number(dd) + 9).padStart(2, "0")}`,
        createdBy: admin._id,
      });
    }

    return { ok: true };
  },
});
