export type BreadcrumbEntry = { label: string; to: string }

/**
 * Walks up categories.parent_id from the product's primary category and
 * reconstructs a breadcrumb trail, e.g. Skin Care > Moisturizing > Masks.
 * `to` paths accumulate each category's own slug (/skin-care/moisturizing/masks),
 * consistent with the storefront's catch-all category route.
 */
export async function getBreadcrumb(db: D1Database, productId: string): Promise<BreadcrumbEntry[]> {
  const { results } = await db
    .prepare(
      `WITH RECURSIVE crumb(id, name, slug, parent_id, depth) AS (
         SELECT c.id, c.name, c.slug, c.parent_id, 0
         FROM categories c
         JOIN product_categories pc ON pc.category_id = c.id AND pc.is_primary = 1
         WHERE pc.product_id = ?1
         UNION ALL
         SELECT c.id, c.name, c.slug, c.parent_id, crumb.depth + 1
         FROM categories c JOIN crumb ON c.id = crumb.parent_id
       )
       SELECT name, slug FROM crumb ORDER BY depth DESC`
    )
    .bind(productId)
    .all<{ name: string; slug: string }>()

  const trail: BreadcrumbEntry[] = [{ label: 'Home', to: '/' }]
  let path = ''
  for (const row of results) {
    path += `/${row.slug}`
    trail.push({ label: row.name, to: path })
  }
  return trail
}
