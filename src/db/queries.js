module.exports = {

    update_name: `UPDATE user SET display_name = ? WHERE id = ?`,

    get_comments_count: `SELECT COUNT(*) AS count
      FROM comment INNER JOIN user ON (user_id=user.id)
      WHERE slug = ? AND ((
        NOT user.blocked AND NOT comment.rejected
        AND (comment.approved OR user.trusted)))`,

    get_comments: `SELECT comment.id, user_id, user.name, user.display_name,
        user.profile_image_url, comment.created_at, comment, approved, trusted, 
	provider, reply_to
      FROM comment INNER JOIN user ON (user_id=user.id)
      WHERE slug = ? AND ((
        NOT user.blocked AND NOT comment.rejected
        AND (comment.approved OR user.trusted))
        OR user.id = ?)
      ORDER BY comment.created_at DESC`,

    admin_get_comments: `SELECT user_id, user.name, user.display_name, 
	user.profile_image_url, comment.id, comment.created_at, comment, 
	approved, trusted, provider, reply_to
      FROM comment INNER JOIN user ON (user_id=user.id)
      WHERE slug = ? AND NOT user.blocked
        AND NOT comment.rejected
      ORDER BY comment.created_at DESC`,

    get_last_comment: `SELECT comment, user_id FROM comment WHERE slug = ?
      ORDER BY comment.created_at DESC LIMIT 1`,

    approve: `UPDATE comment SET approved = 1 WHERE id = ?`,

    reject: `UPDATE comment SET rejected = 1 WHERE id = ?`,

    trust: `UPDATE user SET trusted = 1 WHERE id = ?`,

    block: `UPDATE user SET blocked = 1 WHERE id = ?`,

    remove: `DELETE FROM comment WHERE id = ? OR reply_to = ?`,

    awaiting_moderation: `SELECT comment.id, slug, comment.created_at
      FROM comment INNER JOIN user ON (user_id=user.id)
      WHERE NOT user.blocked AND NOT user.trusted AND
       NOT comment.rejected AND NOT comment.approved
       ORDER BY comment.created_at DESC LIMIT 20`,

    insert: `INSERT INTO comment
      (user_id, slug, comment, reply_to, created_at, approved, rejected)
      VALUES (?,?,?,?,datetime(),0,0)`,

    find_user: `SELECT id, name, display_name, provider, provider_id,
         trusted, blocked, profile_image_url FROM user
       WHERE provider = ? AND provider_id = ?`,

    find_display_name: `SELECT id FROM user WHERE LOWER(display_name) = ?`,

    create_user: `INSERT INTO user
      (provider, provider_id, display_name, name,
       created_at, trusted, blocked, profile_image_url)
      VALUES (?, ?, ?, ?, datetime(), ?, 0, ?)`,

    update_user: `UPDATE user SET profile_image_url = ? WHERE provider = ? AND provider_id = ?`,

    set_settings: `INSERT OR REPLACE INTO setting (name, active)
      VALUES (?, ?)`,

    get_settings: `SELECT active FROM setting WHERE name = ?`,

    subscribe: `INSERT INTO subscription
      (endpoint, publicKey, auth)
      VALUES (?, ?, ?)`,

    unsubscribe: `DELETE FROM subscription
      WHERE endpoint = ?`,

    get_subscriptions: `SELECT endpoint, publicKey, auth FROM subscription`

};
