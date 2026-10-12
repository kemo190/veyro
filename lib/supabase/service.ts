import { supabase } from "./client";
import { Restaurant, UserProfile, Order, OrderFilterOptions, OrderCreationInput } from "@/types";
import { dataUrlToBlob } from "@/lib/utils/image-compression";

export const dbService = {
  // ----------------- Auth & Profile -----------------
  async getCurrentProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      let { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      // If user is authenticated in Supabase but profile row doesn't exist yet, auto-provision it!
      if (!profile) {
        const defaultRole = user.email?.includes("admin") ? "admin" : "employee";
        const defaultName =
          user.user_metadata?.display_name ||
          (user.email ? user.email.split("@")[0] : "موظف");
        const defaultRestaurantId = "22222222-2222-2222-2222-222222222222"; // مطبخ فيرو التجريبي

        // Try to insert into public.profiles
        const { data: created } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            restaurant_id: defaultRestaurantId,
            role: defaultRole,
            display_name: defaultName,
            email: user.email || "",
          })
          .select()
          .maybeSingle();

        if (created) {
          profile = created;
        } else {
          // In-memory fallback so user is NEVER blocked from entering
          return {
            id: user.id,
            restaurantId: defaultRestaurantId,
            role: defaultRole as any,
            displayName: defaultName,
            email: user.email || "",
          };
        }
      }

      return {
        id: profile.id,
        restaurantId: profile.restaurant_id,
        role: profile.role,
        displayName: profile.display_name,
        email: profile.email,
      };
    } catch (err) {
      console.error("getCurrentProfile error:", err);
      return null;
    }
  },

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    await supabase.auth.signOut();
  },

  // ----------------- Restaurants -----------------
  async getRestaurants(): Promise<Restaurant[]> {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*, orders(count)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching restaurants:", error);
      return [];
    }

    return (data || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      nameAr: r.name_ar,
      slug: r.slug,
      branch: r.branch,
      phone: r.phone,
      isActive: r.is_active,
      createdAt: r.created_at,
      ordersCount: r.orders?.[0]?.count || 0,
    }));
  },

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (data) {
        return {
          id: data.id,
          name: data.name,
          nameAr: data.name_ar,
          slug: data.slug,
          branch: data.branch,
          phone: data.phone,
          isActive: data.is_active,
          createdAt: data.created_at,
        };
      }
    } catch (e) {
      console.warn("Failed to fetch restaurant from supabase:", e);
    }

    // Default fallback so UI is immediately usable if offline or unseeded
    if (id === "22222222-2222-2222-2222-222222222222") {
      return {
        id: "22222222-2222-2222-2222-222222222222",
        name: "Veyro Kitchen",
        nameAr: "مطبخ فيرو",
        slug: "veyro-kitchen",
        branch: "الفرع النموذجي",
        phone: "+966500000000",
        isActive: true,
        createdAt: new Date().toISOString(),
      };
    }

    return null;
  },

  async createRestaurant(input: { name: string; nameAr: string; slug: string; branch?: string; phone?: string }): Promise<Restaurant> {
    const { data, error } = await supabase
      .from("restaurants")
      .insert({
        name: input.name,
        name_ar: input.nameAr,
        slug: input.slug,
        branch: input.branch,
        phone: input.phone,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      nameAr: data.name_ar,
      slug: data.slug,
      branch: data.branch,
      phone: data.phone,
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  },

  async toggleRestaurantActive(id: string, currentState: boolean): Promise<boolean> {
    const { error } = await supabase
      .from("restaurants")
      .update({ is_active: !currentState })
      .eq("id", id);

    if (error) throw error;
    return !currentState;
  },

  // ----------------- Orders -----------------
  async getOrders(filters?: OrderFilterOptions): Promise<Order[]> {
    let query = supabase
      .from("orders")
      .select(`
        id,
        restaurant_id,
        order_number,
        order_ticket_image,
        receipt_image,
        notes,
        created_at,
        created_by,
        restaurants ( name, name_ar ),
        profiles ( display_name )
      `)
      .order("created_at", { ascending: false });

    if (filters?.restaurantId) {
      query = query.eq("restaurant_id", filters.restaurantId);
    }

    if (filters?.searchQuery) {
      query = query.ilike("order_number", `%${filters.searchQuery.trim()}%`);
    }

    if (filters?.startDate) {
      query = query.gte("created_at", filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte("created_at", filters.endDate);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching orders:", error);
      return [];
    }

    return (data || []).map((o: any) => {
      const rest = Array.isArray(o.restaurants) ? o.restaurants[0] : o.restaurants;
      const prof = Array.isArray(o.profiles) ? o.profiles[0] : o.profiles;
      return {
        id: o.id,
        restaurantId: o.restaurant_id,
        restaurantName: rest?.name_ar || rest?.name || "مطعم",
        orderNumber: o.order_number,
        orderTicketImage: o.order_ticket_image,
        receiptImage: o.receipt_image,
        createdBy: o.created_by,
        createdByName: prof?.display_name || "موظف",
        createdAt: o.created_at,
        notes: o.notes,
      };
    });
  },

  async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        restaurant_id,
        order_number,
        order_ticket_image,
        receipt_image,
        notes,
        created_at,
        created_by,
        restaurants ( name, name_ar ),
        profiles ( display_name )
      `)
      .eq("id", id)
      .single();

    if (error || !data) return null;

    const rest = Array.isArray(data.restaurants) ? data.restaurants[0] : data.restaurants;
    const prof = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;

    return {
      id: data.id,
      restaurantId: data.restaurant_id,
      restaurantName: rest?.name_ar || rest?.name || "مطعم",
      orderNumber: data.order_number,
      orderTicketImage: data.order_ticket_image,
      receiptImage: data.receipt_image,
      createdBy: data.created_by,
      createdByName: prof?.display_name || "موظف",
      createdAt: data.created_at,
      notes: data.notes,
    };
  },

  // ----------------- Storage Upload -----------------
  async uploadOrderImage(
    fileOrBlobOrDataUrl: File | Blob | string,
    folder: string,
    filename: string
  ): Promise<string> {
    try {
      const bucketName = "orders-media";
      let uploadPayload: Blob | File;
      let contentType = "image/jpeg";

      if (typeof fileOrBlobOrDataUrl === "string") {
        if (fileOrBlobOrDataUrl.startsWith("data:")) {
          uploadPayload = dataUrlToBlob(fileOrBlobOrDataUrl);
          const mimeMatch = fileOrBlobOrDataUrl.match(/^data:([^;]+);/);
          if (mimeMatch) contentType = mimeMatch[1];
        } else if (fileOrBlobOrDataUrl.startsWith("http")) {
          // Already a remote URL
          return fileOrBlobOrDataUrl;
        } else {
          return fileOrBlobOrDataUrl;
        }
      } else {
        uploadPayload = fileOrBlobOrDataUrl;
        contentType = fileOrBlobOrDataUrl.type || "image/jpeg";
      }

      const filePath = `${folder}/${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, uploadPayload, {
          contentType,
          cacheControl: "31536000",
          upsert: true,
        });

      if (error) {
        console.warn(`Supabase storage upload failed, falling back gracefully:`, error.message);
        return typeof fileOrBlobOrDataUrl === "string" ? fileOrBlobOrDataUrl : "";
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.warn("Storage upload exception, falling back gracefully:", err);
      return typeof fileOrBlobOrDataUrl === "string" ? fileOrBlobOrDataUrl : "";
    }
  },

  async createOrder(restaurantId: string, input: OrderCreationInput, userId?: string): Promise<Order> {
    // 1. Upload ticket image to Supabase Storage (with fallback to compressed dataUrl)
    let ticketUrl = input.orderTicketImage;
    if (ticketUrl && ticketUrl.startsWith("data:")) {
      try {
        const uploaded = await this.uploadOrderImage(ticketUrl, restaurantId, `ticket_${input.orderNumber}.jpg`);
        if (uploaded) ticketUrl = uploaded;
      } catch (err) {
        console.warn("Ticket upload failed, using fallback dataUrl:", err);
      }
    }

    // 2. Upload receipt image to Supabase Storage (with fallback to compressed dataUrl)
    let receiptUrl = input.receiptImage;
    if (receiptUrl && receiptUrl.startsWith("data:")) {
      try {
        const uploaded = await this.uploadOrderImage(receiptUrl, restaurantId, `receipt_${input.orderNumber}.jpg`);
        if (uploaded) receiptUrl = uploaded;
      } catch (err) {
        console.warn("Receipt upload failed, using fallback dataUrl:", err);
      }
    }

    const { data, error } = await supabase
      .from("orders")
      .insert({
        restaurant_id: restaurantId,
        order_number: input.orderNumber.trim(),
        order_ticket_image: ticketUrl,
        receipt_image: receiptUrl,
        notes: input.notes?.trim() || null,
        created_by: userId || null,
      })
      .select(`
        *,
        restaurants ( name, name_ar )
      `)
      .single();

    if (error) throw error;

    const rest = Array.isArray(data.restaurants) ? data.restaurants[0] : data.restaurants;

    return {
      id: data.id,
      restaurantId: data.restaurant_id,
      restaurantName: rest?.name_ar || rest?.name,
      orderNumber: data.order_number,
      orderTicketImage: data.order_ticket_image,
      receiptImage: data.receipt_image,
      createdBy: data.created_by,
      createdAt: data.created_at,
      notes: data.notes,
    };
  },
};
