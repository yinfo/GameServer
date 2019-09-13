**`Версия 0.0.11`**

Начало заклинания  (запрос)

`{
"scr":"spell_start",
"sessionId":"",
"charId":"",
"spellId":1
}`

Начало заклинания (ответ инициатору)

`{
spell_available: true,
spellId: 1,
type: "valid-response",
scr: "spell_start"
}`

Начало заклинания (оповещение наблюдателю)

`{
spellId: 1,
type: "valid-response",
scr: "enemy_spell_start"
}`

Начало заклинания (коды ошибок)

`'missing_spellId' - 'В запросе отсутствует spellId';
'spell_not_available' - 'Заклинание недоступно';
'enemy_is_gone' - 'Противник пропал';
`



Скиллчек (запрос)

`{"scr":"spell_step",
"sessionId":"",
"charId":"",
"status":"success",//fail, success, super
}`

Скиллчек (ответ инициатору)

`{
index: 0,
is_last_hit: false,
type: "valid-response",
scr: "spell_step"
}`

Скиллчек (оповещение наблюдателю)

`{
status: "success",
index: 0,
type: "valid-response",
scr: "enemy_spell_step"
}
`
Скиллчек (коды ошибок)

`'wrong_status';
'enemy_is_gone';
'player_is_not_started_spell' - 'Игрок не является начавшим заклинание';
'index_goes_beyond_number_of_spell_params' - 'индекс выходит за пределы количества элементов массива параметров заклинания';
'incorrect_spellId_or_missing_spell_params';`

**`Версия 0.0.10`**

Создание заявки на поединок (запрос)

`{
"scr":"create_bid",
"sessionId":"",
"charId":""
}`

Отмена заявки на поединок (запрос)

`{
"scr":"cancel_bid",
"sessionId":"",
"charId":""
}`

Подтверждение заявки на поединок кнопкой Ок (запрос)

`{
"scr":"start_battle",
"sessionId":"",
"charId":""
}`


**`Версия 0.0.9`**

При распаковке фолианта теперь у заклинания есть параметр количество - **spellsAmount**

**//todo доделать количество заклинаний. В текущей версии**:
            
            prize.spellsAmount = randomInteger(1, 3)
           
При распаковке фолианта теперь могут появиться эссенции. Пример:

  
     {
       "type": "spell",    
       "group": "medium_spell",
       "spellId": 1,
       "spellsAmount": 2
     },     
     {
       "type": "essence",     
       "group": "bad_essence",
       "elementType": "plasma",
       "amount": 1
     }

   **//todo доделать количество и тип эссенций. В текущей версии:**
   
    prize.essenceAmount = randomInteger(1, 3)
    prize.essenceType = elementType
    
Для перемещения эссенций реализованы два скрипта:
**essence_from_user_to_char** и **essence_from_char_to_user** .
Пример запроса на перемещение эссенции выбранного типа от персонажа в поясную сумку:

`{	"scr":"essence_from_user_to_char",
	"sessionId": "awle46q4jnn5jua8",
	"charId":"5bd0697bfbce7a220c15001b",
	"elementType":"plasma"
}`

Пример запроса на перемещение эссенции выбранного типа из поясной сумки на "общий склад" игрока:

`{	"scr":"essence_from_char_to_user",
 	"sessionId": "awle46q4jnn5jua8",
 	"charId":"5bd0697bfbce7a220c15001b",
 	"elementType":"plasma"
 }
`
Размещение эссенций можно наблюдать в отчете getChars. Добавлены коллекции essences в корне (общий склад эссенций)
и для каждого персонажа.


`  "type": "valid-response",
  "userEssences": [
    {
      "elementType": "plasma",
      "amount": 2
    }
  ],
  "characters": [
    {
      "charId": "5bd0697bfbce7a220c15001b",     
      "essences": [
        {
          "elementType": "plasma",
          "amount": 3
        },
        {
          "elementType": "water",
          "amount": 2
        }
      ]
    }
]`



**`Версия 0.0.8`**

`Создание фолианта`

{
"scr":"createFolio",

"sessionId": "awle46q4jnn5jua8",

"charId":"5bd0697bfbce7a220c15001b"}

`Изучение фолиантов`

{	
"scr":"startLearningFolios",

"sessionId": "awle46q4jnn5jua8",
	
"charId":"5bd0697bfbce7a220c15001b"}

`Распаковка фолиантов`

{	
    "scr":"unzipFolios",
    
"sessionId": "awle46q4jnn5jua8",

"charId":"5bd0697bfbce7a220c15001b",

"test":true
}

При установленном флаге **"test":true** фолианты не уничтожаются и можно отправлять команду unzipFolios много раз и наблюдать, как заклинания переходят с уровня на уровень.  

Результат распаковки (в примере - 1 фолиант выдал 2 приза)

  
  
    
    "type": "silver", //тип открытого фолианта
    
    "prizes_count": 2, //получено призов
    
    "prizes": [
    
      {
        "group": "bad_spell",
        
        "spellId": 0, //выпавшее заклинание
        
        "changes": { //изменения в книге
        
          "level_old": 1,//старый уровень
          
          "progress_old": 10,//старый уровень прогресса
          
          "level_new": 2, //переход на новый уровень
          
          "progress_new": 1//прогресс на новом уровне 1
          
        }
        
      },
      
      {
        "group": "good_spell",
        
        "spellId": 3,//выпавшее заклинание
        
        "changes": {//изменения в книге
        
          "level_old": 1,
          
          "progress_old": 1,
          
          "level_new": 1,
          
          "progress_new": 2
          
        }
        
      }
      
    ]
    
 
  
	
	


Админ-панель базы данных:
http://192.168.110.9:3000/app/sansara/sansara/users/view/1

**`Версия 0.0.7`**

`Запрос presetChange (для отправки по сокету)`
  

{
  "scr": "presetChange",
  
  "sessionId": "awle417gjnlji1ov",
  
  "charId": "5bceeca78ba24d061ca1b399",
  
  "Presets": [
  
    {
      "Index": 0,
      "PresetSpells": [-1,-1,2,-1,0,-1]
    },
    
    {
      "Index": 1,
      "Selected": true,
      "PresetSpells": [-1,-1,3,2,-1,-1]
    }
  ]
}




`Валидный ответ`

`{
  "type": "valid-response",  
  "scr": "presetChange"
}`



**`Версия 0.0.6`**

**`Внимание! Нужно заново регистрировать нового пользователя, чтобы увидеть заполнение настроек заклинаний по-умолчанию.`** 

Реализован функционал хранения у персонажа прогресса по каждому заклинанию. Данные хранятся в структуре персонажа в коллекции spells:

"spells": 

        [{
            "charId": 0,
            "level": 1,
            "max_progress": 10,
            "cur_progress": 1
        }]
        
 Настройки для начального заполнения хранятся в коллекции SpellLevels. Настройка имеет поле name по которому и идентифицируется. Например "name":"default" - настройка по умолчанию, присутствует в базе.
 
 **`Имя настройки, которая будет применяться при начальном заполнении заклинаний персонажа хранится для каждого заклинания в поле
 levelsConfig, по-умолчанию там прописано 'default'  `**     


**`Версия 0.0.5`**

**POST http://192.168.110.9:5000/api/SelectedPresets**

Выбранные пресеты незаблокированных персонажей

`Запрос`

{	
    "sessionId":"awle45ywjn340je8"
}


`Валидный ответ`

{

    "type": "valid-response",
    "Elements": [
        {
            "ID": "5bbf40f53edc8f1158d2fcb2",
            "Locked": false,
            "elementType": "plasma",
            "asset_id": 0,
            "selected_preset": 1,
            "Presets": [
                {
                    "Selected": true,
                    "Index": 1,
                    "PresetSpells": [
                        {
                            "Index": 0,
                            "Spell": {
                                "ManaCost": 5,
                                "LifeTime": 0,
                                "Value": -10,
                                "SpellID": 0,
                                "Target": "enemy",
                                "Level": 1,
                                "ProgressLevel": 1,
                                "MaxProgressLevel": "currentHealth",
                                "ParamType": "currentHealth",
                                "SpellType": "active_spell"
                            }
                        },
                        {
                            "Index": 1,
                            "Spell": {
                                "ManaCost": 8,
                                "LifeTime": 0,
                                "Value": -20,
                                "SpellID": 1,
                                "Target": "enemy",
                                "Level": 1,
                                "ProgressLevel": 1,
                                "MaxProgressLevel": "currentHealth",
                                "ParamType": "currentHealth",
                                "SpellType": "active_spell"
                            }
                        },
                        {
                            "Index": 2,
                            "Spell": null
                        },
                        {
                            "Index": 3,
                            "Spell": {
                                "ManaCost": 7,
                                "LifeTime": 5,
                                "Value": 3,
                                "SpellID": 2,
                                "Target": "self",
                                "Level": 1,
                                "ProgressLevel": 0,
                                "MaxProgressLevel": "currentMana",
                                "ParamType": "currentMana",
                                "SpellType": "active_spell"
                            }
                        },
                        {
                            "Index": 4,
                            "Spell": null
                        },
                        {
                            "Index": 5,
                            "Spell": null
                        }
                    ]
                }
            ]
        },
        {
            "ID": "5bbf40f53edc8f1158d2fcb4",
            "Locked": false,
            "elementType": "water",
            "asset_id": 0,
            "selected_preset": 0,
            "Presets": [
                {
                    "Selected": true,
                    "Index": 0,
                    "PresetSpells": [
                        {
                            "Index": 0,
                            "Spell": null
                        },
                        {
                            "Index": 1,
                            "Spell": null
                        },
                        {
                            "Index": 2,
                            "Spell": null
                        },
                        {
                            "Index": 3,
                            "Spell": null
                        },
                        {
                            "Index": 4,
                            "Spell": null
                        },
                        {
                            "Index": 5,
                            "Spell": null
                        }
                    ]
                }
            ]
        }
    ]
}


**POST http://192.168.110.9:5000/api/getSpellBook**

Все заклинания элемента и пресеты заклинаний

`Запрос`

{	
    "sessionId":"awle45ywjn340je8"
}


`Валидный ответ`

{

    "type": "valid-response",
    "Elements": [
        {
            "ID": "5bbf40f53edc8f1158d2fcb2",
            "Locked": false,
            "elementType": "plasma",
            "asset_id": 0,
            "selected_preset": 0,
            "Spells": [
                {
                    "ManaCost": 5,
                    "LifeTime": 0,
                    "Value": -10,
                    "SpellID": 0,
                    "Target": "enemy",
                    "Level": 1,
                    "ProgressLevel": 1,
                    "MaxProgressLevel": "currentHealth",
                    "ParamType": "currentHealth",
                    "SpellType": "active_spell"
                },
                {
                    "ManaCost": 8,
                    "LifeTime": 0,
                    "Value": -20,
                    "SpellID": 1,
                    "Target": "enemy",
                    "Level": 1,
                    "ProgressLevel": 1,
                    "MaxProgressLevel": "currentHealth",
                    "ParamType": "currentHealth",
                    "SpellType": "active_spell"
                },
                {
                    "ManaCost": 7,
                    "LifeTime": 5,
                    "Value": 3,
                    "SpellID": 2,
                    "Target": "self",
                    "Level": 1,
                    "ProgressLevel": 0,
                    "MaxProgressLevel": "currentMana",
                    "ParamType": "currentMana",
                    "SpellType": "active_spell"
                },
                {
                    "ManaCost": 0,
                    "LifeTime": 0,
                    "Value": 50,
                    "SpellID": 3,
                    "Target": "self",
                    "Level": 1,
                    "ProgressLevel": 1,
                    "MaxProgressLevel": "maxHealth",
                    "ParamType": "maxHealth",
                    "SpellType": "spell_parametric"
                },
                {
                    "ManaCost": 0,
                    "LifeTime": 0,
                    "Value": 50,
                    "SpellID": 4,
                    "Target": "self",
                    "Level": 1,
                    "ProgressLevel": 0,
                    "MaxProgressLevel": "maxMana",
                    "ParamType": "maxMana",
                    "SpellType": "spell_parametric"
                }
            ],
            "Presets": [
                {
                    "Selected": true,
                    "Index": 0,
                    "PresetSpells": [
                        {
                            "Index": 0,
                            "Spell": {
                                "ManaCost": 8,
                                "LifeTime": 0,
                                "Value": -20,
                                "SpellID": 1,
                                "Target": "enemy",
                                "Level": 1,
                                "ProgressLevel": 1,
                                "MaxProgressLevel": "currentHealth",
                                "ParamType": "currentHealth",
                                "SpellType": "active_spell"
                            }
                        }
                    ]
                },
                {
                    "Selected": false,
                    "Index": 1,
                    "PresetSpells": [
                        {
                            "Index": 0,
                            "Spell": {
                                "ManaCost": 5,
                                "LifeTime": 0,
                                "Value": -10,
                                "SpellID": 0,
                                "Target": "enemy",
                                "Level": 1,
                                "ProgressLevel": 1,
                                "MaxProgressLevel": "currentHealth",
                                "ParamType": "currentHealth",
                                "SpellType": "active_spell"
                            }
                        },
                        {
                            "Index": 1,
                            "Spell": {
                                "ManaCost": 8,
                                "LifeTime": 0,
                                "Value": -20,
                                "SpellID": 1,
                                "Target": "enemy",
                                "Level": 1,
                                "ProgressLevel": 1,
                                "MaxProgressLevel": "currentHealth",
                                "ParamType": "currentHealth",
                                "SpellType": "active_spell"
                            }
                        },
                        {
                            "Index": 2,
                            "Spell": {
                                "ManaCost": 7,
                                "LifeTime": 5,
                                "Value": 3,
                                "SpellID": 2,
                                "Target": "self",
                                "Level": 1,
                                "ProgressLevel": 0,
                                "MaxProgressLevel": "currentMana",
                                "ParamType": "currentMana",
                                "SpellType": "active_spell"
                            }
                        }
                    ]
                }
            ]
        },
        {
            "ID": "5bbf40f53edc8f1158d2fcb4",
            "Locked": false,
            "elementType": "water",
            "asset_id": 0,
            "selected_preset": 0,
            "Spells": [],
            "Presets": [
                {
                    "Selected": true,
                    "Index": 0,
                    "PresetSpells": []
                }
            ]
        }
    ]
}



**`Версия 0.0.4`**

**POST http://192.168.110.9:5000/api/getChars**

Cписок персонажей по sessionId

`Запрос`

{	
    "sessionId":"awle45ywjn340je8"
}


`Валидный ответ`

{

    "type": "valid-response",
    "message": "Список персонажей успешно получен",
    "characters": [
        {
            "elementType": "water",
            "lock": false,
            "selected_preset": 0,
            "level": 1
        },
        {
            "elementType": "plasma",
            "lock": false,
            "selected_preset": 0,
            "level": 1
        }
    ]
}

**POST http://192.168.110.9:5000/api/getSelectedPresets**

Выбранные пресеты по всем разблокированным персонажам

`Запрос`

{	
    "sessionId":"awle45ywjn340je8"
}



`Валидный ответ`

{

    "type": "valid-response",
    "message": "выбранные пресеты по  разблокированным персонажам",
    "presets": [
        {
            "charId": "5bbdeb85d1d3251e387c13e1",
            "elementType": "water",
            "lock": false,
            "spells": [
                -1,
                -1,
                -1,
                -1,
                -1,
                -1
            ]
        },
        {
            "charId": "5bbdeb85d1d3251e387c13e3",
            "elementType": "plasma",
            "lock": false,
            "spells": [
                {
                    "_id": 0,
                    "spell_type": "active_spell",
                    "mana_cost": 5,
                    "life_time": 0,
                    "param_type": "currentHealth",
                    "value": -10,
                    "target": "enemy",
                    "max_progress": 10,
                    "cur_progress": 1,
                    "level": 1
                },
                {
                    "_id": 1,
                    "spell_type": "active_spell",
                    "mana_cost": 8,
                    "life_time": 0,
                    "param_type": "currentHealth",
                    "value": -20,
                    "target": "enemy",
                    "max_progress": 10,
                    "cur_progress": 1,
                    "level": 1
                },
                -1,
                -1,
                -1,
                -1
            ]
        }
    ]
}



**`Версия 0.0.3`**

**POST http://212.30.187.5:5000/api/register**

или

**POST http://192.168.110.9:5000/api/register**

Регистрация нового пользователя

`Запрос`

{	

    "login":"login",
	"password":"password"
}



`Валидный ответ`

{

     "type": "valid-response",
     "sessionId": "5hqmq25pjms37sg1",
     "login": "login2",
     "nick_name": "",
     "level": 1
 }


`Ошибки:`
{

    "type": "error",    
    "errorId": "LOGIN_ALREADY_EXISTS",    
    "message": "Такой login уже занят"
}
`или`
{

    "type": "error",    
    "errorId": "DATA_BASE_WRITE_ERROR",    
    "message": "Ошибка при записи пользователя в БД"
}


**POST http://212.30.187.5:5000/api/login**

или

**POST http://192.168.110.9:5000/api/login**

Login в систему. Обновляет у пользователя время сессии last_time и возвращает в случае успеха идентификатор этой сессии sessionId

`Запрос`

{	

    "login":"login",
	"password":"password"
}

`Валидный ответ`

{

     "type": "valid-response",
     "sessionId": "5hqmq25pjms37sg1",
     "login": "login2",
     "nick_name": "",
     "level": 1
 }


`Ошибки:`

{
 
     "type": "error",    
     "errorId": "WRONG_PASSWORD",    
     "message": "Неправильный пароль"
 }
 `или`
 {
 
     "type": "error",    
     "errorId": "LOGIN_NOT_FOUND",    
     "message": "Неправильный login"
 }
 `или`
 {
 
     "type": "error",    
     "errorId": "NO_SESSION_ID_SENT",    
     "message": "В запросе не указан sessionId"
 }
 `или`
 {
 
     "type": "error",    
     "errorId": "WRONG_SESSION_ID",    
     "message": "sessionId задан неверно"
 }
 `или`
 {
 
     "type": "error",    
     "errorId": "SESSION_EXPIRED",    
     "message": "Время сессии истекло"
 }
 
 **POST http://212.30.187.5:5000/api/logout**
 
 или
 
 **POST http://192.168.110.9:5000/api/logout**
 
 Выход из системы. Реализация - записывает в поле last_time нулевую дату.
 
 {
 
 	"sessionId":"5hqmq25pjmrsm92q"
 }
 
 `Валидный ответ`
 
 {
 
     "type": "valid-response",
     "sessionId":"5hqmq25pjmrsm92q",
     "message": "Вы успешно разлогинились"
 }
 
 `Ошибки:`
 {
 
     "type": "error",
     
     "errorId": "NO_SESSION_ID_SENT",
     
     "message": "В запросе не указан sessionId"
 }
 `или`
 {
 
     "type": "error",
     
     "errorId": "WRONG_SESSION_ID",
     
     "message": "sessionId задан неверно!"
 }

**POST http://212.30.187.5:5000/api/ChangeNickName**

или

**POST http://192.168.110.9:5000/api/ChangeNickName**

Позволяет изменить никнейм игрока

{

	"sessionId":"5hqmq25pjmrsm92q",
	"newNick": "newNick"
}

`Валидный ответ`

{

    "type": "valid-response",
    "sessionId":"5hqmq25pjmrsm92q",
    "message": "Вы успешно изменили nick-name",
    "oldNick": "",
    "newNick": ""
}

`Ошибки:`

        errorId = 'NICK_NAME_CANNOT_BE_EMPTY'
        message = 'Имя игрока не может быть пустым'
        
        errorId = 'NAME_SHORTER_MIN_LENGTH'
        message = 'Длина имени не может быть меньше '    
        
        errorId = 'NAME_LONGER_MAX_LENGTH'
        message = 'Длина имени не может быть больше '   
        
        errorId = 'NICK_NAME_CONTAINS_INVALID_CHARACTERS'
        message = 'Допустимые символы - латиница обоих регистров, пробел, нижнее подчеркивание, цифры, дефис '                   

**POST http://212.30.187.5:5000/api/TutorialCompleted**

или

**POST http://192.168.110.9:5000/api/TutorialCompleted**

Устанавливает пользователю TutorialCompleted = true (учебник пройден)

{

	"sessionId":"5hqmq25pjmrsm92q"
}

`Валидный ответ`

{

    "type": "valid-response",
    "message": "TutorialCompleted = true"
}

`Ошибки:`
{

    "type": "error",    
    "errorId": "DATA_BASE_WRITE_ERROR",    
    "message": "Ошибка при записи пользователя в БД"
}




Все коды ошибок:

LOGIN_ALREADY_EXISTS - 'Такой login уже занят'

NICK_ALREADY_EXISTS - 'Такой nick уже занят'

DATA_BASE_WRITE_ERROR - 'Ошибка при записи пользователя в БД'

WRONG_PASSWORD - 'Неправильный пароль'

LOGIN_NOT_FOUND - 'Неправильный login'

NO_SESSION_ID_SENT - 'В запросе не указан sessionId'

WRONG_SESSION_ID - 'sessionId задан неверно'

SESSION_EXPIRED - 'Время сессии истекло'

INVALID_CHARACTERS_IN_NAME - 'Недопустимые символы в имени персонажа'

TIMESTAMP_UPDATE_ERROR - 'Ошибка БД при обновлении timestamp'

'NICK_NAME_CANNOT_BE_EMPTY'

'NAME_SHORTER_MIN_LENGTH'

'NAME_LONGER_MAX_LENGTH'

'NICK_NAME_CONTAINS_INVALID_CHARACTERS'
