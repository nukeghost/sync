module.exports = (bookshelf, tablePrefix = '') ->
  ChannelPlaylist = bookshelf.Model.extend({
    modelName: 'ChannelPlaylist'
    tableName: tablePrefix + 'channel_playlists'
    hasTimestamps: true

    channel: ->
      return @belongsTo(bookshelf.model('Channel'), 'channel_id')
  }, {
    TYPE_CHANNEL_MAIN: 1
    TYPE_CHANNEL_SAVED: 2

    createTable: (t) ->
      t.increments('id').primary()
      t.integer('channel_id')
          .unsigned()
          .references(tablePrefix + 'channels.id')
          .onDelete('cascade')
      t.tinyint('type')
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
      t.unique(['channel_id', 'name', 'type'])

    createTable_mysql: (t) ->
      t.increments('id').primary()
      t.integer('channel_id')
          .unsigned()
          .references(tablePrefix + 'channels.id')
          .onDelete('cascade')
      t.tinyint('type')
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
      t.unique(['channel_id', 'name', 'type'])
  })

  bookshelf.model('ChannelPlaylist', ChannelPlaylist)

  return {
    model: ChannelPlaylist
  }
