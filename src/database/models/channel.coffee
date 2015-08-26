module.exports = (bookshelf, tablePrefix = '') ->
  Channel = bookshelf.Model.extend({
    modelName: 'Channel'
    tableName: tablePrefix + 'channels'
    hasTimestamps: true

    owner: ->
      return @belongsTo(bookshelf.model('User'), 'owner_id')
  }, {
    STATUS_INACTIVE: -1
    STATUS_REGISTERED: 1

    createTable: (t) ->
      t.increments('id').primary()
      t.string('name', 30)
          .index()
          .notNullable()
      t.string('canonical_name', 30)
          .unique()
          .notNullable()
      t.integer('owner_id')
          .unsigned()
          .references(tablePrefix + 'users.id')
          .onDelete('cascade')
          .index()
          .notNullable()
      t.tinyint('status')
          .notNullable()
          .defaultTo(@STATUS_REGISTERED)
      t.binary('register_ip', 17)
          .index()
          .notNullable()
      t.timestamps()
  })

  bookshelf.model('Channel', Channel)

  return {
    model: Channel
  }
