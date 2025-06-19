const DefaultSettings = 
{
	"DEBUG": false,
    "SHIELD_BARRAGE_CANCEL": true,
    "SHIELD_BARRAGE_CANCEL_DESCRIPTION": "Habilitar o cancelamento do Shield Barrage, fazendo que o segundo ataque saia extremamente rapido.",
    "SHIELD_BARRAGE_CANCEL_AWSD": true,
    "SHIELD_BARRAGE_CANCEL_AWSD_DESCRIPTION": "Desabilitar o cancelamento do Shield Barrage enquanto se movimenta.",
    "AUTO_SPRING_ATTACK": false,
    "AUTO_SPRING_ATTACK_DESCRIPTION": "Habilitar o uso automatico do Spring Attack apos o Shield Barrage.",
    "AUTO_ONSLAUGHT": true,
    "AUTO_ONSLAUGHT_DESCRIPTION": "Habilitar o uso automatico do Onslaught apos o Shield Bash.",
    "INFURIATE_CANCEL": true,
    "INFURIATE_CANCEL_DESCRIPTION": "Habilitar o cancelamento do Infuriate.",
    "ADRENALINE_RUSH_KEYS": false,
    "ADRENALINE_RUSH_KEYS_DESCRIPTION": "Preciona os botoes KEY_A, KEY_B e KEY_C assim que a habilidade Adrenaline Rush for ativada.",
    "KEY_A": "f1",
    "KEY_B": "f2",
    "KEY_C": "f3"
}

module.exports = function MigrateSettings(from_ver, to_ver, settings)
{
    if(from_ver === undefined)
    {
        return Object.assign(Object.assign({}, DefaultSettings), settings);
    }
    else if(from_ver === null)
    {
        return DefaultSettings;
    }
    else
    {
		if(from_ver + 1 < to_ver)
        {
			settings = MigrateSettings(from_ver, from_ver + 1, settings);
			return MigrateSettings(from_ver + 1, to_ver, settings);
		}
		switch(to_ver)
        {
			default:
				let oldsettings = settings;
				
                settings = Object.assign(DefaultSettings, {});

				for(let option in oldsettings)
                {
					if(settings[option])
                    {
						settings[option] = oldsettings[option];
					}
				}

				if(from_ver < to_ver)
                    console.log('DRAGON-LANCER: Your settings have been updated to version ' + to_ver + '. You can edit the new config file after the next relog.');
				
                break;
		}
		return settings;
	}
}