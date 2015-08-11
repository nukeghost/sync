module.exports = (bookshelf, tablePrefix = '') ->
  ChannelLibraryItem = bookshelf.Model.extend({
    modelName: 'ChannelLibraryItem'
    tableName: tablePrefix + 'channel_library_items'
    hasTimestamps: true

    channel: ->
      return @belongsTo(bookshelf.model('Channel', 'channel_id'))
  }, {
    createTable_sqlite3: (t) ->
      t.increments('id').primary()
      t.integer('channel_id')
          .unsigned()
          .references(tablePrefix + 'channels.id')
      t.string('media_id', 255)
          .notNullable()
      t.specificType('title', 'text collate nocase')
          .index()
          .notNullable()
      t.integer('length')
          .notNullable()
      t.string('media_type', 2)
      t.text('meta')
      t.unique(['channel_id', 'media_id', 'media_type'])

    createTable_mysql: (t) ->
      t.increments('id').primary()
      t.integer('channel_id')
          .unsigned()
          .references(tablePrefix + 'channels.id')
      t.string('media_id', 255)
          .notNullable()
      t.specificType('title', 'text character set utf8mb4')
          .index()
          .notNullable()
      t.integer('length')
          .notNullable()
      t.string('media_type', 2)
      t.text('meta')
      t.unique(['channel_id', 'media_id', 'media_type'])

    createTable_pg: (t) ->
      t.increments('id').primary()
      t.integer('channel_id')
          .unsigned()
          .references(tablePrefix + 'channels.id')
      t.string('media_id', 255)
          .notNullable()
      t.specificType('title', 'citext')
          .index()
          .notNullable()
      t.integer('length')
          .notNullable()
      t.string('media_type', 2)
      t.text('meta')
      t.unique(['channel_id', 'media_id', 'media_type'])
  })

  bookshelf.model('ChannelLibraryItem', ChannelLibraryItem)

  return {
    model: ChannelLibraryItem
  }
