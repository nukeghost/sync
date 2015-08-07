module.exports = (bookshelf, tablePrefix = '') ->
  SavedPlaylist = bookshelf.Model.extend({
    tableName: tablePrefix + 'saved_playlists'
    hasTimestamps: true

    channel: ->
      return @belongsTo(bookshelf.model('Channel', 'channel_id'))

    user: ->
      return @belongsTo(bookshelf.model('User', 'user_id'))
  }, {
    TYPE_CHANNEL_MAIN: 1
    TYPE_CHANNEL_SAVED: 2
    TYPE_USER_SAVED: 3

    createTable: (t) ->
      t.increments('id').primary()
      t.string('name', 255)
          .index()
          .notNullable()
      t.tinyint('type')
          .notNullable()
      t.mediumtext('contents')
          .notNullable()
      t.integer('user_id')
          .unsigned()
          .references(tablePrefix + 'users.id')
          .index()
      t.integer('channel_id')
          .unsigned()
          .references(tablePrefix + 'channels.id')
          .index()
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
      t.specificType('name', 'varchar(255) character set utf8mb4')
          .index()
          .notNullable()
      t.tinyint('type')
          .notNullable()
      t.specificType('contents', 'mediumtext character set utf8mb4')
          .notNullable()
      t.integer('user_id')
          .unsigned()
          .references(tablePrefix + 'users.id')
          .index()
      t.integer('channel_id')
          .unsigned()
          .references(tablePrefix + 'channels.id')
          .index()
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

  return {
    model: SavedPlaylist
  }
