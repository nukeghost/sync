module.exports = (bookshelf, tablePrefix = '') ->
  GlobalIPBan = bookshelf.Model.extend({
    tableName: tablePrefix + 'global_ip_bans'
    hasTimestamps: true
  }, {
    createTable: (t) ->
      t.increments('id').primary()
      t.binary('ip_start', 16)
          .index()
      t.binary('ip_end', 16)
          .index()
      t.integer('banned_by_id')
          .unsigned()
          .references(tablePrefix + 'users.id')
          .notNullable()
      t.text('note')

    createTable_mysql: (t) ->
      t.increments('id').primary()
      t.binary('ip_start', 16)
          .index()
          .notNullable()
      t.binary('ip_end', 16)
          .index()
          .notNullable()
      t.integer('banned_by_id')
          .unsigned()
          .references(tablePrefix + 'users.id')
          .notNullable()
      t.specificType('note', 'text character set utf8mb4')
  })

  return {
    model: GlobalIPBan
  }
