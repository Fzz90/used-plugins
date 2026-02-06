var weap = 0;
Game_Message.prototype.setItemChoice = function(variableId, itemType) {

		 weap = itemType;

    this._itemChoiceVariableId = variableId;
    this._itemChoiceItypeId = itemType;
};

Window_EventItem.prototype.includes = function(item) {
    var itypeId = $gameMessage.itemChoiceItypeId();
    if (weap == 5){
    return DataManager.isWeapon(item);// && item.itypeId === 1;	
    }else if(weap ==6){
    	return DataManager.isArmor(item);
    }
    return DataManager.isItem(item) && item.itypeId === itypeId;
};