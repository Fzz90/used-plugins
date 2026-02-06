//=============================================================================
// STV_BeastBook.js
//=============================================================================
 
/*:
 * @plugindesc v2.5 - STV_BeastBook
 * || This will add an Beast Register to your Game
 * @author SkottyTV (base idea from Yoji Ojima)
 *
 * @param ----- Window -----
 *
 * @param Show Window
 * @desc Show or Hide Window Skin
 * TRUE = show window / FALSE = hide window
 * @default TRUE
 *
 * @param Background Picture
 * @desc The Background Picture in img/pictures/
 * (leave empty for no Background Picture)
 * @default
 *
 * @param Show Background Enemy
 * @desc Show a Picture of the Enemy in the Background
 * (TRUE = show // FALSE = hide)
 * @default TRUE
 *
 * @param Show Battle Back
 * @desc Shows Picture of first kill/encounter place
 * (TRUE = show // FALSE = hide)
 * @default TRUE
 *
 * @param Default Battle Back
 * @desc The Default Battle Back Picture
 * (if beasts added with plugin commands) !(Use "/")
 * @default img/parallaxes/BlueSky.png
 *
 * @param Battle Back Index
 * @desc The Z Position of the Battle Back
 * (0 = behind Windowskin // 1 = over Windowskin)
 * @default 0
 *
 * @param ----- ASV -----
 *
 * @param ASV Animation Speed
 * @desc The Animation Speed of ASV-Battler
 * (the higher the number the slower the animation)
 * @default 10
 *
 * @param ASV Animated Pattern
 * @desc The ASV-Pattern you want to display
 * (default 0 = The topleft 3 Pictures)
 * @default 0
 *
 * @param ----- Functions -----
 *
 * @param Max Beasts
 * @desc Number of Beasts used. (first X in Database)
 * (leave empty to use all beasts)
 * @default
 *
 * @param Fill Behavior
 * @desc How the Book will get filled
 * 1 = Encounter / 2 = Kill / 3 = None (only commands)
 * @default 2
 *
 * @param ID in front of Name
 * @desc Show the ID in front of the Name
 * TRUE = "4 - Monster" / FALSE = "Monster"
 * @default TRUE
 *
 * @param ID in front of Unknown Enemy
 * @desc Show the ID in front of the Name
 * TRUE = "4 - ???" / FALSE = "???"
 * @default TRUE
 *
 * @param Animate Enemy
 * @desc Choose if you want an animated Enemy
 * TRUE = animated / FALSE = static
 * @default TRUE
 *
 * @param Backbar Opacity
 * @desc Set the Backbar opacity
 * 255 = Full Visible / 0 = Invisible
 * @default 130
 *
 * @param Count Discovered Variable
 * @desc Save number of discovered Enemies in Variable
 * @default 0
 *
 * @param Book Full Switch
 * @desc Switch set ON when beast book is full
 * @default 0
 *
 * @param Exp Icon
 * @desc Set the Exp Icon
 * @default 189
 *
 * @param Gold Icon
 * @desc Set the Gold Icon
 * @default 314
 *
 * @param ----- Text -----
 *
 * @param Unknown Info
 * @desc How "Unknown Info" Text appears
 * @default ???
 *
 * @param None Data
 * @desc How "None Data" Text appears
 * @default none
 *
 * @param Drops Text
 * @desc Headline of Enemy Item Drops
 * @default Items:
 *
 * @param Skills Text
 * @desc Headline of Enemy Skills
 * @default Skills:
 *
 * @param Weakness Text
 * @desc Headline of Weakness Window
 * @default Weakness
 *
 * @param Kill Counter Text
 * @desc Headline of Kill Counter
 * @default Kills:
 *
 * @param ----- Colors -----
 *
 * @param Drops Success Color
 * @desc The Default Color for Item Drops Success Rate
 * @default 6
 *
 * @param Skills Color
 * @desc The Default Color for Skills
 * @default 3
 *
 * @param Unknown Color
 * @desc The Default Color for "Unknown"
 * @default 7
 *
 * @param ----- Switches -----
 *
 * @param Info Window Switch
 * @desc Choose a Switch to show the Info Window
 * (leave empty or "0" to show the window permanently)
 * @default 0
 *
 * @param Weakness Window Switch
 * @desc Choose a Switch to show the Weakness Window
 * (leave empty or "0" to show the window permanently)
 * @default 0
 *
 * @param Parameter Window Switch
 * @desc Choose a Switch to show the Parameter Window
 * (leave empty or "0" to show the window permanently)
 * @default 0
 *
 * @param Show Items Switch
 * @desc The Switch for showing Items
 * (leave empty or "0" to show the Items permanently)
 * @default 0
 *
 * @param Show Skills Switch
 * @desc The Switch for showing Skills
 * (leave empty or "0" to show the Skills permanently)
 * @default 0
 *
 * @param Show EXP Switch
 * @desc The Switch for showing EXP
 * (leave empty or "0" to show the EXP permanently)
 * @default 0
 *
 * @param Show Gold Switch
 * @desc The Switch for showing Gold
 * (leave empty or "0" to show the Gold permanently)
 * @default 0
 *
 * @param Show Kill Counter Switch
 * @desc The Switch for showing Kill Counter
 * (leave empty or "0" to show the Kill Counter permanently)
 * @default 0
 *
 * @param ----- Kill Counter -----
 *
 * @param Max Kills Value
 * @desc The default value for kills needed
 * (get overwritten by plugin command "BeastBook maxkills")
 * @default 25
 *
 * @param Kills Achievment Start Switch
 * @desc Number of the switch to start with achievments
 * (Example: 500 = Enemy Id 17 will set Switch 517)
 * @default 0
 *
 * @param Kills Bar Color 1
 * @desc The first Color for the Kill Counter Bar
 * @default 6
 *
 * @param Kills Bar Color 2
 * @desc The second Color for the Kill Counter Bar
 * @default 17
 *
 * @help
 *
 * ////////////////////////////////////////////////////////////////////////////
 * ----------------------------- Terms of Usage: ------------------------------
 * ////////////////////////////////////////////////////////////////////////////
 
 * Feel free to use this Plugin in 1. Non-Commercial Games, 2. Commercial Games
 * However it would be nice to give proper Credits to "SkottyTV".
 * Please also give proper Credits to Yoji Ojima for the base idea.
 *
 * Have Fun And Enjoy! :)
 *
 *
 *
 * ////////////////////////////////////////////////////////////////////////////
 * --------------------------------- Updates:----------------------------------
 * ////////////////////////////////////////////////////////////////////////////
 *
 * Update v2.5
 * - Added "Max Beasts" option.
 * - Added Plugincommand "BeastBook hide X" and "BeastBook show X".
 *
 * Update v2.4a
 * - Bug fixes
 *
 * Update v2.4
 * - Added support funtion for YEP_X_AnimatedSVEnemies
 * - Code clean / Bug fixes
 *
 * Update v2.3
 * - Added the possibility to print Icons in front of the Weaknesses
 * - Option to show the BattleBackground where the Beast was killed/encountered
 *
 * Update v2.2h
 * - Option to show the ID in front of Unknown Beast -> "1 - ???"
 * - Added possibility to change the Beast Pic with <BeastBookPic:Path>
 * - Added option to change "unknown" color.
 * - Maxkills can now be set in the Enemy note box!
 * - IMPORTANT: Fixed Bug where savegames not contain BeastBook data !!!
 *
 * Update v2.1a
 * - bug fixes
 *
 * Update v2.1
 * - Added functions: completekills, completeitems
 * - bug fixes
 *
 * Update v2.0
 * - Option to hide skills inside the Book
 * - Added a Kill Counter Function including Achievment Switches
 * - Drop Items show only if discovered
 * - Drop Items now show their success Rate
 * - Better Beast Animation
 * - Background Picture possible
 * - Visual improvements!
 * 
 *
 * ////////////////////////////////////////////////////////////////////////////
 * -------------------------------- Commands: ---------------------------------
 * ////////////////////////////////////////////////////////////////////////////
 *
 * Plugin Command:
 *   BeastBook open             # Open the beast book screen
 *   BeastBook hide 6           # Hide Beast 6 in book.
 *   BeastBook show 6           # Show Beast 6 in book.
 *   BeastBook add 3            # Add enemy #3 to the beast book
 *   BeastBook addvar 10        # Add enemy (ID) that is in variable 10
 *   BeastBook addkill 6 2      # Add 2 kills for enemyID 6
 *   BeastBook addkill 6 -4     # Removes 4 kills from enemyID 6
 *   BeastBook maxkills 3 50    # Set max kills for enemyID 3 to 50 kills
 *   BeastBook remove 16        # Remove enemy #16 from the beast book
 *   BeastBook complete         # Complete the whole Book
 *   BeastBook completeenemies  # Complete all Enemies
 *   BeastBook completeitems    # Complete all Drops
 *   BeastBook completekills    # Complete all Kills
 *   BeastBook clear            # Clear the beast book
 *   BeastBook clearitems       # Clear all items
 *
 * Enemy Note:
 *   <desc1:The mighty Clown>   # Description text in the beast book, line 1
 *   <desc2:This is Line 2>     # Description text in the beast book, line 2
 *   <desc3:Some Info here?>    # Description text in the beast book, line 3
 *   <desc4:Even more Info!>    # Description text in the beast book, line 4
 *   <BeastBook:hide>           # This Enemy will not appear in the beast book
 *   <BeastBookPic:PATH>        # Changes the Pic of an Enemy to "PATH"
 *                                Example: <BeastBookPic:img/enemies/Slime>
 *                                Don´t type ".png" !
 *   <BeastBookMaxKills:5>      # Set the MaxKills of the Enemy to 5.
 *
 * Skill Note:
 *   <BeastBook:hide>           # This Skill will not appear in the beast book
 *
 *
 *
 * ////////////////////////////////////////////////////////////////////////////
 * --------------------- Examples / Tutorials / Help: -------------------------
 * ////////////////////////////////////////////////////////////////////////////
 *
 * ------------------------Investigate Skill Tutorial:--------------------------
 * (!!! You will NEED YanFly´s Battle Engine Core and ActSeqPack1 !!!)
 *
 * - First set the "Fill Behavior" option of this plugin to "3" (None).
 * - Now create a skill which calls a common event "X" and have the following
 *   in its notebox:
 *   <Target Action>
 *    Change Variable Y = target._enemyId
 *   </Target Action>
 * - Now in the common event "X" call a Plugin-Line and write:
 *   BeastBook addvar Y
 * - Done!
 *
 * ("X" and "Y" is a number you choose)
 * -----------------------------------------------------------------------------
 *
 * ------------------------ Weakness Icons Tutorial:----------------------------
 * You are able to use icons for the beast weaknesses.
 *
 * Got to: RPG Maker MV Editor -> Database -> Types
 * On the Elements tab rename an element like this:
 *
 * 01. Physical ->   \i[76]Physical         //This will print Icon 76 in front
 * 01. Fire     ->   \i[64]Fire             //This will print Icon 64 in front
 *
 *
 * -----------------------------------------------------------------------------
 *
 * -------------------------- Animated Side View: ------------------------------
 * With Yanfly´s "YEP_X_AnimatedSVEnemies" Plugin you are able
 * to set an animated Battler grafic by typing "<Sideview Battler: filename>"
 * into an enemies notebox.
 * The STV_BeastBook will show this animated battler if it is used.
 *
 * With the Plugin Parameter "ASV Animated Pattern" you can decide which Pattern
 * you want the Book to show.
 *
 * A default ASV Battler file looks like this: ( [] <- a pic of the enemy)
 * [][][][][][][][][]
 * [][][][][][][][][]
 * [][][][][][][][][]
 * [][][][][][][][][]
 * [][][][][][][][][]
 * [][][][][][][][][]
 *
 * So if you set the "ASV Animated Pattern" to 3 the animation will be:
 * [][][][][][][][][]
 * [][][][][][][][][]
 * [][][][][][][][][]
 * [x][x][x][][][][][][]
 * [][][][][][][][][]
 * [][][][][][][][][]
 *
 *
 * -----------------------------------------------------------------------------
 *
 */
 
// ----------------------------------------------------------------------------------------------------------------------------
// STV_BeastBook Parameters
// ----------------------------------------------------------------------------------------------------------------------------
    var stv_BeastBook_parameters = PluginManager.parameters('STV_BeastBook');
   
    //----- Window -----
    var stv_BeastBook_showWindow = String(stv_BeastBook_parameters['Show Window'] || 'TRUE');
    var stv_BeastBook_bgPicture = String(stv_BeastBook_parameters['Background Picture'] || '');
    var stv_BeastBook_showBgBeast = String(stv_BeastBook_parameters['Show Background Enemy'] || 'TRUE');
    var stv_BeastBook_showBattleBack = String(stv_BeastBook_parameters['Show Battle Back'] || 'TRUE');
    var stv_BeastBook_defaultBattleBack = String(stv_BeastBook_parameters['Default Battle Back'] || 'img/parallaxes/BlueSky.png');
    var stv_BeastBook_battleBackIndex = Number(stv_BeastBook_parameters['Battle Back Index'] || 0);
   
    //--- Animated Side View ---
    var stv_BeastBook_asvSpeed = Number(stv_BeastBook_parameters['ASV Animation Speed'] || 10);
    var stv_BeastBook_asvPattern = Number(stv_BeastBook_parameters['ASV Animated Pattern'] || 0);
   
    //----- Functions -----
    var stv_BeastBook_fillBehavior = String(stv_BeastBook_parameters['Fill Behavior'] || '2');
    var stv_BeastBook_showID = String(stv_BeastBook_parameters['ID in front of Name'] || 'TRUE');
    var stv_BeastBook_showIDunknown = String(stv_BeastBook_parameters['ID in front of Unknown Enemy'] || 'TRUE');
    var stv_BeastBook_animateBeast = String(stv_BeastBook_parameters['Animate Enemy'] || 'TRUE');
    var stv_BeastBook_bbOpacity = Number(stv_BeastBook_parameters['Backbar Opacity'] || 130);
    var stv_BeastBook_expIcon = Number(stv_BeastBook_parameters['Exp Icon'] || 189);
    var stv_BeastBook_goldIcon = Number(stv_BeastBook_parameters['Gold Icon'] || 314);
    var stv_BeastBook_countDiscovered = Number(stv_BeastBook_parameters['Count Discovered Variable'] || 0);
    var stv_BeastBook_bookFullSwitch = Number(stv_BeastBook_parameters['Book Full Switch'] || 0);
    var stv_BeastBook_maxBeasts = Number(stv_BeastBook_parameters['Max Beasts']);
 
    //----- Text -----
    var stv_BeastBook_unknownData = String(stv_BeastBook_parameters['Unknown Info'] || '???');
    var stv_BeastBook_noData = String(stv_BeastBook_parameters['None Data'] || 'none');
    var stv_BeastBook_dropsText = String(stv_BeastBook_parameters['Drops Text'] || 'Items:');
    var stv_BeastBook_skillsText = String(stv_BeastBook_parameters['Skills Text'] || 'Skills:');
    var stv_BeastBook_weaknessText = String(stv_BeastBook_parameters['Weakness Text'] || 'Weakness');
    var stv_BeastBook_killsText = String(stv_BeastBook_parameters['Kill Counter Text'] || 'Kills:');
   
    //----- Colors -----
    var stv_BeastBook_unknownColor = Number(stv_BeastBook_parameters['Unknown Color'] || 7);
    var stv_BeastBook_skillsColor = Number(stv_BeastBook_parameters['Skills Color'] || 3);
    var stv_BeastBook_dropsSuccessColor = Number(stv_BeastBook_parameters['Drops Success Color'] || 6);
   
    //----- Switches -----
    var stv_BeastBook_statusSwitch = Number(stv_BeastBook_parameters['Info Window Switch'] || 0);
    var stv_BeastBook_elementsSwitch = Number(stv_BeastBook_parameters['Weakness Window Switch'] || 0);
    var stv_BeastBook_parameterSwitch = Number(stv_BeastBook_parameters['Parameter Window Switch'] || 0);
    var stv_BeastBook_showItemsSwitch = Number(stv_BeastBook_parameters['Show Items Switch'] || 0);
    var stv_BeastBook_showSkillsSwitch = Number(stv_BeastBook_parameters['Show Skills Switch'] || 0);
    var stv_BeastBook_showExpSwitch = Number(stv_BeastBook_parameters['Show EXP Switch'] || 0);
    var stv_BeastBook_showGoldSwitch = Number(stv_BeastBook_parameters['Show Gold Switch'] || 0);
    var stv_BeastBook_showKillCounterSwitch = Number(stv_BeastBook_parameters['Show Kill Counter Switch'] || 0);
   
    //----- Kill Counter -----
    var stv_BeastBook_maxKills = Number(stv_BeastBook_parameters['Max Kills Value'] || 25);
    var stv_BeastBook_killsCountColor1 = Number(stv_BeastBook_parameters['Kills Bar Color 1'] || 6);
    var stv_BeastBook_killsCountColor2 = Number(stv_BeastBook_parameters['Kills Bar Color 2'] || 17);
    var stv_BeastBook_killAchievmentSwitch = Number(stv_BeastBook_parameters['Kills Achievment Start Switch'] || 0);
   
    //----- GLOBAL -----
    var stv_BeastBook_padding = 5;
 
 
// ----------------------------------------------------------------------------------------------------------------------------
// Scene BeastBook create
// ----------------------------------------------------------------------------------------------------------------------------  
    Scene_BeastBook = function() {
        this.initialize.apply(this, arguments);
    };
 
    Scene_BeastBook.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_BeastBook.prototype.constructor = Scene_BeastBook;
 
    Scene_BeastBook.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };                                                          
   
    Scene_BeastBook.prototype.createBackground = function() {
        this._backgroundSprite = new Sprite();
        this._backgroundSprite.move(0, 0, Graphics.width, Graphics.height);
        this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
        this.addChild(this._backgroundSprite);
        if (stv_BeastBook_bgPicture){
            this._foregroundSprite = new Sprite();
            this._foregroundSprite.move(0, 0, Graphics.width, Graphics.height);
            this._foregroundSprite.bitmap = ImageManager.loadPicture(stv_BeastBook_bgPicture);
            this.addChild(this._foregroundSprite);
        }
    };
   
    Scene_BeastBook.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
       
        this.createWindowPositions();
        this.createSelectionWindow();
       
        if ($gameSwitches.value(stv_BeastBook_statusSwitch) || !stv_BeastBook_statusSwitch) this.createStatusWindow();
        if ($gameSwitches.value(stv_BeastBook_elementsSwitch) || !stv_BeastBook_elementsSwitch) this.createElementsWindow();
        if ($gameSwitches.value(stv_BeastBook_parameterSwitch) || !stv_BeastBook_parameterSwitch) this.createParametersWindow();
       
        this.createDescriptionWindow();
       
        if(stv_BeastBook_showWindow != "TRUE"){
            this._selectionWindow.opacity = 0;
            this._infoWindow.opacity = 0;
            this._elementsWindow.opacity = 0;
            this._parametersWindow.opacity = 0;
            this._descriptionWindow.opacity = 0;
        }
       
        this.renewWindows();
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Create Window Positions
// ----------------------------------------------------------------------------------------------------------------------------
    Scene_BeastBook.prototype.createWindowPositions = function() {
       
        var maxWidth = Graphics.boxWidth,
            maxHeight = Graphics.boxHeight;
       
        var sX = 0,
            sY = 0,
            sW = (maxWidth/3),
            sH = (maxHeight/3)*2;
        this._selectionWindow = new Window_BeastBook_Selection(sX, sY, sW, sH);
       
        var eX = sX,
            eY = sH,
            eW = sW,
            eH = (maxHeight/3);
        this._elementsWindow = new Window_BeastBook_Elements(eX, eY, eW, eH);
       
        var iX = sW,
            iY = sY,
            iW = maxWidth - sW,
            iH = sH;
        this._infoWindow = new Window_BeastBook_Info(iX, iY, iW, iH);
       
        var pX = sW,
            pY = eY,
            pW = iW,
            pH = eH;
        this._parametersWindow = new Window_BeastBook_Parameters(pX, pY, pW, pH);
       
        var dX = pX,
            dY = pY,
            dW = pW,
            dH = pH;
        this._descriptionWindow = new Window_BeastBook_Description(dX, dY, dW, dH);
       
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Setup Index Window
// ----------------------------------------------------------------------------------------------------------------------------
    Scene_BeastBook.prototype.createSelectionWindow = function() {
        this._selectionWindow.setHandler('ok', this.onEnemySelect.bind(this));
        this._selectionWindow.setHandler('cancel', this.popScene.bind(this));
        this._selectionWindow.setBeastDataWindows(this._infoWindow, this._parametersWindow, this._elementsWindow, this._descriptionWindow);
        this.addWindow(this._selectionWindow);
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Setup Info Window
// ----------------------------------------------------------------------------------------------------------------------------
    Scene_BeastBook.prototype.createStatusWindow = function() {
        this.addWindow(this._infoWindow);
    };
 
// ----------------------------------------------------------------------------------------------------------------------------
// Setup Elements Window
// ----------------------------------------------------------------------------------------------------------------------------
    Scene_BeastBook.prototype.createElementsWindow = function() {
        this.addWindow(this._elementsWindow);
    };
 
// ----------------------------------------------------------------------------------------------------------------------------
// Setup Parameters Window
// ----------------------------------------------------------------------------------------------------------------------------
    Scene_BeastBook.prototype.createParametersWindow = function() {
        this.addWindow(this._parametersWindow);
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Setup Description Window
// ----------------------------------------------------------------------------------------------------------------------------
    Scene_BeastBook.prototype.createDescriptionWindow = function() {
        this.addWindow(this._descriptionWindow);
        this._descriptionWindow.hide();
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Setup Enemy Select
// ----------------------------------------------------------------------------------------------------------------------------
    Scene_BeastBook.prototype.onEnemySelect = function() {
        if(this._descriptionWindow.visible) {
            this._descriptionWindow.hide();
        } else {
            this._descriptionWindow.show();
        }
        this._selectionWindow.activate();
 
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Refresh Windows
// ----------------------------------------------------------------------------------------------------------------------------
    Scene_BeastBook.prototype.renewWindows = function() {
            this._selectionWindow.refresh();
            this._infoWindow.refresh();
            this._elementsWindow.refresh();
            this._parametersWindow.refresh();
            this._descriptionWindow.refresh();
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Fill Selection Window
// ----------------------------------------------------------------------------------------------------------------------------
    function Window_BeastBook_Selection() {
        this.initialize.apply(this, arguments);
    }
 
    Window_BeastBook_Selection.prototype = Object.create(Window_Selectable.prototype);
    Window_BeastBook_Selection.prototype.constructor = Window_BeastBook_Selection;
 
    Window_BeastBook_Selection.lastTopRow = 0;
    Window_BeastBook_Selection.lastIndex  = 0;
 
    Window_BeastBook_Selection.prototype.initialize = function(x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
       
        this.refresh();
        this.setTopRow(Window_BeastBook_Selection.lastTopRow);
        this.select(Window_BeastBook_Selection.lastIndex);
        this.activate();
       
    };
   
    Window_BeastBook_Selection.prototype.maxCols = function() {
        return 1;
    };
 
    Window_BeastBook_Selection.prototype.maxItems = function() {
        return this._list ? this._list.length : 0;
    };
   
    Window_BeastBook_Selection.prototype.setBeastDataWindows = function(window1, window2, window3, window4) {
        this._infoWindow = window1;
        this._parametersWindow = window2;
        this._elementsWindow = window3;
        this._descriptionWindow = window4;
        this.updateStatus();
    };
   
    Window_BeastBook_Selection.prototype.update = function() {
        Window_Selectable.prototype.update.call(this);
        this.updateStatus();
    };
   
    Window_BeastBook_Selection.prototype.updateStatus = function() {
       
        var beast = this._list[this.index()];
       
        if (this._infoWindow) {
            this._infoWindow.setBeast(beast);
        }
        if (this._parametersWindow) {
            this._parametersWindow.setBeast(beast);
        }
        if (this._elementsWindow) {
            this._elementsWindow.setBeast(beast);
        }
        if (this._descriptionWindow) {
            this._descriptionWindow.setBeast(beast);
        }
    };
   
    Window_BeastBook_Selection.prototype.refresh = function() {
        this._list = [];
        for (var i = 1; i < $beastBook.beasts.length; i++) {
            var beast = $dataEnemies[i];
            if (beast.name && $beastBook.beasts[i].show) {
                this._list.push(beast);
            }
        }
        this.createContents();
        this.drawAllItems();
    };
 
    Window_BeastBook_Selection.prototype.drawItem = function(index) {
        var beast= this._list[index],
            rect = this.itemRectForText(index),
            id = index + 1,
            name;
       
        this.changeTextColor(this.normalColor());
           
        if ($beastBook.isRevealed(beast.id)) {
            if (stv_BeastBook_showID == "TRUE") {
                name = id + " - " + beast.name;
            } else {
                name = beast.name;
            }
        } else {
            this.changeTextColor(this.textColor(stv_BeastBook_unknownColor));
            if (stv_BeastBook_showIDunknown  == "TRUE") {
                name = id + " - " + stv_BeastBook_unknownData;
            } else {
                name = stv_BeastBook_unknownData;
            }
        }
       
        this.drawText(name, rect.x, rect.y, rect.width);
        this.changeTextColor(this.normalColor());
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Fill Description Window
// ----------------------------------------------------------------------------------------------------------------------------    
    function Window_BeastBook_Description() {
        this.initialize.apply(this, arguments);
    }
 
    Window_BeastBook_Description.prototype = Object.create(Window_Base.prototype);
    Window_BeastBook_Description.prototype.constructor = Window_BeastBook_Description;
 
    Window_BeastBook_Description.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
       
    };
   
    Window_BeastBook_Description.prototype.setBeast= function(beast) {
        this._beast = beast;
        this.refresh();
    };
   
    Window_BeastBook_Description.prototype.update = function() {
        Window_Base.prototype.update.call(this);
    };
   
    Window_BeastBook_Description.prototype.createDescription = function() {
        var beast = $dataEnemies[this._beast.id];
        var y = this.lineHeight();
       
        if ($beastBook.isRevealed(this._beast.id)) {
            this.drawTextEx(beast.meta.desc1, (this.contents.width/2) - (this.textWidth(beast.meta.desc1)/2), 0);
            this.drawTextEx(beast.meta.desc2, (this.contents.width/2) - (this.textWidth(beast.meta.desc2)/2), y*1);
            this.drawTextEx(beast.meta.desc3, (this.contents.width/2) - (this.textWidth(beast.meta.desc3)/2), y*2);
            this.drawTextEx(beast.meta.desc4, (this.contents.width/2) - (this.textWidth(beast.meta.desc4)/2), y*3);
        } else {
            this.changeTextColor(this.textColor(stv_BeastBook_unknownColor));
            this.drawText(stv_BeastBook_unknownData, (this.contents.width/2) - (this.textWidth(stv_BeastBook_unknownData)/2), 0);
            this.changeTextColor(this.normalColor());
        }
    };
   
    Window_BeastBook_Description.prototype.refresh = function() {
        this.contents.clear();
        this.createDescription();
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Fill Info Window
// ----------------------------------------------------------------------------------------------------------------------------
    function Window_BeastBook_Info() {
        this.initialize.apply(this, arguments);
    }
 
    Window_BeastBook_Info.prototype = Object.create(Window_Base.prototype);
    Window_BeastBook_Info.prototype.constructor = Window_BeastBook_Info;
 
    Window_BeastBook_Info.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this.setBeastSprites();
        this.setBattleBackSprites();
    };
   
    Window_BeastBook_Info.prototype.setBattleBackSprites = function() {
        this._battleBack2 = new Sprite();
        this._battleBack2.anchor.x = 0;
        this._battleBack2.anchor.y = 0;
        this._battleBack2.x = 0;
        this._battleBack2.y = 0;
        this.addChildAt(this._battleBack2, stv_BeastBook_battleBackIndex);
       
        this._battleBack1 = new Sprite();
        this._battleBack1.anchor.x = 0;
        this._battleBack1.anchor.y = 0;
        this._battleBack1.x = 0;
        this._battleBack1.y = 0;
        this.addChildAt(this._battleBack1, stv_BeastBook_battleBackIndex);
    };
   
    Window_BeastBook_Info.prototype.setBeastSprites = function() {
        this._beastSprite = new Sprite();
        this._beastSprite.anchor.x = 0.5;
        this._beastSprite.anchor.y = 0.5;
        this._beastSprite.x = this.width/2;
        this._beastSprite.y = this.height/2;
        this._beastSprite.scale.x = 0.8;
        this._beastSprite.scale.y = 0.8;
        this.addChildToBack(this._beastSprite);
           
        this._beastBackSprite = new Sprite();
        this._beastBackSprite.anchor.x = 0.5;
        this._beastBackSprite.anchor.y = 0.5;
        this._beastBackSprite.x = this.width/1.1;
        this._beastBackSprite.y = this.height/1.2;
        this._beastBackSprite.scale.x = 2.0;
        this._beastBackSprite.scale.y = 2.0;
        this._beastBackSprite.opacity = 50;
        this.addChildToBack(this._beastBackSprite);
    };
   
    Window_BeastBook_Info.prototype.setBeast= function(beast) {
        this._beast = beast;
        this.refresh();
    };
   
    Window_BeastBook_Info.prototype.update = function() {
        Window_Base.prototype.update.call(this);
    };
   
    Window_BeastBook_Info.prototype.contentDrawItems = function() {
        var y = this.lineHeight();
        var maxLength = ((this.contents.width/2) - stv_BeastBook_padding*2 - this.textWidth("100%"));
       
        this.contents.fillRect(0, y-5, (this.contents.width/2) - stv_BeastBook_padding, 1, this.normalColor());
        this.drawText(stv_BeastBook_dropsText, 0, 0);
       
        for (var j = 0; j < 3; j++) {
            var di = this._beast.dropItems[j];
            if (di.kind > 0) {
                if ($beastBook.beasts[this._beast.id] && $beastBook.beasts[this._beast.id].discoveredItems[j]) {
                    var item = Game_Enemy.prototype.itemObject(di.kind, di.dataId);
                    var successRate = Math.round((1/this._beast.dropItems[j].denominator)*100);
                    this.changeTextColor(this.textColor(stv_BeastBook_dropsSuccessColor));
                    this.drawText(successRate + "%", 0, y);
                    this.changeTextColor(this.normalColor());
                    this.drawItemName(item, this.textWidth("100%") + stv_BeastBook_padding, y, maxLength);
                } else {
                    this.changeTextColor(this.textColor(stv_BeastBook_unknownColor));
                    this.drawText(stv_BeastBook_unknownData, 0, y, maxLength);
                    this.changeTextColor(this.normalColor());
                }
                y += this.lineHeight();
            }
        }
 
        if (!this._beast.dropItems[0].kind && !this._beast.dropItems[1].kind && !this._beast.dropItems[2].kind) {
            this.changeTextColor(this.textColor(stv_BeastBook_unknownColor));
            this.drawText(stv_BeastBook_noData, 0, y);
            this.changeTextColor(this.normalColor());
        }    
    };
   
    Window_BeastBook_Info.prototype.contentDrawAbilities = function() {
        y = this.lineHeight();
        var maxLength = ((this.contents.width/2) - stv_BeastBook_padding*2 - 32);
       
        this.contents.fillRect((this.contents.width/2) + stv_BeastBook_padding, y-5, (this.contents.width/2) - stv_BeastBook_padding, 1, this.normalColor());
        this.drawText(stv_BeastBook_skillsText, this.contents.width-this.textWidth(stv_BeastBook_skillsText), 0);
         
        for (var j = 0; j < this._beast.actions.length; j++) {
            var ai = this._beast.actions[j];
                if (ai.skillId > 0) {
                    var skill = $dataSkills[ai.skillId];
                    if (skill.meta.BeastBook !== "hide") {
                        this.changeTextColor(this.textColor(stv_BeastBook_skillsColor));
                        this.drawSkillName(skill, this.contents.width - this.textWidth(skill.name) - 36, y, maxLength);
                        y += this.lineHeight();
                        this.changeTextColor(this.normalColor());
                    }
                }
        }
        if (this._beast.actions.length <= 0) {
            this.changeTextColor(this.textColor(stv_BeastBook_unknownColor));
            this.drawText(stv_BeastBook_noData, this.contents.width-this.textWidth(stv_BeastBook_noData), y);
            this.changeTextColor(this.normalColor());
        }    
    };
   
    Window_BeastBook_Info.prototype.contentDrawExp = function() {
        y = this.lineHeight();
       
        this.contents.paintOpacity = stv_BeastBook_bbOpacity;
        this.contents.fillRect(0, (this.contents.height - y*2) - stv_BeastBook_padding, this.contents.width, y, this.gaugeBackColor());
        this.contents.paintOpacity = 255;
       
        this.drawIcon(stv_BeastBook_expIcon, this.contents.width - 32, this.contents.height - y*2 + 2 - stv_BeastBook_padding);
        this.drawText(TextManager.exp + ":", 0, this.contents.height - y*2 - stv_BeastBook_padding);
        this.drawText(this._beast.exp, this.contents.width - 32 - this.textWidth(this._beast.exp) - stv_BeastBook_padding, this.contents.height - y*2 - stv_BeastBook_padding);
 
    };
   
    Window_BeastBook_Info.prototype.contentDrawGold = function() {
        y = this.lineHeight();
       
        this.contents.paintOpacity = stv_BeastBook_bbOpacity;
        this.contents.fillRect(0, this.contents.height - y, this.contents.width, y, this.gaugeBackColor());
        this.contents.paintOpacity = 255;
 
        this.drawIcon(stv_BeastBook_goldIcon, this.contents.width - 32, this.contents.height - y + 2);
        this.drawText(TextManager.currencyUnit + ":", 0, this.contents.height - y);
        this.drawText(this._beast.gold, this.contents.width - 32 - this.textWidth(this._beast.gold) - stv_BeastBook_padding, this.contents.height - y);        
    };
   
    Window_BeastBook_Info.prototype.contentDrawBattleBack = function() {
        var beast = this._beast;
        var pic1 = $beastBook.beasts[beast.id]._battleBack1;
        var pic2 = $beastBook.beasts[beast.id]._battleBack2;
       
        var bitmap1 = ImageManager.loadNormalBitmap(pic1, 0 || 0);
        var bitmap2 = ImageManager.loadNormalBitmap(pic2, 0 || 0);
       
        this._battleBack1.bitmap = bitmap1;
        this._battleBack2.bitmap = bitmap2;
       
        this._battleBack1.scale.x = this.width/this._battleBack1.bitmap.width;
        this._battleBack1.scale.y = this.height/this._battleBack1.bitmap.height;
        this._battleBack2.scale.x = this.width/this._battleBack2.bitmap.width;
        this._battleBack2.scale.y = this.height/this._battleBack2.bitmap.height;
    };
   
    Window_BeastBook_Info.prototype.aSVMotion = function(speed, max) {
        var thisSpeed = speed;
        if (!this._counter) this._counter = 0;
        if (!this._pattern) this._pattern = 0;
        if (!this._switch) this._switch = false;
       
        if (this._counter < thisSpeed) {
            this._counter += 1;
        } else {
            this._counter = 0;
            if (!this._switch) this._pattern = (this._pattern + 1) % (max+1);
            if (this._switch) this._pattern = (this._pattern - 1) % (max+1);
        }
       
        if (this._pattern == max & !this._switch) this._switch = !this._switch;
        if (this._pattern === 0 & this._switch) this._switch = !this._switch;
       
        return this._pattern;
    };
   
    Window_BeastBook_Info.prototype.staticMotion = function() {
        var bitmapHeight = this._beastSprite.bitmap.height;
        var contentsHeight = this.contents.height;
        var scalex = (Math.cos(Graphics.frameCount*0.03))/16;
        var scaley = ((Math.cos(Graphics.frameCount*0.03))/8);
           
        this._beastSprite.scale.x = (scalex*scalex)+0.8;
        this._beastSprite.scale.y = (scaley*scaley)+0.8;
        this._beastSprite.anchor.y = (scaley*scaley)+0.4;
       
        if (bitmapHeight > contentsHeight) {
            this._beastSprite.scale.x = ((scalex*scalex)+0.9)-0.3;
            this._beastSprite.scale.y = ((scaley*scaley)+0.9)-0.3;
            this._beastSprite.anchor.y = ((scaley*scaley)+0.4);
        }
    };
   
    Window_BeastBook_Info.prototype.contentDrawBeast = function() {
        var beast = this._beast,
            note = beast.note;
           
            if (beast.meta.BeastBookPic) {
                this._bitmap = ImageManager.loadNormalBitmap(beast.meta.BeastBookPic + ".png", 0 || 0);
                this.drawBeastStatic();
            } else {
                if (note.match(/<(?:SIDEVIEW BATTLER):[ ](.*)>/i)) {
                    this._bitmap = ImageManager.loadSvActor(String(RegExp.$1), 0);
                    this.drawBeastASV();
                } else {
                    if ($gameSystem.isSideView()) {this._bitmap = ImageManager.loadSvEnemy($dataEnemies[beast.id].battlerName, beast.battlerHue);}
                    else {this._bitmap = ImageManager.loadEnemy($dataEnemies[beast.id].battlerName, beast.battlerHue);}
                    this.drawBeastStatic();
                }
            }
    };
   
    Window_BeastBook_Info.prototype.drawBeastASV = function() {
        this._beastSprite.bitmap = this._bitmap;
        this._beastBackSprite.bitmap = this._bitmap;
        var bitmap = this._beastSprite.bitmap;
        if (bitmap) {
            var bw = bitmap.width / 9;
            var bh = bitmap.height / 6;
            var cx = Math.floor(stv_BeastBook_asvPattern / 6) * 3 + this.aSVMotion(stv_BeastBook_asvSpeed, 2);
            var cy = stv_BeastBook_asvPattern % 6;
            this._beastSprite.setFrame(cx * bw, cy * bh, bw, bh);
            this._beastBackSprite.setFrame(0, 0, bw, bh);
            if (stv_BeastBook_showBgBeast == "TRUE") this._beastBackSprite.bitmap = bitmap;
        }
    };
   
    Window_BeastBook_Info.prototype.drawBeastStatic = function() {
        this._beastSprite.bitmap = this._bitmap;
        if (stv_BeastBook_showBgBeast == "TRUE") this._beastBackSprite.bitmap = this._bitmap;
        if (stv_BeastBook_animateBeast == "TRUE") this.staticMotion();
    };
   
    Window_BeastBook_Info.prototype.contentDrawKillCounter = function() {
        var beast = this._beast.id;
       
        var gaugeWidth = 200;
        var gaugeXpos = (this.contents.width - gaugeWidth);
        var gaugeYpos = (this.contents.height - (this.lineHeight() * 3) - stv_BeastBook_padding*2);
        var actualkillsCount = $beastBook.beasts[beast].kills;
        var maxKillsCount = $beastBook.beasts[beast].maxKills;
        var killsCountText = actualkillsCount + " / " + maxKillsCount;
       
        this.drawGauge(gaugeXpos, gaugeYpos - stv_BeastBook_padding, gaugeWidth, actualkillsCount / maxKillsCount, this.textColor(stv_BeastBook_killsCountColor1), this.textColor(stv_BeastBook_killsCountColor2));
        this.drawText(stv_BeastBook_killsText, gaugeXpos - this.textWidth(stv_BeastBook_killsText) - stv_BeastBook_padding, gaugeYpos);
        this.drawText(killsCountText, this.contents.width - this.textWidth(killsCountText), gaugeYpos);
       
    };
   
    Window_BeastBook_Info.prototype.deleteBitmaps = function() {
        this._beastSprite.bitmap = null;
        this._beastBackSprite.bitmap = null;
        this._battleBack1.bitmap = null;
        this._battleBack2.bitmap = null;
    };
   
    Window_BeastBook_Info.prototype.refresh = function() {
        this.contents.clear();
        this.deleteBitmaps();
       
        if ($beastBook.isRevealed(this._beast.id)) {
            if (stv_BeastBook_showBattleBack == "TRUE") this.contentDrawBattleBack();
            this.contentDrawBeast();
            if ($gameSwitches.value(stv_BeastBook_showItemsSwitch) || !stv_BeastBook_showItemsSwitch) this.contentDrawItems();
            if ($gameSwitches.value(stv_BeastBook_showSkillsSwitch) || !stv_BeastBook_showSkillsSwitch) this.contentDrawAbilities();
            if ($gameSwitches.value(stv_BeastBook_showKillCounterSwitch) || !stv_BeastBook_showKillCounterSwitch) this.contentDrawKillCounter();
            if ($gameSwitches.value(stv_BeastBook_showExpSwitch) || !stv_BeastBook_showExpSwitch) this.contentDrawExp();
            if ($gameSwitches.value(stv_BeastBook_showGoldSwitch) || !stv_BeastBook_showGoldSwitch) this.contentDrawGold();
        }
    };
 
// ----------------------------------------------------------------------------------------------------------------------------
// Fill Elements Window
// ----------------------------------------------------------------------------------------------------------------------------
    function Window_BeastBook_Elements() {
        this.initialize.apply(this, arguments);
    }
 
    Window_BeastBook_Elements.prototype = Object.create(Window_Base.prototype);
    Window_BeastBook_Elements.prototype.constructor = Window_BeastBook_Elements;
 
    Window_BeastBook_Elements.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
    };
   
    Window_BeastBook_Elements.prototype.setBeast= function(beast) {
        this._beast = beast;
        this.refresh();
    };
   
    Window_BeastBook_Elements.prototype.contentDrawResistance = function() {
        var ii = 1;
        var counter = 0;
        var y = this.lineHeight()-stv_BeastBook_padding;
       
        for (var i = 0; i < 30; i++) {
       
            if (i < this._beast.traits.length) {
                if (this._beast.traits[i].code === 11) {
                    counter += 1;
                    this.changeTextColor(this.systemColor());
                    this.drawTextEx($dataSystem.elements[this._beast.traits[i].dataId], 0, y*ii);
                        if (this._beast.traits[i].value*100 > 100) {
                            this.changeTextColor(this.textColor(3));
                        }
                        else if (this._beast.traits[i].value*100 < 100) {
                            this.changeTextColor(this.textColor(2));
                        } else {
                            this.changeTextColor(this.normalColor());
                        }
                    this.drawText((Math.round(this._beast.traits[i].value*100)) + "%", (Graphics.boxWidth/3) - 110, y*ii, 70, 'right');
                    ii += 1;
                    this.changeTextColor(this.normalColor());
                }
            }
        }
        if (counter <= 0) {
            this.changeTextColor(this.textColor(stv_BeastBook_unknownColor));
            this.drawText(stv_BeastBook_noData, (this.contents.width/2) - (this.textWidth(stv_BeastBook_noData)/2), y);
            this.changeTextColor(this.normalColor());
        }
       
    };
   
    Window_BeastBook_Elements.prototype.refresh = function() {
        this.contents.clear();
       
        this.drawText(stv_BeastBook_weaknessText, (this.contents.width/2) - (this.textWidth(stv_BeastBook_weaknessText)/2),0);
       
        if ($beastBook.isRevealed(this._beast.id)) {
            this.contentDrawResistance();
        }
    };
 
// ----------------------------------------------------------------------------------------------------------------------------
// Fill Parameters Window
// ----------------------------------------------------------------------------------------------------------------------------
    function Window_BeastBook_Parameters() {
        this.initialize.apply(this, arguments);
    }
 
    Window_BeastBook_Parameters.prototype = Object.create(Window_Base.prototype);
    Window_BeastBook_Parameters.prototype.constructor = Window_BeastBook_Parameters;
 
    Window_BeastBook_Parameters.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
    };
   
    Window_BeastBook_Parameters.prototype.setBeast= function(beast) {
        this._beast = beast;
        this.refresh();
    };
   
    Window_BeastBook_Parameters.prototype.contentDrawLeftParameters = function() {
        var y = 0;
        var leftEdgePos = (this.contents.width/2) - stv_BeastBook_padding;
       
        for (var i = 0; i < 4; i++) {
           
            this.contents.paintOpacity = stv_BeastBook_bbOpacity;
            this.contents.fillRect(0, y, leftEdgePos, this.lineHeight(), this.gaugeBackColor());
            this.contents.paintOpacity = 255;
           
            this.changeTextColor(this.systemColor());
            this.drawText(TextManager.param(i), stv_BeastBook_padding, y, 160);
            this.resetTextColor();        
            this.drawText(this._beast.params[i], leftEdgePos - stv_BeastBook_padding - this.textWidth(this._beast.params[i]), y, 60);
            y += this.lineHeight() + stv_BeastBook_padding;
        }
    };
   
    Window_BeastBook_Parameters.prototype.contentDrawRightParameters = function() {
        var y = 0;
        var rightEdgePos = (this.contents.width/2) + stv_BeastBook_padding;
        var leftEdgePos = (this.contents.width/2) - stv_BeastBook_padding;
       
        for (var j = 4; j < 8; j++) {
           
            this.contents.paintOpacity = stv_BeastBook_bbOpacity;
            this.contents.fillRect(rightEdgePos, y, leftEdgePos, this.lineHeight(), this.gaugeBackColor());
            this.contents.paintOpacity = 255;
           
            this.changeTextColor(this.systemColor());
            this.drawText(TextManager.param(j), rightEdgePos + stv_BeastBook_padding, y, 160);
            this.resetTextColor();        
            this.drawText(this._beast.params[j], this.contents.width - stv_BeastBook_padding - this.textWidth(this._beast.params[j]), y, 60);
            y += this.lineHeight() + stv_BeastBook_padding;
        }
    };
   
    Window_BeastBook_Parameters.prototype.refresh = function() {
        this.contents.clear();
       
        if ($beastBook.isRevealed(this._beast.id)) {
            this.contentDrawLeftParameters();
            this.contentDrawRightParameters();
        }
    };
 
 
// ----------------------------------------------------------------------------------------------------------------------------
// Alias methods
// ----------------------------------------------------------------------------------------------------------------------------
    STV_BeastBook_PluginCommand = Game_Interpreter.prototype.pluginCommand;
    STV_BeastBook_Create = DataManager.createGameObjects;
    STV_BeastBook_Save = DataManager.makeSaveContents;
    STV_BeastBook_Load = DataManager.extractSaveContents;
    STV_BeastBook_BattleBack = Spriteset_Battle.prototype.createBattleback;
    STV_BeastBook_DropItems = Game_Enemy.prototype.makeDropItems;
 
// ----------------------------------------------------------------------------------------------------------------------------
// DataManager
// ----------------------------------------------------------------------------------------------------------------------------
    var $beastBook = null;
 
    DataManager.makeSaveContents = function() {
        contents = STV_BeastBook_Save.call(this);
        contents.enemybook = $beastBook;
        return contents;
    };
   
    DataManager.extractSaveContents = function(contents) {
        STV_BeastBook_Load.call(this, contents);
        $beastBook = contents.enemybook;
    };
   
    DataManager.createGameObjects = function() {
        STV_BeastBook_Create.call(this);
        $beastBook = new Beast_Book();
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Get EnemyTroop Info
// ----------------------------------------------------------------------------------------------------------------------------
    Game_Troop.prototype.updateInterpreter = function() {
        this._interpreter.update();
 
            for (var i = 0; i < $gameTroop.members().length; i++) {
            var stv_beastID = $gameTroop.members()[i]._enemyId;
            var stv_beastIsAlive = $gameTroop.members()[i].isAlive();
           
            switch (stv_BeastBook_fillBehavior) {
                case '1':
                    $beastBook.addBeast(stv_beastID);
                    $beastBook.setBattleBacks(stv_beastID);
                break;
                case '2':
                    if (!stv_beastIsAlive){
                        $beastBook.addBeast(stv_beastID);
                        $beastBook.setBattleBacks(stv_beastID);
                    }
                break;
                case '3':
                break;
            }
        }
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Get BattleBack Info
// ----------------------------------------------------------------------------------------------------------------------------    
    Spriteset_Battle.prototype.createBattleback = function() {
        STV_BeastBook_BattleBack.call(this);
        $beastBook.battleBack1 = this._back1Sprite.bitmap._url;
        $beastBook.battleBack2 = this._back2Sprite.bitmap._url;
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Item Discover // Kill Counter
// ----------------------------------------------------------------------------------------------------------------------------
    Game_Enemy.prototype.makeDropItems = function() {
        var rewards = STV_BeastBook_DropItems.call(this);
        var beastId = this._enemyId;
        var list = $beastBook.beasts[beastId];
           
        if(list.kills < list.maxKills) list.kills += 1;
        $beastBook.killAchievmentCheck(beastId);
        rewards.forEach(function(item) {
            $beastBook.discoverItem(beastId, item);
        });
        return rewards;
    };
 
// ----------------------------------------------------------------------------------------------------------------------------
// Beast_Book
// ----------------------------------------------------------------------------------------------------------------------------
 
    function Beast_Book() {
        this.initialize.apply(this, arguments);
    }
   
    Beast_Book.prototype.initialize = function() {
        this.clear();
    };
   
    // Set BattleBacks
    Beast_Book.prototype.setBattleBacks = function(beastId) {
        $beastBook.beasts[beastId]._battleBack1 = $beastBook.battleBack1;
        $beastBook.beasts[beastId]._battleBack2 = $beastBook.battleBack2;
    };
   
    // Clear Book
    Beast_Book.prototype.clear = function() {
        this.beasts = [0];
        var maxBeasts = $dataEnemies.length;
        if (stv_BeastBook_maxBeasts && stv_BeastBook_maxBeasts < maxBeasts) maxBeasts = stv_BeastBook_maxBeasts + 1;
        
        for (var i = 1; i < maxBeasts; ++i) {
            
            var enemy = $dataEnemies[i];
            if (!this.beasts[i]) this.beasts[i] = {};
            
            if (!this.beasts[i].show) {
                this.beasts[i].show = true;
                if (enemy.meta.BeastBook == 'hide') this.beasts[i].show = false;
            }
            if (!this.beasts[i].discovered) this.beasts[i].discovered = false;
            if (!this.beasts[i].discoveredItems) this.beasts[i].discoveredItems = [false,false,false];
            if (!this.beasts[i].kills) this.beasts[i].kills = 0;
            if (!this.beasts[i]._battleBack1) this.beasts[i]._battleBack1 = stv_BeastBook_defaultBattleBack;
            if (!this.beasts[i]._battleBack2) this.beasts[i]._battleBack2 = stv_BeastBook_defaultBattleBack;
           
            if (!this.beasts[i].maxKills) {
                if (!enemy.meta.BeastBookMaxKills) {
                    this.beasts[i].maxKills = stv_BeastBook_maxKills;
                } else {
                    this.beasts[i].maxKills = enemy.meta.BeastBookMaxKills;
                }
            }  
        }
    };
   
    // Complete All
    Beast_Book.prototype.complete = function() {
        this.completeBeasts();
        this.completeItems();
        this.completeKills();
    };  
   
    // Complete Enemies
    Beast_Book.prototype.completeBeasts = function() {
        for (var i = 1; i < this.beasts.length; i++) {
            this.beasts[i].discovered = true;
        }
        this.getRevealed();
    };
   
    // Complete Items
    Beast_Book.prototype.completeItems = function() {
        for (var i = 1; i < this.beasts.length; i++) {
            this.beasts[i].discoveredItems = [true,true,true];
        }
    };
   
    // Complete Kills
    Beast_Book.prototype.completeKills = function() {
        for (var i = 1; i < this.beasts.length; i++) {
            this.beasts[i].kills = this.beasts[i].maxKills;
            this.killAchievmentCheck(i);
        }
    };
   
    // Clear Items
    Beast_Book.prototype.clearItems = function() {
        for (var i = 1; i < this.beasts.length; i++) {
            this.beasts[i].discoveredItems = [false,false,false];
        }
    };
   
    // Hide Beast
    Beast_Book.prototype.hideBeast = function(beastId) {
        if (!this.beasts) this.clear();
        if (this.beasts[beastId]) this.beasts[beastId].show = false;
        this.getRevealed();
    };
    
    // Show Beast
    Beast_Book.prototype.showBeast = function(beastId) {
        if (!this.beasts) this.clear();
        if (this.beasts[beastId]) this.beasts[beastId].show = true;
        this.getRevealed();
    };
   
    // Add Beast
    Beast_Book.prototype.addBeast = function(beastId) {
        if (!this.beasts) this.clear();
        this.beasts[beastId].discovered = true;
        this.getRevealed();
    };
 
    // Remove Beast
    Beast_Book.prototype.removeBeast = function(beastId) {
        if (this.beasts) {
            this.beasts[beastId].discovered = false;
        }
    };
   
    // Check if Enemy is revealed
    Beast_Book.prototype.isRevealed = function(beast) {
        if (this.beasts && beast) {
            return this.beasts[beast].discovered;
        } else {
            return false;
        }
    };
   
    // Add Kill
    Beast_Book.prototype.addKill = function(beastId, value) {
        if (this.beasts[beastId]) {
            this.beasts[beastId].kills += value;
        }
    };
 
    // Set Max Kills
    Beast_Book.prototype.setMaxKills = function(beastId, value) {
        if (this.beasts[beastId]) {
            this.beasts[beastId].maxKills = value;
        }
    };
   
    // Check Kill Achievment
    Beast_Book.prototype.killAchievmentCheck = function(beastID) {
            var beast = this.beasts[beastID];
            if(beast.kills == beast.maxKills) {
                var achievmentSwitch = stv_BeastBook_killAchievmentSwitch + beastID;
            if (stv_BeastBook_killAchievmentSwitch) $gameSwitches.setValue(achievmentSwitch, true);
            }
    };  
   
    // Get Revealed Beasts
    Beast_Book.prototype.getRevealed = function() {
        var discoveredLength = 0;
        for (var i = 1; i < this.beasts.length; i++) {
            if(this.beasts[i].discovered) discoveredLength += 1;
        }
        $gameVariables.setValue(stv_BeastBook_countDiscovered, discoveredLength);
        if(discoveredLength >= ($dataEnemies.length-1)) $gameSwitches.setValue(stv_BeastBook_bookFullSwitch, true);
    };
   
    // Discover Item
    Beast_Book.prototype.discoverItem = function(E_Id, item) {
        var itemKind;
        if (DataManager.isItem(item)) itemKind = 1;
        if (DataManager.isWeapon(item)) itemKind = 2;
        if (DataManager.isArmor(item)) itemKind = 3;    
        for (var i = 0; i < 3; i++) {
            if ($dataEnemies[E_Id].dropItems[i].kind == itemKind && $dataEnemies[E_Id].dropItems[i].dataId == item.id) {
                var items = this.beasts[E_Id].discoveredItems;
                items[i] = true;
            }
        }  
    };
 
// ----------------------------------------------------------------------------------------------------------------------------
// Draw Skill Name Function
// ----------------------------------------------------------------------------------------------------------------------------  
    Window_Base.prototype.drawSkillName = function(skill, x, y, width) {
        if (skill) {
            if (this.textWidth(skill.name) > width) {
                this.drawText(skill.name, x + this.textWidth(skill.name) - width, y, width);  
            } else{
                this.drawText(skill.name, x, y, width);  
            }
            this.drawIcon(skill.iconIndex, x + this.textWidth(skill.name) + 4, y + 2);
        }
    };
 
// ----------------------------------------------------------------------------------------------------------------------------
// Plugin Commands
// ----------------------------------------------------------------------------------------------------------------------------
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        STV_BeastBook_PluginCommand.call(this, command, args);
       
        if (command === 'BeastBook') {
            switch (args[0]) {
                case 'open':
                    SceneManager.push(Scene_BeastBook);
                break;
                case 'hide':
                    $beastBook.hideBeast(Number(args[1]));
                break;
                case 'show':
                    $beastBook.showBeast(Number(args[1]));
                break;
                case 'add':
                    $beastBook.addBeast(Number(args[1]));
                break;
                case 'addvar':
                    $beastBook.addBeast(Number($gameVariables.value(args[1])));
                break;
                case 'addkill':
                    $beastBook.addKill(Number(args[1]), Number(args[2]));
                break;
                case 'maxkills':
                    $beastBook.setMaxKills(Number(args[1]), Number(args[2]));
                break;
                case 'remove':
                    $beastBook.removeBeast(Number(args[1]));
                break;
                case 'clear':
                    $beastBook.clear();
                break;
                case 'complete':
                    $beastBook.complete();
                break;
                case 'completebeasts':
                    $beastBook.completeBeasts();
                break;
                case 'completeitems':
                    $beastBook.completeItems();
                break;
                case 'completekills':
                    $beastBook.completeKills();
                break;
                case 'clearitems':
                    $beastBook.clearItems();
                break;
            }
        }
    };