const TAG = 'DRAGON-LANCER: ';

const JOB_LANCER = 1;

const ADRENALINE_RUSH = 0;

const S_GUARDIAN_SHOUT      = 70300;

const S_ADRENALINE_RUSH_0   = 170200;
const S_ADRENALINE_RUSH_1   = 170240;
const S_ADRENALINE_RUSH_2   = 170250;

module.exports = function archer(mod)
{
    let job;
    let model;
    let playerId;
    let finish = [true];
    let speed;
    let myRe;

    let task0

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

    mod.hook('S_CANNOT_START_SKILL', 4, (event) => 
    {
        if(job != JOB_LANCER){return;}
        if(mod.settings.DEBUG){console.log(TAG + 'S_CANNOT_START_SKILL: ' + event.skill.id);}

        return;
	});

    mod.hook('S_START_COOLTIME_SKILL', mod.majorPatchVersion < 114 ? 3 : 4, (event) =>
    {
        if(job != JOB_LANCER){return;}
        if(mod.settings.DEBUG){console.log(TAG + 'S_START_COOLTIME_SKILL: ' + event.skill.id + ' / ' + event.cooldown);}

        return;
	});
    
    mod.hook('C_PRESS_SKILL', mod.majorPatchVersion < 114 ? 4 : 5, (event) => 
    {
        if(job != JOB_LANCER){return;}
        if(mod.settings.DEBUG){console.log(TAG + 'C_PRESS_SKILL: ' + event.skill.id);}

        return;
	});

    mod.hook('C_START_INSTANCE_SKILL', mod.majorPatchVersion < 114 ? 7 : 8, (event) => 
    {
        if(job != JOB_LANCER){return;}
        if(mod.settings.DEBUG){console.log(TAG + 'C_START_INSTANCE_SKILL: ' + event.skill.id);}

        return;
    });

    mod.hook('C_START_SKILL', 7, (event) =>
    {
        if(job != JOB_LANCER){return;}
        if(mod.settings.DEBUG){console.log(TAG + 'C_START_SKILL: ' + event.skill.id);}

        if((event.skill.id == S_ADRENALINE_RUSH_0 || event.skill.id == S_ADRENALINE_RUSH_1 || event.skill.id == S_ADRENALINE_RUSH_2) && mod.settings.ADRENALINE_RUSH_KEYS)
        {
            finish[ADRENALINE_RUSH] = false;
            
            clearInterval(task0);
            task0 = setInterval(function ()
            {
                if(finish[ADRENALINE_RUSH] == false)
                {
                    var robot = require("robotjs");
                    robot.keyTap(mod.settings.KEY_A);
                    setTimeout(function (){robot.keyTap(mod.settings.KEY_B);},25);
                    setTimeout(function (){robot.keyTap(mod.settings.KEY_C);},50);
                }
                else
                {
                    clearInterval(task0);
                    return;
                }
            }, 50, event);

            setTimeout(function ()
            {
                if(finish[ADRENALINE_RUSH] == false)
                {
                    clearInterval(task0);
                    finish[ADRENALINE_RUSH] = true;
                }
            }, 300, event);
        }
        return;
    });

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
            finish[ADRENALINE_RUSH] = true;

        return;
    });
}