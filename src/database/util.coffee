ipaddr = require 'ipaddr.js'
net = require 'net'

exports.canonicalizeName = (name) ->
    return name.toLowerCase().replace(/[oO0]/g, 'o').replace(/[1Il]/g, 'l')

ipv4ToBinary = (ip) ->
    octets = ipaddr.parse(ip).octets
    buffer = new Buffer(17)
    buffer.fill(0)
    buffer[0] = 4
    for i in [0..3]
        buffer[13 + i] = octets[i]
    return buffer

ipv6ToBinary = (ip) ->
    parts = ipaddr.parse(ip).parts
    buffer = new Buffer(17)
    buffer.fill(0)
    buffer[0] = 6
    for i in [0..7]
        buffer[2*i + 1] = parts[i] >> 8
        buffer[2*i + 2] = parts[i] & 0xff
    return buffer

exports.ipToBinary = (ip) ->
    kind = net.isIP(ip)
    if kind == 6
        return ipv6ToBinary(ip)
    else if kind == 4
        return ipv4ToBinary(ip)
    else
        buffer = new Buffer(17)
        buffer.fill(0)
        return buffer
