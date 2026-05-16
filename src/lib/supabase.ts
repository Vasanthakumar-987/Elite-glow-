import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── Contact ────────────────────────────────────────────────────────────────────
export const insertContact = async (data: {
  name: string;
  email: string;
  message: string;
}) => {
  return await supabase.from("contact_messages").insert([data]);
};

// ── Testimonials ───────────────────────────────────────────────────────────────
export interface Testimonial {
  id: string;
  customer_name: string;
  customer_role: string | null;
  message: string;
  rating: number;
  is_active: boolean;
  created_at: string;
}

export interface TestimonialInsert {
  customer_name: string;
  customer_role?: string | null;
  message: string;
  rating: number;
  is_active: boolean;
}

export const fetchAllTestimonials = () =>
  supabase.from("testimonials").select("*").order("created_at", { ascending: false });

export const fetchActiveTestimonials = () =>
  supabase.from("testimonials").select("*").eq("is_active", true).order("created_at", { ascending: false });

export const insertTestimonial = (data: TestimonialInsert) =>
  supabase.from("testimonials").insert([data]);

export const updateTestimonial = (id: string, data: Partial<TestimonialInsert>) =>
  supabase.from("testimonials").update(data).eq("id", id);

export const deleteTestimonial = (id: string) =>
  supabase.from("testimonials").delete().eq("id", id);

export const toggleTestimonialActive = (id: string, is_active: boolean) =>
  supabase.from("testimonials").update({ is_active }).eq("id", id);

// ── Services ───────────────────────────────────────────────────────────────────
export interface Service {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  price: number;
  duration_minutes: number | null;
  is_active: boolean;
  created_at: string;
}

export interface ServiceInsert {
  name: string;
  category?: string | null;
  description?: string | null;
  price: number;
  duration_minutes?: number | null;
  is_active: boolean;
}

export const fetchAllServices = () =>
  supabase.from("services").select("*").order("created_at", { ascending: false });

export const fetchActiveServices = () =>
  supabase.from("services").select("*").eq("is_active", true).order("created_at", { ascending: false });

export const insertService = (data: ServiceInsert) =>
  supabase.from("services").insert([data]).select();

export const updateService = (id: string, data: Partial<ServiceInsert>) =>
  supabase.from("services").update(data).eq("id", id);

export const deleteService = (id: string) =>
  supabase.from("services").delete().eq("id", id).select();

export const toggleServiceActive = (id: string, is_active: boolean) =>
  supabase.from("services").update({ is_active }).eq("id", id);

// ── Appointments ───────────────────────────────────────────────────────────────
export interface Appointment {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
  notes: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "cancellation_requested";
  created_at: string;
}

export interface AppointmentInsert {
  customer_name: string;
  customer_email?: string | null;
  customer_phone: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string | null;
  status?: "pending" | "confirmed" | "completed" | "cancelled" | "cancellation_requested";
}

export const fetchAllAppointments = () =>
  supabase.from("appointments").select("*").order("appointment_date", { ascending: false });

export const insertAppointment = (data: AppointmentInsert) =>
  supabase.from("appointments").insert([data]);

export const updateAppointmentStatus = (id: string, status: Appointment["status"]) =>
  supabase.from("appointments").update({ status }).eq("id", id);

export const updateAppointmentNotes = (id: string, notes: string | null) =>
  supabase.from("appointments").update({ notes }).eq("id", id);

export const deleteAppointment = (id: string) =>
  supabase.from("appointments").delete().eq("id", id);

export const fetchAppointmentForCancellation = (phone: string, date: string) =>
  supabase.from("appointments").select("*").eq("customer_phone", phone).eq("appointment_date", date).limit(1).single();

// ── Gallery ────────────────────────────────────────────────────────────────────
export interface GalleryItem {
  id: string;
  title: string | null;
  image_url: string;
  category: string | null;
  description?: string | null;
  price?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface GalleryInsert {
  title?: string | null;
  image_url: string;
  category?: string | null;
  description?: string | null;
  price?: string | null;
  is_active: boolean;
}

export const fetchAllGallery = () =>
  supabase.from("gallery").select("*").order("created_at", { ascending: false });

export const fetchActiveGallery = () =>
  supabase.from("gallery").select("*").eq("is_active", true).order("created_at", { ascending: false });

export const insertGallery = (data: GalleryInsert) =>
  supabase.from("gallery").insert([data]).select();

export const updateGallery = (id: string, data: Partial<GalleryInsert>) =>
  supabase.from("gallery").update(data).eq("id", id);

export const deleteGallery = (id: string) =>
  supabase.from("gallery").delete().eq("id", id).select();

export const toggleGalleryActive = (id: string, is_active: boolean) =>
  supabase.from("gallery").update({ is_active }).eq("id", id);

// ── Analytics ──────────────────────────────────────────────────────────────────
export interface AnalyticsData {
  totalMessages: number;
  totalTestimonials: number;
  activeTestimonials: number;
  totalServices: number;
  activeServices: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  totalGallery: number;
  activeGallery: number;
}

export const fetchAnalytics = async (): Promise<AnalyticsData> => {
  const [
    messages,
    testimonials,
    activeTestimonials,
    services,
    activeServices,
    appointments,
    pendingAppts,
    confirmedAppts,
    completedAppts,
    gallery,
    activeGallery,
  ] = await Promise.all([
    supabase.from("contact_messages").select("id", { count: "exact", head: true }),
    supabase.from("testimonials").select("id", { count: "exact", head: true }),
    supabase.from("testimonials").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("services").select("id", { count: "exact", head: true }),
    supabase.from("services").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("appointments").select("id", { count: "exact", head: true }),
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("gallery").select("id", { count: "exact", head: true }),
    supabase.from("gallery").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  return {
    totalMessages: messages.count ?? 0,
    totalTestimonials: testimonials.count ?? 0,
    activeTestimonials: activeTestimonials.count ?? 0,
    totalServices: services.count ?? 0,
    activeServices: activeServices.count ?? 0,
    totalAppointments: appointments.count ?? 0,
    pendingAppointments: pendingAppts.count ?? 0,
    confirmedAppointments: confirmedAppts.count ?? 0,
    completedAppointments: completedAppts.count ?? 0,
    totalGallery: gallery.count ?? 0,
    activeGallery: activeGallery.count ?? 0,
  };
};
