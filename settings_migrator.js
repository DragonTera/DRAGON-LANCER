const DefaultSettings = 
{
	"DEBUG": false,
    "ADRENALINE_RUSH_KEYS": false,
    "ADRENALINE_RUSH_KEYS_DESCRIPTION": "Preciona os botoes KEY_A, KEY_B e KEY_C assim que a habilidade Adrenaline Rush for ativada. true == habilitado | false == desabilitado",
    "KEY_A": "f1",
    "KEY_B": "f2",
    "KEY_C": "f3"
}

module.exports = function MigrateSettings(from_ver, to_ver, settings)
{
    if (from_ver === undefined)
        {
        // Migrate legacy config file
        return Object.assign(Object.assign({}, DefaultSettings), settings);
    }
    else if (from_ver === null) {
        // No config file exists, use default settings
        return DefaultSettings;
    }
}