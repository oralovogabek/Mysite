
(function () {
  "use strict";

  const KEYS = {
    projects: "ogabek_portfolio_projects_v1",
    profile: "ogabek_portfolio_profile_v1",
    feedback: "ogabek_portfolio_feedback_v1"
  };

  // LocalStorage'dan xavfsiz ma'lumot olish
  function readLocal(key, fallback = []) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.error("LocalStorage xatosi:", error);
      return fallback;
    }
  }

  // LocalStorage'ga ma'lumot yozish
  function writeLocal(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Supabase ishlatilayotganini tekshirish
  function useSupabase() {
    return Boolean(window.sb && !window.isDemoMode);
  }

  // ID'larni solishtirish
  function sameId(a, b) {
    return String(a) === String(b);
  }

  window.Store = {

    // ==============================
    // PROJECTS
    // ==============================

    async getProjects() {
      if (useSupabase()) {
        const { data, error } = await window.sb
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
      }

      let projects = readLocal(KEYS.projects, null);

      if (!projects) {
        projects = window.SEED_PROJECTS || [];
        writeLocal(KEYS.projects, projects);
      }

      return projects;
    },

    async saveProject(project) {
      if (!project || !project.title) {
        throw new Error("Loyiha nomini kiriting.");
      }

      if (useSupabase()) {
        let result;

        if (project.id) {
          const { id, ...payload } = project;

          result = await window.sb
            .from("projects")
            .update(payload)
            .eq("id", id)
            .select()
            .single();
        } else {
          const { id, ...payload } = project;

          result = await window.sb
            .from("projects")
            .insert(payload)
            .select()
            .single();
        }

        if (result.error) throw result.error;
        return result.data;
      }

      const projects = await this.getProjects();

      if (project.id) {
        const index = projects.findIndex(
          item => sameId(item.id, project.id)
        );

        if (index === -1) {
          throw new Error("Loyiha topilmadi.");
        }

        projects[index] = {
          ...projects[index],
          ...project
        };

        writeLocal(KEYS.projects, projects);
        return projects[index];
      }

      const newProject = {
        ...project,
        id: "local-" + Date.now(),
        created_at: new Date().toISOString()
      };

      projects.unshift(newProject);
      writeLocal(KEYS.projects, projects);

      return newProject;
    },

    async deleteProject(id) {
      if (!id) throw new Error("Loyiha ID'si topilmadi.");

      if (useSupabase()) {
        const { error } = await window.sb
          .from("projects")
          .delete()
          .eq("id", id);

        if (error) throw error;
        return true;
      }

      const projects = await this.getProjects();

      const updated = projects.filter(
        item => !sameId(item.id, id)
      );

      writeLocal(KEYS.projects, updated);
      return true;
    },

    // ==============================
    // PROFILE
    // ==============================

    async getProfile() {
      if (useSupabase()) {
        const { data, error } = await window.sb
          .from("site_settings")
          .select("value")
          .eq("key", "profile")
          .maybeSingle();

        if (error) throw error;
        return data?.value || {};
      }

      return readLocal(KEYS.profile, {});
    },

    async saveProfile(profile) {
      if (!profile || typeof profile !== "object") {
        throw new Error("Profil ma'lumotlari noto'g'ri.");
      }

      if (useSupabase()) {
        const { error } = await window.sb
          .from("site_settings")
          .upsert(
            {
              key: "profile",
              value: profile,
              updated_at: new Date().toISOString()
            },
            { onConflict: "key" }
          );

        if (error) throw error;
        return true;
      }

      writeLocal(KEYS.profile, profile);
      return true;
    },

    // ==============================
    // FEEDBACK / MESSAGES
    // ==============================

    async sendFeedback(item) {
      if (!item || !item.name || !item.message) {
        throw new Error("Ism va xabar matni majburiy.");
      }

      const feedback = {
        name: item.name.trim(),
        email: item.email?.trim() || null,
        message: item.message.trim()
      };

      if (useSupabase()) {
        const { error } = await window.sb
          .from("feedback")
          .insert(feedback);

        if (error) throw error;
        return true;
      }

      const all = readLocal(KEYS.feedback, []);

      const newMessage = {
        ...feedback,
        id: "fb-" + Date.now(),
        created_at: new Date().toISOString(),
        status: "new"
      };

      all.unshift(newMessage);
      writeLocal(KEYS.feedback, all);

      return newMessage;
    },

    async getFeedback() {
      if (useSupabase()) {
        const { data, error } = await window.sb
          .from("feedback")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
      }

      return readLocal(KEYS.feedback, []);
    },

    async updateFeedback(id, status) {
      if (!id) throw new Error("Xabar ID'si topilmadi.");

      const allowedStatuses = ["new", "read", "replied", "archived"];

      if (!allowedStatuses.includes(status)) {
        throw new Error("Xabar holati noto'g'ri.");
      }

      if (useSupabase()) {
        const { error } = await window.sb
          .from("feedback")
          .update({ status })
          .eq("id", id);

        if (error) throw error;
        return true;
      }

      const all = await this.getFeedback();

      const message = all.find(
        item => sameId(item.id, id)
      );

      if (!message) {
        throw new Error("Xabar topilmadi.");
      }

      message.status = status;
      writeLocal(KEYS.feedback, all);

      return true;
    },

    async deleteFeedback(id) {
      if (!id) throw new Error("Xabar ID'si topilmadi.");

      if (useSupabase()) {
        const { error } = await window.sb
          .from("feedback")
          .delete()
          .eq("id", id);

        if (error) throw error;
        return true;
      }

      const all = await this.getFeedback();

      const updated = all.filter(
        item => !sameId(item.id, id)
      );

      writeLocal(KEYS.feedback, updated);
      return true;
    }

  };

})();
