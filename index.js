const SettingsUI = require('tera-mod-ui').Settings;

const TAG = 'DRAGON-LANCER: ';

const JOB_LANCER            = 1;

const SPRING_ATTACK         = 0;
const INFURIATE             = 1;
const STAND_FAST            = 2;
const SHIELD_BASH           = 3;
const ONSLAUGHT             = 4;
const SHIELD_BARRAGE_0      = 5;
const SHIELD_BARRAGE_1      = 6;

const S_SHIELD_BASH_0       = 50101;
const S_SHIELD_BASH_1       = 50102;

const S_ONSLAUGHT_0         = 30200;

const S_INFURIATE           = 120100;
const S_STAND_FAST          = 20200;

const S_SPRING_ATTACK       = 131100;

const S_SHIELD_BARRAGE_0    = 181100;
const S_SHIELD_BARRAGE_1    = 181101;

const S_ADRENALINE_RUSH_0   = 170200;
const S_ADRENALINE_RUSH_1   = 170240;
const S_ADRENALINE_RUSH_2   = 170250;

const AUTO_BLOCK_DELAY      = 1;

module.exports = function archer(mod)
{
    let job;
    let model;
    let playerId;
    let speed;
    let myRe = 50;

    let atkIdBase = 0xFEFEFFEE;
    let atkId     = [];
    let finish    = [true, true, true, true, true, true, true];
    let skillCd   = [false, false, false, false, false, false, false];
    
    let onslaughtTask;
    let adrenalineRushTask;
    let ifuriateTask;
    let shieldBarrageTask;
    let springAttackTask;

    //--------------------------------------------------------------------------------------------------------------------------------------
    //  Player event
    //--------------------------------------------------------------------------------------------------------------------------------------

    mod.hook('S_LOGIN', mod.majorPatchVersion < 114 ? 14 : 15, (event) => 
    {
        playerId = event.gameId;
        model    = event.templateId;
        job      = (model -10101) % 100;

        return;
    });

    mod.hook('S_PLAYER_STAT_UPDATE', mod.majorPatchVersion < 105 ? 14 : (mod.majorPatchVersion < 108 ? 15 : 17), (event) =>
    {
        speed = (event.attackSpeedBonus + event.attackSpeed) / event.attackSpeed;

        return;
    });
    
    mod.hook('S_PLAYER_CHANGE_STAMINA', 1, (event) =>
    {
        if(job != JOB_LANCER){return;}
        if(mod.settings.DEBUG){console.log(TAG + 'S_PLAYER_CHANGE_STAMINA: ' + event.current);}
        
        myRe = event.current;
        
        return;
    });

    //--------------------------------------------------------------------------------------------------------------------------------------
    //  Cooldown skills event
    //--------------------------------------------------------------------------------------------------------------------------------------

    mod.hook('S_START_COOLTIME_SKILL', mod.majorPatchVersion < 114 ? 3 : 4, (event) =>
    {
        if(job != JOB_LANCER){return;}
        if(mod.settings.DEBUG){console.log(TAG + 'S_START_COOLTIME_SKILL: ' + event.skill.id + ' / ' + event.cooldown);}

        if(event.skill.id == S_SPRING_ATTACK)
        {
            skillCd[SPRING_ATTACK] = true;
            setTimeout(function (){skillCd[SPRING_ATTACK] = false;}, event.cooldown);
        }
        else if(event.skill.id == S_INFURIATE)
        {
            skillCd[INFURIATE] = true;
            setTimeout(function (){skillCd[INFURIATE] = false;}, event.cooldown);
        }
        else if(event.skill.id == S_SHIELD_BASH_0)
        {
            skillCd[SHIELD_BASH] = true;
            setTimeout(function (){skillCd[SHIELD_BASH] = false;}, event.cooldown);
        }
        else if(event.skill.id == S_ONSLAUGHT_0)
        {
            skillCd[ONSLAUGHT] = true;
            setTimeout(function (){skillCd[ONSLAUGHT] = false;}, event.cooldown);
        }
        else if(event.skill.id == S_SHIELD_BARRAGE_0)
        {
            skillCd[SHIELD_BARRAGE_0] = true;
            setTimeout(function (){skillCd[SHIELD_BARRAGE_0] = false;}, event.cooldown);
        }
        
        return;
	});

    //--------------------------------------------------------------------------------------------------------------------------------------
    //  Use skills event
    //--------------------------------------------------------------------------------------------------------------------------------------

    mod.hook('S_CANNOT_START_SKILL', 4, (event) => 
    {
        if(job != JOB_LANCER){return;}
        if(mod.settings.DEBUG){console.log(TAG + 'S_CANNOT_START_SKILL: ' + event.skill.id);}

        return;
	});

    mod.hook('C_START_INSTANCE_SKILL', mod.majorPatchVersion < 114 ? 7 : 8, (event) => 
    {
        if(job != JOB_LANCER){return;}
        if(mod.settings.DEBUG){console.log(TAG + 'C_START_INSTANCE_SKILL: ' + event.skill.id);}

        return;
    });

    mod.hook('C_PRESS_SKILL', mod.majorPatchVersion < 114 ? 4 : 5, (event) => 
    {
        if(job != JOB_LANCER){return;}
        if(mod.settings.DEBUG){console.log(TAG + 'C_PRESS_SKILL: ' + event.skill.id);}

        return;
	});

    mod.hook('C_START_SKILL', 7, (event) =>
    {
        if(job != JOB_LANCER){return;}
        if(mod.settings.DEBUG){console.log(TAG + 'C_START_SKILL: ' + event.skill.id);}

        if(event.skill.id == S_INFURIATE && myRe > 49 && mod.settings.INFURIATE_CANCEL == true)
        {
            finish[INFURIATE] = false;
            atkId[STAND_FAST] = atkIdBase;
            atkIdBase--;
            
            clearInterval(ifuriateTask);
            ifuriateTask = setInterval(function ()
            {
                if(skillCd[INFURIATE] == false && finish[INFURIATE] == false)
                {
                    mod.toServer('C_PRESS_SKILL', 4, 
                    {
                        skill: S_STAND_FAST,
                        press: true,
                        loc: {
                            x: event.loc.x,
                            y: event.loc.y,
                            z: event.loc.z
                        },
                        w: event.w,
                    });
                }
                else
                {
                    mod.toServer('C_PRESS_SKILL', 4,
                    {
                        skill: S_STAND_FAST,
                        press: false,
                        loc: {
                            x: event.loc.x,
                            y: event.loc.y,
                            z: event.loc.z
                        },
                        w: event.w,
                    });
                    mod.toClient('S_ACTION_STAGE', 9, 
                    {
                        gameId: playerId,
                        loc: {
                            x: event.loc.x,
                            y: event.loc.y,
                            z: event.loc.z
                        },
                        w: event.w,
                        templateId: model,
                        skill: S_STAND_FAST,
                        stage: 0,
                        speed: 1,
                        ...(mod.majorPatchVersion >= 75 ? { projectileSpeed: 1 } : 0n),
                        id: atkId[STAND_FAST],
                        effectScale: 1.0,
                        moving: false,
                        dest: { x: 0, y: 0, Z: 0 },
                        target: 0n,
                        animSeq: [],
                    });

                    setTimeout(function (event)
                    {
                        mod.toClient('S_ACTION_END', 5, 
                        {
                            gameId: playerId,
                            loc: {
                                x: event.loc.x,
                                y: event.loc.y,
                                z: event.loc.z
                            },
                            w: event.w,
                            templateId: model,
                            skill: S_STAND_FAST,
                            type: 10,
                            id: atkId[STAND_FAST],
                        });
                        
                        clearInterval(ifuriateTask);
                        return;

                    }, AUTO_BLOCK_DELAY, event);
                }
            }, 50, event);
            return;
        }
        else if(event.skill.id == S_SHIELD_BARRAGE_0 && myRe > 49 && mod.settings.SHIELD_BARRAGE_CANCEL == true)
        {
            if(event.moving == true && mod.settings.SHIELD_BARRAGE_CANCEL_AWSD == true){return;}
            if(event.skill.id != S_SHIELD_BARRAGE_0){return;}

            finish[SHIELD_BARRAGE_0] = false;
            atkId[STAND_FAST]      = atkIdBase;
            atkIdBase--;

            clearInterval(shieldBarrageTask);
            shieldBarrageTask = setInterval(function ()
            {
                if(skillCd[SHIELD_BARRAGE_0] == true)
                {
                    mod.toServer('C_PRESS_SKILL', 4,
                    {
                        skill: S_STAND_FAST,
                        press: true,
                        loc: {
                            x: event.loc.x,
                            y: event.loc.y,
                            z: event.loc.z
                        },
                        w: event.w,
                    });
                    mod.toServer('C_PRESS_SKILL', 4,
                    {
                        skill: S_STAND_FAST,
                        press: false,
                        loc: {
                            x: event.loc.x,
                            y: event.loc.y,
                            z: event.loc.z
                        },
                        w: event.w,
                    });

                    mod.toClient('S_ACTION_STAGE', 9,
                    {
                        gameId: playerId,
                        loc: {
                            x: event.loc.x,
                            y: event.loc.y,
                            z: event.loc.z
                        },
                        w: event.w,
                        templateId: model,
                        skill: S_STAND_FAST,
                        stage: 0,
                        speed: 1,
                        ...(mod.majorPatchVersion >= 75 ? { projectileSpeed: 1 } : 0n),
                        id: atkId[STAND_FAST],
                        effectScale: 1.0,
                        moving: false,
                        dest: { x: 0, y: 0, Z: 0 },
                        target: 0n,
                        animSeq: [],
                    });

                    setTimeout(function (event)
                    {
                        mod.toClient('S_ACTION_END', 5, 
                        {
                            gameId: playerId,
                            loc: {
                                x: event.loc.x,
                                y: event.loc.y,
                                z: event.loc.z
                            },
                            w: event.w,
                            templateId: model,
                            skill: S_STAND_FAST,
                            type: 10,
                            id: atkId[STAND_FAST],
                        });

                        mod.toServer('C_START_SKILL', 7,
                        {
                            skill: S_SHIELD_BARRAGE_1,
                            w: event.w,
                            loc: {
                                x: event.loc.x,
                                y: event.loc.y,
                                z: event.loc.z
                            },
                            dest: {
                                x: event.dest.x,
                                y: event.dest.y,
                                z: event.dest.z
                            },
                            unk: event.unk,
                            moving: event.moving,
                            continue: event.continue,
                            target: event.target,
                            unk2: event.unk2,
                        });

                        if(mod.settings.AUTO_SPRING_ATTACK == true)
                        {
                            finish[SHIELD_BARRAGE_1] = false;

                            clearInterval(springAttackTask);
                            springAttackTask = setInterval(function ()
                            {
                                if(finish[SHIELD_BARRAGE_1] == false)
                                {
                                    mod.toServer('C_START_SKILL', 7,
                                    {
                                        skill: S_SPRING_ATTACK,
                                        w: event.w,
                                        loc: {
                                            x: event.loc.x,
                                            y: event.loc.y,
                                            z: event.loc.z
                                        },
                                        dest: {
                                            x: event.dest.x,
                                            y: event.dest.y,
                                            z: event.dest.z
                                        },
                                        unk: event.unk,
                                        moving: event.moving,
                                        continue: event.continue,
                                        target: event.target,
                                        unk2: event.unk2,
                                    });
                                }
                                else
                                {
                                    clearInterval(springAttackTask);
                                    return;
                                }
                            }, 20, event);
                        }
                        
                        clearInterval(shieldBarrageTask);
                        return;

                    }, AUTO_BLOCK_DELAY, event);
                }
            }, 20, event);
        }
        else if((event.skill.id == S_SHIELD_BASH_0 || event.skill.id == S_SHIELD_BASH_1) && mod.settings.AUTO_ONSLAUGHT == true)
        {
            if(skillCd[ONSLAUGHT] == false)
            {
                finish[SHIELD_BASH] = false;

                clearInterval(onslaughtTask);
                onslaughtTask = setInterval(function ()
                {
                    if((event.skill.id != S_SHIELD_BASH_0 && event.skill.id != S_SHIELD_BASH_1) || finish[SHIELD_BASH] == true)
                    {
                        clearInterval(onslaughtTask);
                        return;
                    }

                    mod.toServer('C_START_SKILL', 7,
                    {
                        skill: S_ONSLAUGHT_0,
                        w: event.w,
                        loc: {
                            x: event.loc.x,
                            y: event.loc.y,
                            z: event.loc.z
                        },
                        dest: {
                            x: event.dest.x,
                            y: event.dest.y,
                            z: event.dest.z
                        },
                        unk: event.unk,
                        moving: event.moving,
                        continue: event.continue,
                        target: event.target,
                        unk2: event.unk2,
                    });
                }, 20, event);
            }
        }
        return;
    });

    //--------------------------------------------------------------------------------------------------------------------------------------
    //  End skills event
    //--------------------------------------------------------------------------------------------------------------------------------------

    mod.hook('S_ACTION_END', 5, (event) =>
    {
        if(playerId != event.gameId){return;}
        if(job != JOB_LANCER){return;}

        if(mod.settings.DEBUG)
        {
            console.log(TAG + 'S_ACTION_END: ' + event.skill.id);
            console.log(TAG + 'S_ACTION_END PLAYER: ' + event.gameId);
        }

        if(event.skill.id == S_ADRENALINE_RUSH_0 || event.skill.id == S_ADRENALINE_RUSH_1 || event.skill.id == S_ADRENALINE_RUSH_2)
        {
            clearInterval(adrenalineRushTask);
            adrenalineRushTask = setInterval(function ()
            {
                var robot = require("robotjs");
                
                if(mod.settings.KEY_A != "")
                    robot.keyTap(mod.settings.KEY_A);
                if(mod.settings.KEY_B != "")
                    setTimeout(function (){robot.keyTap(mod.settings.KEY_B);},25);
                if(mod.settings.KEY_C != "")
                    setTimeout(function (){robot.keyTap(mod.settings.KEY_C);},50);

            }, 50, event);

            setTimeout(function ()
            {
                clearInterval(adrenalineRushTask);
            }, 100, event);
        }
        else if(event.skill.id == S_SHIELD_BASH_0 || event.skill.id == S_SHIELD_BASH_1)
            finish[SHIELD_BASH] = true;
        else if(event.skill.id == S_SHIELD_BARRAGE_0)
            finish[SHIELD_BARRAGE_0] = true;
        else if(event.skill.id == S_SHIELD_BARRAGE_1)
            finish[SHIELD_BARRAGE_1] = true;
        else if(event.skill.id == S_INFURIATE)
            finish[INFURIATE] = true;
        else if(event.skill.id == S_STAND_FAST)
            finish[STAND_FAST] = true;

        return;
    });


    //--------------------------------------------------------------------------------------------------------------------------------------
    //  Interface
    //--------------------------------------------------------------------------------------------------------------------------------------

    mod.command.add(['lancer'], () =>
    {
        if(ui){ui.show();}
    });

    let ui = null;
    if(global.TeraProxy.GUIMode)
    {
        ui = new SettingsUI(mod, require('./settings_structure'), mod.settings, {height: 420, width: 700});
        
        ui.on('update', settings => 
        {
            mod.settings = settings;
        });

        this.destructor = () => 
        {
            if(ui)
            {
                ui.close();
                ui = null;
            }
        };
    }
}