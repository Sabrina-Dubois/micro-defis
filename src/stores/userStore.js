import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/lib/supabase";

export const useUserStore = defineStore("user", () => {
  // State
  const authUser = ref(null); // Objet user Supabase
  const profile = ref({
    username: "Username",
    avatar_emoji: "👤",
    email: "",
  });
  const memberSince = ref("...");
  const loading = ref(false); // état du chargement
  const error = ref(null); // message d'erreur

  // Getters
  const isAuthenticated = computed(() => !!authUser.value); //booléan si connecté
  const userId = computed(() => authUser.value?.id); // ID utilisateur
  const userName = computed(() => profile.value.username); // Nom d'utilisateur affiché
  const userEmail = computed(() => profile.value.email); // Email de l'utilisateur
  const userAvatar = computed(() => profile.value.avatar_emoji); //

  // Actions
  // Charger les données de l'utilisateur
  async function loadUser() {
    loading.value = true;
    error.value = null;

    try {
      // Récupérer l'utilisateur authentifié
      const { data, error: authError } = await supabase.auth.getUser();

      if (authError || !data?.user) {
        throw new Error("Utilisateur non authentifié");
      }

      authUser.value = data.user;
      profile.value.email = data.user.email;

      // Calculer la date d'inscription
      const createdAt = new Date(data.user.created_at);
      memberSince.value = createdAt.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      });

      // Charger le profil public
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("username, avatar_emoji")
        .eq("user_id", data.user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Erreur chargement profil:", profileError);
      }

      if (profileData) {
        profile.value.username = profileData.username || "Username";
        profile.value.avatar_emoji = profileData.avatar_emoji || "👤";
      } else {
        // ✅ FIX : Si le profil n'existe pas, on garde les valeurs par défaut
        console.log("⚠️ Profil non trouvé, utilisation des valeurs par défaut");
        profile.value.username = "Username";
        profile.value.avatar_emoji = "👤";
      }

      console.log("✅ User chargé:", {
        userId: data.user.id,
        username: profile.value.username,
        avatar: profile.value.avatar_emoji,
        email: profile.value.email,
      });

      return data.user;
    } catch (e) {
      error.value = e.message;
      console.error("Erreur loadUser:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // ✅ FIX : Mettre à jour le profil public de l'utilisateur
  async function updateProfile(updates) {
    if (!authUser.value) {
      throw new Error("Utilisateur non connecté");
    }

    try {
      console.log("🔄 Mise à jour profil:", updates);

      // D'abord, vérifier si le profil existe
      const { data: existingProfile, error: checkError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", authUser.value.id)
        .maybeSingle();

      if (checkError) {
        console.error("Erreur vérification profil:", checkError);
        throw checkError;
      }

      let result;

      if (existingProfile) {
        // ✅ Le profil existe : UPDATE
        console.log("✅ Profil existe, UPDATE");
        const { data, error: updateError } = await supabase
          .from("user_profiles")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", authUser.value.id)
          .select()
          .single();

        if (updateError) throw updateError;
        result = data;
      } else {
        // ✅ Le profil n'existe pas : INSERT
        console.log("⚠️ Profil n'existe pas, INSERT");
        const { data, error: insertError } = await supabase
          .from("user_profiles")
          .insert({
            user_id: authUser.value.id,
            ...updates,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        result = data;
      }

      // Mise à jour locale
      Object.assign(profile.value, updates);

      console.log("✅ Profil mis à jour:", profile.value);

      return true;
    } catch (e) {
      error.value = e.message;
      console.error("Erreur updateProfile:", e);
      throw e;
    }
  }

  // Changer l'avatar
  async function changeAvatar() {
    const avatars = ["🙂", "😎", "🦄", "🚀", "⭐", "🔥", "💪", "🌟", "⚡", "🎉"];
    const currentIdx = avatars.indexOf(profile.value.avatar_emoji);
    const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % avatars.length : 0;
    const nextAvatar = avatars[nextIdx];

    console.log("🔄 Changement avatar:", profile.value.avatar_emoji, "→", nextAvatar);

    try {
      await updateProfile({ avatar_emoji: nextAvatar });
      console.log("✅ Avatar changé:", nextAvatar);
      return nextAvatar;
    } catch (e) {
      console.error("Erreur changeAvatar:", e);
      throw e;
    }
  }

  // Déconnexion de l'utilisateur
  async function logout() {
    await supabase.auth.signOut();
    authUser.value = null;
    profile.value = {
      username: "Username",
      avatar_emoji: "👤",
      email: "",
    };
    memberSince.value = "...";
  }

  //Réinitialiser le store (ex: après une déconnexion)
  function reset() {
    authUser.value = null;
    profile.value = {
      username: "Username",
      avatar_emoji: "👤",
      email: "",
    };
    memberSince.value = "...";
    loading.value = false;
    error.value = null;
  }

  return {
    // State
    authUser,
    profile,
    memberSince,
    loading,
    error,

    // Getters
    isAuthenticated,
    userId,
    userName,
    userEmail,
    userAvatar,

    // Actions
    loadUser,
    updateProfile,
    changeAvatar,
    logout,
    reset,
  };
});
