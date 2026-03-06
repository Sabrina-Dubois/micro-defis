-- ============================================================
-- MIGRATION : Restreindre la modification des défis aux admins
-- ============================================================
-- Avant : tout utilisateur connecté pouvait modifier/supprimer des défis
-- Après : seuls les utilisateurs avec is_admin = true peuvent le faire
--
-- Safe à rejouer — ne supprime aucune donnée.
-- ============================================================


-- ============================================================
-- FONCTION HELPER
-- Vérifie si l'utilisateur connecté est admin
-- Utilisée dans les policies ci-dessous
-- ============================================================

create or replace function public.user_is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_profiles
    where user_id = auth.uid()
      and is_admin = true
  );
$$;


-- ============================================================
-- POLICIES CHALLENGES
-- On supprime les anciennes policies trop permissives
-- et on les recrée en vérifiant is_admin
-- ============================================================

-- Lecture : inchangée — tout utilisateur connecté peut voir les défis
-- (gratuit = défis gratuits, premium = tous les défis)
-- Aucun changement sur cette policy.

-- ---------------------------------------------------------------
-- INSERT : seuls les admins peuvent créer un nouveau défi
-- ---------------------------------------------------------------
drop policy if exists "Challenges insert authenticated" on public.challenges;
create policy "Challenges insert admin only" on public.challenges
for insert to authenticated
with check (public.user_is_admin());

-- ---------------------------------------------------------------
-- UPDATE : seuls les admins peuvent modifier un défi existant
-- ---------------------------------------------------------------
drop policy if exists "Challenges update authenticated" on public.challenges;
create policy "Challenges update admin only" on public.challenges
for update to authenticated
using (public.user_is_admin())
with check (public.user_is_admin());

-- ---------------------------------------------------------------
-- DELETE : seuls les admins peuvent supprimer un défi
-- ---------------------------------------------------------------
drop policy if exists "Challenges delete authenticated" on public.challenges;
create policy "Challenges delete admin only" on public.challenges
for delete to authenticated
using (public.user_is_admin());