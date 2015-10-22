-- KEYS = [channel, nodeConfig, nodeUUID]
local success = redis.call('hsetnx', '${ACTIVE_CHANNELS}', KEYS[1], KEYS[2])
if success == 1 then
    redis.call('sadd', '${CHANNELS_FOR_NODE}' .. KEYS[3], KEYS[1])
end
return success
