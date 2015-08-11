module.exports = (bookshelf, tablePrefix = '') ->
  UserPlaylist = bookshelf.Model.extend({
    modelName: 'UserPlaylist'
    tableName: tablePrefix + 'user_playlists'
    hasTimestamps: true

    user: ->
      return @belongsTo(bookshelf.model('User', 'user_id'))
  }, {
    createTable: (t) ->
      t.increments('id').primary()
      t.integer('user_id')
          .unsigned()
          .references(tablePrefix + 'users.id')
          .index()
      t.string('name', 255)
          .index()
          .notNullable()
      t.text('contents')
          .notNullable()
      t.integer('item_count')
          .unsigned()
          .notNullable()
          .defaultTo(0)
      t.integer('total_time')
          .unsigned()
          .notNullable()
          .defaultTo(0)
      t.boolean('public')
          .notNullable()
          .defaultTo(false)

    createTable_mysql: (t) ->
      t.increments('id').primary()
      t.integer('user_id')
          .unsigned()
          .references(tablePrefix + 'users.id')
          .index()
      t.specificType('name', 'varchar(255) character set utf8mb4')
          .index()
          .notNullable()
      t.specificType('contents', 'mediumtext character set utf8mb4')
          .notNullable()
      t.integer('item_count')
          .unsigned()
          .notNullable()
          .defaultTo(0)
      t.integer('total_time')
          .unsigned()
          .notNullable()
          .defaultTo(0)
      t.boolean('public')
          .notNullable()
          .defaultTo(false)
  })

  bookshelf.model('UserPlaylist', UserPlaylist)

  return {
    model: UserPlaylist
  }
