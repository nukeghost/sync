module.exports = (bookshelf, tablePrefix = '') ->
  ChannelRank = bookshelf.Model.extend({
    modelName: 'ChannelRank'
    tableName: tablePrefix + 'channel_ranks'
    hasTimestamps: true

    channel: ->
      return @belongsTo(bookshelf.model('Channel'), 'channel_id')

    user: ->
      return @belongsTo(bookshelf.model('User'), 'user_id')
  }, {
    createTable: (t) ->
      t.increments('id').primary()
      t.integer('channel_id')
          .unsigned()
          .notNullable()
          .references(tablePrefix + 'channels.id')
          .onDelete('cascade')
      t.integer('user_id')
          .unsigned()
          .notNullable()
          .references(tablePrefix + 'users.id')
          .onDelete('cascade')
      t.tinyint('rank')
          .notNullable()
          .defaultTo(1)
      t.unique(['channel_id', 'user_id'])
  })

  bookshelf.model('ChannelRank', ChannelRank)
  return {
    model: ChannelRank
  }
