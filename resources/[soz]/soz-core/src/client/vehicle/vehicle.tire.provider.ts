import { Once, OnceStep } from '@public/core/decorators/event';
import { Inject } from '@public/core/decorators/injectable';
import { Provider } from '@public/core/decorators/provider';
import { ServerEvent } from '@public/shared/event';
import { getDistance } from '@public/shared/polyzone/vector';

import { ProgressService } from '../progress.service';
import { TargetFactory } from '../target/target.factory';
import { WeaponService } from '../weapon/weapon.service';

const SLASHING_TIRE_WEAPON = [
    'weapon_dagger',
    'weapon_bottle',
    'weapon_crowbar',
    'weapon_hammer',
    'weapon_hatchet',
    'weapon_knife',
    'weapon_machete',
    'weapon_switchblade',
    'weapon_battleaxe',
    'weapon_stone_hatchet',
];

const TIRE_INDEX = {
    ['wheel_lf']: 0,
    ['wheel_rf']: 1,
    ['wheel_lm1']: 2,
    ['wheel_rm1']: 3,
    ['wheel_lm2']: 45,
    ['wheel_rm2']: 47,
    ['wheel_lm3']: 46,
    ['wheel_rm3']: 48,
    ['wheel_lr']: 4,
    ['wheel_rr']: 5,
};

@Provider()
export class VehicleSlashTireProvider {
    @Inject(TargetFactory)
    private targetFactory: TargetFactory;

    @Inject(WeaponService)
    private weaponService: WeaponService;

    @Inject(ProgressService)
    private progressService: ProgressService;

    @Once(OnceStep.PlayerLoaded)
    public async onPlayerLoaded(): Promise<void> {
        // Somehow, creating for several bones causes a buggy QB targetting. I will have to fix that.
        this.targetFactory.createForBones(
            Object.keys(TIRE_INDEX),
            [
                {
                    icon: 'c:mechanic/repair_wheel.png',
                    label: 'Crever le pneu',
                    color: 'crimi',
                    action: this.doSlashTire.bind(this),
                    canInteract: () => {
                        const weapon = this.weaponService.getCurrentWeapon();

                        if (!weapon || !SLASHING_TIRE_WEAPON.includes(weapon.name)) {
                            return false;
                        }

                        return true;
                    },
                },
            ],
            1.0
        );
    }

    public async doSlashTire(vehicle: number) {
        const vehicleNetworkId = NetworkGetNetworkIdFromEntity(vehicle);

        const tireIndex = await this.getClosestTireIndex(vehicle);

        if (tireIndex === -1) {
            return;
        }

        const { completed } = await this.progressService.progress(
            'slash_tire',
            'Vous crevez le pneu...',
            10000,
            {
                dictionary: 'melee@knife@streamed_core_fps',
                name: 'ground_attack_on_spot',
                options: {
                    repeat: true,
                    cancellable: true,
                },
            },
            {
                headingEntity: {
                    entity: vehicle,
                    heading: 0,
                },
                useAnimationService: true,
                canCancel: true,
            }
        );

        if (!completed) {
            return;
        }

        TriggerServerEvent(ServerEvent.VEHICLE_SLASH_TIRE, vehicleNetworkId, tireIndex);
    }

    // Warning: Tyre index used by SetVehicleTyreBurst and bone indexes used by GetWorldPositionOfEntityBone are NOT the same.
    public async getClosestTireIndex(vehicle: number): Promise<number> {
        let closestDistance = 100;
        let closestTireIndex = -1;

        const playerPosition = GetEntityCoords(PlayerPedId(), false);

        for (const [boneName, tireIndex] of Object.entries(TIRE_INDEX)) {
            const testedWheelBone = GetEntityBoneIndexByName(vehicle, boneName);

            // console.log(boneName, testedWheelIndex);

            if (testedWheelBone === -1) {
                continue;
            }

            const testedBoneWorldPosition = GetWorldPositionOfEntityBone(vehicle, testedWheelBone);

            // console.log(boneName, testedBoneWorldPosition);

            const distanceOfBoneToPed = getDistance(
                [testedBoneWorldPosition[0], testedBoneWorldPosition[1], testedBoneWorldPosition[2]],
                [playerPosition[0], playerPosition[1], playerPosition[2]]
            );

            // console.log(boneName, distanceOfBoneToPed);

            if (distanceOfBoneToPed < closestDistance) {
                closestTireIndex = tireIndex;
                closestDistance = distanceOfBoneToPed;
            }
        }

        // console.log('closest :', closestWheelIndex, closestDistance);
        return closestTireIndex;
    }
}
