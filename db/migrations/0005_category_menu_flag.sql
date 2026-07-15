-- Lets admins hide a category from the main nav (MegaMenu.vue) without deleting it or
-- affecting its product listings — defaults to visible so existing categories are unaffected.
ALTER TABLE categories ADD COLUMN show_in_menu INTEGER NOT NULL DEFAULT 1;
