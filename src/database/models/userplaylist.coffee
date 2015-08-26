module.exports = (bookshelf, tablePrefix = '') ->
  UserPlaylist = bookshelf.Model.extend({
    modelName: 'UserPlaylist'
    tableName: tablePrefix + 'user_playlists'
    hasTimestamps: true

    user: ->
      return @belongsTo(bookshelf.model('User'), 'user_id')
  }, {
    createTable: (t) ->
      t.increments('id').primary()
      t.integer('user_id')
          .unsigned()
          .references(tablePrefix + 'users.id')
          .onDelete('cascade')
      t.string('name', 191)
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
      t.unique(['user_id', 'name'])

    createTable_mysql: (t) ->
      t.increments('id').primary()
      t.integer('user_id')
          .unsigned()
          .references(tablePrefix + 'users.id')
          .onDelete('cascade')
      t.specificType('name', 'varchar(191) character set utf8mb4')
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
      t.unique(['user_id', 'name'])
  })

  bookshelf.model('UserPlaylist', UserPlaylist)

  return {
    model: UserPlaylist
  }
