local removalObject = {"prop_roadcone02a"}

--- Targets
CreateThread(function()
    exports["qb-target"]:AddTargetModel(removalObject,
                                        {
        options = {{label = "Démonter", icon = "c:jobs/demonter.png", event = "job:client:RemoveObject"}},
        distance = 2.5,
    })
end)

--- Add Object
RegisterNetEvent("job:client:AddObject", function(objectHash, rotation, offset)
    local ped = PlayerPedId()
    local coords = GetOffsetFromEntityInWorldCoords(ped, 0.0, 1.0, 0.0)
    local heading = GetEntityHeading(ped) + (rotation or 0.0)

    QBCore.Functions.Progressbar("spawn_object", "Disposition en cours", 2500, false, true,
                                 {
        disableMovement = true,
        disableCarMovement = true,
        disableMouse = false,
        disableCombat = true,
    }, {animDict = "anim@narcotics@trash", anim = "drop_front", flags = 16}, {}, {}, function() -- Done
        TriggerServerEvent("job:server:AddObject", objectHash, QBCore.Functions.GetProperGroundCoord(objectHash, coords, heading, offset))
    end)
end)

--- Remove Object
RegisterNetEvent("job:client:RemoveObject", function(data)
    QBCore.Functions.Progressbar("remove_object", data.collect and "Récupération en cours" or "Démontage en cours", 2500, false, true,
                                 {
        disableMovement = true,
        disableCarMovement = true,
        disableMouse = false,
        disableCombat = true,
    }, {animDict = "weapons@first_person@aim_rng@generic@projectile@thermal_charge@", anim = "plant_floor", flags = 16}, {}, {}, function() -- Done
        StopAnimTask(PlayerPedId(), "weapons@first_person@aim_rng@generic@projectile@thermal_charge@", "plant_floor", 1.0)
        local objectId = exports["soz-core"]:GetObjectIdFromEntity(data.entity)

        if data.collect then
            TriggerServerEvent("job:server:CollectObject", objectId, GetEntityModel(data.entity))
        else
            TriggerServerEvent("job:server:RemoveObject", objectId)
        end
    end, function() -- Cancel
        StopAnimTask(PlayerPedId(), "weapons@first_person@aim_rng@generic@projectile@thermal_charge@", "plant_floor", 1.0)
    end)
end)
