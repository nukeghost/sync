exports.canonicalizeName = (name) ->
    return name.toLowerCase().replace(/[oO0]/g, 'o').replace(/[1Il]/g, 'l')
