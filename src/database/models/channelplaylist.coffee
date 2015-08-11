module.exports = (bookshelf, tablePrefix = '') ->
  ChannelPlaylist = bookshelf.Model.extend({
    modelName: 'ChannelPlaylist'
    tableName: tablePrefix + 'channel_playlists'
    hasTimestamps: true

    channel: ->
      return @belongsTo(bookshelf.model('Channel', 'channel_id'))
  }, {
    TYPE_CHANNEL_MAIN: 1
    TYPE_CHANNEL_SAVED: 2

    createTable: (t) ->
      t.increments('id').primary()
      t.integer('channel_id')
          .unsigned()
          .references(tablePrefix + 'channels.id')
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
      t.integer('channel_id')
          .unsigned()
          .references(tablePrefix + 'channels.id')
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

  bookshelf.model('ChannelPlaylist', ChannelPlaylist)

  return {
    model: ChannelPlaylist
  }
