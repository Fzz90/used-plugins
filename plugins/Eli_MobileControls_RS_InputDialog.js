//==========================================================================
// Eli_MobileControls_RS_InputDialog.js
//==========================================================================

/*:
@plugindesc Compatibilit patch for Eli Mobile Controls and RS_InputDialog!
@author Hakuen Studio

@help
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
If you like my work, please consider supporting me on Patreon!
Patreon      → https://www.patreon.com/hakuenstudio
Terms of Use → https://www.hakuenstudio.com/terms-of-use-5-0-0
Instagram    → https://www.instagram.com/hakuenstudio
Twitter      → https://twitter.com/hakuen_studio
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

============================================================================
Requirements
============================================================================

Put RS_InputDialog below Eli Mobile Controls.
Put this plugin below RS_InputDialog.

============================================================================

*/

if(Imported.Eli_MobileControls && Imported.RS_InputDialog){

    TextBox.prototype.prepareElement = function(id) {
        var field = document.createElement('div');
        field.id = id;
        field.style.position = 'absolute';
        field.style.left = '0';
        field.style.top = '0';
        field.style.right = '0';
        field.style.bottom = '0';
        field.style.width = '100%';
        field.style.height = '100%';
        field.style.zIndex = "0";
        field.style.display = "none"; // there is a bug occurs in nwjs 0.33.4
    
        Eli.MobileControls.divContainer.appendChild(field)
        for(const button of Eli.MobileControls.buttonList){
            for(const div of button.divs){
                div.style.zIndex = 2
            }
        }
        Eli.MobileControls.controlButton.divs[0].style.zIndex = 2
        //document.body.appendChild(field);
    
        if(RS.InputDialog.Params.isCenterAlignment) {
            Graphics._centerElement(field);
        }
        return field;
    }
    
    TextBox.prototype.terminateTextBox = function() {
        var field = document.getElementById(this._fieldId)
    
        if(field) {
            Eli.MobileControls.divContainer.removeChild(field)
            // document.body.removeChild(field);
        }
        this.startToOriginalInput()
    }
    
    TextBox.prototype.show = function () {
        var field = document.getElementById(this._fieldId);
        field.style.zIndex = 1;
        field.style.display = "block"; // for 0.33.4 
    }

}

