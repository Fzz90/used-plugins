/*
Title: Full Input
Author: DKPlugins
Site: https://dk-plugins.ru
E-mail: kuznetsovdenis96@gmail.com
Version: 5.3.0
Release: 09.02.2023
First release: 30.01.2016
*/

/*ru
Название: Полный Ввод
Автор: DKPlugins
Сайт: https://dk-plugins.ru
E-mail: kuznetsovdenis96@gmail.com
Версия: 5.3.0
Релиз: 09.02.2023
Первый релиз: 30.01.2016
*/

/*:
* @plugindesc v.5.3.0 [MV|MZ] All keys of the keyboard and gamepad.
* @author DKPlugins
* @url https://dk-plugins.ru
* @target MZ
* @orderAfter DKTools
* @help

 ### Info about plugin ###
 Title: DK_Full_Input
 Author: DKPlugins
 Site: https://dk-plugins.ru
 Version: 5.3.0
 Release: 09.02.2023
 First release: 30.01.2016

 ###===========================================================================
 ## Compatibility
 ###===========================================================================
 RPG Maker MV: 1.5+
 RPG Maker MZ: 1.0+

 ###===========================================================================
 ## Installation
 ###===========================================================================
 Place the following plugins ABOVE (if using):
 1. DKTools

 ###===========================================================================
 ## Important information
 ###===========================================================================
 The plugin changes the default behavior for handling keystrokes.
 In RPG Maker, the keypress time is always counted for the last key pressed.
 This plugin changes this system and now the time of pressing each key is counted separately.

 Default RPG Maker MV/MZ values for Alt, Space, Insert, Q, W, X, Z
 Alt: 'control'
 Space: 'ok'
 Insert: 'escape'
 Q: 'pageup'
 W: 'pagedown'
 X: 'escape'
 Z: 'ok'

 The values of this plugin for Alt, Space, Insert, Q, W, X, Z
 Alt: 'alt'
 Space: 'space'
 Insert: 'insert'
 Q: 'q'
 W: 'w'
 X: 'x'
 Z: 'z'

 Tested gamepads:
 Xbox One (wired and wireless) - 100%
 PS5 DualSense - 100% (experimental support)

 ###===========================================================================
 ## Plugin commands (RPG Maker MV)
 ###===========================================================================
 1. Reset the keyboard buttons:
 ResetKeyboardButtons

 2. Reset the gamed buttons:
 ResetGamepadButtons

 ###===========================================================================
 ## Added functions
 ###===========================================================================
 Added tracking of gamepad triggers pressing and axis tilts
 Tested on Xbox One Wireless Gamepad
 Use to get values:
 Input.gamepad.lt - left trigger (float value of the force of pressing in the range from 0 to 1)
 Input.gamepad.rt - right trigger (float value of the force of pressing in the range from 0 to 1)
 Input.gamepad.axes - axes (Array with 4 float values)
 The axes have the following structure:
 [X-axis (left stick), Y-axis (left stick), X-axis (right stick), Y-axis (right stick)]

 X-axis (any stick) is -1 when you tilt the stick to the left
 X-axis (any stick) is 1 when you tilt the stick to the right
 Y-axis (any stick) is -1 when you tilt the stick up
 Y-axis (any stick) is 1 when you tilt the stick down

 Input.preferGamepad () - Returns true if the player is playing a gamepad

 Input.isAnyPressed(keys) - Returns true if at least one key is pressed (keys not specified).
 Returns true if at least one key from the keys array is pressed (keys is an array of keys).

 Input.isAnyTriggered(keys) - Returns true if at least one key is pressed and released (keys not specified).
 Returns true if at least one key from the keys array is pressed and released (keys is an array of keys).

 Input.isAnyRepeated(keys) - Returns true if pressing at least one key is repeated (keys not specified).
 Returns true if pressing at least one key from the keys array is repeated (keys is an array of keys).

 Input.isAnyLongPressed(keys) - Returns true if at least one key is pressed for a long time (keys not specified).
 Returns true if at least one key from the keys array is pressed for a long time (keys is an array of keys).

 Input.getPressedTime (keyName) - Returns the time the keyName was pressed in frames.

 Input.getRepeats(keyName) - Returns the number of repeats the keyName button was pressed.

 Input.virtualClick(keyName) - Emulation of pressing the keyName button.

 Input.resetKeyboardButtons() - Resets the keyboard buttons

 Input.resetGamepadButtons() - Resets the gamepad buttons

 If you create a plugin based on this:
 Before using any function, make sure that the user has installed the plugin:
 if (Imported.DK_Full_Input) {}

 Get plugin version:
 var version = Imported.DK_Full_Input;

 ###===========================================================================
 ## Add-ons
 ###===========================================================================
 1. Map Hotkeys (https://dk-plugins.ru/map-hotkeys/)
 Allows you to create hotkeys on the map and perform various actions when triggered.

 ###=========================================================================
 ## See also
 ###=========================================================================
 1. Game Time (https://dk-plugins.ru/game-time/)
 Time system.

 2. Globals (https://dk-plugins.ru/globals/)
 Allows you to specify variables and switches that will be “global” to all player saves.
 Changes are saved in a separate file and applied when starting a new game or loading any save.

 3. Mouse System (https://dk-plugins.ru/mouse-system/)
 Allows you to change the mouse cursor, activate events by clicking, hovering, etc.

 4. Events Glow (https://dk-plugins.ru/events-glow/)
 Allows highlighting events on mouse hover.

 5. Pictures Glow (https://dk-plugins.ru/pictures-glow/)
 Allows highlighting pictures on mouse hover.

 ###=========================================================================
 ## Graphics
 ###=========================================================================
 Additional graphics for your project: https://dk-plugins.ru/resources/

 ###===========================================================================
 ## License and terms of use
 ###===========================================================================
 You can:
 -To use the plugin for your non-commercial projects
 -Change code of the plugin

 You cannot:
 -Delete or change any information about the plugin
 -Distribute the plugin and its modifications

 ## Commercial license ##
 Visit the page: https://dk-plugins.ru/commercial-license/

 ###===========================================================================
 ## Support
 ###===========================================================================
 Become a subscriber: https://boosty.to/dkplugins



 * @command ResetKeyboardButtons
 * @desc Reset the keyboard buttons

 * @command ResetGamepadButtons
 * @desc Reset the gamepad buttons



 * @param Keyboard
 * @desc Customizing the keyboard keys
 * @type struct<Keyboard>
 * @default {"8":"backspace","9":"tab","13":"ok","16":"shift","17":"control","18":"alt","19":"pause","20":"capslock","27":"escape","32":"space","33":"pageup","34":"pagedown","35":"end","36":"home","37":"left","38":"up","39":"right","40":"down","44":"printscreen","45":"insert","46":"delete","47":"/","48":"0","49":"1","50":"2","51":"3","52":"4","53":"5","54":"6","55":"7","56":"8","57":"9","65":"a","66":"b","67":"c","68":"d","69":"e","70":"f","71":"g","72":"h","73":"i","74":"j","75":"k","76":"l","77":"m","78":"n","79":"o","80":"p","81":"q","82":"r","83":"s","84":"t","85":"u","86":"v","87":"w","88":"x","89":"y","90":"z","96":"escape","97":"numpad1","98":"down","99":"numpad3","100":"left","101":"numpad5","102":"right","103":"numpad7","104":"up","105":"numpad9","106":"*","107":"+","109":"-","110":".","111":"/","112":"f1","113":"f2","114":"f3","115":"f4","116":"f5","117":"f6","118":"f7","119":"f8","120":"debug","121":"f10","122":"f11","123":"f12","144":"numlock","145":"scrolllock","186":";","187":"=","188":"<","189":"-","190":">","191":"?","192":"`","219":"[","220":"|","221":"]","222":"\""}

 * @param WASD Movement
 * @text WASD movement
 * @parent Keyboard
 * @desc Enable WASD movement ? Works only on map.
 * @type boolean
 * @default false

 * @param Key Repeat Wait
 * @parent Keyboard
 * @desc Frames indicating long key press
 * @type number
 * @min 1
 * @default 24

 * @param Key Repeat Interval
 * @parent Keyboard
 * @desc Frames indicating the time between repeated keystrokes
 * @type number
 * @min 1
 * @default 6

 * @param Gamepad
 * @desc Customizing the gamepad keys
 * @type struct<Gamepad>
 * @default {"0":"ok","1":"cancel","2":"shift","3":"menu","4":"lb","5":"rb","6":"lt","7":"rt","8":"select","9":"start","10":"l3","11":"r3","12":"up","13":"down","14":"left","15":"right","16":"up","17":"down","18":"left","19":"right","20":"r_up","21":"r_down","22":"r_left","23":"r_right"}

 * @param Threshold
 * @parent Gamepad
 * @desc The stick tilt value at which it is considered pressed
 * @type number
 * @decimals 2
 * @min 0.05
 * @max 1.00
 * @default 0.50

 * @param Right Stick Scroll
 * @parent Gamepad
 * @desc Enable scrolling of supported windows with the right stick of the gamepad ?
 * @type boolean
 * @default false

 * @param Switches
 * @desc List of switches which are controlled by pressed keys
 * @type struct<Switches>[]
 * @default []

 * @param Latest Button Variable
 * @desc The variable into which the code of the last pressed key is saved
 * @type variable
 * @default 0

*/

/*:ru
 * @plugindesc v.5.3.0 [MV|MZ] Использование всех кнопок клавиатуры и геймпада.
 * @author DKPlugins
 * @url https://dk-plugins.ru
 * @target MZ
 * @orderAfter DKTools
 * @help

 ### Информация о плагине ###
 Название: DK_Full_Input
 Автор: DKPlugins
 Сайт: https://dk-plugins.ru
 Версия: 5.3.0
 Релиз: 09.02.2023
 Первый релиз: 30.01.2016

 ###===========================================================================
 ## Совместимость
 ###===========================================================================
 RPG Maker MV: 1.5+
 RPG Maker MZ: 1.0+

 ###===========================================================================
 ## Установка
 ###===========================================================================
 Разместите следующие плагины ВЫШЕ (если используете):
 1. DKTools

 ###===========================================================================
 ## Важная информация
 ###===========================================================================
 Плагин изменяет стандартное поведение обработки нажатий клавиш.
 В RPG Maker время нажатия клавиши всегда считается для последней нажатой клавиши.
 Этот плагин меняет данную систему, и теперь считается время нажатия каждой клавиши отдельно.

 Изменено назначение следующих клавиш:
 Alt, Space, Insert, Q, W, X, Z

 Стандартные значения клавиш в RPG Maker MV/MZ для Alt, Space, Insert, Q, W, X, Z
 Alt: 'control'
 Space: 'ok'
 Insert: 'escape'
 Q: 'pageup'
 W: 'pagedown'
 X: 'escape'
 Z: 'ok'

 Значения для клавиш в этом плагине Alt, Space, Insert, Q, W, X, Z
 Alt: 'alt'
 Space: 'space'
 Insert: 'insert'
 Q: 'q'
 W: 'w'
 X: 'x'
 Z: 'z'

 Протестированные геймпады:
 Xbox One (проводной и беспроводной) - 100%
 PS5 DualSense - 100% (экспериментальная поддержка)

 ###===========================================================================
 ## Команды плагина (RPG Maker MV)
 ###===========================================================================
 1. Сбросить клавиши клавиатуры:
 ResetKeyboardButtons

 2. Сбросить клавиши геймпада:
 ResetGamepadButtons

 ###===========================================================================
 ## Добавленные функции
 ###===========================================================================
 Добавлено отслеживание нажатия триггеров и отклонения осей геймпада.
 Проверено на беспроводном геймпаде Xbox One
 Используйте для получения значений:
 Input.gamepad.lt - левый триггер (значение с плавающей точкой силы нажатия в диапазоне от 0 до 1)
 Input.gamepad.rt - правый триггер (значение с плавающей точкой силы нажатия в диапазоне от 0 до 1)
 Input.gamepad.axes - оси (массив с 4 значениями с плавающей точкой)
 Оси имеют следующую структуру:
 [X-axis (левый стик), Y-axis (левый стик), X-axis (правый стик), Y-axis (правый стик)]

 X-axis (любой стик) принимает значение -1, когда вы отклоняете стик влево
 X-axis (любой стик) принимает значение 1, когда вы отклоняете стик вправо
 Y-axis (любой стик) принимает значение -1, когда вы отклоняете стик вверх
 Y-axis (любой стик) принимает значение 1, когда вы отклоняете стик вниз

 Input.preferGamepad() - Возвращает true, если игрок играет на геймпаде

 Input.isAnyPressed(keys) - Возвращает true, если нажата хоть одна клавиша (keys не указано).
 Возвращает true, если нажата хоть одна клавиша из массива keys (keys - массив клавиш).

 Input.isAnyTriggered(keys) - Возвращает true, если нажата и отпущена хоть одна клавиша (keys не указано).
 Возвращает true, если нажата и отпущена хоть одна клавиша из массива keys (keys - массив клавиш).

 Input.isAnyRepeated(keys) - Возвращает true, если нажатие хоть одной клавиши повторяется (keys не указано).
 Возвращает true, если нажатие хоть одной клавиши из массива keys повторяется (keys - массив клавиш).

 Input.isAnyLongPressed(keys) - Возвращает true, если долго нажата хоть одна клавиша (keys не указано).
 Возвращает true, если долго нажата хоть одна клавиша из массива keys (keys - массив клавиш).

 Input.getPressedTime(keyName) - Возвращает время нажатия кнопки keyName в кадрах.

 Input.getRepeats(keyName) - Возвращает количество повторений нажатия кнопки keyName.

 Input.virtualClick(keyName) - Эмуляция нажатия кнопки keyName.

 Input.resetKeyboardButtons() - Сбрасывает клавиши клавиатуры

 Input.resetGamepadButtons() - Сбрасывает клавиши геймпада

 Если Вы создаете свой плагин на основе этого:
 Перед использованием любых функций убедитесь, что у пользователя установлен данный плагин:
 if (Imported.DK_Full_Input) {}

 Получить версию плагина:
 var version = Imported.DK_Full_Input;

 ###===========================================================================
 ## Дополнения
 ###===========================================================================
 1. Горячие Клавиши Карты (https://dk-plugins.ru/ru/map-hotkeys/)
 Позволяет создавать горячие клавиши на карте и выполнять различные действия при срабатывании.

 ###=========================================================================
 ## Смотрите также
 ###=========================================================================
 1. Время (https://dk-plugins.ru/game-time/)
 Система времени.

 2. Глобальные Данные (https://dk-plugins.ru/globals/)
 Позволяет указать переменные и переключатели, которые будут "глобальными" для всех сохранений игрока.
 Изменения сохраняются в отдельный файл и применяются при старте новой игры или загрузке любого сохранения.

 3. Система Мыши (https://dk-plugins.ru/mouse-system/)
 Позволяет изменять курсор мыши, активировать события нажатием, наведением и др.

 4. Свечение Событий (https://dk-plugins.ru/events-glow/)
 Позволяет подсвечивать события при наведении мыши.

 5. Свечение Изображений (https://dk-plugins.ru/pictures-glow/)
 Позволяет подсвечивать изображения при наведении мыши.

 ###=========================================================================
 ## Графика
 ###=========================================================================
 Дополнительная графика для вашего проекта: https://dk-plugins.ru/resources/

 ###===========================================================================
 ## Лицензия и правила использования плагина
 ###===========================================================================
 Вы можете:
 -Использовать плагин в некоммерческих проектах
 -Изменять код плагина

 Вы не можете:
 -Удалять или изменять любую информацию о плагине
 -Распространять плагин и его модификации

 ## Коммерческая лицензия ##
 Посетите страницу: https://dk-plugins.ru/commercial-license/

 ###===========================================================================
 ## Поддержка
 ###===========================================================================
 Стать подписчиком: https://boosty.to/dkplugins



 * @command ResetKeyboardButtons
 * @desc Сбросить клавиши клавиатуры

 * @command ResetGamepadButtons
 * @desc Сбросить клавиши геймпада



 * @param Keyboard
 * @text Клавиатура
 * @desc Настройка клавиш клавиатуры
 * @type struct<Keyboard>
 * @default {"8":"backspace","9":"tab","13":"ok","16":"shift","17":"control","18":"alt","19":"pause","20":"capslock","27":"escape","32":"space","33":"pageup","34":"pagedown","35":"end","36":"home","37":"left","38":"up","39":"right","40":"down","44":"printscreen","45":"insert","46":"delete","47":"/","48":"0","49":"1","50":"2","51":"3","52":"4","53":"5","54":"6","55":"7","56":"8","57":"9","65":"a","66":"b","67":"c","68":"d","69":"e","70":"f","71":"g","72":"h","73":"i","74":"j","75":"k","76":"l","77":"m","78":"n","79":"o","80":"p","81":"q","82":"r","83":"s","84":"t","85":"u","86":"v","87":"w","88":"x","89":"y","90":"z","96":"escape","97":"numpad1","98":"down","99":"numpad3","100":"left","101":"numpad5","102":"right","103":"numpad7","104":"up","105":"numpad9","106":"*","107":"+","109":"-","110":".","111":"/","112":"f1","113":"f2","114":"f3","115":"f4","116":"f5","117":"f6","118":"f7","119":"f8","120":"debug","121":"f10","122":"f11","123":"f12","144":"numlock","145":"scrolllock","186":";","187":"=","188":"<","189":"-","190":">","191":"?","192":"`","219":"[","220":"|","221":"]","222":"\""}

 * @param WASD Movement
 * @text Движение на WASD
 * @parent Keyboard
 * @desc Включить движение на WASD ? Работает только на карте.
 * @type boolean
 * @default false

 * @param Key Repeat Wait
 * @text Время длительного нажатия
 * @parent Keyboard
 * @desc Количество кадров, обозначающее длительное нажатие клавиши
 * @type number
 * @min 1
 * @default 24

 * @param Key Repeat Interval
 * @text Интервал повторения нажатия
 * @parent Keyboard
 * @desc Количество кадров, обозначающее время между повторами нажатия клавиши
 * @type number
 * @min 1
 * @default 6

 * @param Gamepad
 * @text Геймпад
 * @desc Настройка клавиш геймпада
 * @type struct<Gamepad>
 * @default {"0":"ok","1":"cancel","2":"shift","3":"menu","4":"lb","5":"rb","6":"lt","7":"rt","8":"select","9":"start","10":"l3","11":"r3","12":"up","13":"down","14":"left","15":"right","16":"up","17":"down","18":"left","19":"right","20":"r_up","21":"r_down","22":"r_left","23":"r_right"}

 * @param Threshold
 * @text Отклонение стика
 * @parent Gamepad
 * @desc Значение отклонения стика при котором он считается нажатым
 * @type number
 * @decimals 2
 * @min 0.05
 * @max 1.00
 * @default 0.50

 * @param Right Stick Scroll
 * @text Прокрутка правым стиком
 * @parent Gamepad
 * @desc Включить прокрутку поддерживаемых окон правым стиком геймпада ?
 * @type boolean
 * @default false

 * @param Switches
 * @text Переключатели
 * @desc Список переключателей, которые управляются нажатыми клавишами
 * @type struct<Switches>[]
 * @default []

 * @param Latest Button Variable
 * @text Переменная последней клавиши
 * @desc Переменная, в которую сохраняется код последней нажатой клавиши
 * @type variable
 * @default 0

*/

/*~struct~Keyboard:

 * @param 8
 * @text Backspace
 * @default backspace

 * @param 9
 * @text Tab
 * @default tab

 * @param 13
 * @text Enter
 * @default ok

 * @param 16
 * @text Left shift
 * @default shift

 * @param 17
 * @text Ctrl
 * @default control

 * @param 18
 * @text Alt
 * @type combo
 * @option alt
 * @option control
 * @default alt

 * @param 19
 * @text Pause
 * @default pause

 * @param 20
 * @text Caps Lock
 * @default capslock

 * @param 27
 * @text Esc
 * @default escape

 * @param 32
 * @text Space
 * @type combo
 * @option space
 * @option ok
 * @default space

 * @param 33
 * @text Page Up
 * @default pageup

 * @param 34
 * @text Page Down
 * @default pagedown

 * @param 35
 * @text End
 * @default end

 * @param 36
 * @text Home
 * @default home

 * @param 37
 * @text Left
 * @default left

 * @param 38
 * @text Up
 * @default up

 * @param 39
 * @text Right
 * @default right

 * @param 40
 * @text Down
 * @default down

 * @param 44
 * @text Print Screen
 * @default printscreen

 * @param 45
 * @text Insert
 * @type combo
 * @option insert
 * @option escape
 * @default insert

 * @param 46
 * @text Del
 * @default delete

 * @param 47
 * @text /
 * @default /

 * @param 48
 * @text 0
 * @default 0

 * @param 49
 * @text 1
 * @default 1

 * @param 50
 * @text 2
 * @default 2

 * @param 51
 * @text 3
 * @default 3

 * @param 52
 * @text 4
 * @default 4

 * @param 53
 * @text 5
 * @default 5

 * @param 54
 * @text 6
 * @default 6

 * @param 55
 * @text 7
 * @default 7

 * @param 56
 * @text 8
 * @default 8

 * @param 57
 * @text 9
 * @default 9

 * @param 65
 * @text a
 * @type combo
 * @option a
 * @option left
 * @default a

 * @param 66
 * @text b
 * @default b

 * @param 67
 * @text c
 * @default c

 * @param 68
 * @text d
 * @type combo
 * @option d
 * @option right
 * @default d

 * @param 69
 * @text e
 * @default e

 * @param 70
 * @text f
 * @default f

 * @param 71
 * @text g
 * @default g

 * @param 72
 * @text h
 * @default h

 * @param 73
 * @text i
 * @default i

 * @param 74
 * @text j
 * @default j

 * @param 75
 * @text k
 * @default k

 * @param 76
 * @text l
 * @default l

 * @param 77
 * @text m
 * @default m

 * @param 78
 * @text n
 * @default n

 * @param 79
 * @text o
 * @default o

 * @param 80
 * @text p
 * @default p

 * @param 81
 * @text q
 * @type combo
 * @option q
 * @option pageup
 * @default q

 * @param 82
 * @text r
 * @default r

 * @param 83
 * @text s
 * @type combo
 * @option s
 * @option down
 * @default s

 * @param 84
 * @text t
 * @default t

 * @param 85
 * @text u
 * @default u

 * @param 86
 * @text v
 * @default v

 * @param 87
 * @text w
 * @type combo
 * @option w
 * @option up
 * @option pagedown
 * @default w

 * @param 88
 * @text x
 * @type combo
 * @option x
 * @option escape
 * @default x

 * @param 89
 * @text y
 * @default y

 * @param 90
 * @text z
 * @type combo
 * @option z
 * @option ok
 * @default z

 * @param 96
 * @text Numpad 0
 * @default escape

 * @param 97
 * @text Numpad 1
 * @default numpad1

 * @param 98
 * @text Numpad 2
 * @default down

 * @param 99
 * @text Numpad 3
 * @default numpad3

 * @param 100
 * @text Numpad 4
 * @default left

 * @param 101
 * @text Numpad 5
 * @default numpad5

 * @param 102
 * @text Numpad 6
 * @default right

 * @param 103
 * @text Numpad 7
 * @default numpad7

 * @param 104
 * @text Numpad 8
 * @default up

 * @param 105
 * @text Numpad 9
 * @default numpad9

 * @param 106
 * @text Numpad *
 * @default *

 * @param 107
 * @text Numpad +
 * @default +

 * @param 109
 * @text Numpad -
 * @default -

 * @param 110
 * @text Numpad .
 * @default .

 * @param 111
 * @text Numpad /
 * @default /

 * @param 112
 * @text F1
 * @default f1

 * @param 113
 * @text F2
 * @default f2

 * @param 114
 * @text F3
 * @default f3

 * @param 115
 * @text F4
 * @default f4

 * @param 116
 * @text F5
 * @default f5

 * @param 117
 * @text F6
 * @default f6

 * @param 118
 * @text F7
 * @default f7

 * @param 119
 * @text F8
 * @default f8

 * @param 120
 * @text F9
 * @default debug

 * @param 121
 * @text F10
 * @default f10

 * @param 122
 * @text F11
 * @default f11

 * @param 123
 * @text F12
 * @default f12

 * @param 144
 * @text Num Lock
 * @default numlock

 * @param 145
 * @text Scroll Lock
 * @default scrolllock

 * @param 186
 * @text ;:
 * @default ;

 * @param 187
 * @text =+
 * @default =

 * @param 188
 * @text ,<
 * @default <

 * @param 189
 * @text -_
 * @default -

 * @param 190
 * @text .>
 * @default >

 * @param 191
 * @text /?
 * @default ?

 * @param 192
 * @text `~
 * @default `

 * @param 219
 * @text [{
 * @default [

 * @param 220
 * @text \|
 * @default |

 * @param 221
 * @text ]}
 * @default ]

 * @param 222
 * @text '"
 * @default "

*/

/*~struct~Gamepad:

 * @param 0
 * @text A (xbox)/X(ps)
 * @default ok

 * @param 1
 * @text B (xbox)/O(ps)
 * @default cancel

 * @param 2
 * @text X (xbox)/Square(ps)
 * @default shift

 * @param 3
 * @text Y (xbox)/Triangle(ps)
 * @default menu

 * @param 4
 * @text LB (xbox)/L1(ps)
 * @default pageup

 * @param 5
 * @text RB (xbox)/R1(ps)
 * @default pagedown

 * @param 6
 * @text LT (xbox)/L2(ps)
 * @default lt

 * @param 7
 * @text RT (xbox)/R2(ps)
 * @default rt

 * @param 8
 * @text Select (xbox)/Share(ps)
 * @default select

 * @param 9
 * @text Start (xbox)/Options(ps)
 * @default start

 * @param 10
 * @text Left stick pressed (L3)
 * @default l3

 * @param 11
 * @text Right stick pressed (R3)
 * @default r3

 * @param 12
 * @text D-pad up
 * @default up

 * @param 13
 * @text D-pad down
 * @default down

 * @param 14
 * @text D-pad left
 * @default left

 * @param 15
 * @text D-pad right
 * @default right

 * @param 16
 * @text Left stick up
 * @default up

 * @param 17
 * @text Left stick down
 * @default down

 * @param 18
 * @text Left stick left
 * @default left

 * @param 19
 * @text Left stick right
 * @default right

 * @param 20
 * @text Right stick up
 * @default r_up

 * @param 21
 * @text Right stick down
 * @default r_down

 * @param 22
 * @text Right stick left
 * @default r_left

 * @param 23
 * @text Right stick right
 * @default r_right

 * @param 24
 * @text Playstation logo (ps only)
 * @default pslogo

 * @param 25
 * @text Touch panel (ps only)
 * @default touchpanel

*/

/*~struct~Switches:

 * @param Key Name
 * @desc Key Name

 * @param Switch
 * @desc Switch that is controlled by pressing a key
 * @type switch

*/

/*~struct~Switches:ru

 * @param Key Name
 * @text Название клавиши
 * @desc Название клавиши

 * @param Switch
 * @text Переключатель
 * @desc Переключатель, который управляется нажатием клавиши
 * @type switch

*/

'use strict';

var Imported = Imported || {};
Imported['DK_Full_Input'] = '5.3.0';

//===========================================================================
// initialize parameters
//===========================================================================

const FullInputParams = (function() {

    function parse(string) {
        try {
            return JSON.parse(string, function(key, value) {
                if (typeof string === 'number' || typeof string === 'boolean') {
                    return string;
                }

                try {
                    if (Array.isArray(value)) {
                        return value.map(val => parse(val));
                    }

                    return parse(value);
                } catch (e) {
                    return value;
                }
            });
        } catch(e) {
            return string;
        }
    }

    const parameters = PluginManager.parameters('DK_Full_Input');

    return Object.entries(parameters).reduce((acc, [key, value]) => {
        acc[key] = parse(value);

        return acc;
    }, {});

})();

//===========================================================================
// initialize plugin commands
//===========================================================================

const Full_Input_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    Full_Input_Game_Interpreter_pluginCommand.apply(this, arguments);

    switch (command) {
        case 'ResetKeyboardButtons':
            Input.resetKeyboardButtons();
            break;
        case 'ResetGamepadButtons':
            Input.resetGamepadButtons();
            break;
    }
};

if (Utils.RPGMAKER_NAME === 'MZ') {

    PluginManager.registerCommand('DK_Full_Input', 'ResetKeyboardButtons', () => {
        Input.resetKeyboardButtons();
    });

    PluginManager.registerCommand('DK_Full_Input', 'ResetGamepadButtons', () => {
        Input.resetGamepadButtons();
    });

}

//===========================================================================
// Input
//===========================================================================

Input.keyMapper = FullInputParams['Keyboard'];
Input.gamepadMapper = FullInputParams['Gamepad'];
Input.keyRepeatWait = FullInputParams['Key Repeat Wait'] || 24;
Input.keyRepeatInterval = FullInputParams['Key Repeat Interval'] || 6;
Input.threshold = FullInputParams['Threshold'] || 0.5;
Input.__switches__ = FullInputParams['Switches'].reduce((acc, data) => {
    const keyName = data['Key Name'];
    const switches = acc[keyName] || (acc[keyName] = []);
    const switchId = data['Switch'];

    if (switchId > 0) {
        switches.push(switchId);
    }

    return acc;
}, {});
Input.W_KEYCODE = 87;
Input.A_KEYCODE = 65;
Input.S_KEYCODE = 83;
Input.D_KEYCODE = 68;

// properties

Object.defineProperties(Input, {

	/**
	 * @type {Object}
	 * @memberof Input
	 */
	gamepad: {
        get: function() {
            return this._gamepad;
        }
    }

});

//

const Full_Input_Input_clear = Input.clear;
Input.clear = function() {
    Full_Input_Input_clear.apply(this, arguments);

	this._gamepad = { axes: [0, 0, 0, 0], lt: 0, rt: 0 };
    this._pressedTime = {};
    this._keyboardDate = 0;
    this._gamepadDate = 0;
};

Input.update = function() {
    this._pollGamepads();

    let updateDate = false;

    for (const name in this._currentState) {
        if (this._currentState[name]) {
            if (!this._previousState[name]) {
                this._pressedTime[name] = 0;

                updateDate = true;
            } else {
                this._pressedTime[name]++;
            }
        } else {
            delete this._pressedTime[name];
        }

        this._previousState[name] = this._currentState[name];
    }

    if (this._virtualButton) {
        updateDate = true;

        this._currentState[this._virtualButton] = true;
        this._pressedTime[this._virtualButton] = 0;
        this._keyboardDate = Date.now();

        this._latestButton = this._virtualButton;

        delete this._virtualButton;
    } else if (this._latestButton) {
        delete this._currentState[this._latestButton];
        delete this._pressedTime[this._latestButton];
        delete this._latestButton;
    }

    if (updateDate) {
        this._date = Date.now();
    }

    this._updateDirection();
};

Input.isTriggered = function(keyName) {
    if (this._isEscapeCompatible(keyName) && this.isTriggered('escape')) {
        return true;
    }

    return this._pressedTime[keyName] === 0;
};

Input.isRepeated = function(keyName) {
    if (this._isEscapeCompatible(keyName) && this.isRepeated('escape')) {
        return true;
    }

    return (this._pressedTime[keyName] === 0 ||
            (this._pressedTime[keyName] >= this.keyRepeatWait &&
                this._pressedTime[keyName] % this.keyRepeatInterval === 0));
};

Input.isLongPressed = function(keyName) {
    if (this._isEscapeCompatible(keyName) && this.isLongPressed('escape')) {
        return true;
    }

    return this._pressedTime[keyName] >= this.keyRepeatWait;
};

const Full_Input_Input_onKeyDown = Input._onKeyDown;
Input._onKeyDown = function(event) {
    Full_Input_Input_onKeyDown.apply(this, arguments);

    this._keyboardDate = Date.now();

    if (this._isEscapeCompatible(this.keyMapper[event.keyCode])) {
		this._updateSwitches('escape', true);
	} else {
		this._updateSwitches(this.keyMapper[event.keyCode], true);
		this._updateSwitches(this.gamepadMapper[event.keyCode], true);
	}

    if (FullInputParams['Latest Button Variable'] > 0) {
        $gameVariables.setValue(FullInputParams['Latest Button Variable'], event.keyCode);
    }
};

const Full_Input_Input_onKeyUp = Input._onKeyUp;
Input._onKeyUp = function(event) {
    Full_Input_Input_onKeyUp.apply(this, arguments);

	if (this._isEscapeCompatible(this.keyMapper[event.keyCode])) {
		this._updateSwitches('escape', false);
	} else {
		this._updateSwitches(this.keyMapper[event.keyCode], false);
		this._updateSwitches(this.gamepadMapper[event.keyCode], false);
	}
};

Input._isDualSense = function(gamepad) {
    if (gamepad.id && gamepad.id.includes('Vendor: 054c Product: 0ce6')) {
        return true;
    }

    return false;
};

/**
 * @private
 * @param gamepad
 */
Input._updateGamepadState = function(gamepad) {
	const lastState = this._gamepadStates[gamepad.index] || [];
    const newState = [];
    const buttons = gamepad.buttons;
    const axes = gamepad.axes;
    const threshold = this.threshold;
    let updateDate = false;

    buttons.forEach((button, index) => {
        newState[index] = button.pressed;
    });

	if (this._isDualSense(gamepad)) {
        const dpadTreshold = 1.28;
        const dpadValue = axes[9] - dpadTreshold; // shit code

        newState[0] = buttons[1].pressed; // X
        newState[1] = buttons[2].pressed; // O
        newState[2] = buttons[0].pressed; // Square

        // shit code
        newState[12] = dpadValue < -2; // D-pad up
        newState[13] = dpadValue < -1 && dpadValue > -1.5; // D-pad down
        newState[14] = dpadValue < 0 && dpadValue > -0.6; // D-pad left
        newState[15] = dpadValue < -1.5 && dpadValue > -2; // D-pad right

        newState[20] = axes[5] < -threshold; // r_up
        newState[21] = axes[5] > threshold; // r_down

        newState[24] = buttons[12].pressed; // PS logo
        newState[25] = buttons[13].pressed; // Touch panel

        this._gamepad = {
            axes: [axes[0], axes[1], axes[2], axes[5]],
            lt: (axes[3] + 1) / 2,
            rt: (axes[4] + 1) / 2
        };
    } else {
        const leftTriggerIndex = 6;
        const rightTriggerIndex = 7;

        newState[20] = axes[3] < -threshold; // r_up
        newState[21] = axes[3] > threshold; // r_down

        this._gamepad = {
            axes: axes.slice(),
            lt: buttons[leftTriggerIndex] && buttons[leftTriggerIndex].value,
            rt: buttons[rightTriggerIndex] && buttons[rightTriggerIndex].value
        };
    }

	newState[16] = axes[1] < -threshold; // l_up
	newState[17] = axes[1] > threshold; // l_down
	newState[18] = axes[0] < -threshold; // l_left
	newState[19] = axes[0] > threshold; // l_right

    newState[22] = axes[2] < -threshold; // r_left
    newState[23] = axes[2] > threshold; // r_right

	newState.forEach((value, index) => {
        const keyName = this.gamepadMapper[index];

        if (!keyName) {
            return;
		}

		if (lastState[index] !== value) {
			this._currentState[keyName] = value;
		}

        if (value) {
			updateDate = true;

			this._updateSwitches(keyName, true);
        } else if (!value && lastState[index]) {
            this._updateSwitches(keyName, false);
		}
    });

	if (updateDate) {
		this._gamepadDate = Date.now();
	}

	this._gamepadStates[gamepad.index] = newState.slice();
};

Input._updateSwitches = function(keyName, state) {
    (Input.__switches__[keyName] || []).forEach((switchId) => {
        $gameSwitches.setValue(switchId, state);
    });
};

if (Utils.RPGMAKER_NAME === 'MV') {

    Input.virtualClick = function(buttonName) {
        this._virtualButton = buttonName;
    };

}

if (FullInputParams['WASD Movement']) {

    const Full_Input_Input_signX = Input._signX;
    Input._signX = function() {
        if (SceneManager._scene instanceof Scene_Map) {
            const leftPressed = this.isPressed(Input.keyMapper[Input.A_KEYCODE]);
            const rightPressed = this.isPressed(Input.keyMapper[Input.D_KEYCODE]);

            if (leftPressed || rightPressed) {
                return (rightPressed ? 1 : 0) - (leftPressed ? 1 : 0);
            }
        }

        return Full_Input_Input_signX.apply(this, arguments);
    };

    const Full_Input_Input_signY = Input._signY;
    Input._signY = function() {
        if (SceneManager._scene instanceof Scene_Map) {
            const upPressed = this.isPressed(Input.keyMapper[Input.W_KEYCODE]);
            const downPressed = this.isPressed(Input.keyMapper[Input.S_KEYCODE]);

            if (upPressed || downPressed) {
                return (downPressed ? 1 : 0) - (upPressed ? 1 : 0);
            }
        }

        return Full_Input_Input_signY.apply(this, arguments);
    };

}

//

/**
 * @static
 */
Input.resetKeyboardButtons = function() {
    this.keyMapper = FullInputParams['Keyboard'];
};

/**
 * @static
 */
Input.resetGamepadButtons = function() {
    this.gamepadMapper = FullInputParams['Gamepad'];
};

/**
 * @static
 * @param {String[]} [keys] - Keys
 * @returns {Boolean}
 */
Input.isAnyPressed = function(keys) {
	return Array.isArray(keys) ?
		keys.some(key => this.isPressed(key))
		: Object.keys(this._pressedTime).length > 0;
};

/**
 * @static
 * @param {String[]} [keys] - Keys
 * @returns {Boolean}
 */
Input.isAnyTriggered = function(keys) {
	return Array.isArray(keys) ?
		keys.some(key => this.isTriggered(key))
		: Object.keys(this._pressedTime).some(key => this.isTriggered(key));
};

/**
 * @static
 * @param {String[]} [keys] - Keys
 * @returns {Boolean}
 */
Input.isAnyRepeated = function(keys) {
	return Array.isArray(keys) ?
		keys.some(key => this.isRepeated(key))
		: Object.keys(this._pressedTime).some(key => this.isRepeated(key));
};

/**
 * @static
 * @param {String[]} [keys] - Keys
 * @returns {Boolean}
 */
Input.isAnyLongPressed = function(keys) {
	return Array.isArray(keys) ?
		keys.some(key => this.isLongPressed(key))
		: Object.keys(this._pressedTime).some(key => this.isLongPressed(key));
};

/**
 * @static
 * @param {String} keyName - Key name
 * @returns {Number}
 */
Input.getPressedTime = function(keyName) {
	return this._pressedTime[keyName] || 0;
};

/**
 * @static
 * @param {String} keyName - Key name
 * @returns {Number}
 */
Input.getRepeats = function(keyName) {
    if (this._isEscapeCompatible(keyName)) {
        return this.getRepeats('escape');
    }

    if (this._pressedTime[keyName] === 0) {
        return 1;
    }

    const pressedTime = this.getPressedTime(keyName);

    if (pressedTime >= this.keyRepeatWait) {
        return Math.floor((pressedTime - this.keyRepeatWait) / this.keyRepeatInterval);
    }

    return 0;
};

/**
 * @static
 * @returns {Boolean}
 */
Input.preferGamepad = function() {
	return this._gamepadDate > this._keyboardDate;
};

//===========================================================================
// applying plugin parameters
//===========================================================================

if (FullInputParams['Right Stick Scroll']) {

    if (Utils.RPGMAKER_NAME === 'MV') {

        if (Imported['DKTools']) {

            const FullInput_DKToolsWindowScrollable_update = DKTools.Window.Scrollable.prototype.update;
            DKTools.Window.Scrollable.prototype.update = function() {
                FullInput_DKToolsWindowScrollable_update.apply(this, arguments);
                this.processGamepadScroll();
            };

            DKTools.Window.Scrollable.prototype.processGamepadScroll = function() {
                const threshold = Input.threshold;
                let rightStickX = Input.gamepad.axes[2];
                let rightStickY = Input.gamepad.axes[3];

                if (rightStickX > -threshold && rightStickX < threshold) {
                    rightStickX = 0;
                }

                if (rightStickY > -threshold && rightStickY < threshold) {
                    rightStickY = 0;
                }

                if (rightStickX !== 0 || rightStickY !== 0) {
                    this.scrollBy(rightStickX * 3, rightStickY * 3);
                }
            };

        }

    } else {

        const FullInput_Window_Scrollable_update = Window_Scrollable.prototype.update;
        Window_Scrollable.prototype.update = function() {
            FullInput_Window_Scrollable_update.apply(this, arguments);
            this.processGamepadScroll();
        };

        Window_Scrollable.prototype.processGamepadScroll = function() {
            const threshold = Input.threshold;
            let rightStickX = Input.gamepad.axes[2];
            let rightStickY = Input.gamepad.axes[3];

            if (rightStickX > -threshold && rightStickX < threshold) {
                rightStickX = 0;
            }

            if (rightStickY > -threshold && rightStickY < threshold) {
                rightStickY = 0;
            }

            if (rightStickX !== 0 || rightStickY !== 0) {
                this.scrollBy(rightStickX * 3, rightStickY * 3);
            }
        };

    }

}



